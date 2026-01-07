import { 
  workflowProgress, artifacts, clients, timeEntries, actions, invoices, invoiceItems, debriefTemplates, debriefRecords, messages,
  guides, formTemplates, formSubmissions, opportunities, workflowTemplates, workflowInstances, collaborations, jiraSettings,
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
  type JiraSettings, type InsertJiraSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, or, inArray } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
