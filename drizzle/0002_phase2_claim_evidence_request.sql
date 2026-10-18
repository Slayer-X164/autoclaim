CREATE TABLE IF NOT EXISTS "claim_evidence_request" (
  "id" text PRIMARY KEY NOT NULL,
  "claim_id" text NOT NULL REFERENCES "claim"("id") ON DELETE CASCADE,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "requested_by" text REFERENCES "user"("id") ON DELETE SET NULL,
  "description" text NOT NULL,
  "token_hash" text NOT NULL UNIQUE,
  "expires_at" timestamp NOT NULL,
  "fulfilled_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "claim_evidence_request_claim_idx" ON "claim_evidence_request" ("claim_id");
CREATE INDEX IF NOT EXISTS "claim_evidence_request_org_created_idx" ON "claim_evidence_request" ("organization_id", "created_at");
