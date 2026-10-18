import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/lib/db/db";
import { workspaceSettings } from "@/app/lib/db/schema";
import { getWorkspaceAccess } from "@/app/lib/claims/access";

export const runtime = "nodejs";
const defaults = { coverageNotes: "", exclusions: "", deductibleNotes: "", requiredDocuments: [] as string[], aiInstructions: "" };
function cleanContext(input: unknown) {
  const value = input && typeof input === "object" ? input as Record<string, unknown> : {};
  return {
    coverageNotes: typeof value.coverageNotes === "string" ? value.coverageNotes.trim().slice(0, 6000) : "",
    exclusions: typeof value.exclusions === "string" ? value.exclusions.trim().slice(0, 6000) : "",
    deductibleNotes: typeof value.deductibleNotes === "string" ? value.deductibleNotes.trim().slice(0, 3000) : "",
    requiredDocuments: Array.isArray(value.requiredDocuments) ? value.requiredDocuments.filter((item): item is string => typeof item === "string").map((item) => item.trim().slice(0, 160)).filter(Boolean).slice(0, 30) : [],
    aiInstructions: typeof value.aiInstructions === "string" ? value.aiInstructions.trim().slice(0, 3000) : "",
  };
}
export async function GET() {
  const access = await getWorkspaceAccess();
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "unauthorized" ? 401 : 403 });
  const [row] = await db.select({ policyContext: workspaceSettings.policyContext, preferences: workspaceSettings.preferences, updatedAt: workspaceSettings.updatedAt }).from(workspaceSettings).where(eq(workspaceSettings.organizationId, access.organizationId)).limit(1);
  return NextResponse.json({ policyContext: row?.policyContext ?? defaults, preferences: row?.preferences ?? { emailNotifications: true, claimUpdates: true, invitationUpdates: true }, updatedAt: row?.updatedAt ?? null, canEdit: access.role === "admin" || access.role === "owner" });
}
export async function PUT(request: Request) {
  const access = await getWorkspaceAccess();
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "unauthorized" ? 401 : 403 });
  if (access.role !== "admin" && access.role !== "owner") return NextResponse.json({ error: "Only workspace admins can change workspace settings." }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid settings payload." }, { status: 400 });
  const record = body as Record<string, unknown>;
  const policyContext = cleanContext(record.policyContext);
  const rawPrefs = record.preferences && typeof record.preferences === "object" ? record.preferences as Record<string, unknown> : {};
  const preferences = {
    emailNotifications: typeof rawPrefs.emailNotifications === "boolean" ? rawPrefs.emailNotifications : true,
    claimUpdates: typeof rawPrefs.claimUpdates === "boolean" ? rawPrefs.claimUpdates : true,
    invitationUpdates: typeof rawPrefs.invitationUpdates === "boolean" ? rawPrefs.invitationUpdates : true,
  };
  const [existing] = await db.select({ organizationId: workspaceSettings.organizationId }).from(workspaceSettings).where(eq(workspaceSettings.organizationId, access.organizationId)).limit(1);
  const values = { policyContext, preferences, updatedBy: access.session.user.id, updatedAt: new Date() };
  if (existing) await db.update(workspaceSettings).set(values).where(eq(workspaceSettings.organizationId, access.organizationId));
  else await db.insert(workspaceSettings).values({ organizationId: access.organizationId, ...values });
  return NextResponse.json({ ok: true, policyContext, preferences, updatedAt: values.updatedAt });
}
