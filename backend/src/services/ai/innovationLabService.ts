import { GoogleGenerativeAI } from "@google/generative-ai";

export class InnovationLabService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  public static async evaluateIdea(idea: { title: string; problem: string; solution: string }) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  public static async generateMvpPlan(idea: string) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate a 4-week MVP execution roadmap for this idea: "${idea}". Focus on core value delivery with minimal complexity.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
