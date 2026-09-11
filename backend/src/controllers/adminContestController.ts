import { Response } from "express";
import { AdminAuthenticatedRequest } from "../middleware/adminAuth";
import { contestCmsRepository } from "../repositories/contestCmsRepository";
import { adminRepository } from "../repositories/adminRepository";
import { logger } from "../utils/logger";

export class AdminContestController {
  public static async getContests(_req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const contests = await contestCmsRepository.getAllContests();
      res.json({ success: true, data: contests, meta: { total: contests.length } });
    } catch (err: any) {
      logger.error(`[AdminContests] Error getting contests: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async getContestById(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const contest = await contestCmsRepository.getContestById(id);
      if (!contest) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Contest not found" } });
        return;
      }
      const registrations = await contestCmsRepository.getRegistrations(id);
      res.json({ success: true, data: { ...contest, registrations } });
    } catch (err: any) {
      logger.error(`[AdminContests] Error getting contest: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async createContest(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      const body = req.body;

      if (!body.title || !body.startTime || !body.endTime) {
        res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "title, startTime, and endTime are required." },
        });
        return;
      }

      const created = await contestCmsRepository.createContest({
        title: body.title,
        description: body.description || "",
        contestType: body.contestType || "Weekly Contest",
        startTime: body.startTime,
        endTime: body.endTime,
        durationMinutes: body.durationMinutes || 90,
        difficulty: body.difficulty || "All Levels",
        status: body.status || "upcoming",
        problems: body.problems || [],
      });

      if (user) {
        await adminRepository.recordAuditLog({
          adminId: user.userId,
          adminName: user.username,
          action: "CREATE_CONTEST",
          entityType: "contest",
          entityId: created.id,
          details: { title: created.title, startTime: created.startTime },
          ipAddress: req.ip,
        });
      }

      res.status(201).json({ success: true, data: created, message: "Contest scheduled successfully." });
    } catch (err: any) {
      logger.error(`[AdminContests] Error creating contest: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async updateContest(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const user = req.user;
      const updates = req.body;

      const updated = await contestCmsRepository.updateContest(id, updates);
      if (!updated) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Contest not found" } });
        return;
      }

      if (user) {
        await adminRepository.recordAuditLog({
          adminId: user.userId,
          adminName: user.username,
          action: "UPDATE_CONTEST",
          entityType: "contest",
          entityId: id,
          details: { title: updated.title },
          ipAddress: req.ip,
        });
      }

      res.json({ success: true, data: updated, message: "Contest updated successfully." });
    } catch (err: any) {
      logger.error(`[AdminContests] Error updating contest: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async deleteContest(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const user = req.user;
      const existing = await contestCmsRepository.getContestById(id);

      if (!existing) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Contest not found" } });
        return;
      }

      await contestCmsRepository.deleteContest(id);

      if (user) {
        await adminRepository.recordAuditLog({
          adminId: user.userId,
          adminName: user.username,
          action: "DELETE_CONTEST",
          entityType: "contest",
          entityId: id,
          details: { title: existing.title },
          ipAddress: req.ip,
        });
      }

      res.json({ success: true, message: `Contest '${existing.title}' deleted successfully.` });
    } catch (err: any) {
      logger.error(`[AdminContests] Error deleting contest: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async addProblem(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const contestId = req.params.id;
      const body = req.body;

      if (!body.problemId || !body.problemSlug || !body.problemTitle) {
        res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "problemId, problemSlug, and problemTitle are required." },
        });
        return;
      }

      const problem = await contestCmsRepository.addProblemToContest(contestId, {
        problemId: body.problemId,
        problemSlug: body.problemSlug,
        problemTitle: body.problemTitle,
        orderIndex: body.orderIndex || 1,
        scorePoints: body.scorePoints || 100,
        difficulty: body.difficulty || "Medium",
      });

      if (!problem) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Contest not found" } });
        return;
      }

      res.status(201).json({ success: true, data: problem, message: "Problem attached to contest." });
    } catch (err: any) {
      logger.error(`[AdminContests] Error adding problem to contest: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async removeProblem(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const contestId = req.params.id;
      const problemId = parseInt(req.params.problemId, 10);

      const removed = await contestCmsRepository.removeProblemFromContest(contestId, problemId);
      if (!removed) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Contest or problem not found" } });
        return;
      }

      res.json({ success: true, message: "Problem removed from contest." });
    } catch (err: any) {
      logger.error(`[AdminContests] Error removing problem: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }
}
