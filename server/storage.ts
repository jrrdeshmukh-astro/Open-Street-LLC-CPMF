import { 
  workflowProgress, artifacts, clients, timeEntries, actions, invoices, invoiceItems, debriefTemplates, debriefRecords, messages,
  guides, formTemplates, formSubmissions, opportunities, workflowTemplates, workflowInstances, collaborations, jiraSettings,
  slackSettings, sessionActivities, asanaSettings, contractTemplates, contracts, legalSettings, billingRates, taskCodes,
  type WorkflowProgress, type InsertWorkflowProgress,
  type Artifact, type InsertArtifact,
  type Client, type InsertClient,
  type TimeEntry, type InsertTimeEntry,
  type Action, type InsertAction,
  type Invoice, type InsertInvoice,
  type InvoiceItem, type InsertInvoiceItem,
  type DebriefTemplate, type InsertDebriefTemplate,
  type DebriefRecord, type InsertDebriefRecord,
  type Message, type InsertMessage,
  type Guide, type InsertGuide,
  type FormTemplate, type InsertFormTemplate,
  type FormSubmission, type InsertFormSubmission,
  type Opportunity, type InsertOpportunity,
  type WorkflowTemplate, type InsertWorkflowTemplate,
  type WorkflowInstance, type InsertWorkflowInstance,
  type Collaboration, type InsertCollaboration,
  type JiraSettings, type InsertJiraSettings,
  type SlackSettings, type InsertSlackSettings,
  type SessionActivity, type InsertSessionActivity,
  type AsanaSettings, type InsertAsanaSettings,
  type ContractTemplate, type InsertContractTemplate,
  type Contract, type InsertContract,
  type LegalSettings, type InsertLegalSettings,
  type BillingRate, type InsertBillingRate,
  type TaskCode, type InsertTaskCode
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, or, inArray, isNull } from "drizzle-orm";

export class DatabaseStorage {
  // Workflow Progress
  async getWorkflowProgress(userId: string): Promise<WorkflowProgress[]> {
    return await db.select().from(workflowProgress).where(eq(workflowProgress.userId, userId));
  }

  async getWorkflowProgressByStage(userId: string, componentId: string, stage: string): Promise<WorkflowProgress | undefined> {
    const [progress] = await db.select().from(workflowProgress)
      .where(and(eq(workflowProgress.userId, userId), eq(workflowProgress.componentId, componentId), eq(workflowProgress.stage, stage)));
    return progress;
  }

  async upsertWorkflowProgress(progress: InsertWorkflowProgress): Promise<WorkflowProgress> {
    const existing = await this.getWorkflowProgressByStage(progress.userId, progress.componentId, progress.stage);
    
    if (existing) {
      const effectiveCompleted = progress.completed ?? existing.completed ?? false;
      let completedAt = existing.completedAt;
      if (effectiveCompleted && !existing.completed) completedAt = new Date();
      else if (!effectiveCompleted) completedAt = null;
      
      const [updated] = await db.update(workflowProgress)
        .set({ completed: effectiveCompleted, notes: progress.notes ?? existing.notes, updatedAt: new Date(), completedAt })
        .where(eq(workflowProgress.id, existing.id)).returning();
      return updated;
    }
    
    const [created] = await db.insert(workflowProgress).values({
      userId: progress.userId, componentId: progress.componentId, stage: progress.stage,
      completed: progress.completed ?? false, notes: progress.notes ?? "",
      completedAt: progress.completed ? new Date() : null,
    }).returning();
    return created;
  }

  // Artifacts
  async getArtifacts(userId: string): Promise<Artifact[]> {
    return await db.select().from(artifacts).where(eq(artifacts.userId, userId));
  }

  async getArtifactsByComponent(userId: string, componentId: string): Promise<Artifact[]> {
    return await db.select().from(artifacts).where(and(eq(artifacts.userId, userId), eq(artifacts.componentId, componentId)));
  }

  async upsertArtifact(artifact: InsertArtifact): Promise<Artifact> {
    const [existing] = await db.select().from(artifacts)
      .where(and(eq(artifacts.userId, artifact.userId), eq(artifacts.componentId, artifact.componentId), eq(artifacts.artifactType, artifact.artifactType)));
    
    if (existing) {
      const [updated] = await db.update(artifacts)
        .set({ title: artifact.title ?? existing.title, content: artifact.content ?? existing.content, updatedAt: new Date() })
        .where(eq(artifacts.id, existing.id)).returning();
      return updated;
    }
    
    const [created] = await db.insert(artifacts).values({
      userId: artifact.userId, componentId: artifact.componentId, artifactType: artifact.artifactType,
      title: artifact.title, content: artifact.content ?? "",
    }).returning();
    return created;
  }

  async deleteArtifact(id: string, userId: string): Promise<void> {
    await db.delete(artifacts).where(and(eq(artifacts.id, id), eq(artifacts.userId, userId)));
  }

  // Clients
  async getClients(userId: string): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.userId, userId)).orderBy(desc(clients.createdAt));
  }

  async getClient(id: string, userId: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(and(eq(clients.id, id), eq(clients.userId, userId)));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [created] = await db.insert(clients).values(client).returning();
    return created;
  }

  async updateClient(id: string, userId: string, data: Partial<InsertClient>): Promise<Client> {
    const [updated] = await db.update(clients).set({ ...data, updatedAt: new Date() })
      .where(and(eq(clients.id, id), eq(clients.userId, userId))).returning();
    return updated;
  }

  async deleteClient(id: string, userId: string): Promise<void> {
    await db.delete(clients).where(and(eq(clients.id, id), eq(clients.userId, userId)));
  }

  // Time Entries
  async getTimeEntries(userId: string): Promise<TimeEntry[]> {
    return await db.select().from(timeEntries).where(eq(timeEntries.userId, userId)).orderBy(desc(timeEntries.startTime));
  }

  async getTimeEntriesByClient(userId: string, clientId: string): Promise<TimeEntry[]> {
    return await db.select().from(timeEntries).where(and(eq(timeEntries.userId, userId), eq(timeEntries.clientId, clientId)));
  }

  async createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry> {
    const [created] = await db.insert(timeEntries).values(entry).returning();
    return created;
  }

  async updateTimeEntry(id: string, userId: string, data: Partial<InsertTimeEntry>): Promise<TimeEntry> {
    const [updated] = await db.update(timeEntries).set({ ...data, updatedAt: new Date() })
      .where(and(eq(timeEntries.id, id), eq(timeEntries.userId, userId))).returning();
    return updated;
  }

  async deleteTimeEntry(id: string, userId: string): Promise<void> {
    await db.delete(timeEntries).where(and(eq(timeEntries.id, id), eq(timeEntries.userId, userId)));
  }

  // Actions
  async getActions(userId: string): Promise<Action[]> {
    return await db.select().from(actions).where(eq(actions.userId, userId)).orderBy(actions.dueDate);
  }

  async createAction(action: InsertAction): Promise<Action> {
    const [created] = await db.insert(actions).values(action).returning();
    return created;
  }

  async updateAction(id: string, userId: string, data: Partial<InsertAction>): Promise<Action> {
    const [updated] = await db.update(actions).set({ ...data, updatedAt: new Date() })
      .where(and(eq(actions.id, id), eq(actions.userId, userId))).returning();
    return updated;
  }

  async deleteAction(id: string, userId: string): Promise<void> {
    await db.delete(actions).where(and(eq(actions.id, id), eq(actions.userId, userId)));
  }

  // Invoices
  async getInvoices(userId: string): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string, userId: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
    return invoice;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [created] = await db.insert(invoices).values(invoice).returning();
    return created;
  }

  async updateInvoice(id: string, userId: string, data: Partial<InsertInvoice>): Promise<Invoice> {
    const [updated] = await db.update(invoices).set({ ...data, updatedAt: new Date() })
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId))).returning();
    return updated;
  }

  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    const [created] = await db.insert(invoiceItems).values(item).returning();
    return created;
  }

  // Debrief Templates
  async getDebriefTemplates(userId: string): Promise<DebriefTemplate[]> {
    return await db.select().from(debriefTemplates).where(eq(debriefTemplates.userId, userId));
  }

  async createDebriefTemplate(template: InsertDebriefTemplate): Promise<DebriefTemplate> {
    const [created] = await db.insert(debriefTemplates).values(template).returning();
    return created;
  }

  async updateDebriefTemplate(id: string, userId: string, data: Partial<InsertDebriefTemplate>): Promise<DebriefTemplate> {
    const [updated] = await db.update(debriefTemplates).set({ ...data, updatedAt: new Date() })
      .where(and(eq(debriefTemplates.id, id), eq(debriefTemplates.userId, userId))).returning();
    return updated;
  }

  async deleteDebriefTemplate(id: string, userId: string): Promise<void> {
    await db.delete(debriefTemplates).where(and(eq(debriefTemplates.id, id), eq(debriefTemplates.userId, userId)));
  }

  // Debrief Records
  async getDebriefRecords(userId: string): Promise<DebriefRecord[]> {
    return await db.select().from(debriefRecords).where(eq(debriefRecords.userId, userId)).orderBy(desc(debriefRecords.createdAt));
  }

  async createDebriefRecord(record: InsertDebriefRecord): Promise<DebriefRecord> {
    const [created] = await db.insert(debriefRecords).values(record).returning();
    return created;
  }

  async updateDebriefRecord(id: string, userId: string, data: Partial<InsertDebriefRecord>): Promise<DebriefRecord> {
    const [updated] = await db.update(debriefRecords).set({ ...data, updatedAt: new Date() })
      .where(and(eq(debriefRecords.id, id), eq(debriefRecords.userId, userId))).returning();
    return updated;
  }

  // Messages
  async getMessages(userId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.userId, userId)).orderBy(desc(messages.createdAt));
  }

  async getMessagesByClient(userId: string, clientId: string): Promise<Message[]> {
    return await db.select().from(messages).where(and(eq(messages.userId, userId), eq(messages.clientId, clientId))).orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }

  async markMessageRead(id: string, userId: string): Promise<void> {
    await db.update(messages).set({ readAt: new Date() }).where(and(eq(messages.id, id), eq(messages.userId, userId)));
  }

  // Guides
  async getGuides(): Promise<Guide[]> {
    return await db.select().from(guides).where(eq(guides.isActive, true)).orderBy(asc(guides.orderIndex));
  }

  async getGuidesByComponent(componentId: string, stage?: string): Promise<Guide[]> {
    if (stage) {
      return await db.select().from(guides)
        .where(and(eq(guides.componentId, componentId), eq(guides.stage, stage), eq(guides.isActive, true)))
        .orderBy(asc(guides.orderIndex));
    }
    return await db.select().from(guides)
      .where(and(eq(guides.componentId, componentId), eq(guides.isActive, true)))
      .orderBy(asc(guides.orderIndex));
  }

  async createGuide(guide: InsertGuide): Promise<Guide> {
    const [created] = await db.insert(guides).values(guide).returning();
    return created;
  }

  async updateGuide(id: string, data: Partial<InsertGuide>): Promise<Guide> {
    const [updated] = await db.update(guides).set({ ...data, updatedAt: new Date() })
      .where(eq(guides.id, id)).returning();
    return updated;
  }

  // Form Templates
  async getFormTemplates(): Promise<FormTemplate[]> {
    return await db.select().from(formTemplates).where(eq(formTemplates.isActive, true)).orderBy(asc(formTemplates.orderIndex));
  }

  async getFormTemplatesByComponent(componentId: string, stage?: string): Promise<FormTemplate[]> {
    if (stage) {
      return await db.select().from(formTemplates)
        .where(and(eq(formTemplates.componentId, componentId), eq(formTemplates.stage, stage), eq(formTemplates.isActive, true)))
        .orderBy(asc(formTemplates.orderIndex));
    }
    return await db.select().from(formTemplates)
      .where(and(eq(formTemplates.componentId, componentId), eq(formTemplates.isActive, true)))
      .orderBy(asc(formTemplates.orderIndex));
  }

  async getFormTemplate(id: string): Promise<FormTemplate | undefined> {
    const [template] = await db.select().from(formTemplates).where(eq(formTemplates.id, id));
    return template;
  }

  async createFormTemplate(template: InsertFormTemplate): Promise<FormTemplate> {
    const [created] = await db.insert(formTemplates).values(template).returning();
    return created;
  }

  // Form Submissions
  async getFormSubmissions(userId: string): Promise<FormSubmission[]> {
    return await db.select().from(formSubmissions).where(eq(formSubmissions.userId, userId)).orderBy(desc(formSubmissions.createdAt));
  }

  async getFormSubmissionsByTemplate(userId: string, templateId: string): Promise<FormSubmission[]> {
    return await db.select().from(formSubmissions)
      .where(and(eq(formSubmissions.userId, userId), eq(formSubmissions.templateId, templateId)));
  }

  async getFormSubmission(id: string, userId: string): Promise<FormSubmission | undefined> {
    const [submission] = await db.select().from(formSubmissions)
      .where(and(eq(formSubmissions.id, id), eq(formSubmissions.userId, userId)));
    return submission;
  }

  async createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission> {
    const [created] = await db.insert(formSubmissions).values(submission).returning();
    return created;
  }

  async updateFormSubmission(id: string, userId: string, data: Partial<InsertFormSubmission>): Promise<FormSubmission> {
    const [updated] = await db.update(formSubmissions).set({ ...data, updatedAt: new Date() })
      .where(and(eq(formSubmissions.id, id), eq(formSubmissions.userId, userId))).returning();
    return updated;
  }

  async submitFormSubmission(id: string, userId: string): Promise<FormSubmission> {
    const [updated] = await db.update(formSubmissions)
      .set({ status: "submitted", submittedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(formSubmissions.id, id), eq(formSubmissions.userId, userId))).returning();
    return updated;
  }

  // Opportunities
  async getOpportunities(): Promise<Opportunity[]> {
    return await db.select().from(opportunities).orderBy(desc(opportunities.responseDeadline));
  }

  async getOpportunity(id: string): Promise<Opportunity | undefined> {
    const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, id));
    return opp;
  }

  async getOpportunityByExternalId(externalId: string): Promise<Opportunity | undefined> {
    const [opp] = await db.select().from(opportunities).where(eq(opportunities.externalId, externalId));
    return opp;
  }

  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    const [created] = await db.insert(opportunities).values(opportunity).returning();
    return created;
  }

  async upsertOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    const existing = await this.getOpportunityByExternalId(opportunity.externalId);
    if (existing) {
      const [updated] = await db.update(opportunities)
        .set({ ...opportunity, updatedAt: new Date(), syncedAt: new Date() })
        .where(eq(opportunities.id, existing.id)).returning();
      return updated;
    }
    return this.createOpportunity(opportunity);
  }

  async deleteOpportunity(id: string): Promise<void> {
    await db.delete(opportunities).where(eq(opportunities.id, id));
  }

  // Workflow Templates
  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    return await db.select().from(workflowTemplates).where(eq(workflowTemplates.isActive, true));
  }

  async getWorkflowTemplate(id: string): Promise<WorkflowTemplate | undefined> {
    const [template] = await db.select().from(workflowTemplates).where(eq(workflowTemplates.id, id));
    return template;
  }

  async createWorkflowTemplate(template: InsertWorkflowTemplate): Promise<WorkflowTemplate> {
    const [created] = await db.insert(workflowTemplates).values(template).returning();
    return created;
  }

  // Workflow Instances
  async getWorkflowInstances(userId: string): Promise<WorkflowInstance[]> {
    return await db.select().from(workflowInstances)
      .where(eq(workflowInstances.userId, userId))
      .orderBy(desc(workflowInstances.createdAt));
  }

  async getWorkflowInstance(id: string, userId: string): Promise<WorkflowInstance | undefined> {
    const [instance] = await db.select().from(workflowInstances)
      .where(and(eq(workflowInstances.id, id), eq(workflowInstances.userId, userId)));
    return instance;
  }

  async getWorkflowInstanceByOpportunity(opportunityId: string, userId: string): Promise<WorkflowInstance | undefined> {
    const [instance] = await db.select().from(workflowInstances)
      .where(and(eq(workflowInstances.opportunityId, opportunityId), eq(workflowInstances.userId, userId)));
    return instance;
  }

  async createWorkflowInstance(instance: InsertWorkflowInstance): Promise<WorkflowInstance> {
    const [created] = await db.insert(workflowInstances).values(instance).returning();
    return created;
  }

  async updateWorkflowInstance(id: string, userId: string, data: Partial<InsertWorkflowInstance>): Promise<WorkflowInstance> {
    const [updated] = await db.update(workflowInstances).set({ ...data, updatedAt: new Date() })
      .where(and(eq(workflowInstances.id, id), eq(workflowInstances.userId, userId))).returning();
    return updated;
  }

  async deleteWorkflowInstance(id: string, userId: string): Promise<void> {
    await db.delete(workflowInstances).where(and(eq(workflowInstances.id, id), eq(workflowInstances.userId, userId)));
  }

  // Collaborations
  async getCollaborationsByUser(userId: string): Promise<Collaboration[]> {
    return await db.select().from(collaborations)
      .where(or(
        eq(collaborations.ownerId, userId),
        eq(collaborations.collaboratorId, userId)
      ))
      .orderBy(desc(collaborations.createdAt));
  }

  async getCollaborationsByClient(clientId: string): Promise<Collaboration[]> {
    return await db.select().from(collaborations)
      .where(eq(collaborations.clientId, clientId))
      .orderBy(desc(collaborations.createdAt));
  }

  async getPendingInvites(userId: string): Promise<Collaboration[]> {
    return await db.select().from(collaborations)
      .where(and(
        eq(collaborations.collaboratorId, userId),
        eq(collaborations.status, "pending")
      ))
      .orderBy(desc(collaborations.invitedAt));
  }

  async getCollaboration(id: string): Promise<Collaboration | undefined> {
    const [collab] = await db.select().from(collaborations).where(eq(collaborations.id, id));
    return collab;
  }

  async createCollaboration(collab: InsertCollaboration): Promise<Collaboration> {
    const [created] = await db.insert(collaborations).values(collab).returning();
    return created;
  }

  async updateCollaborationStatus(id: string, userId: string, status: string): Promise<Collaboration> {
    const acceptedAt = status === "accepted" ? new Date() : null;
    const [updated] = await db.update(collaborations)
      .set({ status, acceptedAt, updatedAt: new Date() })
      .where(and(eq(collaborations.id, id), eq(collaborations.collaboratorId, userId)))
      .returning();
    return updated;
  }

  async deleteCollaboration(id: string, ownerId: string): Promise<void> {
    await db.delete(collaborations).where(and(eq(collaborations.id, id), eq(collaborations.ownerId, ownerId)));
  }

  // Get clients where user is a collaborator (for shared workflow progress)
  async getCollaboratedClients(userId: string): Promise<string[]> {
    const collabs = await db.select({ clientId: collaborations.clientId })
      .from(collaborations)
      .where(and(
        eq(collaborations.collaboratorId, userId),
        eq(collaborations.status, "accepted")
      ));
    return collabs.map(c => c.clientId);
  }

  // Get all users who are collaborators on a client (for viewing shared progress)
  async getClientCollaboratorIds(clientId: string): Promise<string[]> {
    const [client] = await db.select({ userId: clients.userId }).from(clients).where(eq(clients.id, clientId));
    const collabs = await db.select({ collaboratorId: collaborations.collaboratorId })
      .from(collaborations)
      .where(and(eq(collaborations.clientId, clientId), eq(collaborations.status, "accepted")));
    const ids = [client?.userId, ...collabs.map(c => c.collaboratorId)].filter(Boolean) as string[];
    return Array.from(new Set(ids));
  }

  // Get shared workflow progress for a client
  async getSharedWorkflowProgress(clientId: string): Promise<{ userId: string; progress: WorkflowProgress[] }[]> {
    const userIds = await this.getClientCollaboratorIds(clientId);
    const results = await Promise.all(
      userIds.map(async (userId) => ({
        userId,
        progress: await this.getWorkflowProgress(userId)
      }))
    );
    return results;
  }

  // Jira Settings
  async getJiraSettings(userId: string): Promise<JiraSettings | undefined> {
    const [settings] = await db.select().from(jiraSettings).where(eq(jiraSettings.userId, userId));
    return settings;
  }

  async upsertJiraSettings(settings: InsertJiraSettings): Promise<JiraSettings> {
    const existing = await this.getJiraSettings(settings.userId);
    if (existing) {
      const [updated] = await db.update(jiraSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(jiraSettings.userId, settings.userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(jiraSettings).values(settings).returning();
    return created;
  }

  async deleteJiraSettings(userId: string): Promise<void> {
    await db.delete(jiraSettings).where(eq(jiraSettings.userId, userId));
  }

  // Update action with Jira info
  async updateActionJiraInfo(actionId: string, userId: string, jiraInfo: {
    jiraIssueId?: string;
    jiraKey?: string;
    jiraStatus?: string;
    jiraProjectKey?: string;
    lastSyncedAt?: Date;
  }): Promise<Action> {
    const [updated] = await db.update(actions)
      .set({ ...jiraInfo, updatedAt: new Date() })
      .where(and(eq(actions.id, actionId), eq(actions.userId, userId)))
      .returning();
    return updated;
  }

  // Get actions with Jira links
  async getActionsWithJira(userId: string): Promise<Action[]> {
    return await db.select().from(actions)
      .where(and(eq(actions.userId, userId)))
      .orderBy(desc(actions.createdAt));
  }

  // Get action by Jira issue ID
  async getActionByJiraId(jiraIssueId: string, userId: string): Promise<Action | undefined> {
    const [action] = await db.select().from(actions)
      .where(and(eq(actions.jiraIssueId, jiraIssueId), eq(actions.userId, userId)));
    return action;
  }

  // Session Activities - for logout summary
  async createSessionActivity(activity: InsertSessionActivity): Promise<SessionActivity> {
    const [created] = await db.insert(sessionActivities).values(activity).returning();
    return created;
  }

  async getSessionActivities(userId: string, sessionId: string): Promise<SessionActivity[]> {
    return await db.select().from(sessionActivities)
      .where(and(eq(sessionActivities.userId, userId), eq(sessionActivities.sessionId, sessionId)))
      .orderBy(desc(sessionActivities.createdAt));
  }

  async getSessionSummary(userId: string, sessionId: string): Promise<{
    activityCount: number;
    activities: SessionActivity[];
    summary: { [key: string]: number };
  }> {
    const activities = await this.getSessionActivities(userId, sessionId);
    const summary: { [key: string]: number } = {};
    activities.forEach(a => {
      const key = `${a.activityType}_${a.entityType}`;
      summary[key] = (summary[key] || 0) + 1;
    });
    return { activityCount: activities.length, activities, summary };
  }

  async deleteSessionActivities(userId: string, sessionId: string): Promise<void> {
    await db.delete(sessionActivities)
      .where(and(eq(sessionActivities.userId, userId), eq(sessionActivities.sessionId, sessionId)));
  }

  // Slack Settings
  async getSlackSettings(userId: string): Promise<SlackSettings | undefined> {
    const [settings] = await db.select().from(slackSettings).where(eq(slackSettings.userId, userId));
    return settings;
  }

  async upsertSlackSettings(settings: InsertSlackSettings): Promise<SlackSettings> {
    const existing = await this.getSlackSettings(settings.userId);
    if (existing) {
      const [updated] = await db.update(slackSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(slackSettings.userId, settings.userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(slackSettings).values(settings).returning();
    return created;
  }

  async deleteSlackSettings(userId: string): Promise<void> {
    await db.delete(slackSettings).where(eq(slackSettings.userId, userId));
  }

  // Message delivery tracking
  async updateMessageDelivery(messageId: string, userId: string, status: "sent" | "delivered" | "read" | "failed"): Promise<Message> {
    const updates: any = { deliveryStatus: status, updatedAt: new Date() };
    if (status === "delivered") updates.deliveredAt = new Date();
    if (status === "read") {
      updates.deliveredAt = updates.deliveredAt || new Date();
      updates.readAt = new Date();
    }
    const [updated] = await db.update(messages)
      .set(updates)
      .where(and(eq(messages.id, messageId), eq(messages.userId, userId)))
      .returning();
    return updated;
  }

  async markMessageAsRead(messageId: string): Promise<Message | undefined> {
    const [updated] = await db.update(messages)
      .set({ readAt: new Date(), deliveryStatus: "read", deliveredAt: new Date(), updatedAt: new Date() })
      .where(eq(messages.id, messageId))
      .returning();
    return updated;
  }

  async getMessagesWithDeliveryStatus(userId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(or(eq(messages.userId, userId), eq(messages.recipientId, userId)))
      .orderBy(desc(messages.createdAt));
  }

  // Slack sync for messages
  async updateMessageSlackInfo(messageId: string, slackInfo: {
    slackChannelId?: string;
    slackMessageTs?: string;
    slackSyncedAt?: Date;
  }): Promise<Message> {
    const [updated] = await db.update(messages)
      .set({ ...slackInfo, updatedAt: new Date() })
      .where(eq(messages.id, messageId))
      .returning();
    return updated;
  }

  // Asana Settings
  async getAsanaSettings(userId: string): Promise<AsanaSettings | undefined> {
    const [settings] = await db.select().from(asanaSettings).where(eq(asanaSettings.userId, userId));
    return settings;
  }

  async upsertAsanaSettings(settings: InsertAsanaSettings): Promise<AsanaSettings> {
    const existing = await this.getAsanaSettings(settings.userId);
    if (existing) {
      const [updated] = await db.update(asanaSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(asanaSettings.userId, settings.userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(asanaSettings).values(settings).returning();
    return created;
  }

  async deleteAsanaSettings(userId: string): Promise<void> {
    await db.delete(asanaSettings).where(eq(asanaSettings.userId, userId));
  }

  async updateAsanaLastSync(userId: string): Promise<void> {
    await db.update(asanaSettings)
      .set({ lastSyncAt: new Date(), updatedAt: new Date() })
      .where(eq(asanaSettings.userId, userId));
  }

  // Client contracting stage management
  async updateClientContractingStage(clientId: string, userId: string, stage: string, notes?: string): Promise<Client> {
    const [client] = await db.select().from(clients).where(and(eq(clients.id, clientId), eq(clients.userId, userId)));
    if (!client) throw new Error("Client not found");
    
    const history = client.contractingStageHistory ? JSON.parse(client.contractingStageHistory) : [];
    history.push({ stage, date: new Date().toISOString(), notes: notes || "" });
    
    const [updated] = await db.update(clients)
      .set({ 
        contractingStage: stage, 
        contractingStageHistory: JSON.stringify(history),
        updatedAt: new Date() 
      })
      .where(eq(clients.id, clientId))
      .returning();
    return updated;
  }

  async updateClientAsanaInfo(clientId: string, asanaInfo: {
    asanaProjectId?: string;
    asanaTaskId?: string;
    asanaSyncedAt?: Date;
  }): Promise<Client> {
    const [updated] = await db.update(clients)
      .set({ ...asanaInfo, updatedAt: new Date() })
      .where(eq(clients.id, clientId))
      .returning();
    return updated;
  }

  async getClientsByContractingStage(userId: string, stage: string): Promise<Client[]> {
    return await db.select().from(clients)
      .where(and(eq(clients.userId, userId), eq(clients.contractingStage, stage)));
  }

  // Billing rates
  async getBillingRates(userId: string): Promise<BillingRate[]> {
    return await db.select().from(billingRates).where(eq(billingRates.userId, userId));
  }

  async createBillingRate(data: InsertBillingRate): Promise<BillingRate> {
    if (data.isDefault) {
      await db.update(billingRates).set({ isDefault: false }).where(eq(billingRates.userId, data.userId));
    }
    const [rate] = await db.insert(billingRates).values(data).returning();
    return rate;
  }

  async updateBillingRate(id: string, userId: string, data: Partial<InsertBillingRate>): Promise<BillingRate> {
    if (data.isDefault) {
      await db.update(billingRates).set({ isDefault: false }).where(eq(billingRates.userId, userId));
    }
    const [rate] = await db.update(billingRates).set({ ...data, updatedAt: new Date() })
      .where(and(eq(billingRates.id, id), eq(billingRates.userId, userId))).returning();
    return rate;
  }

  async deleteBillingRate(id: string, userId: string): Promise<void> {
    await db.delete(billingRates).where(and(eq(billingRates.id, id), eq(billingRates.userId, userId)));
  }

  // Task codes
  async getTaskCodes(userId: string, clientId?: string): Promise<TaskCode[]> {
    if (clientId) {
      return await db.select().from(taskCodes).where(and(eq(taskCodes.userId, userId), or(eq(taskCodes.clientId, clientId), isNull(taskCodes.clientId))));
    }
    return await db.select().from(taskCodes).where(eq(taskCodes.userId, userId));
  }

  async createTaskCode(data: InsertTaskCode): Promise<TaskCode> {
    const [code] = await db.insert(taskCodes).values(data).returning();
    return code;
  }

  async updateTaskCode(id: string, userId: string, data: Partial<InsertTaskCode>): Promise<TaskCode> {
    const [code] = await db.update(taskCodes).set({ ...data, updatedAt: new Date() })
      .where(and(eq(taskCodes.id, id), eq(taskCodes.userId, userId))).returning();
    return code;
  }

  async deleteTaskCode(id: string, userId: string): Promise<void> {
    await db.delete(taskCodes).where(and(eq(taskCodes.id, id), eq(taskCodes.userId, userId)));
  }

  // Contract templates
  async getContractTemplates(userId: string): Promise<ContractTemplate[]> {
    return await db.select().from(contractTemplates).where(or(eq(contractTemplates.userId, userId), eq(contractTemplates.isSystemTemplate, true)));
  }

  async getContractTemplate(id: string): Promise<ContractTemplate | undefined> {
    const [template] = await db.select().from(contractTemplates).where(eq(contractTemplates.id, id));
    return template;
  }

  async createContractTemplate(data: InsertContractTemplate): Promise<ContractTemplate> {
    const [template] = await db.insert(contractTemplates).values(data).returning();
    return template;
  }

  async updateContractTemplate(id: string, userId: string, data: Partial<InsertContractTemplate>): Promise<ContractTemplate> {
    const [template] = await db.update(contractTemplates).set({ ...data, updatedAt: new Date() })
      .where(and(eq(contractTemplates.id, id), eq(contractTemplates.userId, userId))).returning();
    return template;
  }

  async deleteContractTemplate(id: string, userId: string): Promise<void> {
    await db.delete(contractTemplates).where(and(eq(contractTemplates.id, id), eq(contractTemplates.userId, userId)));
  }

  // Contracts
  async getContracts(userId: string, clientId?: string): Promise<Contract[]> {
    if (clientId) {
      return await db.select().from(contracts).where(and(eq(contracts.userId, userId), eq(contracts.clientId, clientId)));
    }
    return await db.select().from(contracts).where(eq(contracts.userId, userId));
  }

  async getContract(id: string, userId: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(and(eq(contracts.id, id), eq(contracts.userId, userId)));
    return contract;
  }

  async createContract(data: InsertContract): Promise<Contract> {
    const [contract] = await db.insert(contracts).values(data).returning();
    return contract;
  }

  async updateContract(id: string, userId: string, data: Partial<InsertContract>): Promise<Contract> {
    const [contract] = await db.update(contracts).set({ ...data, updatedAt: new Date() })
      .where(and(eq(contracts.id, id), eq(contracts.userId, userId))).returning();
    return contract;
  }

  async deleteContract(id: string, userId: string): Promise<void> {
    await db.delete(contracts).where(and(eq(contracts.id, id), eq(contracts.userId, userId)));
  }

  async generateContractNumber(userId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await db.select().from(contracts).where(eq(contracts.userId, userId));
    return `OSL-${year}-${String(count.length + 1).padStart(4, '0')}`;
  }

  // Legal settings
  async getLegalSettings(userId: string): Promise<LegalSettings | undefined> {
    const [settings] = await db.select().from(legalSettings).where(eq(legalSettings.userId, userId));
    return settings;
  }

  async upsertLegalSettings(data: Partial<InsertLegalSettings> & { userId: string }): Promise<LegalSettings> {
    const existing = await this.getLegalSettings(data.userId);
    if (existing) {
      const [updated] = await db.update(legalSettings).set({ ...data, updatedAt: new Date() })
        .where(eq(legalSettings.userId, data.userId)).returning();
      return updated;
    }
    const [created] = await db.insert(legalSettings).values(data as InsertLegalSettings).returning();
    return created;
  }

  // Auto-generate invoice from time entries
  async generateInvoiceFromTimeEntries(userId: string, clientId: string, timeEntryIds: string[]): Promise<Invoice> {
    const entries = await db.select().from(timeEntries).where(and(eq(timeEntries.userId, userId), eq(timeEntries.clientId, clientId), eq(timeEntries.billable, true), eq(timeEntries.invoiced, false)));
    const filteredEntries = timeEntryIds.length > 0 ? entries.filter(e => timeEntryIds.includes(e.id)) : entries;
    
    let subtotal = 0;
    for (const entry of filteredEntries) {
      const hours = (entry.durationMinutes || 0) / 60;
      const rate = parseFloat(entry.hourlyRate || "0");
      subtotal += hours * rate;
    }
    
    const invoiceNumber = await this.generateInvoiceNumber(userId);
    const [invoice] = await db.insert(invoices).values({
      userId, clientId, invoiceNumber, status: "draft",
      subtotal: subtotal.toFixed(2), taxRate: "0", taxAmount: "0", total: subtotal.toFixed(2),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }).returning();
    
    for (const entry of filteredEntries) {
      const hours = (entry.durationMinutes || 0) / 60;
      const rate = parseFloat(entry.hourlyRate || "0");
      await db.insert(invoiceItems).values({
        invoiceId: invoice.id, description: entry.description, quantity: hours.toFixed(2), unitPrice: rate.toFixed(2), total: (hours * rate).toFixed(2)
      });
      await db.update(timeEntries).set({ invoiced: true, invoiceId: invoice.id }).where(eq(timeEntries.id, entry.id));
    }
    
    return invoice;
  }

  async generateInvoiceNumber(userId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await db.select().from(invoices).where(eq(invoices.userId, userId));
    return `INV-${year}-${String(count.length + 1).padStart(4, '0')}`;
  }
}

export const storage = new DatabaseStorage();
