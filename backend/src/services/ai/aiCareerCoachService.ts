import { defaultAIProvider } from "./geminiProvider";

export class AICareerCoachService {
  public static async getCoachAdvice(params: {
    userId: string;
    userQuery: string;
    topic?: "career" | "learning" | "interview" | "company" | "salary";
    targetCompany?: string;
    targetRole?: string;
  }): Promise<{
    advice: string;
    actionableSteps: string[];
    recommendedResources: string[];
  }> {
    const systemPrompt = `You are Algora's Executive AI Career Coach.
Provide expert guidance for career progression, interview strategy, technical preparation, company insights, or compensation negotiations.
Be encouraging, strategic, and give actionable advice.`;

    const prompt = `Topic: ${params.topic || "career"}
Target Company: ${params.targetCompany || "FAANG / Tier 1 Tech"}
Target Role: ${params.targetRole || "Software Engineer"}
User Question: "${params.userQuery}"

Return valid JSON:
{
  "advice": "Strategic advice paragraph...",
  "actionableSteps": ["Step 1", "Step 2", "Step 3"],
  "recommendedResources": ["Resource 1", "Resource 2"]
}`;

    try {
      const responseText = await defaultAIProvider.generateRawText(prompt, systemPrompt);
      const parsed = JSON.parse(responseText.replace(/```json|```/g, "").trim());
      return {
        advice: parsed.advice || responseText,
        actionableSteps: parsed.actionableSteps || ["Practice mock interviews", "Optimize LinkedIn & Resume"],
        recommendedResources: parsed.recommendedResources || ["Algora Company Prep Hub", "System Design Primer"],
      };
    } catch (e) {
      return {
        advice: "Focus on mastering core patterns in Data Structures & Algorithms (Trees, Graphs, Two Pointers) while practicing clear verbal breakdown in mock interviews.",
        actionableSteps: [
          "Solve 3 medium LeetCode problems daily using timed limits.",
          "Prepare 5 STAR stories tailored for Amazon Leadership Principles or Google Googlyness.",
          "Participate in Algora Live Mock Interviews twice weekly.",
        ],
        recommendedResources: ["Algora Company Prep Hub", "Grokking System Design", "Algora Voice AI Mentor"],
      };
    }
  }
}
