CREATE TABLE IF NOT EXISTS "claim_invitation" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "customer_email" text NOT NULL,
  "customer_name" text NOT NULL,
  "token_hash" text NOT NULL UNIQUE,
  "expires_at" timestamp NOT NULL,
  "used_at" timestamp,
  "revoked_at" timestamp,
  "claim_id" text REFERENCES "claim"("id") ON DELETE SET NULL,
  "created_by" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "claim_invitation_org_created_idx" ON "claim_invitation" ("organization_id", "created_at");
CREATE INDEX IF NOT EXISTS "claim_invitation_email_idx" ON "claim_invitation" ("customer_email");
