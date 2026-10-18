import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/app/lib/db/db";
import { claimActivity, user } from "@/app/lib/db/schema";
import { getWorkspaceAccess } from "@/app/lib/claims/access";

export async function GET() {
  const access = await getWorkspaceAccess();
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "unauthorized" ? 401 : 403 });
  const activities = await db.select({ id: claimActivity.id, action: claimActivity.action, details: claimActivity.details, createdAt: claimActivity.createdAt, actorName: user.name })
    .from(claimActivity).leftJoin(user, eq(claimActivity.actorId, user.id))
    .where(eq(claimActivity.organizationId, access.organizationId)).orderBy(desc(claimActivity.createdAt)).limit(5);
  return NextResponse.json({ activities });
}
