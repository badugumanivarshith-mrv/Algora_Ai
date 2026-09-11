import path from "path";
import fs from "fs";
import { UploadRepository, UploadEntity } from "../repositories/uploadRepository";
import { ApiError } from "../middleware/error";

export interface SaveUploadedFileParams {
  userId?: string;
  file: {
    originalname: string;
    mimetype: string;
    size: number;
    buffer?: Buffer;
    path?: string;
  };
  category: "avatar" | "problem_asset" | "contest_asset" | "resource";
}

export class StorageService {
  private static readonly ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/gif",
    "application/pdf",
    "text/plain",
    "application/json",
  ]);

  private static readonly MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

  static async saveFile(params: SaveUploadedFileParams): Promise<UploadEntity> {
    const { file, category, userId } = params;

    if (!this.ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new ApiError(400, "INVALID_FILE_TYPE", `File type ${file.mimetype} is not supported. Allowed: JPEG, PNG, WEBP, SVG, GIF, PDF, TXT, JSON.`);
    }

    if (file.size > this.MAX_FILE_SIZE_BYTES) {
      throw new ApiError(400, "FILE_TOO_LARGE", `File size exceeds the 15MB limit.`);
    }

    const uploadId = `upl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const ext = path.extname(file.originalname) || ".bin";
    const safeFilename = `${uploadId}${ext}`;
    const now = new Date().toISOString();

    let publicUrl = "";
    const storageDir = path.join(process.cwd(), "public", "uploads");

    try {
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }

      if (file.buffer) {
        const targetPath = path.join(storageDir, safeFilename);
        fs.writeFileSync(targetPath, file.buffer);
        publicUrl = `/uploads/${safeFilename}`;
      } else if (file.buffer && file.mimetype.startsWith("image/")) {
        // inline base64 fallback
        const base64 = file.buffer.toString("base64");
        publicUrl = `data:${file.mimetype};base64,${base64}`;
      } else {
        publicUrl = `/uploads/${safeFilename}`;
      }
    } catch (err) {
      console.warn("[StorageService] Could not write to disk, using data URL fallback:", err);
      if (file.buffer) {
        publicUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      } else {
        publicUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${safeFilename}`;
      }
    }

    const record: UploadEntity = {
      id: uploadId,
      userId,
      filename: safeFilename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      category,
      storagePath: path.join("uploads", safeFilename),
      publicUrl,
      createdAt: now,
    };

    return UploadRepository.create(record);
  }

  static async getFile(id: string): Promise<UploadEntity | null> {
    return UploadRepository.findById(id);
  }

  static async listFiles(category?: string): Promise<UploadEntity[]> {
    return UploadRepository.listAll(category);
  }

  static async deleteFile(id: string): Promise<boolean> {
    const record = await UploadRepository.findById(id);
    if (!record) return false;

    try {
      const diskPath = path.join(process.cwd(), "public", record.storagePath);
      if (fs.existsSync(diskPath)) {
        fs.unlinkSync(diskPath);
      }
    } catch {
      // ignore
    }

    return UploadRepository.delete(id);
  }
}
