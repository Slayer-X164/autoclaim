import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Please sign in to upload a profile picture." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    }
    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return NextResponse.json({ error: "Use a JPG, PNG, or WebP image." }, { status: 415 });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "The image must be smaller than 5 MB." }, { status: 413 });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_PROFILE_BUCKET || "profile-photos";
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Profile photo storage is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)." }, { status: 503 });
    }

    const objectPath = `${session.user.id}/${randomUUID()}.${extension}`;
    const uploadUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
    const upload = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": file.type,
        "x-upsert": "false",
        "Cache-Control": "3600",
      },
      body: await file.arrayBuffer(),
      cache: "no-store",
    });
    if (!upload.ok) {
      const message = await upload.text().catch(() => "");
      console.error("Supabase Storage upload failed:", upload.status, message);
      return NextResponse.json({ error: "Could not upload the image to Supabase Storage. Check that the profile-photos bucket exists and is public." }, { status: 502 });
    }

    const imageUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${encodeURIComponent(bucket)}/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Profile picture upload failed:", error);
    return NextResponse.json({ error: "Unexpected error while uploading the profile picture." }, { status: 500 });
  }
}
