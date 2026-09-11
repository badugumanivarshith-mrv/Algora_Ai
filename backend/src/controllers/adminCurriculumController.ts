import { Response } from "express";
import { AdminAuthenticatedRequest } from "../middleware/adminAuth";
import { curriculumCmsRepository } from "../repositories/curriculumCmsRepository";
import { adminRepository } from "../repositories/adminRepository";
import { logger } from "../utils/logger";

export class AdminCurriculumController {
  public static async getPaths(_req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const paths = await curriculumCmsRepository.getAllPaths();
      res.json({ success: true, data: paths, meta: { total: paths.length } });
    } catch (err: any) {
      logger.error(`[AdminCurriculum] Error getting paths: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async getPathById(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const path = await curriculumCmsRepository.getPathById(id);
      if (!path) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Curriculum path not found" } });
        return;
      }
      res.json({ success: true, data: path });
    } catch (err: any) {
      logger.error(`[AdminCurriculum] Error getting path: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async createPath(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      const body = req.body;

      if (!body.title || !body.slug) {
        res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "title and slug are required." } });
        return;
      }

      const created = await curriculumCmsRepository.createPath({
        slug: body.slug,
        title: body.title,
        language: body.language || "General",
        description: body.description || "",
        targetRole: body.targetRole || "Software Engineer",
        difficulty: body.difficulty || "Intermediate",
        estimatedHours: body.estimatedHours || 40,
        iconName: body.iconName || "Compass",
        orderIndex: body.orderIndex,
        isPublished: body.isPublished ?? true,
        modules: body.modules || [],
      });

      if (user) {
        await adminRepository.recordAuditLog({
          adminId: user.userId,
          adminName: user.username,
          action: "CREATE_CURRICULUM_PATH",
          entityType: "curriculum",
          entityId: created.id,
          details: { title: created.title, slug: created.slug },
          ipAddress: req.ip,
        });
      }

      res.status(201).json({ success: true, data: created, message: "Curriculum path created successfully." });
    } catch (err: any) {
      logger.error(`[AdminCurriculum] Error creating path: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async updatePath(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const user = req.user;
      const updates = req.body;

      const updated = await curriculumCmsRepository.updatePath(id, updates);
      if (!updated) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Curriculum path not found" } });
        return;
      }

      if (user) {
        await adminRepository.recordAuditLog({
          adminId: user.userId,
          adminName: user.username,
          action: "UPDATE_CURRICULUM_PATH",
          entityType: "curriculum",
          entityId: id,
          details: { title: updated.title },
          ipAddress: req.ip,
        });
      }

      res.json({ success: true, data: updated, message: "Curriculum path updated successfully." });
    } catch (err: any) {
      logger.error(`[AdminCurriculum] Error updating path: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async deletePath(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const user = req.user;
      const existing = await curriculumCmsRepository.getPathById(id);

      if (!existing) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Curriculum path not found" } });
        return;
      }

      await curriculumCmsRepository.deletePath(id);

      if (user) {
        await adminRepository.recordAuditLog({
          adminId: user.userId,
          adminName: user.username,
          action: "DELETE_CURRICULUM_PATH",
          entityType: "curriculum",
          entityId: id,
          details: { title: existing.title },
          ipAddress: req.ip,
        });
      }

      res.json({ success: true, message: `Curriculum path '${existing.title}' deleted successfully.` });
    } catch (err: any) {
      logger.error(`[AdminCurriculum] Error deleting path: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async addModule(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const pathId = req.params.pathId;
      const body = req.body;

      if (!body.title) {
        res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Module title is required." } });
        return;
      }

      const newMod = await curriculumCmsRepository.addModule(pathId, {
        title: body.title,
        description: body.description || "",
        orderIndex: body.orderIndex,
        status: body.status || "active",
        lessons: body.lessons || [],
      });

      if (!newMod) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Curriculum path not found" } });
        return;
      }

      res.status(201).json({ success: true, data: newMod, message: "Module added to curriculum path." });
    } catch (err: any) {
      logger.error(`[AdminCurriculum] Error adding module: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async addLesson(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { pathId, moduleId } = req.params;
      const body = req.body;

      if (!body.title) {
        res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Lesson title is required." } });
        return;
      }

      const newLesson = await curriculumCmsRepository.addLesson(pathId, moduleId, {
        title: body.title,
        lessonType: body.lessonType || "lesson",
        duration: body.duration || "15 min",
        problemSlug: body.problemSlug,
        xpReward: body.xpReward || 25,
        orderIndex: body.orderIndex,
      });

      if (!newLesson) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Path or Module not found" } });
        return;
      }

      res.status(201).json({ success: true, data: newLesson, message: "Lesson added to module." });
    } catch (err: any) {
      logger.error(`[AdminCurriculum] Error adding lesson: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }
}
