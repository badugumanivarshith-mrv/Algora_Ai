import { Response } from "express";
import { AdminAuthenticatedRequest } from "../middleware/adminAuth";
import { problemCmsRepository } from "../repositories/problemCmsRepository";
import { adminRepository } from "../repositories/adminRepository";
import { ProblemDifficulty } from "../types";
import { logger } from "../utils/logger";

export class AdminProblemController {
  public static async getProblems(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const search = req.query.search as string;
      const difficulty = req.query.difficulty as ProblemDifficulty;
      const topic = req.query.topic as string;
      const status = req.query.status as "draft" | "published" | "archived";
      const language = req.query.language as string;

      const problems = await problemCmsRepository.getAll({
        search,
        difficulty,
        topic,
        status,
        language,
      });

      res.json({ success: true, data: problems, meta: { total: problems.length } });
    } catch (err: any) {
      logger.error(`[AdminProblems] Error getting problems: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async getProblemById(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const problem = await problemCmsRepository.getById(id);
      if (!problem) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Problem not found" } });
        return;
      }

      const versions = await problemCmsRepository.getVersions(id);
      res.json({ success: true, data: { ...problem, versions } });
    } catch (err: any) {
      logger.error(`[AdminProblems] Error getting problem: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async createProblem(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      const body = req.body;

      if (!body.title || !body.slug || !body.difficulty || !body.description) {
        res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "title, slug, difficulty, and description are required." },
        });
        return;
      }

      const existing = await problemCmsRepository.getBySlug(body.slug);
      if (existing) {
        res.status(409).json({
          success: false,
          error: { code: "CONFLICT", message: `Problem with slug '${body.slug}' already exists.` },
        });
        return;
      }

      const created = await problemCmsRepository.create(
        {
          slug: body.slug,
          title: body.title,
          difficulty: body.difficulty,
          language: body.language || "Python",
          topic: body.topic || "General",
          tags: body.tags || [],
          xpReward: body.xpReward || 100,
          acceptance: body.acceptance || "0.0%",
          description: body.description,
          examples: body.examples || [],
          constraints: body.constraints || [],
          hints: body.hints || [],
          starterCodes: body.starterCodes || {
            Python: "class Solution:\n    # Write your solution\n    pass",
          },
          solutionCodes: body.solutionCodes || {},
          testCases: body.testCases || [],
          hiddenTestCases: body.hiddenTestCases || [],
          status: body.status || "draft",
        },
        user?.userId,
        user?.username
      );

      // Record audit log
      if (user) {
        await adminRepository.recordAuditLog({
          adminId: user.userId,
          adminName: user.username,
          action: "CREATE_PROBLEM",
          entityType: "problem",
          entityId: String(created.id),
          details: { title: created.title, slug: created.slug, difficulty: created.difficulty },
          ipAddress: req.ip,
        });
      }

      res.status(201).json({ success: true, data: created, message: "Problem successfully created." });
    } catch (err: any) {
      logger.error(`[AdminProblems] Error creating problem: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async updateProblem(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const user = req.user;
      const updates = req.body;

      const updated = await problemCmsRepository.update(
        id,
        updates,
        user?.userId,
        user?.username,
        updates.changeSummary || "Updated via Admin CMS"
      );

      if (!updated) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Problem not found" } });
        return;
      }

      if (user) {
        await adminRepository.recordAuditLog({
          adminId: user.userId,
          adminName: user.username,
          action: "UPDATE_PROBLEM",
          entityType: "problem",
          entityId: String(id),
          details: { title: updated.title, updatedFields: Object.keys(updates) },
          ipAddress: req.ip,
        });
      }

      res.json({ success: true, data: updated, message: "Problem successfully updated." });
    } catch (err: any) {
      logger.error(`[AdminProblems] Error updating problem: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async deleteProblem(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const user = req.user;
      const problem = await problemCmsRepository.getById(id);

      if (!problem) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Problem not found" } });
        return;
      }

      await problemCmsRepository.delete(id);

      if (user) {
        await adminRepository.recordAuditLog({
          adminId: user.userId,
          adminName: user.username,
          action: "DELETE_PROBLEM",
          entityType: "problem",
          entityId: String(id),
          details: { title: problem.title, slug: problem.slug },
          ipAddress: req.ip,
        });
      }

      res.json({ success: true, message: `Problem '${problem.title}' deleted successfully.` });
    } catch (err: any) {
      logger.error(`[AdminProblems] Error deleting problem: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async togglePublish(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const user = req.user;
      const problem = await problemCmsRepository.togglePublish(id);

      if (!problem) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Problem not found" } });
        return;
      }

      if (user) {
        await adminRepository.recordAuditLog({
          adminId: user.userId,
          adminName: user.username,
          action: problem.status === "published" ? "PUBLISH_PROBLEM" : "UNPUBLISH_PROBLEM",
          entityType: "problem",
          entityId: String(id),
          details: { title: problem.title, status: problem.status },
          ipAddress: req.ip,
        });
      }

      res.json({
        success: true,
        data: problem,
        message: `Problem '${problem.title}' is now ${problem.status}.`,
      });
    } catch (err: any) {
      logger.error(`[AdminProblems] Error toggling publish: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async getVersions(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const versions = await problemCmsRepository.getVersions(id);
      res.json({ success: true, data: versions });
    } catch (err: any) {
      logger.error(`[AdminProblems] Error getting problem versions: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }
}
