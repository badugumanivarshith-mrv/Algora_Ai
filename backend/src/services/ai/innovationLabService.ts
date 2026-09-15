import { defaultAIProvider } from "./geminiProvider";

export class InnovationLabService {
  public static async evaluateIdea(idea: { title: string; problem: string; solution: string }) {
    const prompt = `
      Evaluate the following startup idea:
      Title: ${idea.title}
      Problem: ${idea.problem}
      Solution: ${idea.solution}
      
      Provide:
      1. Technical feasibility (1-10)
      2. Market potential (1-10)
      3. Innovation score (1-10)
      4. Main technical challenges
      5. Suggested architecture
    `;

    return await defaultAIProvider.generateRawText(prompt);
  }

  public static async generateMvpPlan(idea: string) {
    const prompt = `Generate a 4-week MVP execution roadmap for this idea: "${idea}". Focus on core value delivery with minimal complexity.`;
    return await defaultAIProvider.generateRawText(prompt);
  }
}
