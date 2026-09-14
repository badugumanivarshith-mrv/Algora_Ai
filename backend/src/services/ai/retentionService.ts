import { LearningMemoryRepository, LearningRetentionRecord } from "../../repositories/learningMemoryRepository";

export class RetentionService {
  public static async getRetentionMetrics(userId: string): Promise<{
    retentionRecords: LearningRetentionRecord[];
    overallRetention: number;
    revisionCompletionPercentage: number;
  }> {
    const retentionRecords = await LearningMemoryRepository.getRetentionRecords(userId);

    let sumRetention = 0;
    let sumCompletion = 0;

    retentionRecords.forEach((r) => {
      sumRetention += r.retentionPercentage;
      sumCompletion += r.revisionCompletionPercentage;
    });

    const count = retentionRecords.length || 1;
    return {
      retentionRecords,
      overallRetention: Math.round(sumRetention / count),
      revisionCompletionPercentage: Math.round(sumCompletion / count),
    };
  }

  public static calculateSpacedRepetitionInterval(currentIntervalDays: number, success: boolean): number {
    const intervals = [1, 3, 7, 14, 30];
    const currIndex = intervals.indexOf(currentIntervalDays);

    if (success) {
      if (currIndex === -1) return 3;
      return intervals[Math.min(intervals.length - 1, currIndex + 1)];
    } else {
      if (currIndex <= 0) return 1;
      return intervals[Math.max(0, currIndex - 1)];
    }
  }
}
