import { 
  workflowProgress, artifacts,
  type WorkflowProgress, type InsertWorkflowProgress,
  type Artifact, type InsertArtifact
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Workflow Progress
  getWorkflowProgress(userId: string): Promise<WorkflowProgress[]>;
  getWorkflowProgressByComponent(userId: string, componentId: string): Promise<WorkflowProgress | undefined>;
  upsertWorkflowProgress(progress: InsertWorkflowProgress): Promise<WorkflowProgress>;
  
  // Artifacts
  getArtifacts(userId: string): Promise<Artifact[]>;
  getArtifactsByComponent(userId: string, componentId: string): Promise<Artifact[]>;
  upsertArtifact(artifact: InsertArtifact): Promise<Artifact>;
  deleteArtifact(id: string, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getWorkflowProgress(userId: string): Promise<WorkflowProgress[]> {
    return await db.select().from(workflowProgress).where(eq(workflowProgress.userId, userId));
  }

  async getWorkflowProgressByComponent(userId: string, componentId: string): Promise<WorkflowProgress | undefined> {
    const [progress] = await db.select().from(workflowProgress)
      .where(and(eq(workflowProgress.userId, userId), eq(workflowProgress.componentId, componentId)));
    return progress;
  }

  async upsertWorkflowProgress(progress: InsertWorkflowProgress): Promise<WorkflowProgress> {
    // Check if exists
    const existing = await this.getWorkflowProgressByComponent(progress.userId, progress.componentId);
    
    if (existing) {
      const [updated] = await db.update(workflowProgress)
        .set({
          ...progress,
          updatedAt: new Date(),
          completedAt: progress.completed ? new Date() : null,
        })
        .where(eq(workflowProgress.id, existing.id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(workflowProgress)
      .values({
        ...progress,
        completedAt: progress.completed ? new Date() : null,
      })
      .returning();
    return created;
  }

  async getArtifacts(userId: string): Promise<Artifact[]> {
    return await db.select().from(artifacts).where(eq(artifacts.userId, userId));
  }

  async getArtifactsByComponent(userId: string, componentId: string): Promise<Artifact[]> {
    return await db.select().from(artifacts)
      .where(and(eq(artifacts.userId, userId), eq(artifacts.componentId, componentId)));
  }

  async upsertArtifact(artifact: InsertArtifact): Promise<Artifact> {
    // Check if exists by type and component
    const [existing] = await db.select().from(artifacts)
      .where(and(
        eq(artifacts.userId, artifact.userId),
        eq(artifacts.componentId, artifact.componentId),
        eq(artifacts.artifactType, artifact.artifactType)
      ));
    
    if (existing) {
      const [updated] = await db.update(artifacts)
        .set({
          ...artifact,
          updatedAt: new Date(),
        })
        .where(eq(artifacts.id, existing.id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(artifacts)
      .values(artifact)
      .returning();
    return created;
  }

  async deleteArtifact(id: string, userId: string): Promise<void> {
    await db.delete(artifacts)
      .where(and(eq(artifacts.id, id), eq(artifacts.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
