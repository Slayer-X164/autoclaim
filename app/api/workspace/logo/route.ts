import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { getWorkspaceAccess } from "@/app/lib/claims/access";
import { db } from "@/app/lib/db/db";
import { organization, member } from "@/app/lib/db/schema";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export async function POST(request: Request) {
  const access = await getWorkspaceAccess();
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.error === "unauthorized" ? 401 : 403 });
  if (!["admin", "owner"].includes(access.role)) return NextResponse.json({ error: "Only workspace admins can change the workspace picture." }, { status: 403 });
  try {
    const form = await request.formData(); const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    const ext = TYPES[file.type]; if (!ext) return NextResponse.json({ error: "Use a JPG, PNG, or WebP image." }, { status: 415 });
    if (!file.size || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 413 });
    const base = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_WORKSPACE_BUCKET || process.env.SUPABASE_PROFILE_BUCKET || "profile-photos";
    if (!base || !key) return NextResponse.json({ error: "Storage is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) on the server." }, { status: 503 });
    const path = `workspaces/${access.organizationId}/${randomUUID()}.${ext}`;
    const endpoint = `${base.replace(/\/$/, "")}/storage/v1/object/${encodeURIComponent(bucket)}/${path.split("/").map(encodeURIComponent).join("/")}`;
    const upload = await fetch(endpoint, { method: "POST", headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": file.type, "x-upsert": "false", "Cache-Control": "3600" }, body: await file.arrayBuffer(), cache: "no-store" });
    if (!upload.ok) { const detail = await upload.text().catch(() => ""); console.error("Workspace logo upload failed", upload.status, detail); return NextResponse.json({ error: `Supabase Storage rejected the upload (${upload.status}). Check the bucket and server credentials.` }, { status: 502 }); }
    const url = `${base.replace(/\/$/, "")}/storage/v1/object/public/${encodeURIComponent(bucket)}/${path.split("/").map(encodeURIComponent).join("/")}`;
    await db.update(organization).set({ logo: url }).where(eq(organization.id, access.organizationId));
    return NextResponse.json({ imageUrl: url });
  } catch (error) { console.error("Workspace logo update failed", error); return NextResponse.json({ error: "Could not update the workspace picture." }, { status: 500 }); }
}
