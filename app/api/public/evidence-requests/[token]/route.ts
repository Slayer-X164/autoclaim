import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/app/lib/db/db";
import { claim, claimActivity, claimEvidence, claimEvidenceRequest, organization } from "@/app/lib/db/schema";
import { hasExpectedFileSignature, uploadPrivateEvidence } from "@/app/lib/storage";
export const runtime = "nodejs";
type Context = { params: Promise<{ token: string }> };
const hash = (token: string) => createHash("sha256").update(token).digest("hex");
export async function GET(_request: Request, context: Context) {
 const { token } = await context.params; if (!token || token.length > 200) return NextResponse.json({ error: "Invalid upload link." }, { status: 404 });
 const [row] = await db.select({ id: claimEvidenceRequest.id, description: claimEvidenceRequest.description, expiresAt: claimEvidenceRequest.expiresAt, fulfilledAt: claimEvidenceRequest.fulfilledAt, claimNumber: claim.claimNumber, customerName: claim.customerName, organizationName: organization.name }).from(claimEvidenceRequest).innerJoin(claim, eq(claimEvidenceRequest.claimId, claim.id)).innerJoin(organization, eq(claimEvidenceRequest.organizationId, organization.id)).where(eq(claimEvidenceRequest.tokenHash, hash(token))).limit(1);
 if (!row || row.expiresAt <= new Date()) return NextResponse.json({ error: "This upload link has expired. Contact your insurer for a new request." }, { status: 410 });
 return NextResponse.json({ request: { description: row.description, expiresAt: row.expiresAt, fulfilled: Boolean(row.fulfilledAt), claimNumber: row.claimNumber, customerName: row.customerName, organizationName: row.organizationName } });
}
export async function POST(request: Request, context: Context) {
 const { token } = await context.params; const [row] = await db.select({ id: claimEvidenceRequest.id, claimId: claimEvidenceRequest.claimId, organizationId: claimEvidenceRequest.organizationId, description: claimEvidenceRequest.description, expiresAt: claimEvidenceRequest.expiresAt, fulfilledAt: claimEvidenceRequest.fulfilledAt }).from(claimEvidenceRequest).where(eq(claimEvidenceRequest.tokenHash, hash(token))).limit(1);
 if (!row || row.expiresAt <= new Date()) return NextResponse.json({ error: "This upload link has expired. Contact your insurer for a new request." }, { status: 410 });
 if (row.fulfilledAt) return NextResponse.json({ error: "Evidence for this request has already been submitted." }, { status: 409 });
 const form = await request.formData(); const files = form.getAll("evidence").filter((item): item is File => item instanceof File && item.size > 0);
 if (!files.length || files.length > 5) return NextResponse.json({ error: "Choose between 1 and 5 files." }, { status: 400 });
 const allowed = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]); let total = 0; const values = [] as Array<{ id: string; claimId: string; fileName: string; mimeType: string; fileSize: number; kind: "vehicle-image" | "document"; dataUrl: null; storagePath: string }>;
 if (files.some((file) => !allowed.has(file.type))) return NextResponse.json({ error: "Use JPG, PNG, WebP, or PDF files only." }, { status: 400 });
 if (files.some((file) => file.size > 2 * 1024 * 1024)) return NextResponse.json({ error: "Each file must be 2 MB or smaller." }, { status: 400 });
 for (const file of files) { total += file.size; }
 if (total > 7 * 1024 * 1024) return NextResponse.json({ error: "Total upload size must be under 7 MB." }, { status: 400 });
 try {
  for (const file of files) { const id = randomUUID(); const bytes = Buffer.from(await file.arrayBuffer()); if (!hasExpectedFileSignature(file.type, bytes)) return NextResponse.json({ error: `${file.name} does not appear to be a valid ${file.type} file.` }, { status: 415 }); const stored = await uploadPrivateEvidence({ organizationId: row.organizationId, claimId: row.claimId, evidenceId: id, fileName: file.name.slice(0, 240), mimeType: file.type, bytes }); values.push({ id, claimId: row.claimId, fileName: file.name.slice(0, 240), mimeType: file.type, fileSize: file.size, kind: file.type.startsWith("image/") ? "vehicle-image" : "document", dataUrl: null, storagePath: stored.path }); }
  await db.insert(claimEvidence).values(values); await db.update(claimEvidenceRequest).set({ fulfilledAt: new Date() }).where(and(eq(claimEvidenceRequest.id, row.id), isNull(claimEvidenceRequest.fulfilledAt))); await db.update(claim).set({ status: "Needs Review", updatedAt: new Date() }).where(eq(claim.id, row.claimId)); await db.insert(claimActivity).values({ id: randomUUID(), claimId: row.claimId, organizationId: row.organizationId, action: "Additional evidence received", details: `${files.length} file(s) uploaded in response to: ${row.description}` });
  return NextResponse.json({ ok: true, uploaded: files.length });
 } catch (error) { console.error("Evidence request upload failed", error); return NextResponse.json({ error: error instanceof Error ? error.message : "Could not securely store the uploaded evidence." }, { status: 502 }); }
}
