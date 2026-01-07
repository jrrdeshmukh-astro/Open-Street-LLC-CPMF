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
  // Government contracting stages (SAM.gov)
  contractingStage: varchar("contracting_stage").default("sources_sought"), // sources_sought, rfi, presolicitation, solicitation, award, post_award, completed
  contractingStageHistory: text("contracting_stage_history"), // JSON: [{stage, date, notes}]
  samOpportunityId: varchar("sam_opportunity_id"), // SAM.gov opportunity ID
  naicsCode: varchar("naics_code"), // NAICS code for the opportunity
  pscCode: varchar("psc_code"), // Product Service Code
  setAside: varchar("set_aside"), // small_business, sdvosb, wosb, hubzone, 8a, none
  estimatedValue: varchar("estimated_value"), // Estimated contract value
  responseDeadline: timestamp("response_deadline"), // Deadline for response
  // Asana integration
  asanaProjectId: varchar("asana_project_id"),
  asanaTaskId: varchar("asana_task_id"),
  asanaSyncedAt: timestamp("asana_synced_at"),
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
  // Jira integration fields
  jiraIssueId: varchar("jira_issue_id"),
  jiraKey: varchar("jira_key"), // e.g., PROJ-123
  jiraStatus: varchar("jira_status"),
  jiraProjectKey: varchar("jira_project_key"),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Jira settings for user's Jira connection
export const jiraSettings = pgTable("jira_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  jiraDomain: varchar("jira_domain").notNull(), // e.g., yourcompany.atlassian.net
  jiraEmail: varchar("jira_email").notNull(),
  jiraApiToken: varchar("jira_api_token").notNull(), // Encrypted or stored securely
  defaultProjectKey: varchar("default_project_key"),
  syncEnabled: boolean("sync_enabled").default(true),
  lastSyncAt: timestamp("last_sync_at"),
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

// SAM.gov opportunities
export const opportunities = pgTable("opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  externalId: varchar("external_id").notNull(), // SAM.gov noticeId
  title: varchar("title").notNull(),
  solicitationNumber: varchar("solicitation_number"),
  agency: varchar("agency"),
  subAgency: varchar("sub_agency"),
  office: varchar("office"),
  noticeType: varchar("notice_type"), // presolicitation, solicitation, combined, etc.
  contractType: varchar("contract_type"), // Fixed Price, Cost Reimbursement, etc.
  naicsCodes: text("naics_codes"), // JSON array of NAICS codes
  pscCodes: text("psc_codes"), // JSON array of PSC codes
  setAsideType: varchar("set_aside_type"), // Small Business, 8(a), HUBZone, etc.
  responseDeadline: timestamp("response_deadline"),
  postedDate: timestamp("posted_date"),
  archiveDate: timestamp("archive_date"),
  placeOfPerformance: text("place_of_performance"), // JSON with city/state/country
  description: text("description"),
  synopsis: text("synopsis"),
  contactInfo: text("contact_info"), // JSON with contact details
  attachmentLinks: text("attachment_links"), // JSON array of attachment URLs
  rawJson: text("raw_json"), // Full API response for reference
  syncedAt: timestamp("synced_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [index("idx_opportunities_external").on(table.externalId)]);

// Workflow templates for different opportunity types
export const workflowTemplates = pgTable("workflow_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  triggerRules: text("trigger_rules"), // JSON: NAICS codes, notice types, contract types that trigger this template
  componentStageMatrix: text("component_stage_matrix"), // JSON: which components/stages are relevant
  defaultActions: text("default_actions"), // JSON: default action items to create
  recommendedGuides: text("recommended_guides"), // JSON: array of guide IDs
  recommendedForms: text("recommended_forms"), // JSON: array of form template IDs
  estimatedDuration: integer("estimated_duration"), // Days to complete
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workflow instances - links opportunities to active workflows
export const workflowInstances = pgTable("workflow_instances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  opportunityId: varchar("opportunity_id").notNull(),
  templateId: varchar("template_id"),
  userId: varchar("user_id").notNull(),
  clientId: varchar("client_id"),
  name: varchar("name").notNull(),
  status: varchar("status").default("active"), // active, paused, completed, archived
  startDate: timestamp("start_date").defaultNow(),
  targetDate: timestamp("target_date"), // Typically response deadline
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  customConfig: text("custom_config"), // JSON: any customizations to the template
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_workflow_instances_opportunity").on(table.opportunityId),
  index("idx_workflow_instances_user").on(table.userId),
]);

// Messages for async communication
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  recipientId: varchar("recipient_id"), // Target user for the message
  clientId: varchar("client_id"),
  parentId: varchar("parent_id"), // for threaded replies
  subject: varchar("subject"),
  content: text("content").notNull(),
  // Delivery tracking
  sentAt: timestamp("sent_at").defaultNow(),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  deliveryStatus: varchar("delivery_status").default("sent"), // sent, delivered, read, failed
  // Slack integration
  slackChannelId: varchar("slack_channel_id"),
  slackMessageTs: varchar("slack_message_ts"), // Slack message timestamp ID
  slackSyncedAt: timestamp("slack_synced_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [index("idx_messages_client").on(table.clientId)]);

// Slack settings for user's Slack connection
export const slackSettings = pgTable("slack_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  workspaceName: varchar("workspace_name"),
  webhookUrl: varchar("webhook_url"), // Incoming webhook for sending messages
  botToken: varchar("bot_token"), // Bot OAuth token for full API access
  defaultChannelId: varchar("default_channel_id"),
  defaultChannelName: varchar("default_channel_name"),
  syncEnabled: boolean("sync_enabled").default(true),
  notifyOnNewMessage: boolean("notify_on_new_message").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Session activity log for logout summary
export const sessionActivities = pgTable("session_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  sessionId: varchar("session_id").notNull(),
  activityType: varchar("activity_type").notNull(), // login, logout, create, update, delete, view
  entityType: varchar("entity_type"), // client, action, message, form, etc.
  entityId: varchar("entity_id"),
  entityName: varchar("entity_name"), // Human-readable name for the entity
  description: text("description"), // Human-readable description of the action
  metadata: text("metadata"), // JSON with additional context
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_session_activities_user").on(table.userId),
  index("idx_session_activities_session").on(table.sessionId),
]);

// Asana settings for CRM integration
export const asanaSettings = pgTable("asana_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  accessToken: varchar("access_token"), // Asana Personal Access Token
  workspaceId: varchar("workspace_id"), // Asana workspace GID
  workspaceName: varchar("workspace_name"),
  defaultProjectId: varchar("default_project_id"), // Default project for new clients
  defaultProjectName: varchar("default_project_name"),
  syncEnabled: boolean("sync_enabled").default(true),
  autoCreateTasks: boolean("auto_create_tasks").default(true), // Create Asana tasks for new clients
  syncStages: boolean("sync_stages").default(true), // Sync contracting stages with Asana sections
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Collaborations - links industry partners and academia for shared workflows
export const collaborations = pgTable("collaborations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull(),
  ownerId: varchar("owner_id").notNull(), // User who created the collaboration
  collaboratorId: varchar("collaborator_id").notNull(), // Invited user
  collaboratorEmail: varchar("collaborator_email"), // For pending invites
  role: varchar("role").default("collaborator"), // owner, collaborator
  status: varchar("status").default("pending"), // pending, accepted, declined
  invitedAt: timestamp("invited_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_collaborations_client").on(table.clientId),
  index("idx_collaborations_collaborator").on(table.collaboratorId),
]);

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

export const insertCollaborationSchema = createInsertSchema(collaborations).omit({
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

export const insertJiraSettingsSchema = createInsertSchema(jiraSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSlackSettingsSchema = createInsertSchema(slackSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSessionActivitySchema = createInsertSchema(sessionActivities).omit({
  id: true,
  createdAt: true,
});

export const insertAsanaSettingsSchema = createInsertSchema(asanaSettings).omit({
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
export type Collaboration = typeof collaborations.$inferSelect;
export type InsertCollaboration = z.infer<typeof insertCollaborationSchema>;
export type Guide = typeof guides.$inferSelect;
export type InsertGuide = z.infer<typeof insertGuideSchema>;
export type FormTemplate = typeof formTemplates.$inferSelect;
export type InsertFormTemplate = z.infer<typeof insertFormTemplateSchema>;
export type FormSubmission = typeof formSubmissions.$inferSelect;
export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;
export type JiraSettings = typeof jiraSettings.$inferSelect;
export type InsertJiraSettings = z.infer<typeof insertJiraSettingsSchema>;
export type SlackSettings = typeof slackSettings.$inferSelect;
export type InsertSlackSettings = z.infer<typeof insertSlackSettingsSchema>;
export type SessionActivity = typeof sessionActivities.$inferSelect;
export type InsertSessionActivity = z.infer<typeof insertSessionActivitySchema>;
export type AsanaSettings = typeof asanaSettings.$inferSelect;
export type InsertAsanaSettings = z.infer<typeof insertAsanaSettingsSchema>;

// Opportunity schemas
export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  syncedAt: true,
});

export const insertWorkflowTemplateSchema = createInsertSchema(workflowTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkflowInstanceSchema = createInsertSchema(workflowInstances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type WorkflowTemplate = typeof workflowTemplates.$inferSelect;
export type InsertWorkflowTemplate = z.infer<typeof insertWorkflowTemplateSchema>;
export type WorkflowInstance = typeof workflowInstances.$inferSelect;
export type InsertWorkflowInstance = z.infer<typeof insertWorkflowInstanceSchema>;
