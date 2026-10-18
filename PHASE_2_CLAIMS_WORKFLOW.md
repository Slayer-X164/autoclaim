# Phase 2 — Claims workflow

## Implemented in this update

- Admin/owner claim assignment and reassignment to a reviewer in the active workspace.
- Reviewers see only claims assigned to them in the claims queue and cannot open or decide claims assigned to other reviewers.
- Assignment/unassignment, claim decisions, evidence requests, and evidence uploads are recorded in `claim_activity`.
- Reviewers can request additional evidence by writing a clear request. The customer receives an email with a unique upload link.
- Evidence upload links are random bearer tokens; only the SHA-256 hash is stored in the database. Links expire after 7 days and a request can be fulfilled once.
- Customer upload endpoint accepts up to five JPG/PNG/WebP/PDF files, up to 2 MB each and 7 MB total.
- Submitted claim status page includes outstanding and fulfilled evidence requests and continues polling for updates.

## Database setup

The Drizzle schema adds `claim_evidence_request`. Apply the schema to your development database using:

```bash
npm run db:push
```

Alternatively, review and apply `drizzle/0002_phase2_claim_evidence_request.sql` using your database migration process. Do not run both approaches blindly against production; inspect the resulting schema first.

## Email setup

Evidence request emails use the existing Resend configuration:

```env
RESEND_API_KEY=...
EMAIL_FROM=AutoClaim AI <noreply@your-verified-domain.com>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, set `NEXT_PUBLIC_APP_URL` to the HTTPS origin of the deployed app. Keep secrets server-side.

## Important current limitation

Evidence bytes still use the prototype `dataUrl` field in PostgreSQL. This phase provides a time-limited, token-protected customer upload flow, but Phase 3 should move evidence bytes to a private Supabase Storage bucket and use short-lived signed download URLs. Until then, use this only with non-production/test data.

## Test plan

1. Log in as workspace admin and assign a claim to a reviewer in the same workspace.
2. Confirm another workspace's reviewer cannot be selected.
3. Log in as the assigned reviewer and confirm the claim is visible; verify unassigned claims and another reviewer's claims are not visible/openable.
4. Request a specific document/photo and confirm the customer email arrives with the configured origin.
5. Open the upload link, upload valid evidence, and confirm the request changes to `Evidence received` and the claim is returned to `Needs Review`.
6. Confirm an expired link returns 410 and a fulfilled link cannot be used a second time.
7. Confirm claim activity contains assignment, evidence request, evidence receipt, and decision events.
8. Run `npm run build` and test the entire flow against a disposable database before deployment.
