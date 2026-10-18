import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/app/lib/db/db";
import { claim, claimEvidenceRequest, claimInvitation, organization } from "@/app/lib/db/schema";
import { desc } from "drizzle-orm";

export const runtime = "nodejs";
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

// A claim invitation is single-use for submission, but remains a private status link
// after a successful submission. Its original expiry only applies before submission.
export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  if (!token || token.length > 200) return NextResponse.json({ error: "This invitation link is invalid." }, { status: 404 });

  const [row] = await db.select({
    id: claimInvitation.id,
    customerName: claimInvitation.customerName,
    customerEmail: claimInvitation.customerEmail,
    expiresAt: claimInvitation.expiresAt,
    usedAt: claimInvitation.usedAt,
    revokedAt: claimInvitation.revokedAt,
    organizationName: organization.name,
    organizationSlug: organization.slug,
    claimId: claim.id,
    claimNumber: claim.claimNumber,
    claimStatus: claim.status,
    aiConfidence: claim.aiConfidence,
    aiRecommendation: claim.aiRecommendation,
    claimUpdatedAt: claim.updatedAt,
    claimCreatedAt: claim.createdAt,
  }).from(claimInvitation)
    .innerJoin(organization, eq(claimInvitation.organizationId, organization.id))
    .leftJoin(claim, eq(claimInvitation.claimId, claim.id))
    .where(eq(claimInvitation.tokenHash, hashToken(token)))
    .limit(1);

  if (!row || row.revokedAt || (row.expiresAt <= new Date() && !row.claimId) || (row.usedAt && !row.claimId)) {
    return NextResponse.json({ error: "This invitation has expired or been revoked. Please contact your insurer for a new link." }, { status: 410 });
  }

  // Submitted claims can always be viewed from this same secret link, even after the
  // submission window has expired. Revoked links remain inaccessible.
  if (row.claimId && row.claimNumber && row.claimStatus) {
    const evidenceRequests = await db.select({ id: claimEvidenceRequest.id, description: claimEvidenceRequest.description, expiresAt: claimEvidenceRequest.expiresAt, fulfilledAt: claimEvidenceRequest.fulfilledAt, createdAt: claimEvidenceRequest.createdAt }).from(claimEvidenceRequest).where(eq(claimEvidenceRequest.claimId, row.claimId)).orderBy(desc(claimEvidenceRequest.createdAt));
    return NextResponse.json({
      submitted: true,
      invitation: { customerName: row.customerName, customerEmail: row.customerEmail, organizationName: row.organizationName, organizationSlug: row.organizationSlug },
      claim: { id: row.claimId, claimNumber: row.claimNumber, status: row.claimStatus, aiConfidence: row.aiConfidence, aiRecommendation: row.aiRecommendation, createdAt: row.claimCreatedAt, updatedAt: row.claimUpdatedAt, evidenceRequests },
    });
  }

  return NextResponse.json({ submitted: false, invitation: { customerName: row.customerName, customerEmail: row.customerEmail, organizationName: row.organizationName, organizationSlug: row.organizationSlug, expiresAt: row.expiresAt } });
}
