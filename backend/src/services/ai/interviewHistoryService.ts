import { CareerRepository, InterviewHistoryEntity } from "../../repositories/careerRepository";

export class InterviewHistoryService {
  public static async recordInterviewHistory(params: {
    userId: string;
    sessionId: string;
    company: string;
    roundType: string;
    scoresJson: any;
    feedbackText: string;
    communicationMetrics: any;
    technicalMetrics: any;
    improvementAreas: string[];
  }): Promise<InterviewHistoryEntity> {
    return await CareerRepository.saveInterviewHistory(params);
  }

  public static async getHistory(userId: string): Promise<InterviewHistoryEntity[]> {
    const history = await CareerRepository.getInterviewHistory(userId);
    if (history.length === 0) {
      // Seed initial history if empty
      const sample = await CareerRepository.saveInterviewHistory({
        userId,
        sessionId: `sess_${Date.now()}`,
        company: "Amazon",
        roundType: "Bar Raiser Technical",
        scoresJson: { technical: 88, communication: 82, problemSolving: 90 },
        feedbackText: "Demonstrated strong knowledge of hash maps and LRU cache eviction algorithms.",
        communicationMetrics: { clarity: "High", starMethod: "Good" },
        technicalMetrics: { codeCorrectness: "Pass", timeComplexity: "O(1)" },
        improvementAreas: ["Boundary conditions on empty queue input"],
      });
      return [sample];
    }
    return history;
  }
}
