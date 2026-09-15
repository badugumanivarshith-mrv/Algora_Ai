import { CareerRepository, RecruiterInterviewEntity } from "../../repositories/careerRepository";
import { defaultAIProvider } from "./geminiProvider";

export class RecruiterSimulatorService {
  public static async simulateRecruiterSession(params: {
    userId: string;
    company: string;
    interviewType: "HR" | "Technical" | "Behavioral" | "Managerial" | "Leadership";
    candidateAnswer?: string;
    transcript?: any[];
  }): Promise<{
    aiQuestion: string;
    evaluation?: any;
    interviewRecord?: RecruiterInterviewEntity;
  }> {
    const systemPrompt = `You are an executive interviewer for ${params.company} conducting a ${params.interviewType} Interview.
Be professional, sharp, and evaluate STAR framework (Situation, Task, Action, Result) for behavioral, or technical depth for coding/system design.`;

    const userMessage = params.candidateAnswer
      ? `Candidate Answer:\n${params.candidateAnswer}`
      : `Start the ${params.interviewType} interview round. Ask the first realistic question for ${params.company}.`;

    try {
      const responseText = await defaultAIProvider.generateRawText(userMessage, systemPrompt);

      let evaluation = null;
      let interviewRecord = undefined;

      if (params.candidateAnswer && params.transcript && params.transcript.length >= 3) {
        // Complete evaluation
        const evalPrompt = `Evaluate this completed ${params.interviewType} interview transcript for ${params.company}:
${JSON.stringify(params.transcript)}

Return JSON:
{
  "scores": {
    "technical": 88,
    "communication": 85,
    "problemSolving": 90
  },
  "communicationFeedback": "Clear articulation of tradeoffs using the STAR method.",
  "confidenceScore": 88,
  "hiringRecommendation": "Strong Hire",
  "nextSteps": "Proceed to Onsite Managerial Round"
}`;

        const evalText = await defaultAIProvider.generateRawText(evalPrompt);
        evaluation = JSON.parse(evalText.replace(/```json|```/g, "").trim());

        interviewRecord = await CareerRepository.saveRecruiterInterview({
          userId: params.userId,
          company: params.company,
          interviewType: params.interviewType,
          scoresJson: evaluation.scores || { overall: 85 },
          communicationFeedback: evaluation.communicationFeedback || "Solid communication.",
          confidenceScore: evaluation.confidenceScore || 85,
          hiringRecommendation: evaluation.hiringRecommendation || "Hire",
          transcriptJson: [...(params.transcript || []), { candidate: params.candidateAnswer, recruiter: responseText }],
        });
      }

      return {
        aiQuestion: responseText,
        evaluation,
        interviewRecord,
      };
    } catch (e) {
      return {
        aiQuestion: `Tell me about a challenging project at your previous role where you had to make a complex architectural trade-off for ${params.company}.`,
      };
    }
  }

  public static async getInterviews(userId: string): Promise<RecruiterInterviewEntity[]> {
    return await CareerRepository.getRecruiterInterviews(userId);
  }
}
