import { Database } from "../db/connection";

export interface UploadEntity {
  id: string;
  userId?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  category: "avatar" | "problem_asset" | "contest_asset" | "resource";
  storagePath: string;
  publicUrl: string;
  createdAt: string;
}

const uploadsStore = new Map<string, UploadEntity>();

// Seed sample problem asset uploads
const sampleUploadId = "upl-sample-1";
uploadsStore.set(sampleUploadId, {
  id: sampleUploadId,
  userId: "usr-admin-1",
  filename: "graph_dijkstra_diagram.png",
  originalName: "graph_dijkstra_diagram.png",
  mimeType: "image/png",
  sizeBytes: 124500,
  category: "problem_asset",
  storagePath: "/uploads/graph_dijkstra_diagram.png",
  publicUrl: "https://images.unsplash.com/photo-1516116211227-bbc141e97669?auto=format&fit=crop&w=600&q=80",
  createdAt: new Date().toISOString(),
});

export class UploadRepository {
  static async create(upload: UploadEntity): Promise<UploadEntity> {
    uploadsStore.set(upload.id, upload);

    if (Database.isReady()) {
      try {
        await Database.query(
          `INSERT INTO uploads (id, user_id, filename, original_name, mime_type, size_bytes, category, storage_path, public_url, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [upload.id, upload.userId || null, upload.filename, upload.originalName, upload.mimeType, upload.sizeBytes, upload.category, upload.storagePath, upload.publicUrl, upload.createdAt]
        );
      } catch (err) {
        console.warn("[UploadRepository] DB insert fallback:", err);
      }
    }

    return upload;
  }

  static async findById(id: string): Promise<UploadEntity | null> {
    if (Database.isReady()) {
      try {
        const res = await Database.query<UploadEntity>(
          `SELECT id, user_id as "userId", filename, original_name as "originalName", mime_type as "mimeType", size_bytes as "sizeBytes",
                  category, storage_path as "storagePath", public_url as "publicUrl", created_at as "createdAt"
           FROM uploads WHERE id = $1`,
          [id]
        );
        if (res.rows[0]) return res.rows[0];
      } catch (err) {
        console.warn("[UploadRepository] DB find fallback:", err);
      }
    }
    return uploadsStore.get(id) || null;
  }

  static async findByUserId(userId: string): Promise<UploadEntity[]> {
    if (Database.isReady()) {
      try {
        const res = await Database.query<UploadEntity>(
          `SELECT id, user_id as "userId", filename, original_name as "originalName", mime_type as "mimeType", size_bytes as "sizeBytes",
                  category, storage_path as "storagePath", public_url as "publicUrl", created_at as "createdAt"
           FROM uploads WHERE user_id = $1 ORDER BY created_at DESC`,
          [userId]
        );
        if (res.rows.length > 0) return res.rows;
      } catch (err) {
        console.warn("[UploadRepository] DB find by user fallback:", err);
      }
    }
    return Array.from(uploadsStore.values()).filter((u) => u.userId === userId);
  }

  static async listAll(category?: string): Promise<UploadEntity[]> {
    if (Database.isReady()) {
      try {
        const sql = category
          ? `SELECT id, user_id as "userId", filename, original_name as "originalName", mime_type as "mimeType", size_bytes as "sizeBytes",
                    category, storage_path as "storagePath", public_url as "publicUrl", created_at as "createdAt"
             FROM uploads WHERE category = $1 ORDER BY created_at DESC`
          : `SELECT id, user_id as "userId", filename, original_name as "originalName", mime_type as "mimeType", size_bytes as "sizeBytes",
                    category, storage_path as "storagePath", public_url as "publicUrl", created_at as "createdAt"
             FROM uploads ORDER BY created_at DESC`;
        const res = await Database.query<UploadEntity>(sql, category ? [category] : []);
        if (res.rows.length > 0) return res.rows;
      } catch (err) {
        console.warn("[UploadRepository] DB list fallback:", err);
      }
    }
    let all = Array.from(uploadsStore.values());
    if (category) {
      all = all.filter((u) => u.category === category);
    }
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async delete(id: string): Promise<boolean> {
    uploadsStore.delete(id);
    if (Database.isReady()) {
      try {
        await Database.query(`DELETE FROM uploads WHERE id = $1`, [id]);
      } catch (err) {
        console.warn("[UploadRepository] DB delete fallback:", err);
      }
    }
    return true;
  }
}
