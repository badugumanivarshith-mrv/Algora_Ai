import { CollaborationRepository } from "../../repositories/collaborationRepository";
import { RedisManager } from "../../redis/redisClient";

export class CollaborationAnalyticsService {
  public static async getUserAnalytics(userId: string) {
    const redisKey = `collab:analytics:${userId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback
      }
    }

    let dbAnalytics = await CollaborationRepository.getAnalytics(userId);
    if (!dbAnalytics) {
      dbAnalytics = {
        id: `collab_an_${userId}`,
        user_id: userId,
        sessions_participated: 1,
        time_collaborating_minutes: 25,
        pair_sessions: 1,
        interview_sessions: 0,
        problems_solved_together: 1,
        ai_interactions: 3,
        updated_at: new Date().toISOString(),
      };
      await CollaborationRepository.saveAnalytics({
        userId,
        sessionsParticipated: 1,
        timeCollaboratingMinutes: 25,
        pairSessions: 1,
        interviewSessions: 0,
        problemsSolvedTogether: 1,
        aiInteractions: 3,
      });
    }

    await RedisManager.set(redisKey, JSON.stringify(dbAnalytics), 3600);
    return dbAnalytics;
  }

  public static async recordActivity(userId: string, minutes: number, type: "pair" | "interview" | "practice") {
    await CollaborationRepository.saveAnalytics({
      userId,
      sessionsParticipated: 1,
      timeCollaboratingMinutes: minutes,
      pairSessions: type === "pair" ? 1 : 0,
      interviewSessions: type === "interview" ? 1 : 0,
      problemsSolvedTogether: 1,
      aiInteractions: 1,
    });
    await RedisManager.del(`collab:analytics:${userId}`);
  }
}
