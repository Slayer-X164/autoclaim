import { NextResponse } from "next/server";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/app/lib/db/db";
import { claim, claimActivity, claimEvidenceRequest, organization } from "@/app/lib/db/schema";
import { getWorkspaceAccess } from "@/app/lib/claims/access";
import { sendEvidenceRequestEmail } from "@/app/lib/email";

export const runtime = "nodejs";
type Context = { params: Promise<{ claimId: string }> };
export async function GET(_request: Request, context: Context) {
 const access = await getWorkspaceAccess(); if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "unauthorized" ? 401 : 403 });
 const { claimId } = await context.params;
 const rows = await db.select({ id: claimEvidenceRequest.id, description: claimEvidenceRequest.description, expiresAt: claimEvidenceRequest.expiresAt, fulfilledAt: claimEvidenceRequest.fulfilledAt, createdAt: claimEvidenceRequest.createdAt }).from(claimEvidenceRequest).where(and(eq(claimEvidenceRequest.claimId, claimId), eq(claimEvidenceRequest.organizationId, access.organizationId))).orderBy(desc(claimEvidenceRequest.createdAt));
 return NextResponse.json({ requests: rows });
}
export async function POST(request: Request, context: Context) {
 const access = await getWorkspaceAccess(); if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "unauthorized" ? 401 : 403 });
 if (!["admin", "owner", "reviewer"].includes(access.role)) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
 const { claimId } = await context.params; const body = await request.json().catch(() => null); const description = typeof body?.description === "string" ? body.description.trim().slice(0, 1500) : "";
 if (description.length < 5) return NextResponse.json({ error: "Explain what additional evidence is needed (at least 5 characters)." }, { status: 400 });
 const [item] = await db.select({ id: claim.id, claimNumber: claim.claimNumber, customerName: claim.customerName, customerEmail: claim.customerEmail, reviewerId: claim.reviewerId, organizationName: organization.name }).from(claim).innerJoin(organization, eq(claim.organizationId, organization.id)).where(and(eq(claim.id, claimId), eq(claim.organizationId, access.organizationId))).limit(1);
 if (!item) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
 const token = randomBytes(32).toString("base64url"); const tokenHash = createHash("sha256").update(token).digest("hex"); const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
 const requestId = randomUUID();
 await db.insert(claimEvidenceRequest).values({ id: requestId, claimId, organizationId: access.organizationId, requestedBy: access.session.user.id, description, tokenHash, expiresAt });
 await db.insert(claimActivity).values({ id: randomUUID(), claimId, organizationId: access.organizationId, actorId: access.session.user.id, action: "Additional evidence requested", details: description });
 const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin; const uploadLink = `${origin}/claim/evidence/${token}`;
 try { await sendEvidenceRequestEmail({ email: item.customerEmail, customerName: item.customerName, organizationName: item.organizationName, claimNumber: item.claimNumber, description, uploadLink, expiresAt }); } catch (error) { console.error("Evidence request email failed", error); return NextResponse.json({ error: "Evidence request was saved, but email delivery failed. Check RESEND_API_KEY and EMAIL_FROM, then send a new request." , requestId }, { status: 502 }); }
 return NextResponse.json({ ok: true, requestId, expiresAt });
}
