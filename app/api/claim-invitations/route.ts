import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { db } from "@/app/lib/db/db";
import { claimInvitation, organization } from "@/app/lib/db/schema";
import { getWorkspaceAccess } from "@/app/lib/claims/access";
import { sendCustomerClaimInvitation } from "@/app/lib/email";

export const runtime = "nodejs";
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function GET() {
  const access = await getWorkspaceAccess();
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "unauthorized" ? 401 : 403 });
  if (access.role !== "admin" && access.role !== "owner" && access.role !== "reviewer") return NextResponse.json({ error: "Insufficient permissions to manage customer invitations." }, { status: 403 });
  const rows = await db.select({ id: claimInvitation.id, customerName: claimInvitation.customerName, customerEmail: claimInvitation.customerEmail, expiresAt: claimInvitation.expiresAt, usedAt: claimInvitation.usedAt, revokedAt: claimInvitation.revokedAt, claimId: claimInvitation.claimId, createdAt: claimInvitation.createdAt }).from(claimInvitation).where(eq(claimInvitation.organizationId, access.organizationId)).orderBy(desc(claimInvitation.createdAt)).limit(30);
  return NextResponse.json({ invitations: rows });
}

export async function POST(request: Request) {
  const access = await getWorkspaceAccess();
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "unauthorized" ? 401 : 403 });
  if (access.role !== "admin" && access.role !== "owner" && access.role !== "reviewer") return NextResponse.json({ error: "Insufficient permissions to create customer invitations." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const customerName = typeof body?.customerName === "string" ? body.customerName.trim().slice(0, 160) : "";
  const customerEmail = typeof body?.customerEmail === "string" ? body.customerEmail.trim().toLowerCase() : "";
  const expiresInHours = Math.min(168, Math.max(1, Number(body?.expiresInHours) || 72));
  if (!customerName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return NextResponse.json({ error: "Enter a customer name and valid email address." }, { status: 400 });
  const [org] = await db.select({ id: organization.id, name: organization.name }).from(organization).where(eq(organization.id, access.organizationId)).limit(1);
  if (!org) return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  await db.insert(claimInvitation).values({ id: crypto.randomUUID(), organizationId: org.id, customerName, customerEmail, tokenHash: hashToken(token), expiresAt, createdBy: access.session.user.id });
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || process.env.BETTER_AUTH_URL || new URL(request.url).origin).replace(/\/$/, "");
  const inviteLink = `${baseUrl}/claim/invite/${token}`;
  let emailSent = false;
  if (process.env.RESEND_API_KEY) {
    try { await sendCustomerClaimInvitation({ email: customerEmail, customerName, organizationName: org.name, inviteLink, expiresAt }); emailSent = true; }
    catch (error) { console.error("Customer invitation email failed", error); }
  }
  return NextResponse.json({ invitation: { customerName, customerEmail, expiresAt }, inviteLink, emailSent, emailConfigured: Boolean(process.env.RESEND_API_KEY) }, { status: 201 });
}
