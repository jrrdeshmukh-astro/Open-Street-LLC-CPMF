import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth } from "./auth";
import { 
  insertWorkflowProgressSchema, insertArtifactSchema, insertClientSchema,
  insertTimeEntrySchema, insertActionSchema, insertInvoiceSchema, insertInvoiceItemSchema,
  insertDebriefTemplateSchema, insertDebriefRecordSchema, insertMessageSchema,
  insertGuideSchema, insertFormTemplateSchema, insertFormSubmissionSchema
} from "@shared/schema";

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
      const entries = clientId
        ? await storage.getTimeEntriesByClient(req.session.userId, clientId)
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

  return httpServer;
}
