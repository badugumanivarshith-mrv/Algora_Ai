import { ContestRepository } from "../../repositories/contestRepository";
import { RedisManager } from "../../redis/redisClient";

export class ContestRatingService {
  public static async calculateAndUpdateRating(contestId: string, userId: string, score: number, rank: number): Promise<number> {
    const analytics = await ContestRepository.getAnalytics(userId);
    const currentRating = analytics ? analytics.rating : 1500;

    // Simple Elo-based contest delta calculation
    let delta = 0;
    if (rank === 1) delta = 48;
    else if (rank <= 3) delta = 32;
    else if (rank <= 10) delta = 16;
    else if (rank <= 25) delta = 4;
    else delta = -12;

    const newRating = Math.max(800, currentRating + delta);

    // Update participant
    await ContestRepository.updateParticipantResult({
      contestId,
      userId,
      score,
      rank,
      ratingAfter: newRating,
    });

    // Update analytics
    const joined = (analytics?.contests_joined || 0) + 1;
    const won = (analytics?.contests_won || 0) + (rank === 1 ? 1 : 0);
    const avgRank = analytics?.average_rank
      ? Math.round(((Number(analytics.average_rank) * (joined - 1) + rank) / joined) * 10) / 10
      : rank;

    await ContestRepository.upsertAnalytics({
      userId,
      contestsJoined: joined,
      contestsWon: won,
      averageRank: avgRank,
      rating: newRating,
    });

    // Update Redis rating cache
    const redisKey = `contest:rating:${userId}`;
    await RedisManager.set(redisKey, JSON.stringify({ userId, rating: newRating, delta, updatedAt: new Date() }), 3600);

    return newRating;
  }
}
