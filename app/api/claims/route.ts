import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { and, desc, eq, gt, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/app/lib/db/db";
import { claim, claimActivity, claimEvidence, claimInvitation, organization, user } from "@/app/lib/db/schema";
import { getWorkspaceAccess } from "@/app/lib/claims/access";
import { analyzeClaim } from "@/app/lib/claims/analyze";
import type { ClaimStatus } from "@/app/lib/db/schema/claims-schema";
import { hasExpectedFileSignature, uploadPrivateEvidence } from "@/app/lib/storage";
import { workspaceSettings } from "@/app/lib/db/schema/claims-schema";
import { extractPdfTextBestEffort } from "@/app/lib/claims/pdf-text";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const access = await getWorkspaceAccess();
  if ("error" in access) {
    const status = access.error === "unauthorized" ? 401 : access.error === "no_workspace" ? 400 : 403;
    return NextResponse.json({ error: access.error }, { status });
  }
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");
  const search = searchParams.get("q")?.trim();
  const filters = [eq(claim.organizationId, access.organizationId)];
  if (statusFilter && statusFilter !== "All") filters.push(eq(claim.status, statusFilter as ClaimStatus));
  if (search) filters.push(or(ilike(claim.claimNumber, `%${search}%`), ilike(claim.customerName, `%${search}%`), ilike(claim.customerEmail, `%${search}%`), ilike(claim.vehicleMake, `%${search}%`), ilike(claim.vehicleModel, `%${search}%`), ilike(claim.registrationNumber, `%${search}%`))!);

  const claims = await db.select({
    id: claim.id, claimNumber: claim.claimNumber, customerName: claim.customerName,
    customerEmail: claim.customerEmail, vehicleMake: claim.vehicleMake, vehicleModel: claim.vehicleModel,
    vehicleYear: claim.vehicleYear, status: claim.status, aiConfidence: claim.aiConfidence,
    aiRecommendation: claim.aiRecommendation, createdAt: claim.createdAt, reviewerId: claim.reviewerId, reviewerName: user.name, reviewerEmail: user.email,
  }).from(claim).leftJoin(user, eq(claim.reviewerId, user.id)).where(and(...filters)).orderBy(desc(claim.createdAt)).limit(100);
  return NextResponse.json({ claims });
}

// Public customer portal submission. The insurer workspace is selected by its public slug.
export async function POST(request: Request) {
  const form = await request.formData();
  const orgSlug = String(form.get("orgSlug") || "").trim().toLowerCase();
  const customerName = String(form.get("customerName") || "").trim();
  const customerEmail = String(form.get("customerEmail") || "").trim().toLowerCase();
  const vehicleMake = String(form.get("vehicleMake") || "").trim();
  const vehicleModel = String(form.get("vehicleModel") || "").trim();
  const vehicleYear = Number(form.get("vehicleYear"));
  const registrationNumber = String(form.get("registrationNumber") || "").trim().toUpperCase();
  const accidentDate = String(form.get("accidentDate") || "").trim();
  const incidentDescription = String(form.get("incidentDescription") || "").trim();
  const invitationToken = String(form.get("invitationToken") || "").trim();

  if (!orgSlug || !customerName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) || !vehicleMake || !vehicleModel || !Number.isInteger(vehicleYear) || vehicleYear < 1950 || vehicleYear > new Date().getFullYear() + 1 || !registrationNumber || !accidentDate || incidentDescription.length < 15) {
    return NextResponse.json({ error: "Please complete all required fields with valid information." }, { status: 400 });
  }
  const [insurer] = await db.select({ id: organization.id, name: organization.name }).from(organization).where(eq(organization.slug, orgSlug)).limit(1);
  if (!insurer) return NextResponse.json({ error: "We couldn't find an insurer with that workspace slug." }, { status: 404 });
  let invitationId: string | null = null;
  if (invitationToken) {
    const tokenHash = createHash("sha256").update(invitationToken).digest("hex");
    const [invite] = await db.select({ id: claimInvitation.id, organizationId: claimInvitation.organizationId, customerEmail: claimInvitation.customerEmail }).from(claimInvitation).where(and(eq(claimInvitation.tokenHash, tokenHash), gt(claimInvitation.expiresAt, new Date()), isNull(claimInvitation.usedAt), isNull(claimInvitation.revokedAt))).limit(1);
    if (!invite || invite.organizationId !== insurer.id) return NextResponse.json({ error: "This invitation is invalid, expired, or already used. Contact your insurer for a new link." }, { status: 410 });
    if (invite.customerEmail.toLowerCase() !== customerEmail) return NextResponse.json({ error: "Use the email address this invitation was sent to." }, { status: 403 });
    invitationId = invite.id;
  }

  const files = form.getAll("evidence").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length > 5) return NextResponse.json({ error: "Upload up to 5 photos or documents." }, { status: 400 });
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
  const evidence: Array<{ id: string; fileName: string; mimeType: string; fileSize: number; kind: "vehicle-image" | "document"; dataUrl: string; storagePath?: string; extractedText?: string }> = [];
  let totalSize = 0;
  for (const file of files) {
    if (!allowedTypes.has(file.type)) return NextResponse.json({ error: `Unsupported file type: ${file.name}. Use JPG, PNG, WEBP, or PDF.` }, { status: 400 });
    if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: `${file.name} is larger than the 2 MB limit.` }, { status: 400 });
    totalSize += file.size;
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!hasExpectedFileSignature(file.type, bytes)) return NextResponse.json({ error: `${file.name} does not appear to be a valid ${file.type} file.` }, { status: 415 });
    evidence.push({ id: crypto.randomUUID(), fileName: file.name.slice(0, 240), mimeType: file.type, fileSize: file.size, kind: file.type.startsWith("image/") ? "vehicle-image" : "document", dataUrl: `data:${file.type};base64,${bytes.toString("base64")}`, ...(file.type === "application/pdf" ? { extractedText: extractPdfTextBestEffort(bytes) } : {}) });
  }
  if (totalSize > 7 * 1024 * 1024) return NextResponse.json({ error: "Total upload size must be under 7 MB." }, { status: 400 });

  const id = crypto.randomUUID();
  const claimNumber = `AC-${new Date().getFullYear()}-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
  const claimData = { customerName, vehicleMake, vehicleModel, vehicleYear, registrationNumber, accidentDate, incidentDescription };
  // Store uploaded files privately; only metadata and object paths go into PostgreSQL.
  for (let index = 0; index < evidence.length; index++) {
    const item = evidence[index];
    const file = files[index];
    if (!file) throw new Error("Uploaded evidence could not be matched to its file.");
    const stored = await uploadPrivateEvidence({ organizationId: insurer.id, claimId: id, evidenceId: item.id, fileName: item.fileName, mimeType: item.mimeType, bytes: Buffer.from(await file.arrayBuffer()) });
    item.storagePath = stored.path;
  }
  await db.insert(claim).values({ id, claimNumber, organizationId: insurer.id, customerName, customerEmail, vehicleMake, vehicleModel, vehicleYear, registrationNumber, accidentDate, incidentDescription, status: "Processing" });
  if (evidence.length) {
    await db.insert(claimEvidence).values(evidence.map(({ dataUrl, extractedText, ...item }) => ({ ...item, claimId: id, dataUrl: null, storagePath: item.storagePath || null })));
  }
  await db.insert(claimActivity).values({ id: crypto.randomUUID(), claimId: id, organizationId: insurer.id, action: "Claim submitted", details: `${claimNumber} submitted by ${customerName}` });

  const [settings] = await db.select({ policyContext: workspaceSettings.policyContext }).from(workspaceSettings).where(eq(workspaceSettings.organizationId, insurer.id)).limit(1);
  const analysis = await analyzeClaim(claimData, evidence, settings?.policyContext);
  // AI is triage only. Every submission goes to a human reviewer; the model never decides coverage.
  await db.update(claim).set({ status: "Needs Review", aiConfidence: analysis.confidence, aiRecommendation: analysis.recommendation, aiSummary: analysis.summary, riskFlags: analysis.riskFlags, aiProvider: analysis.provider, updatedAt: new Date() }).where(eq(claim.id, id));
  await db.insert(claimActivity).values({ id: crypto.randomUUID(), claimId: id, organizationId: insurer.id, action: "AI triage completed", details: `Recommendation: ${analysis.recommendation}; confidence: ${analysis.confidence}%` });
  if (invitationId) await db.update(claimInvitation).set({ usedAt: new Date(), claimId: id }).where(eq(claimInvitation.id, invitationId));

  return NextResponse.json({ claim: { id, claimNumber, status: "Needs Review", aiConfidence: analysis.confidence, aiRecommendation: analysis.recommendation, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, organizationName: insurer.name }, { status: 201 });
}
