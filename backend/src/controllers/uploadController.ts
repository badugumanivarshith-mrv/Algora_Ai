import { Request, Response, NextFunction } from "express";
import { StorageService } from "../services/storageService";
import { AuthenticatedRequest } from "../middleware/auth";

export class UploadController {
  static async uploadFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: { code: "NO_FILE", message: "No file attached to upload." } });
        return;
      }

      const category = (req.body.category as "avatar" | "problem_asset" | "contest_asset" | "resource") || "problem_asset";
      const userId = req.user?.userId;

      const record = await StorageService.saveFile({
        userId,
        file: {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          buffer: file.buffer,
        },
        category,
      });

      res.status(201).json({
        success: true,
        data: record,
        message: "File uploaded successfully.",
      });
    } catch (err) {
      next(err);
    }
  }

  static async listFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const files = await StorageService.listFiles(category);
      res.status(200).json({ success: true, data: files });
    } catch (err) {
      next(err);
    }
  }

  static async getFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const file = await StorageService.getFile(id);
      if (!file) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "File not found." } });
        return;
      }
      res.status(200).json({ success: true, data: file });
    } catch (err) {
      next(err);
    }
  }

  static async deleteFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await StorageService.deleteFile(id);
      if (!deleted) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "File not found." } });
        return;
      }
      res.status(200).json({ success: true, message: "File deleted successfully." });
    } catch (err) {
      next(err);
    }
  }
}
