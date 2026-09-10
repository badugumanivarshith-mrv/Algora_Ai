import { Response, NextFunction } from "express";
import { SubmissionService } from "../services/submissionService";
import { AuthenticatedRequest } from "../middleware/auth";

export class SubmissionController {
  static async getSubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const problemSlug = req.query.problemSlug as string | undefined;
      const status = req.query.status as string | undefined;
      const language = req.query.language as string | undefined;
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const offset = req.query.offset ? Number(req.query.offset) : 0;
      const userId = (req.query.userId as string) || req.user?.userId;

      const result = await SubmissionService.getSubmissions({
        userId,
        problemSlug,
        status,
        language,
        limit,
        offset,
      });

      res.status(200).json({
        success: true,
        data: result.submissions,
        meta: {
          total: result.total,
          limit,
          offset,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async createSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const submission = await SubmissionService.createSubmission(req.body, req.user?.userId);

      res.status(201).json({
        success: true,
        data: submission,
        message: "Submission recorded successfully.",
      });
    } catch (err) {
      next(err);
    }
  }
}
