import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models for Replit Auth integration
export * from "./models/auth";

// Workflow progress tracking
export const workflowProgress = pgTable("workflow_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  componentId: varchar("component_id").notNull(), // e.g., "engagement_structure", "governance", etc.
  stage: varchar("stage").notNull(), // "initiation", "engagement", "synthesis", "continuation"
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Artifacts storage
export const artifacts = pgTable("artifacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  componentId: varchar("component_id").notNull(),
  artifactType: varchar("artifact_type").notNull(), // e.g., "program_charter", "governance_framework"
  title: varchar("title").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertWorkflowProgressSchema = createInsertSchema(workflowProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertArtifactSchema = createInsertSchema(artifacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type WorkflowProgress = typeof workflowProgress.$inferSelect;
export type InsertWorkflowProgress = z.infer<typeof insertWorkflowProgressSchema>;
export type Artifact = typeof artifacts.$inferSelect;
export type InsertArtifact = z.infer<typeof insertArtifactSchema>;
