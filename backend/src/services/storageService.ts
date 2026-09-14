import path from "path";
import fs from "fs";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UploadRepository, UploadEntity } from "../repositories/uploadRepository";
import { ApiError } from "../middleware/error";
import { config } from "../config/env";
import { logger } from "../utils/logger";

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
  private static s3Client: S3Client | null = null;

  private static getS3Client(): S3Client | null {
    if (config.storageProvider !== "s3") return null;
    
    if (!this.s3Client) {
      try {
        const s3Config: any = {
          region: config.awsRegion,
          credentials: {
            accessKeyId: config.awsAccessKeyId,
            secretAccessKey: config.awsSecretAccessKey,
          },
        };

        if (config.s3Endpoint) {
          s3Config.endpoint = config.s3Endpoint;
          s3Config.forcePathStyle = true; // Essential for local MinIO / LocalStack / R2
        }

        this.s3Client = new S3Client(s3Config);
        logger.info("[StorageService] S3 Client initialized successfully.");
      } catch (err: any) {
        logger.error(`[StorageService] Failed to initialize S3 Client: ${err.message}`);
        this.s3Client = null;
      }
    }
    return this.s3Client;
  }

  static async saveFile(params: SaveUploadedFileParams): Promise<UploadEntity> {
    const { file, category, userId } = params;

    // Secure upload validation
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
    const key = `${category}/${safeFilename}`;

    let publicUrl = "";
    const s3 = this.getS3Client();

    if (s3 && config.s3BucketName && file.buffer) {
      try {
        logger.info(`[StorageService] Uploading ${file.originalname} to S3 bucket ${config.s3BucketName}...`);
        await s3.send(
          new PutObjectCommand({
            Bucket: config.s3BucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          })
        );
        
        // Generate a public URL or Signed URL
        if (config.s3Endpoint) {
          publicUrl = `${config.s3Endpoint}/${config.s3BucketName}/${key}`;
        } else {
          publicUrl = `https://${config.s3BucketName}.s3.${config.awsRegion}.amazonaws.com/${key}`;
        }
      } catch (err: any) {
        logger.error(`[StorageService] S3 upload failed, falling back to local storage: ${err.message}`);
        publicUrl = "";
      }
    }

    // Fallback to local storage if S3 was unavailable or disabled
    if (!publicUrl) {
      const storageDir = path.join(process.cwd(), "public", "uploads");
      try {
        if (!fs.existsSync(storageDir)) {
          fs.mkdirSync(storageDir, { recursive: true });
        }

        if (file.buffer) {
          const targetPath = path.join(storageDir, safeFilename);
          fs.writeFileSync(targetPath, file.buffer);
          publicUrl = `/uploads/${safeFilename}`;
        } else if (file.path && fs.existsSync(file.path)) {
          const targetPath = path.join(storageDir, safeFilename);
          fs.copyFileSync(file.path, targetPath);
          publicUrl = `/uploads/${safeFilename}`;
        } else {
          publicUrl = `/uploads/${safeFilename}`;
        }
      } catch (err: any) {
        logger.warn(`[StorageService] Local write failed: ${err.message}. Using inline base64 placeholder.`);
        if (file.buffer) {
          publicUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        } else {
          publicUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${safeFilename}`;
        }
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
      storagePath: key,
      publicUrl,
      createdAt: now,
    };

    return UploadRepository.create(record);
  }

  static async getFile(id: string): Promise<UploadEntity | null> {
    return UploadRepository.findById(id);
  }

  // Signed URL implementation
  static async getSignedDownloadUrl(id: string, expiresInSeconds = 3600): Promise<string> {
    const record = await UploadRepository.findById(id);
    if (!record) throw new ApiError(404, "FILE_NOT_FOUND", "File record does not exist.");

    const s3 = this.getS3Client();
    if (s3 && config.s3BucketName && !record.publicUrl.startsWith("/uploads") && !record.publicUrl.startsWith("data:")) {
      try {
        const command = new GetObjectCommand({
          Bucket: config.s3BucketName,
          Key: record.storagePath,
        });
        return await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
      } catch (err: any) {
        logger.warn(`[StorageService] S3 Signed URL generation failed: ${err.message}`);
      }
    }
    return record.publicUrl;
  }

  static async listFiles(category?: string): Promise<UploadEntity[]> {
    return UploadRepository.listAll(category);
  }

  // Deletion lifecycle
  static async deleteFile(id: string): Promise<boolean> {
    const record = await UploadRepository.findById(id);
    if (!record) return false;

    // Remove from S3
    const s3 = this.getS3Client();
    if (s3 && config.s3BucketName && !record.publicUrl.startsWith("/uploads") && !record.publicUrl.startsWith("data:")) {
      try {
        logger.info(`[StorageService] Deleting key ${record.storagePath} from S3 bucket...`);
        await s3.send(
          new DeleteObjectCommand({
            Bucket: config.s3BucketName,
            Key: record.storagePath,
          })
        );
      } catch (err: any) {
        logger.error(`[StorageService] Failed to delete S3 file: ${err.message}`);
      }
    }

    // Remove local file
    try {
      const diskPath = path.join(process.cwd(), "public", "uploads", record.filename);
      if (fs.existsSync(diskPath)) {
        fs.unlinkSync(diskPath);
      }
    } catch {
      // ignore
    }

    return UploadRepository.delete(id);
  }

  // Storage Health Check
  static async checkHealth(): Promise<{ status: string; provider: string; details?: any }> {
    const s3 = this.getS3Client();
    if (s3 && config.s3BucketName) {
      try {
        await s3.send(new ListObjectsV2Command({ Bucket: config.s3BucketName, MaxKeys: 1 }));
        return {
          status: "healthy",
          provider: "s3_cloud",
          details: { bucket: config.s3BucketName, region: config.awsRegion },
        };
      } catch (err: any) {
        return {
          status: "degraded",
          provider: "s3_cloud",
          details: { bucket: config.s3BucketName, error: err.message },
        };
      }
    }

    // Local check
    try {
      const storageDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }
      const testFile = path.join(storageDir, ".health");
      fs.writeFileSync(testFile, "OK");
      fs.unlinkSync(testFile);
      return {
        status: "healthy",
        provider: "local_filesystem",
        details: { path: storageDir },
      };
    } catch (err: any) {
      return {
        status: "unhealthy",
        provider: "local_filesystem",
        details: { error: err.message },
      };
    }
  }
}
