import { LearningMemoryRepository, LearningMemoryRecord, LearningRetentionRecord } from "../../repositories/learningMemoryRepository";

export class LearningMemoryService {
  public static async getLearningMemory(userId: string): Promise<{
    records: LearningMemoryRecord[];
    topicMastery: Record<string, number>;
    overallConfidence: number;
  }> {
    const records = await LearningMemoryRepository.getMemoryRecords(userId);

    const topicMastery: Record<string, number> = {};
    let totalConfidence = 0;

    records.forEach((rec) => {
      const totalProblems = rec.problemsSolved + rec.problemsFailed;
      const solveRatio = totalProblems > 0 ? rec.problemsSolved / totalProblems : 0.5;
      const penalty = Math.min(20, rec.hintCount * 2);

      const mastery = Math.max(
        10,
        Math.min(
          100,
          Math.round(
            solveRatio * 40 +
              (rec.quizScore / 100) * 20 +
              (rec.contestScore / 100) * 20 +
              (rec.interviewScore / 100) * 20 -
              penalty
          )
        )
      );

      topicMastery[rec.topic] = mastery;
      totalConfidence += rec.confidenceScore;
    });

    const overallConfidence = records.length > 0 ? Math.round(totalConfidence / records.length) : 75;

    return {
      records,
      topicMastery,
      overallConfidence,
    };
  }

  public static async getRetentionOverview(userId: string): Promise<{
    retentionRecords: LearningRetentionRecord[];
    overallRetention: number;
    averageRevisionCompletion: number;
  }> {
    const retentionRecords = await LearningMemoryRepository.getRetentionRecords(userId);

    let sumRetention = 0;
    let sumCompletion = 0;

    retentionRecords.forEach((r) => {
      sumRetention += r.retentionPercentage;
      sumCompletion += r.revisionCompletionPercentage;
    });

    const count = retentionRecords.length || 1;
    const overallRetention = Math.round(sumRetention / count);
    const averageRevisionCompletion = Math.round(sumCompletion / count);

    return {
      retentionRecords,
      overallRetention,
      averageRevisionCompletion,
    };
  }
}
