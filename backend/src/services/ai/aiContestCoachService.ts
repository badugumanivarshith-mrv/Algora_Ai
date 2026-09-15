import { defaultAIProvider } from "./geminiProvider";

export interface CoachAdviceRequest {
  contestId: string;
  problemTitle?: string;
  userCode?: string;
  errorLog?: string;
  timeRemainingMinutes?: number;
  requestType: "hint" | "strategy" | "time_allocation" | "weak_topics" | "post_contest_analysis";
}

export class AIContestCoachService {
  public static async getCoachAdvice(request: CoachAdviceRequest): Promise<{
    adviceType: string;
    headline: string;
    socraticHint: string;
    strategyRecommendation: string;
    recommendedTimeAllocation: string;
  }> {
    const prompt = `You are Algora's AI Contest Coach guiding a competitive programmer during a contest.
Follow strict SOCRATIC LEARNING rules: NEVER reveal the full code or solution algorithm.
Focus on guiding the student through hints, time management, and strategy.

Request details:
- Type: ${request.requestType}
- Problem: ${request.problemTitle || "General Contest Strategy"}
- User Code/Attempt: ${request.userCode || "None provided"}
- Error Log: ${request.errorLog || "None"}
- Time Remaining: ${request.timeRemainingMinutes || 60} minutes

Return JSON format:
{
  "adviceType": "${request.requestType}",
  "headline": "Socratic Hint & Strategy",
  "socraticHint": "Consider what happens when the input array contains duplicate elements. Have you handled the boundary condition?",
  "strategyRecommendation": "Prioritize Problem B first as it matches your high Sliding Window accuracy before tackling Problem C.",
  "recommendedTimeAllocation": "Spend 15 mins on Problem A, 25 mins on Problem B, and 35 mins on Problem C."
}`;

    try {
      const responseText = await defaultAIProvider.generateRawText(prompt);
      const parsed = JSON.parse(responseText.replace(/```json|```/g, "").trim());
      return parsed;
    } catch (e) {
      return {
        adviceType: request.requestType,
        headline: "Socratic Hint & Strategy",
        socraticHint: "Consider testing edge cases such as empty inputs or negative values. What is the time complexity of your inner loop?",
        strategyRecommendation: "Focus on securing partial points for Problem B before attempting the hard constraint version.",
        recommendedTimeAllocation: "Spend 20 minutes analyzing constraints before writing code.",
      };
    }
  }
}
