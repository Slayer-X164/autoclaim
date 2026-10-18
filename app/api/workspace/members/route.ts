import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/app/lib/db/db";
import { claim, member, user } from "@/app/lib/db/schema";
import { getWorkspaceAccess } from "@/app/lib/claims/access";

export async function GET() {
  const access = await getWorkspaceAccess();
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "unauthorized" ? 401 : 403 });
  const rows = await db.select({ id: member.id, userId: user.id, name: user.name, email: user.email, role: member.role, createdAt: member.createdAt })
    .from(member).innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.organizationId, access.organizationId));
  const pendingCounts = await db.select({ reviewerId: claim.reviewerId }).from(claim).where(and(eq(claim.organizationId, access.organizationId), eq(claim.status, "Needs Review")));
  const counts = new Map<string, number>();
  for (const row of pendingCounts) if (row.reviewerId) counts.set(row.reviewerId, (counts.get(row.reviewerId) || 0) + 1);
  return NextResponse.json({ currentRole: access.role, members: rows.map((row) => ({ ...row, pending: counts.get(row.userId) || 0 })) });
}
