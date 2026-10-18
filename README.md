# AutoClaimAI

AutoClaimAI is a multi-tenant motor-insurance claim triage prototype built with Next.js, TypeScript, Better Auth, Drizzle ORM, and PostgreSQL. The existing Figma-inspired admin/reviewer dashboard styling and organization-based authentication have been retained.

## Implemented workflow

1. A workspace admin opens the **customer claim portal** from the admin dashboard. The URL is `/claim/<workspace-slug>`.
2. A customer submits contact details, vehicle/accident details, and up to five JPG/PNG/WEBP/PDF evidence files.
3. The claim and evidence are stored in PostgreSQL. An AI triage step runs using an OpenAI-compatible provider if configured; otherwise, a clearly labeled rules-based fallback checks basic completeness.
4. The claim appears in the organization's Claims table. Reviewers/admins can open it, view uploaded evidence and risk flags, add notes, and record a decision.
5. Dashboard KPIs and recent claims are loaded from the database.

**Important:** AI results are advisory only. This prototype does not establish policy coverage, prove fraud, or automatically make a final insurance decision. All submissions go to a human reviewer.

## Setup

Requirements: Node.js 20+, a PostgreSQL database (Supabase PostgreSQL works), and Google OAuth credentials for Better Auth.

```bash
npm ci
cp .env.example .env.local
```

Fill in these environment variables in `.env.local`:

- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: a long random secret
- `BETTER_AUTH_URL` and `NEXT_PUBLIC_BASE_URL`: local URL such as `http://localhost:3000` during development
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
- `RESEND_API_KEY`: optional; used for invitation email delivery
- `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`: optional OpenAI-compatible chat-completions endpoint/model.
- `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`), `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`), `SUPABASE_EVIDENCE_BUCKET=claim-evidence`: server-only credentials for private claim evidence storage. Keep the evidence bucket private; the app creates short-lived signed links for authorized reviewers.

`AI_BASE_URL` should be the API base URL ending in `/v1` (not `/chat/completions`). Configure a vision-capable model for image evidence. Different providers may support different image/PDF formats.

Apply the new claim tables to your database:

```bash
npm run db:push
```

The equivalent SQL is in `drizzle/0002_claim_workflow.sql` if you prefer to apply the migration manually. Back up an existing database before changing its schema.

Then run:

```bash
npm run dev
```

## Storage note

New claim evidence is stored in the private Supabase `claim-evidence` bucket. PostgreSQL stores object paths and metadata; claim detail APIs generate signed URLs for authorized workspace members. Existing base64 records must be migrated with `npm run db:migrate-evidence` after applying the schema and configuring Storage. Malware scanning, retention controls, and upload rate limiting remain production hardening tasks.

## AI provider compatibility

The AI adapter calls `<AI_BASE_URL>/chat/completions` using bearer authentication and JSON output mode. This is intentionally provider-agnostic for OpenAI-compatible APIs. If your provider uses a different API contract, adapt `app/lib/claims/analyze.ts`. When the provider is unset or fails, the app records a rules-based fallback and makes the missing AI analysis explicit rather than pretending a vision model ran.

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run build
```

The database-backed workflow requires valid environment variables and the migration to be applied before testing API routes.


## Customer claim invitations

Admins and owners can create customer-specific claim links from the Admin Dashboard under **Customer claim invitations**. Each invitation has a cryptographically random token; only its SHA-256 hash is stored in the database. Links expire after 72 hours by default and become single-use after a claim is submitted. The invitation email is sent through Resend when configured; otherwise the admin can copy and send the link manually.

### Database update

After pulling these changes, run `npm run db:push` against your configured database to create the `claim_invitation` table. The SQL migration is also provided at `drizzle/0003_claim_invitations.sql` for environments that use reviewed migrations.

### Email configuration

Set `RESEND_API_KEY`, `EMAIL_FROM` (a sender address on a verified Resend domain), and `NEXT_PUBLIC_BASE_URL` (for example `http://localhost:3000` locally, or your deployed HTTPS URL). Restart the development server after editing `.env.local`. If Resend is not configured, the invitation still works and the admin can copy the generated link.

The existing shared `/claim/<workspace-slug>` portal remains available. Invitation links use `/claim/invite/<token>` and are prefilled for the invited customer. The submission API checks the invitation expiry, one-time-use state, organization, and invited email address.


## Recent dashboard improvements

- Global header search submits a claim/customer search and opens the Claims tab. Use Ctrl+K / Cmd+K to focus it. Search supports claim number, customer name/email, vehicle make/model, and registration number.
- Admin **Reviewers** tab lists workspace reviewers, pending claim counts, search, refresh, and invitation modal.
- Admin **Settings** tab displays workspace/account information and lets the admin save local dashboard notification preferences. These preferences are browser-local and do not change server-side email delivery.
- Reviewer settings now save notification preferences locally and clearly explain that password management is handled by Google sign-in.
- A claim review dialog closes after a successful approve, reject, or keep-in-review action. If the request fails, the dialog stays open and shows the error so the reviewer can retry.

After extracting, keep your existing `.env.local`, then run `npm ci`, `npm run db:push` only if schema changes are pending, and `npm run dev`. No new database tables are required for these dashboard changes.


## Phase 3/4 storage and AI policy setup

1. Create a **private** Supabase Storage bucket named `claim-evidence` (or set `SUPABASE_EVIDENCE_BUCKET`). Configure `SUPABASE_URL` and a server-side `SUPABASE_SECRET_KEY` or legacy `SUPABASE_SERVICE_ROLE_KEY`. Do not use `NEXT_PUBLIC_` for a secret.
2. Apply the Drizzle schema changes with `npm run db:push` after reviewing the changes against your database. This adds `workspace_settings` and `claim_evidence.storage_path`, and makes the legacy `data_url` nullable. Back up production before schema changes.
3. Migrate existing evidence from base64 database rows into private object storage by running `npm run db:migrate-evidence` after the schema change. The script skips rows already migrated and only clears `data_url` after each successful upload. Back up your database before running it.
4. Admins can configure workspace policy context under Settings: coverage notes, exclusions, deductible notes, required documents, and additional review instructions. This context is persisted per workspace and included in AI triage prompts. It is not a substitute for policy document parsing, and AI recommendations remain advisory; all claims remain subject to human review.
5. Test new claim submissions and additional-evidence uploads, then open each claim as an authorized workspace member. Evidence links are signed and expire after 10 minutes.

### AI limitations

The AI adapter supports an OpenAI-compatible chat-completions endpoint and passes image evidence to a vision-capable model. It considers workspace-provided policy context and records the provider and triage output. It does **not** currently perform reliable PDF OCR/text extraction or verify document authenticity. PDF evidence remains available to authorized reviewers for manual inspection. Do not use the AI output as an automated coverage/denial decision.
