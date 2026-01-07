import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

// Workflow progress tracking
export const workflowProgress = pgTable("workflow_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  componentId: varchar("component_id").notNull(),
  stage: varchar("stage").notNull(),
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
  artifactType: varchar("artifact_type").notNull(),
  title: varchar("title").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clients / Engagements for intake forms
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  organization: varchar("organization"),
  email: varchar("email"),
  phone: varchar("phone"),
  sector: varchar("sector"), // government, industry, academia
  notes: text("notes"),
  intakeData: text("intake_data"), // JSON string for flexible intake form responses
  status: varchar("status").default("active"), // active, completed, archived
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Time entries for time tracking
export const timeEntries = pgTable("time_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  clientId: varchar("client_id"),
  componentId: varchar("component_id"),
  description: text("description").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  durationMinutes: integer("duration_minutes"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  billable: boolean("billable").default(true),
  invoiced: boolean("invoiced").default(false),
  invoiceId: varchar("invoice_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Actions for timebound action waterfall
export const actions = pgTable("actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  clientId: varchar("client_id"),
  componentId: varchar("component_id"),
  title: varchar("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  completedAt: timestamp("completed_at"),
  status: varchar("status").default("pending"), // pending, in_progress, completed, overdue
  priority: varchar("priority").default("medium"), // low, medium, high, urgent
  assignee: varchar("assignee"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices for billing
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  clientId: varchar("client_id").notNull(),
  invoiceNumber: varchar("invoice_number").notNull(),
  status: varchar("status").default("draft"), // draft, sent, paid, overdue
  issueDate: timestamp("issue_date").defaultNow(),
  dueDate: timestamp("due_date"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice line items
export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull(),
  timeEntryId: varchar("time_entry_id"),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Debrief templates for post-engagement
export const debriefTemplates = pgTable("debrief_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  questions: text("questions"), // JSON array of questions
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Debrief records (completed debriefs)
export const debriefRecords = pgTable("debrief_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  clientId: varchar("client_id"),
  templateId: varchar("template_id"),
  title: varchar("title").notNull(),
  responses: text("responses"), // JSON object with question/answer pairs
  findings: text("findings"),
  recommendations: text("recommendations"),
  status: varchar("status").default("draft"), // draft, completed
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guides for knowledge/documentation
export const guides = pgTable("guides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  componentId: varchar("component_id").notNull(),
  stage: varchar("stage").notNull(),
  title: varchar("title").notNull(),
  summary: text("summary"),
  content: text("content").notNull(), // Markdown content
  roleVisibility: text("role_visibility"), // JSON array of roles that can see this guide
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Form templates for actionable forms
export const formTemplates = pgTable("form_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  componentId: varchar("component_id").notNull(),
  stage: varchar("stage").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  formSchema: text("form_schema").notNull(), // JSON schema for form fields
  roleVisibility: text("role_visibility"), // JSON array of roles
  artifactType: varchar("artifact_type"), // Links to artifact creation
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Form submissions (completed forms)
export const formSubmissions = pgTable("form_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull(),
  userId: varchar("user_id").notNull(),
  clientId: varchar("client_id"),
  componentId: varchar("component_id").notNull(),
  stage: varchar("stage").notNull(),
  responses: text("responses").notNull(), // JSON object with form responses
  status: varchar("status").default("draft"), // draft, submitted, approved, rejected
  submittedAt: timestamp("submitted_at"),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [index("idx_form_submissions_user").on(table.userId)]);

// Messages for async communication
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  clientId: varchar("client_id"),
  parentId: varchar("parent_id"), // for threaded replies
  subject: varchar("subject"),
  content: text("content").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [index("idx_messages_client").on(table.clientId)]);

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

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActionSchema = createInsertSchema(actions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
  createdAt: true,
});

export const insertDebriefTemplateSchema = createInsertSchema(debriefTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDebriefRecordSchema = createInsertSchema(debriefRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuideSchema = createInsertSchema(guides).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFormTemplateSchema = createInsertSchema(formTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFormSubmissionSchema = createInsertSchema(formSubmissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type WorkflowProgress = typeof workflowProgress.$inferSelect;
export type InsertWorkflowProgress = z.infer<typeof insertWorkflowProgressSchema>;
export type Artifact = typeof artifacts.$inferSelect;
export type InsertArtifact = z.infer<typeof insertArtifactSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type Action = typeof actions.$inferSelect;
export type InsertAction = z.infer<typeof insertActionSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type DebriefTemplate = typeof debriefTemplates.$inferSelect;
export type InsertDebriefTemplate = z.infer<typeof insertDebriefTemplateSchema>;
export type DebriefRecord = typeof debriefRecords.$inferSelect;
export type InsertDebriefRecord = z.infer<typeof insertDebriefRecordSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Guide = typeof guides.$inferSelect;
export type InsertGuide = z.infer<typeof insertGuideSchema>;
export type FormTemplate = typeof formTemplates.$inferSelect;
export type InsertFormTemplate = z.infer<typeof insertFormTemplateSchema>;
export type FormSubmission = typeof formSubmissions.$inferSelect;
export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;
