import postgres from 'postgres';
import { randomUUID } from 'node:crypto';

const databaseUrl = process.env.DATABASE_URL;
const baseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_EVIDENCE_BUCKET || 'claim-evidence';
if (!databaseUrl || !baseUrl || !key) {
  console.error('Set DATABASE_URL, SUPABASE_URL, and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) before migrating evidence.');
  process.exit(1);
}
const sql = postgres(databaseUrl, { prepare: false, max: 1 });
const cleanName = (name) => name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(-100) || 'evidence';
try {
  const rows = await sql`select e.id, e.claim_id, e.file_name, e.mime_type, e.data_url, c.organization_id from claim_evidence e join claim c on c.id = e.claim_id where e.storage_path is null and e.data_url is not null order by e.created_at`;
  console.log(`Found ${rows.length} legacy evidence file(s) to migrate.`);
  let migrated = 0;
  for (const row of rows) {
    const match = /^data:([^;,]+);base64,([\s\S]+)$/.exec(row.data_url);
    if (!match) { console.warn(`Skipping ${row.id}: unrecognized legacy data URL.`); continue; }
    const mimeType = match[1];
    const bytes = Buffer.from(match[2], 'base64');
    const path = `${row.organization_id}/${row.claim_id}/${row.id || randomUUID()}-${cleanName(row.file_name)}`;
    const response = await fetch(`${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${path.split('/').map(encodeURIComponent).join('/')}`, {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, apikey: key, 'Content-Type': mimeType, 'x-upsert': 'false', 'Cache-Control': '3600' }, body: bytes,
    });
    if (!response.ok) {
      console.error(`Upload failed for ${row.file_name} (${response.status}): ${(await response.text()).slice(0, 250)}`);
      throw new Error('Migration stopped. No database record was changed for this failed file. Re-run after fixing storage; existing migrated rows are skipped.');
    }
    await sql`update claim_evidence set storage_path = ${path}, data_url = null where id = ${row.id}`;
    migrated++;
    console.log(`Migrated ${migrated}/${rows.length}: ${row.file_name}`);
  }
  console.log(`Done. Migrated ${migrated} file(s).`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await sql.end();
}
