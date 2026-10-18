# Auth and dashboard notifications setup

## Required environment variables

Configure these in `.env.local` (never commit secrets):

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL=http://localhost:3000`
- `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
- `RESEND_API_KEY`
- `EMAIL_FROM` using a sender/domain verified in Resend
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

Email OTP is sent through Resend. Without a valid Resend key and verified sender, OTP requests will fail and show an error in the login UI.

## OAuth callback URLs

For local development, configure these callback URLs in the OAuth provider dashboards:

- Google: `http://localhost:3000/api/auth/callback/google`
- GitHub: `http://localhost:3000/api/auth/callback/github`

For production, add the equivalent URLs using your deployed origin.

## Features included

- Six-digit email OTP sign-in with a five-minute expiry and resend/change-email flow.
- GitHub and Google OAuth buttons.
- Reviewer invitation page restyled to match the blue-and-white AutoClaimAI login theme. OTP sign-in accepts the invitation after authentication.
- Admin notifications show recent workspace claim activity. Reviewer notifications are scoped to claims currently assigned to that reviewer. The bell refreshes every 30 seconds and supports marking notifications read locally.

No new database table or migration was added for these features. Notifications are sourced from the existing `claim_activity` records, so actions only appear if the app writes corresponding activity rows.


## Profile and responsive dashboard updates
- Admins and reviewers can update their account name and profile picture URL from Settings. The email field is read-only.
- The dashboard header uses the signed-in account name (with email-prefix fallback) instead of remaining on a Loading placeholder.
- Dashboard navigation becomes a slide-in menu on small screens; header, settings forms, cards and tables use mobile-friendly sizing/overflow behavior.
- Profile picture changes currently accept a publicly accessible image URL. For private uploads, configure an image/object-storage provider before production.


## Profile and workspace pictures
Create a Supabase Storage bucket (default `profile-photos`) and configure `SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY` in server-side environment variables. The bucket must be public when using public object URLs for displaying pictures. Profile photos upload through `/api/profile/avatar`; workspace pictures upload through `/api/workspace/logo`, which requires an admin/owner membership. Both accept JPG, PNG, and WebP up to 5 MB. Do not expose the service key with a `NEXT_PUBLIC_` prefix.


## Claim evidence storage and workspace policy settings

Claim evidence must use a separate **private** Supabase Storage bucket (default `claim-evidence`). Configure `SUPABASE_URL` and either `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` on the server only, plus optional `SUPABASE_EVIDENCE_BUCKET`. Run `npm run db:push` after reviewing the schema, then `npm run db:migrate-evidence` to move existing base64 evidence into Storage. Existing records are retained until each upload succeeds.

Admins can persist workspace policy notes and required-document checklists from Settings. The notes guide AI triage but are not full policy ingestion. AI results are advisory and a human reviewer remains responsible for the final decision. PDF OCR/document text extraction is not enabled in this version.
