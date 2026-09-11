import { Response } from "express";
import { AdminAuthenticatedRequest } from "../middleware/adminAuth";
import { topicCmsRepository } from "../repositories/topicCmsRepository";
import { adminRepository } from "../repositories/adminRepository";
import { logger } from "../utils/logger";

export class AdminTopicController {
  public static async getTopics(_req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const topics = await topicCmsRepository.getAll();
      res.json({ success: true, data: topics, meta: { total: topics.length } });
    } catch (err: any) {
      logger.error(`[AdminTopics] Error getting topics: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async getTopicById(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const topic = await topicCmsRepository.getById(id);
      if (!topic) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topic not found" } });
        return;
      }
      res.json({ success: true, data: topic });
    } catch (err: any) {
      logger.error(`[AdminTopics] Error getting topic: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async createTopic(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      const body = req.body;

      if (!body.title || !body.slug) {
        res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "title and slug are required." } });
        return;
      }

      const created = await topicCmsRepository.create({
        slug: body.slug,
        title: body.title,
        language: body.language || "General",
        description: body.description || "",
        iconName: body.iconName || "BookOpen",
        orderIndex: body.orderIndex,
        prerequisites: body.prerequisites || [],
        learningObjectives: body.learningObjectives || [],
        isPublished: body.isPublished ?? true,
        problemCount: body.problemCount || 0,
      });

      if (user) {
        await adminRepository.recordAuditLog({
          adminId: user.userId,
          adminName: user.username,
          action: "CREATE_TOPIC",
          entityType: "topic",
          entityId: created.id,
          details: { title: created.title, slug: created.slug },
          ipAddress: req.ip,
        });
      }

      res.status(201).json({ success: true, data: created, message: "Topic created successfully." });
    } catch (err: any) {
      logger.error(`[AdminTopics] Error creating topic: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async updateTopic(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const user = req.user;
      const updates = req.body;

      const updated = await topicCmsRepository.update(id, updates);
      if (!updated) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topic not found" } });
        return;
      }

      if (user) {
        await adminRepository.recordAuditLog({
          adminId: user.userId,
          adminName: user.username,
          action: "UPDATE_TOPIC",
          entityType: "topic",
          entityId: id,
          details: { title: updated.title, updatedFields: Object.keys(updates) },
          ipAddress: req.ip,
        });
      }

      res.json({ success: true, data: updated, message: "Topic updated successfully." });
    } catch (err: any) {
      logger.error(`[AdminTopics] Error updating topic: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async deleteTopic(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const user = req.user;
      const existing = await topicCmsRepository.getById(id);

      if (!existing) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topic not found" } });
        return;
      }

      await topicCmsRepository.delete(id);

      if (user) {
        await adminRepository.recordAuditLog({
          adminId: user.userId,
          adminName: user.username,
          action: "DELETE_TOPIC",
          entityType: "topic",
          entityId: id,
          details: { title: existing.title },
          ipAddress: req.ip,
        });
      }

      res.json({ success: true, message: `Topic '${existing.title}' deleted successfully.` });
    } catch (err: any) {
      logger.error(`[AdminTopics] Error deleting topic: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async togglePublish(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const topic = await topicCmsRepository.togglePublish(id);
      if (!topic) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Topic not found" } });
        return;
      }
      res.json({ success: true, data: topic, message: `Topic is now ${topic.isPublished ? "published" : "hidden"}.` });
    } catch (err: any) {
      logger.error(`[AdminTopics] Error toggling topic publish: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async reorderTopics(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orderedIds: string[] = req.body.orderedIds;
      if (!Array.isArray(orderedIds)) {
        res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "orderedIds array is required." } });
        return;
      }

      const updated = await topicCmsRepository.reorder(orderedIds);
      res.json({ success: true, data: updated, message: "Topics reordered successfully." });
    } catch (err: any) {
      logger.error(`[AdminTopics] Error reordering topics: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }
}
