import { NextResponse } from "next/server";
import { and, count, eq, sql } from "drizzle-orm";
import { db } from "@/app/lib/db/db";
import { claim, member } from "@/app/lib/db/schema";
import { getWorkspaceAccess } from "@/app/lib/claims/access";

export async function GET() {
  const access = await getWorkspaceAccess();
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "unauthorized" ? 401 : 403 });
  const organizationFilter = eq(claim.organizationId, access.organizationId);
  const [total] = await db.select({ value: count() }).from(claim).where(organizationFilter);
  const [pending] = await db.select({ value: count() }).from(claim).where(and(organizationFilter, eq(claim.status, "Needs Review")));
  const [processing] = await db.select({ value: count() }).from(claim).where(and(organizationFilter, eq(claim.status, "Processing")));
  const [approved] = await db.select({ value: count() }).from(claim).where(and(organizationFilter, eq(claim.status, "Approved")));
  const [rejected] = await db.select({ value: count() }).from(claim).where(and(organizationFilter, eq(claim.status, "Rejected")));
  const [autoApproved] = await db.select({ value: count() }).from(claim).where(and(organizationFilter, eq(claim.status, "Auto Approved")));
  const [reviewers] = await db.select({ value: count() }).from(member).where(and(eq(member.organizationId, access.organizationId), eq(member.role, "reviewer")));
  const [completedToday] = await db.select({ value: count() }).from(claim).where(and(organizationFilter, sql`${claim.decisionAt} >= date_trunc('day', now())`));
  return NextResponse.json({ total: total.value, pending: pending.value, processing: processing.value, approved: approved.value, rejected: rejected.value, autoApproved: autoApproved.value, reviewers: reviewers.value, completedToday: completedToday.value });
}
