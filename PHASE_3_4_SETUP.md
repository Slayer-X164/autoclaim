# AutoClaimAI Phase 3 + 4 setup

## 1. Environment

Copy `.env.example` to `.env.local` and fill in your own values. Never commit `.env.local`, any API keys, database URLs with passwords, or service-role/secret keys. `SUPABASE_SECRET_KEY` is preferred; `SUPABASE_SERVICE_ROLE_KEY` remains supported for older projects.

## 2. Supabase Storage buckets

Create these buckets in the same Supabase project:

- `profile-photos`: public bucket, used only for user profile pictures.
- `claim-evidence`: **private** bucket, used for customer claim evidence and evidence-request uploads.

`workspace-logo` uploads currently use `SUPABASE_WORKSPACE_BUCKET` if set, otherwise `profile-photos`; keep that bucket public because workspace logos are displayed without authentication. Never put claim evidence in a public bucket.

## 3. Apply database schema

Back up the database first. Review Drizzle schema changes, then run:

```bash
npm ci
npm run db:push
```

This adds the `workspace_settings` table and `claim_evidence.storage_path`, and makes `claim_evidence.data_url` nullable so new evidence metadata can point to Storage.

## 4. Migrate existing base64 evidence

After `db:push` and bucket creation, run:

```bash
npm run db:migrate-evidence
```

The migration script uploads existing base64 evidence to the private bucket and clears each `data_url` only after its upload succeeds. It skips already-migrated rows, so it can be re-run after correcting an error. Keep a database backup until you've verified the files. Do not run it until the private bucket and server credentials are correct.

## 5. Workspace policy settings and AI

Workspace admins can edit coverage notes, exclusions, deductible notes, required-document names, and extra triage instructions in Settings. These values are stored per organization in PostgreSQL and included in the AI triage prompt. The model receives claim text, filenames, best-effort extracted text from text-based PDFs, and attached image evidence. Image analysis requires a vision-capable model through an OpenAI-compatible chat-completions endpoint (`AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`).

PDF text extraction is deliberately best-effort and only works on some text-based PDFs. Scanned PDFs and image-only documents are not OCR'd in this build. PDF authenticity is not verified. Do not interpret model confidence as calibrated probability, and do not auto-approve or deny claims based on AI output. All submissions stay in the human-review workflow.

## 6. Verification checklist

- [ ] `npm run build` completes successfully.
- [ ] A new claim with an image uploads the file to the private bucket and stores a `storage_path`, not a base64 `data_url`.
- [ ] Authorized workspace members can view/download evidence using short-lived signed URLs.
- [ ] A non-member receives 403/404 and cannot get claim details or signed evidence links.
- [ ] An additional-evidence request uploads to the private bucket and appears in claim activity.
- [ ] `npm run db:migrate-evidence` migrates old data URLs and leaves no successfully migrated `data_url` values.
- [ ] Workspace policy settings survive refresh and changing workspaces shows the correct organization's settings.
- [ ] With an AI provider configured, image claims receive a triage summary and risk flags; if the provider fails, the fallback clearly says AI assessment was unavailable.
- [ ] With no AI provider configured, claims remain in `Needs Review`; the fallback never makes a final decision.

## Important limitations

The app uses an OpenAI-compatible Chat Completions request and JSON output mode. Some gateways/models may not support all of these features; test your chosen model before deployment. Policy notes are manually entered and are not full policy-document ingestion. Scanned-document OCR, document authenticity checks, automated policy interpretation, formal concurrency locking, and production monitoring still require separate work.
