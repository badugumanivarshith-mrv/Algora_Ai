import { GoogleGenerativeAI } from "@google/generative-ai";

export class OpenSourceMentorService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  public static async getContributionGuidance(repoUrl: string, userSkillset: string[]) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Provide open-source contribution guidance for the repository: ${repoUrl}.
      The user has skills in: ${userSkillset.join(", ")}.
      
      Suggest:
      1. How to get started (onboarding)
      2. Types of issues to look for
      3. Communication best practices in this community
      4. Typical PR review process
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  public static async analyzeIssue(issueDescription: string) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Break down this open-source issue and suggest a high-level implementation strategy:\n\n${issueDescription}`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
