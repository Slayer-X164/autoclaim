import { randomUUID } from "node:crypto";

function config() {
  const baseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const bucket = process.env.SUPABASE_EVIDENCE_BUCKET || "claim-evidence";
  if (!baseUrl || !key) throw new Error("Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) on the server.");
  return { baseUrl, key, bucket };
}

function encodedPath(path: string) { return path.split("/").map(encodeURIComponent).join("/"); }

export function safeFileName(name: string) {
  const clean = name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-100);
  return clean || "evidence";
}

export async function uploadPrivateEvidence(input: { organizationId: string; claimId: string; evidenceId?: string; fileName: string; mimeType: string; bytes: Buffer | Uint8Array }) {
  const { baseUrl, key, bucket } = config();
  const evidenceId = input.evidenceId || randomUUID();
  const path = `${input.organizationId}/${input.claimId}/${evidenceId}-${safeFileName(input.fileName)}`;
  const url = `${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath(path)}`;
  const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": input.mimeType, "x-upsert": "false", "Cache-Control": "3600" }, body: new Uint8Array(input.bytes), cache: "no-store", signal: AbortSignal.timeout(20_000) });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Private evidence upload failed", response.status, detail.slice(0, 500));
    throw new Error(response.status === 404 ? "Evidence storage bucket was not found. Create the private claim-evidence bucket." : response.status === 401 || response.status === 403 ? "Supabase rejected the storage credentials or permissions." : `Evidence upload failed (Storage ${response.status}).`);
  }
  return { path, evidenceId };
}

export async function createPrivateEvidenceSignedUrl(path: string, expiresIn = 300) {
  const { baseUrl, key, bucket } = config();
  const response = await fetch(`${baseUrl}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${encodedPath(path)}`, { method: "POST", headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn }), cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Could not create evidence signed URL", response.status, detail.slice(0, 300));
    throw new Error("Could not create a secure evidence link. Check the private storage bucket and server credentials.");
  }
  const result = await response.json() as { signedURL?: string; signedUrl?: string };
  const signed = result.signedURL || result.signedUrl;
  if (!signed) throw new Error("Supabase did not return a signed evidence URL.");
  return signed.startsWith("http") ? signed : `${baseUrl}/storage/v1${signed.startsWith("/") ? signed : `/${signed}`}`;
}

export async function downloadPrivateEvidence(path: string) {
  const { baseUrl, key, bucket } = config();
  const response = await fetch(`${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath(path)}`, { headers: { Authorization: `Bearer ${key}`, apikey: key }, cache: "no-store", signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`Could not read stored evidence (Storage ${response.status}).`);
  return Buffer.from(await response.arrayBuffer());
}

export function hasExpectedFileSignature(mimeType: string, bytes: Uint8Array) {
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  if (mimeType === "image/webp") return bytes.length >= 12 && Buffer.from(bytes.slice(0, 4)).toString("ascii") === "RIFF" && Buffer.from(bytes.slice(8, 12)).toString("ascii") === "WEBP";
  if (mimeType === "application/pdf") return bytes.length >= 5 && Buffer.from(bytes.slice(0, 5)).toString("ascii") === "%PDF-";
  return false;
}
