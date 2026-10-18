import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/app/lib/db/db";
import { claim, claimActivity, user } from "@/app/lib/db/schema";
import { getWorkspaceAccess } from "@/app/lib/claims/access";

export async function GET() {
  const access = await getWorkspaceAccess();
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "unauthorized" ? 401 : 403 });
  // All workspace reviewers can see activity for workspace claims, including unassigned claims.
  const filters = eq(claimActivity.organizationId, access.organizationId);
  const rows = await db.select({ id: claimActivity.id, claimId: claimActivity.claimId, claimNumber: claim.claimNumber, action: claimActivity.action, details: claimActivity.details, createdAt: claimActivity.createdAt, actorName: user.name, status: claim.status })
    .from(claimActivity)
    .innerJoin(claim, eq(claimActivity.claimId, claim.id))
    .leftJoin(user, eq(claimActivity.actorId, user.id))
    .where(filters)
    .orderBy(desc(claimActivity.createdAt))
    .limit(20);
  return NextResponse.json({ notifications: rows });
}
