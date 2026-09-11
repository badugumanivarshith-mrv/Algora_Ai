import { Database } from "../db/connection";
import { UserEntity } from "../types";
import { db } from "../services/store";

export class UserRepository {
  static async findById(id: string): Promise<UserEntity | null> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT id, email, username, password_hash as "passwordHash", role, created_at as "createdAt", updated_at as "updatedAt"
         FROM users WHERE id = $1 LIMIT 1;`,
        [id]
      );
      if (rows.length === 0) return null;
      return {
        id: rows[0].id,
        email: rows[0].email,
        username: rows[0].username,
        passwordHash: rows[0].passwordHash,
        role: rows[0].role,
        createdAt: new Date(rows[0].createdAt).toISOString(),
        updatedAt: new Date(rows[0].updatedAt).toISOString(),
      };
    }

    return db.users.get(id) || null;
  }

  static async findByEmail(email: string): Promise<UserEntity | null> {
    const norm = email.trim().toLowerCase();
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT id, email, username, password_hash as "passwordHash", role, created_at as "createdAt", updated_at as "updatedAt"
         FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1;`,
        [norm]
      );
      if (rows.length === 0) return null;
      return {
        id: rows[0].id,
        email: rows[0].email,
        username: rows[0].username,
        passwordHash: rows[0].passwordHash,
        role: rows[0].role,
        createdAt: new Date(rows[0].createdAt).toISOString(),
        updatedAt: new Date(rows[0].updatedAt).toISOString(),
      };
    }

    for (const u of db.users.values()) {
      if (u.email.toLowerCase() === norm) return u;
    }
    return null;
  }

  static async findByUsername(username: string): Promise<UserEntity | null> {
    const norm = username.trim().toLowerCase();
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT id, email, username, password_hash as "passwordHash", role, created_at as "createdAt", updated_at as "updatedAt"
         FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1;`,
        [norm]
      );
      if (rows.length === 0) return null;
      return {
        id: rows[0].id,
        email: rows[0].email,
        username: rows[0].username,
        passwordHash: rows[0].passwordHash,
        role: rows[0].role,
        createdAt: new Date(rows[0].createdAt).toISOString(),
        updatedAt: new Date(rows[0].updatedAt).toISOString(),
      };
    }

    for (const u of db.users.values()) {
      if (u.username.toLowerCase() === norm) return u;
    }
    return null;
  }

  static async findByEmailOrUsername(identifier: string): Promise<UserEntity | null> {
    const norm = identifier.trim().toLowerCase();
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT id, email, username, password_hash as "passwordHash", role, created_at as "createdAt", updated_at as "updatedAt"
         FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1) LIMIT 1;`,
        [norm]
      );
      if (rows.length === 0) return null;
      return {
        id: rows[0].id,
        email: rows[0].email,
        username: rows[0].username,
        passwordHash: rows[0].passwordHash,
        role: rows[0].role,
        createdAt: new Date(rows[0].createdAt).toISOString(),
        updatedAt: new Date(rows[0].updatedAt).toISOString(),
      };
    }

    for (const u of db.users.values()) {
      if (u.email.toLowerCase() === norm || u.username.toLowerCase() === norm) return u;
    }
    return null;
  }

  static async create(user: UserEntity): Promise<UserEntity> {
    const pool = Database.getPool();
    if (pool) {
      await Database.query(
        `INSERT INTO users (id, email, username, password_hash, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7);`,
        [user.id, user.email, user.username, user.passwordHash, user.role, user.createdAt, user.updatedAt]
      );
    }
    db.users.set(user.id, user);
    return user;
  }

  static async update(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: UserEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const pool = Database.getPool();
    if (pool) {
      const setClauses: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (updates.email !== undefined) {
        setClauses.push(`email = $${idx++}`);
        values.push(updates.email);
      }
      if (updates.username !== undefined) {
        setClauses.push(`username = $${idx++}`);
        values.push(updates.username);
      }
      if (updates.passwordHash !== undefined) {
        setClauses.push(`password_hash = $${idx++}`);
        values.push(updates.passwordHash);
      }
      if (updates.role !== undefined) {
        setClauses.push(`role = $${idx++}`);
        values.push(updates.role);
      }

      setClauses.push(`updated_at = $${idx++}`);
      values.push(updated.updatedAt);
      values.push(id);

      if (setClauses.length > 0) {
        await Database.query(`UPDATE users SET ${setClauses.join(", ")} WHERE id = $${idx};`, values);
      }
    }

    db.users.set(id, updated);
    return updated;
  }

  static async count(): Promise<number> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<{ count: string }>(`SELECT COUNT(*) as count FROM users;`);
      return parseInt(rows[0]?.count || "0", 10);
    }
    return db.users.size;
  }
}
