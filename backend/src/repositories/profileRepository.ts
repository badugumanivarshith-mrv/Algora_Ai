import { Database } from "../db/connection";
import { ProfileEntity } from "../types";
import { db } from "../services/store";

export class ProfileRepository {
  static async findByUserId(userId: string): Promise<ProfileEntity | null> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT id, user_id as "userId", full_name as "fullName", avatar_url as "avatarUrl", bio,
                institution, github_handle as "githubHandle", preferred_language as "preferredLanguage",
                rating, streak_days as "streakDays", total_xp as "totalXP", created_at as "createdAt",
                updated_at as "updatedAt"
         FROM profiles WHERE user_id = $1 LIMIT 1;`,
        [userId]
      );
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        userId: r.userId,
        fullName: r.fullName,
        avatarUrl: r.avatarUrl,
        bio: r.bio || "",
        institution: r.institution || "",
        githubHandle: r.githubHandle,
        preferredLanguage: r.preferredLanguage || "Python",
        rating: Number(r.rating) || 1200,
        streakDays: Number(r.streakDays) || 0,
        totalXP: Number(r.totalXP) || 0,
        createdAt: new Date(r.createdAt).toISOString(),
        updatedAt: new Date(r.updatedAt).toISOString(),
      };
    }

    return db.profiles.get(userId) || null;
  }

  static async create(profile: ProfileEntity): Promise<ProfileEntity> {
    const pool = Database.getPool();
    if (pool) {
      await Database.query(
        `INSERT INTO profiles (id, user_id, full_name, avatar_url, bio, institution, github_handle, preferred_language, rating, streak_days, total_xp, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);`,
        [
          profile.id,
          profile.userId,
          profile.fullName,
          profile.avatarUrl,
          profile.bio,
          profile.institution,
          profile.githubHandle,
          profile.preferredLanguage,
          profile.rating,
          profile.streakDays,
          profile.totalXP,
          profile.createdAt,
          profile.updatedAt,
        ]
      );
    }
    db.profiles.set(profile.userId, profile);
    return profile;
  }

  static async update(userId: string, data: Partial<ProfileEntity>): Promise<ProfileEntity> {
    const existing = await this.findByUserId(userId);
    const now = new Date().toISOString();

    const updated: ProfileEntity = {
      id: existing?.id || `prof-${userId}`,
      userId,
      fullName: data.fullName !== undefined ? data.fullName : existing?.fullName || "User",
      avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : existing?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
      bio: data.bio !== undefined ? data.bio : existing?.bio || "",
      institution: data.institution !== undefined ? data.institution : existing?.institution || "",
      githubHandle: data.githubHandle !== undefined ? data.githubHandle : existing?.githubHandle,
      preferredLanguage: data.preferredLanguage !== undefined ? data.preferredLanguage : existing?.preferredLanguage || "Python",
      rating: data.rating !== undefined ? data.rating : existing?.rating || 1200,
      streakDays: data.streakDays !== undefined ? data.streakDays : existing?.streakDays || 0,
      totalXP: data.totalXP !== undefined ? data.totalXP : existing?.totalXP || 0,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    const pool = Database.getPool();
    if (pool) {
      await Database.query(
        `INSERT INTO profiles (id, user_id, full_name, avatar_url, bio, institution, github_handle, preferred_language, rating, streak_days, total_xp, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (user_id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           avatar_url = EXCLUDED.avatar_url,
           bio = EXCLUDED.bio,
           institution = EXCLUDED.institution,
           github_handle = EXCLUDED.github_handle,
           preferred_language = EXCLUDED.preferred_language,
           rating = EXCLUDED.rating,
           streak_days = EXCLUDED.streak_days,
           total_xp = EXCLUDED.total_xp,
           updated_at = EXCLUDED.updated_at;`,
        [
          updated.id,
          updated.userId,
          updated.fullName,
          updated.avatarUrl,
          updated.bio,
          updated.institution,
          updated.githubHandle,
          updated.preferredLanguage,
          updated.rating,
          updated.streakDays,
          updated.totalXP,
          updated.createdAt,
          updated.updatedAt,
        ]
      );
    }

    db.profiles.set(userId, updated);
    return updated;
  }

  static async incrementXPAndRating(userId: string, xpGained: number, ratingDelta: number): Promise<ProfileEntity | null> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `UPDATE profiles
         SET total_xp = total_xp + $2, rating = rating + $3, updated_at = NOW()
         WHERE user_id = $1
         RETURNING id, user_id as "userId", full_name as "fullName", avatar_url as "avatarUrl", bio,
                   institution, github_handle as "githubHandle", preferred_language as "preferredLanguage",
                   rating, streak_days as "streakDays", total_xp as "totalXP", created_at as "createdAt",
                   updated_at as "updatedAt";`,
        [userId, xpGained, ratingDelta]
      );
      if (rows.length > 0) {
        const r = rows[0];
        const res: ProfileEntity = {
          id: r.id,
          userId: r.userId,
          fullName: r.fullName,
          avatarUrl: r.avatarUrl,
          bio: r.bio,
          institution: r.institution,
          githubHandle: r.githubHandle,
          preferredLanguage: r.preferredLanguage,
          rating: Number(r.rating),
          streakDays: Number(r.streakDays),
          totalXP: Number(r.totalXP),
          createdAt: new Date(r.createdAt).toISOString(),
          updatedAt: new Date(r.updatedAt).toISOString(),
        };
        db.profiles.set(userId, res);
        return res;
      }
    }

    const current = db.profiles.get(userId);
    if (current) {
      current.totalXP += xpGained;
      current.rating += ratingDelta;
      current.updatedAt = new Date().toISOString();
      return current;
    }
    return null;
  }
}
