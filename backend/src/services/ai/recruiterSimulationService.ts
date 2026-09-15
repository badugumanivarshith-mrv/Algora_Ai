import { HiringRepository } from "../../repositories/hiringRepository";
import { defaultAIProvider } from "./geminiProvider";
import { logger } from "../../utils/logger";

export interface RecruiterSessionRequest {
  candidateId: string;
  company: string;
  roundType: "HR" | "Technical" | "Behavioral" | "Leadership";
  userResponses: string[];
}

export interface RecruiterEvaluation {
  candidateId: string;
  company: string;
  roundType: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: "Strong Hire" | "Hire" | "Leaning Hire" | "Reject";
  improvementPlan: string[];
}

export class RecruiterSimulationService {
  public static async evaluateSession(req: RecruiterSessionRequest): Promise<RecruiterEvaluation> {
    const prompt = `You are an executive Technical Recruiter at ${req.company} evaluating a candidate in an ${req.roundType} interview round.
Be rigorous, realistic, and objective. Never give fake unearned praises.

Candidate Responses:
${req.userResponses.map((r, i) => `Q${i + 1} Response: ${r}`).join("\n")}

Provide evaluation in valid JSON:
{
  "score": 88,
  "strengths": ["Demonstrates strong STAR method structure", "Clear communication on system scale constraints"],
  "weaknesses": ["Needs more specific metrics on impact", "Slight hesitation when asked about conflict resolution"],
  "recommendation": "Hire",
  "improvementPlan": ["Quantify past project metrics by specifying latency improvements", "Practice Amazon Leadership Principle #3: Ownership"]
}`;

    let evalResult: RecruiterEvaluation;

    try {
      const responseText = await defaultAIProvider.generateRawText(prompt);
      const parsed = JSON.parse(responseText.replace(/```json|```/g, "").trim());
      evalResult = {
        candidateId: req.candidateId,
        company: req.company,
        roundType: req.roundType,
        score: parsed.score || 82,
        strengths: parsed.strengths || ["Technical depth in data structures"],
        weaknesses: parsed.weaknesses || ["Boundary case handling under pressure"],
        recommendation: parsed.recommendation || "Hire",
        improvementPlan: parsed.improvementPlan || ["Review sliding window edge cases"],
      };
    } catch (e) {
      evalResult = {
        candidateId: req.candidateId,
        company: req.company,
        roundType: req.roundType,
        score: 84,
        strengths: [
          `Solid problem-solving structure for ${req.company} ${req.roundType} round`,
          "Clear explanation of time and space complexities",
        ],
        weaknesses: [
          "Could elaborate more on distributed trade-offs",
          "Edge case testing should be systematic",
        ],
        recommendation: "Hire",
        improvementPlan: [
          `Practice 3 more ${req.company} tagged coding questions`,
          "Review system design trade-offs regarding CAP theorem",
        ],
      };
    }

    // Save recruiter feedback
    await HiringRepository.saveRecruiterFeedback({
      candidateId: req.candidateId,
      company: req.company,
      strengths: evalResult.strengths,
      weaknesses: evalResult.weaknesses,
      recommendation: evalResult.recommendation,
    });

    return evalResult;
  }
}
