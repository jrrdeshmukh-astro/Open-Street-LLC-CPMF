import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth } from "./auth";
import { insertWorkflowProgressSchema, insertArtifactSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/workflow/progress", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const progress = await storage.getWorkflowProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching workflow progress:", error);
      res.status(500).json({ message: "Failed to fetch workflow progress" });
    }
  });

  app.post("/api/workflow/progress", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const data = insertWorkflowProgressSchema.parse({ ...req.body, userId });
      const progress = await storage.upsertWorkflowProgress(data);
      res.json(progress);
    } catch (error) {
      console.error("Error saving workflow progress:", error);
      res.status(500).json({ message: "Failed to save workflow progress" });
    }
  });

  app.get("/api/artifacts", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const componentId = req.query.componentId as string | undefined;
      
      const artifacts = componentId 
        ? await storage.getArtifactsByComponent(userId, componentId)
        : await storage.getArtifacts(userId);
      
      res.json(artifacts);
    } catch (error) {
      console.error("Error fetching artifacts:", error);
      res.status(500).json({ message: "Failed to fetch artifacts" });
    }
  });

  app.post("/api/artifacts", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const data = insertArtifactSchema.parse({ ...req.body, userId });
      const artifact = await storage.upsertArtifact(data);
      res.json(artifact);
    } catch (error) {
      console.error("Error saving artifact:", error);
      res.status(500).json({ message: "Failed to save artifact" });
    }
  });

  app.delete("/api/artifacts/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      await storage.deleteArtifact(req.params.id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting artifact:", error);
      res.status(500).json({ message: "Failed to delete artifact" });
    }
  });

  return httpServer;
}
