CREATE TABLE IF NOT EXISTS "claim" (
  "id" text PRIMARY KEY NOT NULL,
  "claim_number" text NOT NULL UNIQUE,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "customer_name" text NOT NULL,
  "customer_email" text NOT NULL,
  "vehicle_make" text NOT NULL,
  "vehicle_model" text NOT NULL,
  "vehicle_year" integer NOT NULL,
  "registration_number" text NOT NULL,
  "accident_date" text NOT NULL,
  "incident_description" text NOT NULL,
  "status" text DEFAULT 'Processing' NOT NULL,
  "ai_confidence" integer,
  "ai_recommendation" text,
  "ai_summary" text,
  "risk_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "ai_provider" text,
  "reviewer_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "reviewer_notes" text,
  "decision_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "claim_org_created_idx" ON "claim" ("organization_id", "created_at");
CREATE INDEX IF NOT EXISTS "claim_org_status_idx" ON "claim" ("organization_id", "status");

CREATE TABLE IF NOT EXISTS "claim_evidence" (
  "id" text PRIMARY KEY NOT NULL,
  "claim_id" text NOT NULL REFERENCES "claim"("id") ON DELETE CASCADE,
  "file_name" text NOT NULL,
  "mime_type" text NOT NULL,
  "file_size" integer NOT NULL,
  "kind" text NOT NULL,
  "data_url" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "claim_evidence_claim_idx" ON "claim_evidence" ("claim_id");

CREATE TABLE IF NOT EXISTS "claim_activity" (
  "id" text PRIMARY KEY NOT NULL,
  "claim_id" text NOT NULL REFERENCES "claim"("id") ON DELETE CASCADE,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "actor_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "action" text NOT NULL,
  "details" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "claim_activity_org_created_idx" ON "claim_activity" ("organization_id", "created_at");
