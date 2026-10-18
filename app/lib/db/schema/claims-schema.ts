import { relations } from "drizzle-orm";
import { index, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organization, user } from "./auth-schema";

export type ClaimStatus = "Processing" | "Needs Review" | "Approved" | "Rejected" | "Auto Approved";
export type ClaimEvidenceKind = "vehicle-image" | "document";

export const claim = pgTable("claim", {
  id: text("id").primaryKey(),
  claimNumber: text("claim_number").notNull().unique(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  vehicleYear: integer("vehicle_year").notNull(),
  registrationNumber: text("registration_number").notNull(),
  accidentDate: text("accident_date").notNull(),
  incidentDescription: text("incident_description").notNull(),
  status: text("status").$type<ClaimStatus>().notNull().default("Processing"),
  aiConfidence: integer("ai_confidence"),
  aiRecommendation: text("ai_recommendation"),
  aiSummary: text("ai_summary"),
  riskFlags: jsonb("risk_flags").$type<string[]>().notNull().default([]),
  aiProvider: text("ai_provider"),
  reviewerId: text("reviewer_id").references(() => user.id, { onDelete: "set null" }),
  reviewerNotes: text("reviewer_notes"),
  decisionAt: timestamp("decision_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("claim_org_created_idx").on(table.organizationId, table.createdAt),
  index("claim_org_status_idx").on(table.organizationId, table.status),
]);

export const claimEvidence = pgTable("claim_evidence", {
  id: text("id").primaryKey(),
  claimId: text("claim_id").notNull().references(() => claim.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  kind: text("kind").$type<ClaimEvidenceKind>().notNull(),
  // New evidence bytes live in private object storage. dataUrl remains nullable for legacy records during migration.
  dataUrl: text("data_url"),
  storagePath: text("storage_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("claim_evidence_claim_idx").on(table.claimId)]);

export const claimActivity = pgTable("claim_activity", {
  id: text("id").primaryKey(),
  claimId: text("claim_id").notNull().references(() => claim.id, { onDelete: "cascade" }),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("claim_activity_org_created_idx").on(table.organizationId, table.createdAt)]);

export const claimRelations = relations(claim, ({ one, many }) => ({
  organization: one(organization, { fields: [claim.organizationId], references: [organization.id] }),
  reviewer: one(user, { fields: [claim.reviewerId], references: [user.id] }),
  evidence: many(claimEvidence),
  activities: many(claimActivity),
}));

export const claimEvidenceRelations = relations(claimEvidence, ({ one }) => ({
  claim: one(claim, { fields: [claimEvidence.claimId], references: [claim.id] }),
}));

export const claimActivityRelations = relations(claimActivity, ({ one }) => ({
  claim: one(claim, { fields: [claimActivity.claimId], references: [claim.id] }),
  organization: one(organization, { fields: [claimActivity.organizationId], references: [organization.id] }),
  actor: one(user, { fields: [claimActivity.actorId], references: [user.id] }),
}));


export const claimEvidenceRequest = pgTable("claim_evidence_request", {
  id: text("id").primaryKey(),
  claimId: text("claim_id").notNull().references(() => claim.id, { onDelete: "cascade" }),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  requestedBy: text("requested_by").references(() => user.id, { onDelete: "set null" }),
  description: text("description").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  fulfilledAt: timestamp("fulfilled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("claim_evidence_request_claim_idx").on(table.claimId), index("claim_evidence_request_org_created_idx").on(table.organizationId, table.createdAt)]);

export const claimInvitation = pgTable("claim_invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  revokedAt: timestamp("revoked_at"),
  claimId: text("claim_id").references(() => claim.id, { onDelete: "set null" }),
  createdBy: text("created_by").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("claim_invitation_org_created_idx").on(table.organizationId, table.createdAt), index("claim_invitation_email_idx").on(table.customerEmail)]);


export const workspaceSettings = pgTable("workspace_settings", {
  organizationId: text("organization_id").primaryKey().references(() => organization.id, { onDelete: "cascade" }),
  policyContext: jsonb("policy_context").$type<{ coverageNotes: string; exclusions: string; deductibleNotes: string; requiredDocuments: string[]; aiInstructions: string }>().notNull().default({ coverageNotes: "", exclusions: "", deductibleNotes: "", requiredDocuments: [], aiInstructions: "" }),
  preferences: jsonb("preferences").$type<{ emailNotifications: boolean; claimUpdates: boolean; invitationUpdates: boolean }>().notNull().default({ emailNotifications: true, claimUpdates: true, invitationUpdates: true }),
  updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
