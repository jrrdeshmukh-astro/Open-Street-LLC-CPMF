import { 
  workflowProgress, artifacts,
  type WorkflowProgress, type InsertWorkflowProgress,
  type Artifact, type InsertArtifact
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getWorkflowProgress(userId: string): Promise<WorkflowProgress[]>;
  getWorkflowProgressByStage(userId: string, componentId: string, stage: string): Promise<WorkflowProgress | undefined>;
  upsertWorkflowProgress(progress: InsertWorkflowProgress): Promise<WorkflowProgress>;
  
  getArtifacts(userId: string): Promise<Artifact[]>;
  getArtifactsByComponent(userId: string, componentId: string): Promise<Artifact[]>;
  upsertArtifact(artifact: InsertArtifact): Promise<Artifact>;
  deleteArtifact(id: string, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getWorkflowProgress(userId: string): Promise<WorkflowProgress[]> {
    return await db.select().from(workflowProgress).where(eq(workflowProgress.userId, userId));
  }

  async getWorkflowProgressByStage(userId: string, componentId: string, stage: string): Promise<WorkflowProgress | undefined> {
    const [progress] = await db.select().from(workflowProgress)
      .where(and(
        eq(workflowProgress.userId, userId), 
        eq(workflowProgress.componentId, componentId),
        eq(workflowProgress.stage, stage)
      ));
    return progress;
  }

  async upsertWorkflowProgress(progress: InsertWorkflowProgress): Promise<WorkflowProgress> {
    const existing = await this.getWorkflowProgressByStage(progress.userId, progress.componentId, progress.stage);
    
    if (existing) {
      const effectiveCompleted = progress.completed ?? existing.completed ?? false;
      const wasCompletedBefore = existing.completed ?? false;
      
      let completedAt = existing.completedAt;
      if (effectiveCompleted && !wasCompletedBefore) {
        completedAt = new Date();
      } else if (!effectiveCompleted) {
        completedAt = null;
      }
      
      const [updated] = await db.update(workflowProgress)
        .set({
          completed: effectiveCompleted,
          notes: progress.notes ?? existing.notes,
          updatedAt: new Date(),
          completedAt,
        })
        .where(eq(workflowProgress.id, existing.id))
        .returning();
      return updated;
    }
    
    const effectiveCompleted = progress.completed ?? false;
    const [created] = await db.insert(workflowProgress)
      .values({
        userId: progress.userId,
        componentId: progress.componentId,
        stage: progress.stage,
        completed: effectiveCompleted,
        notes: progress.notes ?? "",
        completedAt: effectiveCompleted ? new Date() : null,
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
    const [existing] = await db.select().from(artifacts)
      .where(and(
        eq(artifacts.userId, artifact.userId),
        eq(artifacts.componentId, artifact.componentId),
        eq(artifacts.artifactType, artifact.artifactType)
      ));
    
    if (existing) {
      const [updated] = await db.update(artifacts)
        .set({
          title: artifact.title ?? existing.title,
          content: artifact.content ?? existing.content,
          updatedAt: new Date(),
        })
        .where(eq(artifacts.id, existing.id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(artifacts)
      .values({
        userId: artifact.userId,
        componentId: artifact.componentId,
        artifactType: artifact.artifactType,
        title: artifact.title,
        content: artifact.content ?? "",
      })
      .returning();
    return created;
  }

  async deleteArtifact(id: string, userId: string): Promise<void> {
    await db.delete(artifacts)
      .where(and(eq(artifacts.id, id), eq(artifacts.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
