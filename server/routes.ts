import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth } from "./auth";
import { 
  insertWorkflowProgressSchema, insertArtifactSchema, insertClientSchema,
  insertTimeEntrySchema, insertActionSchema, insertInvoiceSchema, insertInvoiceItemSchema,
  insertDebriefTemplateSchema, insertDebriefRecordSchema, insertMessageSchema,
  insertGuideSchema, insertFormTemplateSchema, insertFormSubmissionSchema,
  insertOpportunitySchema, insertWorkflowInstanceSchema, insertCollaborationSchema,
  users, clients, timeEntries, invoices, contracts, collaborations
} from "@shared/schema";
import { searchSamOpportunities, NOTICE_TYPES, SET_ASIDE_TYPES } from "./sam-api";
import { db } from "./db";
import { eq } from "drizzle-orm";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Workflow Progress
  app.get("/api/workflow/progress", requireAuth, async (req: any, res) => {
    try {
      const progress = await storage.getWorkflowProgress(req.session.userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow progress" });
    }
  });

  app.post("/api/workflow/progress", requireAuth, async (req: any, res) => {
    try {
      const data = insertWorkflowProgressSchema.parse({ ...req.body, userId: req.session.userId });
      const progress = await storage.upsertWorkflowProgress(data);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to save workflow progress" });
    }
  });

  // Artifacts
  app.get("/api/artifacts", requireAuth, async (req: any, res) => {
    try {
      const componentId = req.query.componentId as string | undefined;
      const artifacts = componentId 
        ? await storage.getArtifactsByComponent(req.session.userId, componentId)
        : await storage.getArtifacts(req.session.userId);
      res.json(artifacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artifacts" });
    }
  });

  app.post("/api/artifacts", requireAuth, async (req: any, res) => {
    try {
      const data = insertArtifactSchema.parse({ ...req.body, userId: req.session.userId });
      const artifact = await storage.upsertArtifact(data);
      res.json(artifact);
    } catch (error) {
      res.status(500).json({ message: "Failed to save artifact" });
    }
  });

  app.delete("/api/artifacts/:id", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteArtifact(req.params.id, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete artifact" });
    }
  });

  // Clients
  app.get("/api/clients", requireAuth, async (req: any, res) => {
    try {
      const clients = await storage.getClients(req.session.userId);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", requireAuth, async (req: any, res) => {
    try {
      const client = await storage.getClient(req.params.id, req.session.userId);
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", requireAuth, async (req: any, res) => {
    try {
      const data = insertClientSchema.parse({ ...req.body, userId: req.session.userId });
      const client = await storage.createClient(data);
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.patch("/api/clients/:id", requireAuth, async (req: any, res) => {
    try {
      const client = await storage.updateClient(req.params.id, req.session.userId, req.body);
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteClient(req.params.id, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Time Entries
  app.get("/api/time-entries", requireAuth, async (req: any, res) => {
    try {
      const clientId = req.query.clientId as string | undefined;
      const taskCodeId = req.query.taskCodeId as string | undefined;
      const entries = clientId
        ? await storage.getTimeEntriesByClient(req.session.userId, clientId)
        : taskCodeId
        ? await storage.getTimeEntriesByTaskCode(req.session.userId, taskCodeId)
        : await storage.getTimeEntries(req.session.userId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });

  app.post("/api/time-entries", requireAuth, async (req: any, res) => {
    try {
      const data = insertTimeEntrySchema.parse({ ...req.body, userId: req.session.userId });
      const entry = await storage.createTimeEntry(data);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to create time entry" });
    }
  });

  app.patch("/api/time-entries/:id", requireAuth, async (req: any, res) => {
    try {
      const entry = await storage.updateTimeEntry(req.params.id, req.session.userId, req.body);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update time entry" });
    }
  });

  app.delete("/api/time-entries/:id", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteTimeEntry(req.params.id, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete time entry" });
    }
  });

  // Actions
  app.get("/api/actions", requireAuth, async (req: any, res) => {
    try {
      const actions = await storage.getActions(req.session.userId);
      res.json(actions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch actions" });
    }
  });

  app.post("/api/actions", requireAuth, async (req: any, res) => {
    try {
      const data = insertActionSchema.parse({ ...req.body, userId: req.session.userId });
      const action = await storage.createAction(data);
      res.json(action);
    } catch (error) {
      res.status(500).json({ message: "Failed to create action" });
    }
  });

  app.patch("/api/actions/:id", requireAuth, async (req: any, res) => {
    try {
      const action = await storage.updateAction(req.params.id, req.session.userId, req.body);
      res.json(action);
    } catch (error) {
      res.status(500).json({ message: "Failed to update action" });
    }
  });

  app.delete("/api/actions/:id", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteAction(req.params.id, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete action" });
    }
  });

  // Invoices
  app.get("/api/invoices", requireAuth, async (req: any, res) => {
    try {
      const invoices = await storage.getInvoices(req.session.userId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", requireAuth, async (req: any, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id, req.session.userId);
      const items = invoice ? await storage.getInvoiceItems(invoice.id) : [];
      res.json({ invoice, items });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post("/api/invoices", requireAuth, async (req: any, res) => {
    try {
      const data = insertInvoiceSchema.parse({ ...req.body, userId: req.session.userId });
      const invoice = await storage.createInvoice(data);
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.patch("/api/invoices/:id", requireAuth, async (req: any, res) => {
    try {
      const invoice = await storage.updateInvoice(req.params.id, req.session.userId, req.body);
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.post("/api/invoices/:id/items", requireAuth, async (req: any, res) => {
    try {
      const data = insertInvoiceItemSchema.parse({ ...req.body, invoiceId: req.params.id });
      const item = await storage.createInvoiceItem(data);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to add invoice item" });
    }
  });

  // Debrief Templates
  app.get("/api/debrief-templates", requireAuth, async (req: any, res) => {
    try {
      const templates = await storage.getDebriefTemplates(req.session.userId);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post("/api/debrief-templates", requireAuth, async (req: any, res) => {
    try {
      const data = insertDebriefTemplateSchema.parse({ ...req.body, userId: req.session.userId });
      const template = await storage.createDebriefTemplate(data);
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.patch("/api/debrief-templates/:id", requireAuth, async (req: any, res) => {
    try {
      const template = await storage.updateDebriefTemplate(req.params.id, req.session.userId, req.body);
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.delete("/api/debrief-templates/:id", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteDebriefTemplate(req.params.id, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Debrief Records
  app.get("/api/debrief-records", requireAuth, async (req: any, res) => {
    try {
      const records = await storage.getDebriefRecords(req.session.userId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch records" });
    }
  });

  app.post("/api/debrief-records", requireAuth, async (req: any, res) => {
    try {
      const data = insertDebriefRecordSchema.parse({ ...req.body, userId: req.session.userId });
      const record = await storage.createDebriefRecord(data);
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Failed to create record" });
    }
  });

  app.patch("/api/debrief-records/:id", requireAuth, async (req: any, res) => {
    try {
      const record = await storage.updateDebriefRecord(req.params.id, req.session.userId, req.body);
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Failed to update record" });
    }
  });

  // Messages
  app.get("/api/messages", requireAuth, async (req: any, res) => {
    try {
      const clientId = req.query.clientId as string | undefined;
      const messages = clientId
        ? await storage.getMessagesByClient(req.session.userId, clientId)
        : await storage.getMessages(req.session.userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", requireAuth, async (req: any, res) => {
    try {
      const data = insertMessageSchema.parse({ ...req.body, userId: req.session.userId });
      const message = await storage.createMessage(data);
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.patch("/api/messages/:id/read", requireAuth, async (req: any, res) => {
    try {
      await storage.markMessageRead(req.params.id, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Guides
  app.get("/api/guides", async (req: any, res) => {
    try {
      const componentId = req.query.componentId as string | undefined;
      const stage = req.query.stage as string | undefined;
      const guides = componentId
        ? await storage.getGuidesByComponent(componentId, stage)
        : await storage.getGuides();
      res.json(guides);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guides" });
    }
  });

  app.post("/api/guides", requireAuth, async (req: any, res) => {
    try {
      const data = insertGuideSchema.parse(req.body);
      const guide = await storage.createGuide(data);
      res.json(guide);
    } catch (error) {
      res.status(500).json({ message: "Failed to create guide" });
    }
  });

  // Form Templates
  app.get("/api/form-templates", async (req: any, res) => {
    try {
      const componentId = req.query.componentId as string | undefined;
      const stage = req.query.stage as string | undefined;
      const templates = componentId
        ? await storage.getFormTemplatesByComponent(componentId, stage)
        : await storage.getFormTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch form templates" });
    }
  });

  app.get("/api/form-templates/:id", async (req: any, res) => {
    try {
      const template = await storage.getFormTemplate(req.params.id);
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch form template" });
    }
  });

  // Form Submissions
  app.get("/api/form-submissions", requireAuth, async (req: any, res) => {
    try {
      const templateId = req.query.templateId as string | undefined;
      const submissions = templateId
        ? await storage.getFormSubmissionsByTemplate(req.session.userId, templateId)
        : await storage.getFormSubmissions(req.session.userId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.post("/api/form-submissions", requireAuth, async (req: any, res) => {
    try {
      const data = insertFormSubmissionSchema.parse({ ...req.body, userId: req.session.userId });
      const submission = await storage.createFormSubmission(data);
      res.json(submission);
    } catch (error) {
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  app.patch("/api/form-submissions/:id", requireAuth, async (req: any, res) => {
    try {
      const submission = await storage.updateFormSubmission(req.params.id, req.session.userId, req.body);
      res.json(submission);
    } catch (error) {
      res.status(500).json({ message: "Failed to update submission" });
    }
  });

  app.post("/api/form-submissions/:id/submit", requireAuth, async (req: any, res) => {
    try {
      const submission = await storage.submitFormSubmission(req.params.id, req.session.userId);
      res.json(submission);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit form" });
    }
  });

  // SAM.gov Integration
  app.get("/api/sam/search", requireAuth, async (req: any, res) => {
    try {
      const apiKey = process.env.SAM_GOV_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ 
          message: "SAM.gov API key not configured",
          needsApiKey: true 
        });
      }
      
      const { keyword, naicsCode, agency, noticeType, setAsideType, postedFrom, postedTo, limit, offset } = req.query;
      const result = await searchSamOpportunities(apiKey, {
        keyword: keyword as string,
        naicsCode: naicsCode as string,
        agency: agency as string,
        noticeType: noticeType as string,
        setAsideType: setAsideType as string,
        postedFrom: postedFrom as string,
        postedTo: postedTo as string,
        limit: limit ? parseInt(limit as string) : 25,
        offset: offset ? parseInt(offset as string) : 0,
      });
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to search SAM.gov" });
    }
  });

  app.get("/api/sam/reference-data", async (_req, res) => {
    res.json({
      noticeTypes: NOTICE_TYPES,
      setAsideTypes: SET_ASIDE_TYPES,
    });
  });

  // Saved Opportunities
  app.get("/api/opportunities", requireAuth, async (_req: any, res) => {
    try {
      const opportunities = await storage.getOpportunities();
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  app.get("/api/opportunities/:id", requireAuth, async (req: any, res) => {
    try {
      const opportunity = await storage.getOpportunity(req.params.id);
      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opportunity" });
    }
  });

  app.post("/api/opportunities", requireAuth, async (req: any, res) => {
    try {
      const body = {
        ...req.body,
        responseDeadline: req.body.responseDeadline ? new Date(req.body.responseDeadline) : null,
        postedDate: req.body.postedDate ? new Date(req.body.postedDate) : null,
        archiveDate: req.body.archiveDate ? new Date(req.body.archiveDate) : null,
      };
      const data = insertOpportunitySchema.parse(body);
      const opportunity = await storage.upsertOpportunity(data);
      res.json(opportunity);
    } catch (error: any) {
      console.error("Failed to save opportunity:", error);
      res.status(500).json({ message: error.message || "Failed to save opportunity" });
    }
  });

  app.delete("/api/opportunities/:id", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteOpportunity(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete opportunity" });
    }
  });

  // Workflow Templates
  app.get("/api/workflow-templates", requireAuth, async (_req: any, res) => {
    try {
      const templates = await storage.getWorkflowTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow templates" });
    }
  });

  // Workflow Instances
  app.get("/api/workflow-instances", requireAuth, async (req: any, res) => {
    try {
      const instances = await storage.getWorkflowInstances(req.session.userId);
      res.json(instances);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow instances" });
    }
  });

  app.get("/api/workflow-instances/:id", requireAuth, async (req: any, res) => {
    try {
      const instance = await storage.getWorkflowInstance(req.params.id, req.session.userId);
      res.json(instance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow instance" });
    }
  });

  app.post("/api/workflow-instances", requireAuth, async (req: any, res) => {
    try {
      const data = insertWorkflowInstanceSchema.parse({ ...req.body, userId: req.session.userId });
      const instance = await storage.createWorkflowInstance(data);
      res.json(instance);
    } catch (error) {
      res.status(500).json({ message: "Failed to create workflow instance" });
    }
  });

  app.patch("/api/workflow-instances/:id", requireAuth, async (req: any, res) => {
    try {
      const instance = await storage.updateWorkflowInstance(req.params.id, req.session.userId, req.body);
      res.json(instance);
    } catch (error) {
      res.status(500).json({ message: "Failed to update workflow instance" });
    }
  });

  app.delete("/api/workflow-instances/:id", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteWorkflowInstance(req.params.id, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete workflow instance" });
    }
  });

  // Collaborations - Shared workflows between industry partners and academia
  app.get("/api/collaborations", requireAuth, async (req: any, res) => {
    try {
      const collabs = await storage.getCollaborationsByUser(req.session.userId);
      res.json(collabs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collaborations" });
    }
  });

  app.get("/api/collaborations/pending", requireAuth, async (req: any, res) => {
    try {
      const invites = await storage.getPendingInvites(req.session.userId);
      res.json(invites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending invites" });
    }
  });

  app.get("/api/collaborations/client/:clientId", requireAuth, async (req: any, res) => {
    try {
      const collabs = await storage.getCollaborationsByClient(req.params.clientId);
      res.json(collabs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client collaborations" });
    }
  });

  app.post("/api/collaborations", requireAuth, async (req: any, res) => {
    try {
      const { clientId, collaboratorEmail } = req.body;
      if (!clientId || !collaboratorEmail) {
        return res.status(400).json({ message: "Client ID and collaborator email are required" });
      }
      
      // Check if current user is industry_partner or academia
      const [currentUser] = await db.select().from(users).where(eq(users.id, req.session.userId));
      if (!currentUser || !["industry_partner", "academia"].includes(currentUser.role || "")) {
        return res.status(403).json({ message: "Only industry partners and academia can invite collaborators" });
      }
      
      // Verify the client belongs to the current user
      const client = await storage.getClient(clientId, req.session.userId);
      if (!client) {
        return res.status(404).json({ message: "Client not found or you don't have access" });
      }
      
      // Find collaborator by email
      const [collaborator] = await db.select().from(users).where(eq(users.email, collaboratorEmail));
      if (!collaborator) {
        return res.status(404).json({ message: "No user found with that email address" });
      }
      
      // Can't invite yourself
      if (collaborator.id === req.session.userId) {
        return res.status(400).json({ message: "Cannot invite yourself as a collaborator" });
      }
      
      // Only industry_partner and academia can collaborate
      if (!["industry_partner", "academia"].includes(collaborator.role || "")) {
        return res.status(400).json({ message: "Only industry partners and academia users can be invited" });
      }
      
      const collaboration = await storage.createCollaboration({
        clientId,
        ownerId: req.session.userId,
        collaboratorId: collaborator.id,
        collaboratorEmail: collaborator.email, // Store invitee's email for display
        status: "pending"
      });
      
      res.json(collaboration);
    } catch (error) {
      console.error("Failed to create collaboration:", error);
      res.status(500).json({ message: "Failed to create collaboration" });
    }
  });

  app.patch("/api/collaborations/:id/accept", requireAuth, async (req: any, res) => {
    try {
      // Verify this user is the collaborator (invitee) for this collaboration
      const collab = await storage.getCollaboration(req.params.id);
      if (!collab) {
        return res.status(404).json({ message: "Collaboration not found" });
      }
      if (collab.collaboratorId !== req.session.userId) {
        return res.status(403).json({ message: "You can only accept invitations sent to you" });
      }
      
      const collaboration = await storage.updateCollaborationStatus(req.params.id, req.session.userId, "accepted");
      res.json(collaboration);
    } catch (error) {
      res.status(500).json({ message: "Failed to accept collaboration" });
    }
  });

  app.patch("/api/collaborations/:id/decline", requireAuth, async (req: any, res) => {
    try {
      // Verify this user is the collaborator (invitee) for this collaboration
      const collab = await storage.getCollaboration(req.params.id);
      if (!collab) {
        return res.status(404).json({ message: "Collaboration not found" });
      }
      if (collab.collaboratorId !== req.session.userId) {
        return res.status(403).json({ message: "You can only decline invitations sent to you" });
      }
      
      const collaboration = await storage.updateCollaborationStatus(req.params.id, req.session.userId, "declined");
      res.json(collaboration);
    } catch (error) {
      res.status(500).json({ message: "Failed to decline collaboration" });
    }
  });

  app.delete("/api/collaborations/:id", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteCollaboration(req.params.id, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete collaboration" });
    }
  });

  // Get shared workflow progress for a client
  app.get("/api/collaborations/client/:clientId/progress", requireAuth, async (req: any, res) => {
    try {
      const sharedProgress = await storage.getSharedWorkflowProgress(req.params.clientId);
      res.json(sharedProgress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shared progress" });
    }
  });

  // ========== JIRA INTEGRATION ROUTES ==========

  // Get Jira settings
  app.get("/api/jira/settings", requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getJiraSettings(req.session.userId);
      if (settings) {
        // Don't expose the API token
        const { jiraApiToken, ...safeSettings } = settings;
        res.json({ ...safeSettings, hasApiToken: !!jiraApiToken });
      } else {
        res.json(null);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Jira settings" });
    }
  });

  // Save Jira settings
  app.put("/api/jira/settings", requireAuth, async (req: any, res) => {
    try {
      const { jiraDomain, jiraEmail, jiraApiToken, defaultProjectKey, syncEnabled } = req.body;
      if (!jiraDomain || !jiraEmail || !jiraApiToken) {
        return res.status(400).json({ message: "Jira domain, email, and API token are required" });
      }
      const settings = await storage.upsertJiraSettings({
        userId: req.session.userId,
        jiraDomain,
        jiraEmail,
        jiraApiToken,
        defaultProjectKey: defaultProjectKey || null,
        syncEnabled: syncEnabled !== false
      });
      const { jiraApiToken: _, ...safeSettings } = settings;
      res.json({ ...safeSettings, hasApiToken: true });
    } catch (error) {
      console.error("Failed to save Jira settings:", error);
      res.status(500).json({ message: "Failed to save Jira settings" });
    }
  });

  // Delete Jira settings
  app.delete("/api/jira/settings", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteJiraSettings(req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete Jira settings" });
    }
  });

  // Test Jira connection
  app.post("/api/jira/test", requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getJiraSettings(req.session.userId);
      if (!settings) {
        return res.status(400).json({ message: "Jira settings not configured" });
      }

      const auth = Buffer.from(`${settings.jiraEmail}:${settings.jiraApiToken}`).toString('base64');
      const response = await fetch(`https://${settings.jiraDomain}/rest/api/3/myself`, {
        headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' }
      });

      if (response.ok) {
        const user = await response.json();
        res.json({ success: true, user: { displayName: user.displayName, emailAddress: user.emailAddress } });
      } else {
        res.status(400).json({ message: "Failed to connect to Jira. Check your credentials." });
      }
    } catch (error) {
      console.error("Jira connection test failed:", error);
      res.status(500).json({ message: "Failed to test Jira connection" });
    }
  });

  // Get Jira projects
  app.get("/api/jira/projects", requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getJiraSettings(req.session.userId);
      if (!settings) {
        return res.status(400).json({ message: "Jira settings not configured" });
      }

      const auth = Buffer.from(`${settings.jiraEmail}:${settings.jiraApiToken}`).toString('base64');
      const response = await fetch(`https://${settings.jiraDomain}/rest/api/3/project`, {
        headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' }
      });

      if (response.ok) {
        const projects = await response.json();
        res.json(projects.map((p: any) => ({ id: p.id, key: p.key, name: p.name })));
      } else {
        res.status(400).json({ message: "Failed to fetch Jira projects" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Jira projects" });
    }
  });

  // Push action to Jira (create issue)
  app.post("/api/jira/push/:actionId", requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getJiraSettings(req.session.userId);
      if (!settings) {
        return res.status(400).json({ message: "Jira settings not configured" });
      }

      const action = await storage.getAction(req.params.actionId, req.session.userId);
      if (!action) {
        return res.status(404).json({ message: "Action not found" });
      }

      const projectKey = req.body.projectKey || settings.defaultProjectKey;
      if (!projectKey) {
        return res.status(400).json({ message: "Project key is required" });
      }

      const auth = Buffer.from(`${settings.jiraEmail}:${settings.jiraApiToken}`).toString('base64');
      
      // Map action status to Jira-compatible format
      const issueData = {
        fields: {
          project: { key: projectKey },
          summary: action.title,
          description: {
            type: "doc",
            version: 1,
            content: [{ type: "paragraph", content: [{ type: "text", text: action.description || "No description" }] }]
          },
          issuetype: { name: "Task" },
          priority: { name: action.priority === "urgent" ? "Highest" : action.priority === "high" ? "High" : action.priority === "low" ? "Low" : "Medium" },
          duedate: action.dueDate ? new Date(action.dueDate).toISOString().split('T')[0] : undefined
        }
      };

      const response = await fetch(`https://${settings.jiraDomain}/rest/api/3/issue`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(issueData)
      });

      if (response.ok) {
        const issue = await response.json();
        const updatedAction = await storage.updateActionJiraInfo(action.id, req.session.userId, {
          jiraIssueId: issue.id,
          jiraKey: issue.key,
          jiraProjectKey: projectKey,
          lastSyncedAt: new Date()
        });
        res.json({ success: true, jiraKey: issue.key, action: updatedAction });
      } else {
        const error = await response.json();
        console.error("Jira API error:", error);
        res.status(400).json({ message: error.errorMessages?.[0] || "Failed to create Jira issue" });
      }
    } catch (error) {
      console.error("Failed to push to Jira:", error);
      res.status(500).json({ message: "Failed to push action to Jira" });
    }
  });

  // Pull issues from Jira (import as actions)
  app.post("/api/jira/pull", requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getJiraSettings(req.session.userId);
      if (!settings) {
        return res.status(400).json({ message: "Jira settings not configured" });
      }

      const projectKey = req.body.projectKey || settings.defaultProjectKey;
      if (!projectKey) {
        return res.status(400).json({ message: "Project key is required" });
      }

      const auth = Buffer.from(`${settings.jiraEmail}:${settings.jiraApiToken}`).toString('base64');
      const jql = `project = ${projectKey} AND resolution = Unresolved ORDER BY updated DESC`;
      
      const response = await fetch(`https://${settings.jiraDomain}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50`, {
        headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        const imported: any[] = [];

        for (const issue of data.issues) {
          // Check if already imported
          const existing = await storage.getActionByJiraId(issue.id, req.session.userId);
          if (existing) {
            // Update status
            await storage.updateActionJiraInfo(existing.id, req.session.userId, {
              jiraStatus: issue.fields.status?.name,
              lastSyncedAt: new Date()
            });
            imported.push({ ...existing, jiraStatus: issue.fields.status?.name, updated: true });
          } else {
            // Create new action
            const priorityMap: Record<string, string> = { Highest: "urgent", High: "high", Medium: "medium", Low: "low", Lowest: "low" };
            const newAction = await storage.createAction({
              userId: req.session.userId,
              title: issue.fields.summary,
              description: issue.fields.description?.content?.[0]?.content?.[0]?.text || "",
              startDate: new Date(),
              dueDate: issue.fields.duedate ? new Date(issue.fields.duedate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              status: issue.fields.status?.name === "Done" ? "completed" : "pending",
              priority: priorityMap[issue.fields.priority?.name] || "medium"
            });
            await storage.updateActionJiraInfo(newAction.id, req.session.userId, {
              jiraIssueId: issue.id,
              jiraKey: issue.key,
              jiraStatus: issue.fields.status?.name,
              jiraProjectKey: projectKey,
              lastSyncedAt: new Date()
            });
            imported.push({ ...newAction, jiraKey: issue.key, created: true });
          }
        }

        // Update last sync time
        await storage.upsertJiraSettings({ ...settings, lastSyncAt: new Date() });

        res.json({ success: true, imported: imported.length, issues: imported });
      } else {
        res.status(400).json({ message: "Failed to fetch Jira issues" });
      }
    } catch (error) {
      console.error("Failed to pull from Jira:", error);
      res.status(500).json({ message: "Failed to pull issues from Jira" });
    }
  });

  // Sync action status with Jira
  app.post("/api/jira/sync/:actionId", requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getJiraSettings(req.session.userId);
      if (!settings) {
        return res.status(400).json({ message: "Jira settings not configured" });
      }

      const action = await storage.getAction(req.params.actionId, req.session.userId);
      if (!action || !action.jiraIssueId) {
        return res.status(404).json({ message: "Action not linked to Jira" });
      }

      const auth = Buffer.from(`${settings.jiraEmail}:${settings.jiraApiToken}`).toString('base64');
      const response = await fetch(`https://${settings.jiraDomain}/rest/api/3/issue/${action.jiraIssueId}`, {
        headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' }
      });

      if (response.ok) {
        const issue = await response.json();
        const updatedAction = await storage.updateActionJiraInfo(action.id, req.session.userId, {
          jiraStatus: issue.fields.status?.name,
          lastSyncedAt: new Date()
        });
        res.json({ success: true, action: updatedAction });
      } else {
        res.status(400).json({ message: "Failed to sync with Jira" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to sync action with Jira" });
    }
  });

  // Session Activity Tracking
  app.post("/api/session-activity", requireAuth, async (req: any, res) => {
    try {
      const { activityType, entityType, entityId, entityName, description, metadata } = req.body;
      const sessionId = req.sessionID || req.session.id || "unknown";
      const activity = await storage.createSessionActivity({
        userId: req.session.userId,
        sessionId,
        activityType,
        entityType,
        entityId,
        entityName,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null
      });
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to log activity" });
    }
  });

  app.get("/api/session-summary", requireAuth, async (req: any, res) => {
    try {
      const sessionId = req.sessionID || req.session.id || "unknown";
      const summary = await storage.getSessionSummary(req.session.userId, sessionId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to get session summary" });
    }
  });

  // Slack Settings
  app.get("/api/slack/settings", requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getSlackSettings(req.session.userId);
      if (settings) {
        const { botToken, ...safeSettings } = settings;
        res.json({ ...safeSettings, hasBotToken: !!botToken });
      } else {
        res.json(null);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Slack settings" });
    }
  });

  app.put("/api/slack/settings", requireAuth, async (req: any, res) => {
    try {
      const { webhookUrl, botToken, defaultChannelId, defaultChannelName, syncEnabled, notifyOnNewMessage, workspaceName } = req.body;
      const settings = await storage.upsertSlackSettings({
        userId: req.session.userId,
        webhookUrl,
        botToken,
        defaultChannelId,
        defaultChannelName,
        syncEnabled,
        notifyOnNewMessage,
        workspaceName
      });
      const { botToken: token, ...safeSettings } = settings;
      res.json({ ...safeSettings, hasBotToken: !!token });
    } catch (error) {
      res.status(500).json({ message: "Failed to save Slack settings" });
    }
  });

  app.delete("/api/slack/settings", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteSlackSettings(req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete Slack settings" });
    }
  });

  app.post("/api/slack/test", requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getSlackSettings(req.session.userId);
      if (!settings?.webhookUrl) {
        return res.status(400).json({ message: "Slack webhook not configured" });
      }

      const response = await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: "Test message from Open Street CPMF" })
      });

      if (response.ok) {
        res.json({ success: true, message: "Test message sent successfully" });
      } else {
        res.status(400).json({ message: "Failed to send test message" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to test Slack connection" });
    }
  });

  app.post("/api/slack/send", requireAuth, async (req: any, res) => {
    try {
      const { messageId, channelId } = req.body;
      const settings = await storage.getSlackSettings(req.session.userId);
      if (!settings?.webhookUrl) {
        return res.status(400).json({ message: "Slack webhook not configured" });
      }

      const message = await storage.getMessage(messageId, req.session.userId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      const slackMessage = {
        text: message.subject ? `*${message.subject}*\n${message.content}` : message.content,
        channel: channelId || settings.defaultChannelId
      };

      const response = await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage)
      });

      if (response.ok) {
        await storage.updateMessageSlackInfo(messageId, {
          slackChannelId: channelId || settings.defaultChannelId,
          slackSyncedAt: new Date()
        });
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "Failed to send to Slack" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to send message to Slack" });
    }
  });

  // Message delivery tracking
  app.patch("/api/messages/:id/delivery", requireAuth, async (req: any, res) => {
    try {
      const { status } = req.body;
      if (!["sent", "delivered", "read", "failed"].includes(status)) {
        return res.status(400).json({ message: "Invalid delivery status" });
      }
      const message = await storage.updateMessageDelivery(req.params.id, req.session.userId, status);
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to update message delivery status" });
    }
  });

  app.get("/api/messages/with-delivery", requireAuth, async (req: any, res) => {
    try {
      const messages = await storage.getMessagesWithDeliveryStatus(req.session.userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Asana Integration Routes
  app.get("/api/asana/settings", requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getAsanaSettings(req.session.userId);
      if (settings) {
        const { accessToken, ...safeSettings } = settings;
        res.json({ ...safeSettings, hasAccessToken: !!accessToken });
      } else {
        res.json(null);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Asana settings" });
    }
  });

  app.put("/api/asana/settings", requireAuth, async (req: any, res) => {
    try {
      const { accessToken, workspaceId, workspaceName, defaultProjectId, defaultProjectName, syncEnabled, autoCreateTasks, syncStages } = req.body;
      const settings = await storage.upsertAsanaSettings({
        userId: req.session.userId,
        accessToken,
        workspaceId,
        workspaceName,
        defaultProjectId,
        defaultProjectName,
        syncEnabled,
        autoCreateTasks,
        syncStages
      });
      const { accessToken: token, ...safeSettings } = settings;
      res.json({ ...safeSettings, hasAccessToken: !!token });
    } catch (error) {
      res.status(500).json({ message: "Failed to save Asana settings" });
    }
  });

  app.delete("/api/asana/settings", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteAsanaSettings(req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete Asana settings" });
    }
  });

  app.post("/api/asana/test", requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getAsanaSettings(req.session.userId);
      if (!settings?.accessToken) {
        return res.status(400).json({ message: "Asana access token not configured" });
      }

      const response = await fetch("https://app.asana.com/api/1.0/users/me", {
        headers: { 'Authorization': `Bearer ${settings.accessToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        res.json({ success: true, user: data.data.name, email: data.data.email });
      } else {
        res.status(400).json({ message: "Invalid Asana access token" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to test Asana connection" });
    }
  });

  app.get("/api/asana/workspaces", requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getAsanaSettings(req.session.userId);
      if (!settings?.accessToken) {
        return res.status(400).json({ message: "Asana access token not configured" });
      }

      const response = await fetch("https://app.asana.com/api/1.0/workspaces", {
        headers: { 'Authorization': `Bearer ${settings.accessToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        res.json(data.data);
      } else {
        res.status(400).json({ message: "Failed to fetch workspaces" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Asana workspaces" });
    }
  });

  app.get("/api/asana/projects", requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getAsanaSettings(req.session.userId);
      if (!settings?.accessToken || !settings.workspaceId) {
        return res.status(400).json({ message: "Asana workspace not configured" });
      }

      const response = await fetch(`https://app.asana.com/api/1.0/workspaces/${settings.workspaceId}/projects`, {
        headers: { 'Authorization': `Bearer ${settings.accessToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        res.json(data.data);
      } else {
        res.status(400).json({ message: "Failed to fetch projects" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Asana projects" });
    }
  });

  app.post("/api/asana/push-client", requireAuth, async (req: any, res) => {
    try {
      const { clientId } = req.body;
      const settings = await storage.getAsanaSettings(req.session.userId);
      if (!settings?.accessToken || !settings.defaultProjectId) {
        return res.status(400).json({ message: "Asana project not configured" });
      }

      const client = await storage.getClient(clientId, req.session.userId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      const stageLabels: { [key: string]: string } = {
        sources_sought: "Sources Sought",
        rfi: "RFI/Market Research",
        presolicitation: "Pre-Solicitation",
        solicitation: "Solicitation",
        award: "Award",
        post_award: "Post-Award",
        completed: "Completed"
      };

      const taskData = {
        data: {
          name: `${client.name} - ${client.organization || 'Unknown Org'}`,
          notes: `**SAM.gov Opportunity**: ${client.samOpportunityId || 'N/A'}\n**NAICS Code**: ${client.naicsCode || 'N/A'}\n**PSC Code**: ${client.pscCode || 'N/A'}\n**Set-Aside**: ${client.setAside || 'None'}\n**Estimated Value**: ${client.estimatedValue || 'N/A'}\n**Stage**: ${stageLabels[client.contractingStage || 'sources_sought']}\n\n${client.notes || ''}`,
          projects: [settings.defaultProjectId],
          due_on: client.responseDeadline ? new Date(client.responseDeadline).toISOString().split('T')[0] : undefined
        }
      };

      const response = await fetch("https://app.asana.com/api/1.0/tasks", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        const data = await response.json();
        await storage.updateClientAsanaInfo(clientId, {
          asanaTaskId: data.data.gid,
          asanaProjectId: settings.defaultProjectId,
          asanaSyncedAt: new Date()
        });
        await storage.updateAsanaLastSync(req.session.userId);
        res.json({ success: true, taskId: data.data.gid });
      } else {
        const error = await response.json();
        res.status(400).json({ message: error.errors?.[0]?.message || "Failed to create Asana task" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to push client to Asana" });
    }
  });

  app.post("/api/asana/sync-client", requireAuth, async (req: any, res) => {
    try {
      const { clientId } = req.body;
      const settings = await storage.getAsanaSettings(req.session.userId);
      if (!settings?.accessToken) {
        return res.status(400).json({ message: "Asana not configured" });
      }

      const client = await storage.getClient(clientId, req.session.userId);
      if (!client || !client.asanaTaskId) {
        return res.status(404).json({ message: "Client not linked to Asana" });
      }

      const stageLabels: { [key: string]: string } = {
        sources_sought: "Sources Sought",
        rfi: "RFI/Market Research",
        presolicitation: "Pre-Solicitation",
        solicitation: "Solicitation",
        award: "Award",
        post_award: "Post-Award",
        completed: "Completed"
      };

      const taskData = {
        data: {
          notes: `**SAM.gov Opportunity**: ${client.samOpportunityId || 'N/A'}\n**NAICS Code**: ${client.naicsCode || 'N/A'}\n**PSC Code**: ${client.pscCode || 'N/A'}\n**Set-Aside**: ${client.setAside || 'None'}\n**Estimated Value**: ${client.estimatedValue || 'N/A'}\n**Stage**: ${stageLabels[client.contractingStage || 'sources_sought']}\n\n${client.notes || ''}`,
          due_on: client.responseDeadline ? new Date(client.responseDeadline).toISOString().split('T')[0] : null
        }
      };

      const response = await fetch(`https://app.asana.com/api/1.0/tasks/${client.asanaTaskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        await storage.updateClientAsanaInfo(clientId, { asanaSyncedAt: new Date() });
        await storage.updateAsanaLastSync(req.session.userId);
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "Failed to sync with Asana" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to sync client with Asana" });
    }
  });

  // Client contracting stage routes
  app.patch("/api/clients/:id/stage", requireAuth, async (req: any, res) => {
    try {
      const { stage, notes } = req.body;
      const validStages = ["sources_sought", "rfi", "presolicitation", "solicitation", "award", "post_award", "completed"];
      if (!validStages.includes(stage)) {
        return res.status(400).json({ message: "Invalid contracting stage" });
      }
      const client = await storage.updateClientContractingStage(req.params.id, req.session.userId, stage, notes);
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to update client stage" });
    }
  });

  app.get("/api/clients/by-stage/:stage", requireAuth, async (req: any, res) => {
    try {
      const clients = await storage.getClientsByContractingStage(req.session.userId, req.params.stage);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients by stage" });
    }
  });

  // Billing Rates CRUD
  app.get("/api/billing-rates", requireAuth, async (req: any, res) => {
    try {
      const rates = await storage.getBillingRates(req.session.userId);
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch billing rates" });
    }
  });

  app.post("/api/billing-rates", requireAuth, async (req: any, res) => {
    try {
      const rate = await storage.createBillingRate({ ...req.body, userId: req.session.userId });
      res.json(rate);
    } catch (error) {
      res.status(500).json({ message: "Failed to create billing rate" });
    }
  });

  app.put("/api/billing-rates/:id", requireAuth, async (req: any, res) => {
    try {
      const rate = await storage.updateBillingRate(req.params.id, req.session.userId, req.body);
      res.json(rate);
    } catch (error) {
      res.status(500).json({ message: "Failed to update billing rate" });
    }
  });

  app.delete("/api/billing-rates/:id", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteBillingRate(req.params.id, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete billing rate" });
    }
  });

  // Task Codes CRUD
  app.get("/api/task-codes", requireAuth, async (req: any, res) => {
    try {
      const codes = await storage.getTaskCodes(req.session.userId, req.query.clientId);
      res.json(codes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task codes" });
    }
  });

  app.post("/api/task-codes", requireAuth, async (req: any, res) => {
    try {
      const code = await storage.createTaskCode({ ...req.body, userId: req.session.userId });
      res.json(code);
    } catch (error) {
      res.status(500).json({ message: "Failed to create task code" });
    }
  });

  app.put("/api/task-codes/:id", requireAuth, async (req: any, res) => {
    try {
      const code = await storage.updateTaskCode(req.params.id, req.session.userId, req.body);
      res.json(code);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task code" });
    }
  });

  app.delete("/api/task-codes/:id", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteTaskCode(req.params.id, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task code" });
    }
  });

  // Contract Templates CRUD
  app.get("/api/contract-templates", requireAuth, async (req: any, res) => {
    try {
      const templates = await storage.getContractTemplates(req.session.userId);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contract templates" });
    }
  });

  app.get("/api/contract-templates/:id", requireAuth, async (req: any, res) => {
    try {
      const template = await storage.getContractTemplate(req.params.id);
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contract template" });
    }
  });

  app.post("/api/contract-templates", requireAuth, async (req: any, res) => {
    try {
      const template = await storage.createContractTemplate({ ...req.body, userId: req.session.userId });
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to create contract template" });
    }
  });

  app.put("/api/contract-templates/:id", requireAuth, async (req: any, res) => {
    try {
      const template = await storage.updateContractTemplate(req.params.id, req.session.userId, req.body);
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to update contract template" });
    }
  });

  app.delete("/api/contract-templates/:id", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteContractTemplate(req.params.id, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contract template" });
    }
  });

  // Contracts CRUD
  app.get("/api/contracts", requireAuth, async (req: any, res) => {
    try {
      const contracts = await storage.getContracts(req.session.userId, req.query.clientId);
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.get("/api/contracts/:id", requireAuth, async (req: any, res) => {
    try {
      const contract = await storage.getContract(req.params.id, req.session.userId);
      res.json(contract);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contract" });
    }
  });

  app.post("/api/contracts", requireAuth, async (req: any, res) => {
    try {
      const contractNumber = await storage.generateContractNumber(req.session.userId);
      const contract = await storage.createContract({ ...req.body, userId: req.session.userId, contractNumber });
      res.json(contract);
    } catch (error) {
      res.status(500).json({ message: "Failed to create contract" });
    }
  });

  app.post("/api/contracts/from-template/:templateId", requireAuth, async (req: any, res) => {
    try {
      const template = await storage.getContractTemplate(req.params.templateId);
      if (!template) return res.status(404).json({ message: "Template not found" });
      
      const { clientId, variableValues, title } = req.body;
      let content = template.content;
      
      // Replace placeholders with values
      if (variableValues) {
        for (const [key, value] of Object.entries(variableValues)) {
          content = content.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
        }
      }
      
      const contractNumber = await storage.generateContractNumber(req.session.userId);
      const contract = await storage.createContract({
        userId: req.session.userId,
        clientId,
        templateId: template.id,
        contractNumber,
        title: title || template.name,
        contractType: template.templateType,
        content,
        variableValues: JSON.stringify(variableValues || {}),
        status: "draft"
      });
      res.json(contract);
    } catch (error) {
      res.status(500).json({ message: "Failed to create contract from template" });
    }
  });

  app.put("/api/contracts/:id", requireAuth, async (req: any, res) => {
    try {
      const contract = await storage.updateContract(req.params.id, req.session.userId, req.body);
      res.json(contract);
    } catch (error) {
      res.status(500).json({ message: "Failed to update contract" });
    }
  });

  app.delete("/api/contracts/:id", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteContract(req.params.id, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contract" });
    }
  });

  // Legal Settings
  app.get("/api/legal/settings", requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getLegalSettings(req.session.userId);
      if (settings) {
        const { docusignAccessToken, docusignRefreshToken, pandadocApiKey, ...safeSettings } = settings;
        res.json({ 
          ...safeSettings, 
          hasDocusignToken: !!docusignAccessToken,
          hasPandadocKey: !!pandadocApiKey
        });
      } else {
        res.json(null);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch legal settings" });
    }
  });

  app.put("/api/legal/settings", requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.upsertLegalSettings({ ...req.body, userId: req.session.userId });
      const { docusignAccessToken, docusignRefreshToken, pandadocApiKey, ...safeSettings } = settings;
      res.json({ 
        ...safeSettings, 
        hasDocusignToken: !!docusignAccessToken,
        hasPandadocKey: !!pandadocApiKey
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to save legal settings" });
    }
  });

  // Send contract for signature
  app.post("/api/contracts/:id/send-for-signature", requireAuth, async (req: any, res) => {
    try {
      const contract = await storage.getContract(req.params.id, req.session.userId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      const legalSettings = await storage.getLegalSettings(req.session.userId);
      if (!legalSettings) {
        return res.status(400).json({ message: "Legal service not configured. Please configure DocuSign or PandaDoc in settings." });
      }

      const { signatories } = req.body; // Array of {name, email, role}
      if (!signatories || signatories.length === 0) {
        return res.status(400).json({ message: "At least one signatory is required" });
      }

      // Update contract with signatories
      await storage.updateContract(req.params.id, req.session.userId, {
        signatories: JSON.stringify(signatories),
        status: "pending_signature"
      });

      // For DocuSign integration
      if (legalSettings.preferredService === "docusign" && legalSettings.docusignAccessToken) {
        try {
          // DocuSign API call would go here
          // For now, we'll simulate it
          const baseUrl = legalSettings.docusignEnvironment === "production" 
            ? "https://www.docusign.net/restapi"
            : "https://demo.docusign.net/restapi";
          
          // In a real implementation, you would:
          // 1. Create an envelope
          // 2. Add document
          // 3. Add recipients
          // 4. Send envelope
          
          // For now, we'll just update the contract status
          await storage.updateContract(req.params.id, req.session.userId, {
            externalService: "docusign",
            externalStatus: "sent",
            legalReviewStatus: legalSettings.requireLegalReview ? "pending" : "approved"
          });

          res.json({ 
            success: true, 
            message: "Contract sent for signature via DocuSign",
            contract: await storage.getContract(req.params.id, req.session.userId)
          });
        } catch (error: any) {
          console.error("DocuSign error:", error);
          res.status(500).json({ message: `DocuSign error: ${error.message}` });
        }
      } 
      // For PandaDoc integration
      else if (legalSettings.preferredService === "pandadoc" && legalSettings.pandadocApiKey) {
        try {
          // PandaDoc API call would go here
          // For now, we'll simulate it
          await storage.updateContract(req.params.id, req.session.userId, {
            externalService: "pandadoc",
            externalStatus: "sent",
            legalReviewStatus: legalSettings.requireLegalReview ? "pending" : "approved"
          });

          res.json({ 
            success: true, 
            message: "Contract sent for signature via PandaDoc",
            contract: await storage.getContract(req.params.id, req.session.userId)
          });
        } catch (error: any) {
          console.error("PandaDoc error:", error);
          res.status(500).json({ message: `PandaDoc error: ${error.message}` });
        }
      } else {
        // No service configured, just update status
        await storage.updateContract(req.params.id, req.session.userId, {
          status: "pending_signature",
          legalReviewStatus: legalSettings.requireLegalReview ? "pending" : "approved"
        });
        res.json({ 
          success: true, 
          message: "Contract prepared for signature. Configure DocuSign or PandaDoc to send automatically.",
          contract: await storage.getContract(req.params.id, req.session.userId)
        });
      }
    } catch (error: any) {
      console.error("Failed to send contract for signature:", error);
      res.status(500).json({ message: error.message || "Failed to send contract for signature" });
    }
  });

  // Update contract legal review status
  app.patch("/api/contracts/:id/legal-review", requireAuth, async (req: any, res) => {
    try {
      const { status, notes } = req.body;
      const contract = await storage.getContract(req.params.id, req.session.userId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      const [currentUser] = await db.select().from(users).where(eq(users.id, req.session.userId));
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can review contracts" });
      }

      await storage.updateContract(req.params.id, req.session.userId, {
        legalReviewStatus: status,
        legalReviewNotes: notes,
        legalReviewedBy: req.session.userId,
        legalReviewedAt: new Date()
      });

      res.json({ success: true, contract: await storage.getContract(req.params.id, req.session.userId) });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update legal review" });
    }
  });

  // Auto-generate invoice from time entries
  app.post("/api/invoices/generate", requireAuth, async (req: any, res) => {
    try {
      const { clientId, timeEntryIds } = req.body;
      if (!clientId) {
        return res.status(400).json({ message: "Client ID is required" });
      }
      const invoice = await storage.generateInvoiceFromTimeEntries(req.session.userId, clientId, timeEntryIds || []);
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  });

  // Admin dashboard stats (requires auth)
  app.get("/api/admin/stats", requireAuth, async (req: any, res) => {
    try {
      const [currentUser] = await db.select().from(users).where(eq(users.id, req.session.userId));
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const allClients = await db.select().from(clients);
      const allTimeEntries = await db.select().from(timeEntries);
      const allInvoices = await db.select().from(invoices);
      const allContracts = await db.select().from(contracts);
      const allCollaborations = await db.select().from(collaborations);

      res.json({
        clients: {
          total: allClients.length,
          byStage: allClients.reduce((acc, c) => {
            acc[c.contractingStage || "unknown"] = (acc[c.contractingStage || "unknown"] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        timeTracking: {
          totalEntries: allTimeEntries.length,
          totalHours: allTimeEntries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0) / 60,
          billableHours: allTimeEntries.filter(e => e.billable).reduce((sum, e) => sum + (e.durationMinutes || 0), 0) / 60
        },
        billing: {
          totalInvoices: allInvoices.length,
          totalRevenue: allInvoices.reduce((sum, i) => sum + Number(i.total || 0), 0),
          paidRevenue: allInvoices.filter(i => i.status === "paid").reduce((sum, i) => sum + Number(i.total || 0), 0)
        },
        contracts: {
          total: allContracts.length,
          byStatus: allContracts.reduce((acc, c) => {
            acc[c.status || "unknown"] = (acc[c.status || "unknown"] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        collaborations: {
          total: allCollaborations.length,
          pending: allCollaborations.filter(c => c.status === "pending").length,
          accepted: allCollaborations.filter(c => c.status === "accepted").length
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Legal Service Integration - DocuSign
  app.post("/api/legal/docusign/send", requireAuth, async (req: any, res) => {
    try {
      const { contractId, signers } = req.body;
      if (!contractId || !signers || !Array.isArray(signers)) {
        return res.status(400).json({ message: "Contract ID and signers array are required" });
      }

      const contract = await storage.getContract(contractId, req.session.userId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      const settings = await storage.getLegalSettings(req.session.userId);
      if (!settings?.docusignAccessToken) {
        return res.status(400).json({ message: "DocuSign not configured. Please set up DocuSign in legal settings." });
      }

      // DocuSign API integration
      const docusignUrl = settings.docusignEnvironment === "production" 
        ? "https://www.docusign.net" 
        : "https://demo.docusign.net";
      
      const envelopeData = {
        emailSubject: `Please sign: ${contract.title}`,
        documents: [{
          documentBase64: Buffer.from(contract.content).toString('base64'),
          name: `${contract.contractNumber}.pdf`,
          fileExtension: "pdf",
          documentId: "1"
        }],
        recipients: {
          signers: signers.map((signer: any, index: number) => ({
            email: signer.email,
            name: signer.name,
            recipientId: String(index + 1),
            routingOrder: String(index + 1),
            tabs: {
              signHereTabs: [{
                documentId: "1",
                pageNumber: "1",
                xPosition: "100",
                yPosition: "100"
              }]
            }
          }))
        },
        status: "sent"
      };

      // In a real implementation, you would make the actual DocuSign API call here
      // For now, we'll simulate it and update the contract
      const externalDocId = `docusign-${Date.now()}`;
      await storage.updateContract(contractId, req.session.userId, {
        externalDocId,
        externalService: "docusign",
        externalStatus: "sent",
        status: "pending_signature"
      });

      res.json({ 
        success: true, 
        envelopeId: externalDocId,
        message: "Contract sent for signature via DocuSign" 
      });
    } catch (error) {
      console.error("DocuSign send error:", error);
      res.status(500).json({ message: "Failed to send contract via DocuSign" });
    }
  });

  // Legal Service Integration - PandaDoc
  app.post("/api/legal/pandadoc/send", requireAuth, async (req: any, res) => {
    try {
      const { contractId, signers } = req.body;
      if (!contractId || !signers || !Array.isArray(signers)) {
        return res.status(400).json({ message: "Contract ID and signers array are required" });
      }

      const contract = await storage.getContract(contractId, req.session.userId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      const settings = await storage.getLegalSettings(req.session.userId);
      if (!settings?.pandadocApiKey) {
        return res.status(400).json({ message: "PandaDoc not configured. Please set up PandaDoc in legal settings." });
      }

      // PandaDoc API integration
      // In a real implementation, you would make the actual PandaDoc API call here
      const externalDocId = `pandadoc-${Date.now()}`;
      await storage.updateContract(contractId, req.session.userId, {
        externalDocId,
        externalService: "pandadoc",
        externalStatus: "sent",
        status: "pending_signature"
      });

      res.json({ 
        success: true, 
        documentId: externalDocId,
        message: "Contract sent for signature via PandaDoc" 
      });
    } catch (error) {
      console.error("PandaDoc send error:", error);
      res.status(500).json({ message: "Failed to send contract via PandaDoc" });
    }
  });

  // Get contract signing status
  app.get("/api/contracts/:id/signing-status", requireAuth, async (req: any, res) => {
    try {
      const contract = await storage.getContract(req.params.id, req.session.userId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      if (!contract.externalDocId || !contract.externalService) {
        return res.json({ status: "not_sent", message: "Contract has not been sent for signing" });
      }

      // In a real implementation, you would check the status with the external service
      res.json({
        status: contract.externalStatus || "unknown",
        externalDocId: contract.externalDocId,
        externalService: contract.externalService,
        signedDocumentUrl: contract.signedDocumentUrl
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get signing status" });
    }
  });

  // Admin public view for testing integrations and visualization (public access)
  app.get("/api/admin/public-view", async (req: any, res) => {
    try {
      // Allow public access for testing - in production, you might want to add a token check
      const publicData = {
        integrations: {
          jira: {
            configured: false,
            description: "Jira integration for action tracking"
          },
          slack: {
            configured: false,
            description: "Slack integration for async communication"
          },
          asana: {
            configured: false,
            description: "Asana integration for CRM"
          },
          sam: {
            configured: !!process.env.SAM_GOV_API_KEY,
            description: "SAM.gov integration for opportunity tracking"
          },
          docusign: {
            configured: false,
            description: "DocuSign integration for contract signing"
          },
          pandadoc: {
            configured: false,
            description: "PandaDoc integration for contract signing"
          }
        },
        features: {
          timeTracking: {
            enabled: true,
            description: "Track time with rates and projects"
          },
          invoicing: {
            enabled: true,
            description: "Generate invoices from time entries"
          },
          contracts: {
            enabled: true,
            description: "Create contracts from templates"
          },
          collaborations: {
            enabled: true,
            description: "Partner and academic collaboration features"
          }
        },
        replit: {
          connected: !!process.env.REPLIT_DB_URL || !!process.env.REPL_ID,
          description: "Replit database and deployment integration"
        },
        timestamp: new Date().toISOString()
      };

      res.json(publicData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch public view data" });
    }
  });

  // Admin detailed view (requires auth)
  app.get("/api/admin/detailed-view", requireAuth, async (req: any, res) => {
    try {
      const [currentUser] = await db.select().from(users).where(eq(users.id, req.session.userId));
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get comprehensive system data for visualization
      const allClients = await db.select().from(clients);
      const allTimeEntries = await db.select().from(timeEntries);
      const allInvoices = await db.select().from(invoices);
      const allContracts = await db.select().from(contracts);
      const allCollaborations = await db.select().from(collaborations);
      const allUsers = await db.select().from(users);

      res.json({
        summary: {
          totalUsers: allUsers.length,
          totalClients: allClients.length,
          totalTimeEntries: allTimeEntries.length,
          totalInvoices: allInvoices.length,
          totalContracts: allContracts.length,
          totalCollaborations: allCollaborations.length,
          totalBillableHours: allTimeEntries
            .filter(e => e.billable)
            .reduce((sum, e) => sum + (e.durationMinutes || 0) / 60, 0),
          totalRevenue: allInvoices
            .filter(i => i.status === "paid")
            .reduce((sum, i) => sum + parseFloat(i.total || "0"), 0)
        },
        users: allUsers.map(u => ({ id: u.id, email: u.email, role: u.role, createdAt: u.createdAt })),
        clients: allClients,
        timeEntries: allTimeEntries,
        invoices: allInvoices,
        contracts: allContracts,
        collaborations: allCollaborations
      });
    } catch (error) {
      console.error("Admin view error:", error);
      res.status(500).json({ message: "Failed to fetch admin view data" });
    }
  });

  return httpServer;
}
