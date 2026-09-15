import { defaultAIProvider } from "./geminiProvider";

export class OpenSourceMentorService {
  public static async getContributionGuidance(repoUrl: string, userSkillset: string[]) {
    const prompt = `
      Provide open-source contribution guidance for the repository: ${repoUrl}.
      The user has skills in: ${userSkillset.join(", ")}.
      
      Suggest:
      1. How to get started (onboarding)
      2. Types of issues to look for
      3. Communication best practices in this community
      4. Typical PR review process
    `;

    return await defaultAIProvider.generateRawText(prompt);
  }

  public static async analyzeIssue(issueDescription: string) {
    const prompt = `Break down this open-source issue and suggest a high-level implementation strategy:\n\n${issueDescription}`;
    return await defaultAIProvider.generateRawText(prompt);
  }
}
