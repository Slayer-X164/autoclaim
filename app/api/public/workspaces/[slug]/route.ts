import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/lib/db/db";
import { organization } from "@/app/lib/db/schema";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const [workspace] = await db.select({ name: organization.name, slug: organization.slug }).from(organization).where(eq(organization.slug, slug)).limit(1);
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  return NextResponse.json({ workspace });
}
