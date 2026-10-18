import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/app/lib/db/db";
import { claim, member, user } from "@/app/lib/db/schema";
import { getWorkspaceAccess } from "@/app/lib/claims/access";

export async function DELETE(_request: Request, context: { params: Promise<{ memberId: string }> }) {
  const access = await getWorkspaceAccess();
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "unauthorized" ? 401 : 403 });
  if (access.role !== "admin" && access.role !== "owner") return NextResponse.json({ error: "Only workspace admins can remove members." }, { status: 403 });
  const { memberId } = await context.params;
  const [target] = await db.select({ id: member.id, userId: member.userId, role: member.role, name: user.name })
    .from(member).innerJoin(user, eq(member.userId, user.id))
    .where(and(eq(member.id, memberId), eq(member.organizationId, access.organizationId))).limit(1);
  if (!target) return NextResponse.json({ error: "Workspace member not found." }, { status: 404 });
  if (target.userId === access.session.user.id) return NextResponse.json({ error: "You cannot remove yourself from this workspace." }, { status: 400 });
  if (target.role === "owner") return NextResponse.json({ error: "The workspace owner cannot be removed here." }, { status: 400 });
  await db.update(claim).set({ reviewerId: null, updatedAt: new Date() }).where(and(eq(claim.organizationId, access.organizationId), eq(claim.reviewerId, target.userId)));
  await db.delete(member).where(and(eq(member.id, memberId), eq(member.organizationId, access.organizationId)));
  return NextResponse.json({ ok: true, removed: target.name });
}
