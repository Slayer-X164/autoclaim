import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/db/db";
import { member } from "@/app/lib/db/schema";

export async function getWorkspaceAccess() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "unauthorized" as const };

  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) return { error: "no_workspace" as const };

  const [membership] = await db.select({ role: member.role })
    .from(member)
    .where(and(eq(member.userId, session.user.id), eq(member.organizationId, organizationId)))
    .limit(1);

  if (!membership) return { error: "forbidden" as const };
  return { session, organizationId, role: membership.role };
}
