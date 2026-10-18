import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/db/db";
import { claim, claimActivity, claimEvidence, member, organization, user } from "@/app/lib/db/schema";
import { getWorkspaceAccess } from "@/app/lib/claims/access";
import { sendClaimStatusUpdate } from "@/app/lib/email";
import { createPrivateEvidenceSignedUrl } from "@/app/lib/storage";

export const runtime = "nodejs";

type Context = { params: Promise<{ claimId: string }> };

export async function GET(_request: Request, context: Context) {
  const access = await getWorkspaceAccess();
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "unauthorized" ? 401 : 403 });
  const { claimId } = await context.params;
  const [item] = await db.select({
    id: claim.id, claimNumber: claim.claimNumber, customerName: claim.customerName, customerEmail: claim.customerEmail,
    vehicleMake: claim.vehicleMake, vehicleModel: claim.vehicleModel, vehicleYear: claim.vehicleYear,
    registrationNumber: claim.registrationNumber, accidentDate: claim.accidentDate, incidentDescription: claim.incidentDescription,
    status: claim.status, aiConfidence: claim.aiConfidence, aiRecommendation: claim.aiRecommendation, aiSummary: claim.aiSummary,
    riskFlags: claim.riskFlags, reviewerNotes: claim.reviewerNotes, reviewerId: claim.reviewerId, createdAt: claim.createdAt,
  }).from(claim).where(and(eq(claim.id, claimId), eq(claim.organizationId, access.organizationId))).limit(1);
  if (!item) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  const evidenceRows = await db.select({ id: claimEvidence.id, fileName: claimEvidence.fileName, mimeType: claimEvidence.mimeType, fileSize: claimEvidence.fileSize, kind: claimEvidence.kind, dataUrl: claimEvidence.dataUrl, storagePath: claimEvidence.storagePath }).from(claimEvidence).where(eq(claimEvidence.claimId, claimId)).orderBy(asc(claimEvidence.createdAt));
  let evidence;
  try {
    evidence = await Promise.all(evidenceRows.map(async (file) => ({ id: file.id, fileName: file.fileName, mimeType: file.mimeType, fileSize: file.fileSize, kind: file.kind, dataUrl: file.storagePath ? await createPrivateEvidenceSignedUrl(file.storagePath, 600) : (file.dataUrl || "") })));
  } catch (error) {
    console.error("Could not prepare private evidence links", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load claim evidence." }, { status: 502 });
  }
  const activity = await db.select({ id: claimActivity.id, action: claimActivity.action, details: claimActivity.details, createdAt: claimActivity.createdAt }).from(claimActivity).where(eq(claimActivity.claimId, claimId)).orderBy(asc(claimActivity.createdAt));
  return NextResponse.json({ claim: item, evidence, activity });
}

export async function PATCH(request: Request, context: Context) {
  const access = await getWorkspaceAccess();
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "unauthorized" ? 401 : 403 });
  if (access.role !== "admin" && access.role !== "owner" && access.role !== "reviewer") return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  const body = await request.json().catch(() => null);
  const decision = body?.decision;
  const hasAssignment = Object.prototype.hasOwnProperty.call(body || {}, "assignReviewerId");
  const assignReviewerId = body?.assignReviewerId === null || body?.assignReviewerId === "" ? null : typeof body?.assignReviewerId === "string" ? body.assignReviewerId : undefined;
  const notes = typeof body?.notes === "string" ? body.notes.trim().slice(0, 3000) : "";
  if (hasAssignment) {
    if (access.role !== "admin" && access.role !== "owner") return NextResponse.json({ error: "Only workspace admins can assign claims." }, { status: 403 });
    if (assignReviewerId === undefined) return NextResponse.json({ error: "Invalid reviewer selection." }, { status: 400 });
    const { claimId } = await context.params;
    const [existing] = await db.select({ id: claim.id, claimNumber: claim.claimNumber, reviewerId: claim.reviewerId, status: claim.status }).from(claim).where(and(eq(claim.id, claimId), eq(claim.organizationId, access.organizationId))).limit(1);
    if (!existing) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    if (assignReviewerId) {
      const [reviewer] = await db.select({ userId: member.userId }).from(member).where(and(eq(member.organizationId, access.organizationId), eq(member.userId, assignReviewerId), eq(member.role, "reviewer"))).limit(1);
      if (!reviewer) return NextResponse.json({ error: "Choose a reviewer who belongs to this workspace." }, { status: 400 });
    }
    await db.update(claim).set({ reviewerId: assignReviewerId, updatedAt: new Date(), status: existing.status === "Processing" ? "Needs Review" : existing.status }).where(and(eq(claim.id, claimId), eq(claim.organizationId, access.organizationId)));
    const session = await auth.api.getSession({ headers: await headers() });
    const detail = assignReviewerId ? `Assigned ${existing.claimNumber} to reviewer ${assignReviewerId}` : `Unassigned ${existing.claimNumber}`;
    await db.insert(claimActivity).values({ id: crypto.randomUUID(), claimId, organizationId: access.organizationId, actorId: session?.user.id ?? null, action: assignReviewerId ? "Claim assigned" : "Claim unassigned", details: detail });
    return NextResponse.json({ ok: true, reviewerId: assignReviewerId });
  }
  if (!["Approved", "Rejected", "Needs Review"].includes(decision)) return NextResponse.json({ error: "Choose Approved, Rejected, or Needs Review." }, { status: 400 });
  const { claimId } = await context.params;
  const [existing] = await db.select({ id: claim.id, claimNumber: claim.claimNumber, customerName: claim.customerName, customerEmail: claim.customerEmail, reviewerId: claim.reviewerId, organizationName: organization.name }).from(claim).innerJoin(organization, eq(claim.organizationId, organization.id)).where(and(eq(claim.id, claimId), eq(claim.organizationId, access.organizationId))).limit(1);
  if (!existing) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  const session = await auth.api.getSession({ headers: await headers() });
  // Assignment is optional: any reviewer in this workspace may work on a claim. If it has no assignee, record the first reviewer who acts on it.
  const nextReviewerId = access.role === "reviewer" && !existing.reviewerId ? (session?.user.id ?? null) : existing.reviewerId;
  await db.update(claim).set({ status: decision, reviewerId: nextReviewerId, reviewerNotes: notes || null, decisionAt: decision === "Needs Review" ? null : new Date(), updatedAt: new Date() }).where(and(eq(claim.id, claimId), eq(claim.organizationId, access.organizationId)));
  await db.insert(claimActivity).values({ id: crypto.randomUUID(), claimId, organizationId: access.organizationId, actorId: session?.user.id ?? null, action: `Claim ${decision.toLowerCase()}`, details: notes || `${existing.claimNumber} marked ${decision}` });
  if (decision === "Approved" || decision === "Rejected") {
    void sendClaimStatusUpdate({ email: existing.customerEmail, customerName: existing.customerName, organizationName: existing.organizationName, claimNumber: existing.claimNumber, status: decision }).catch((error) => console.error("Could not send claim status email", error));
  }
  return NextResponse.json({ ok: true, status: decision });
}
