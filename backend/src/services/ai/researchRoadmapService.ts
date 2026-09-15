import { GoogleGenerativeAI } from "@google/generative-ai";

export class ResearchRoadmapService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  public static async generateRoadmap(params: {
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Publication';
    domain: string;
    interests: string[];
    masteryScores: any[];
  }) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Generate a research roadmap for a user at ${params.level} level in the domain of "${params.domain}".
      User interests: ${params.interests.join(", ")}
      User mastery levels: ${JSON.stringify(params.masteryScores)}
      
      The roadmap should include:
      - Phases (e.g., Foundations, Literature Survey, Methodology, Experimentation, Writing)
      - Specific topics to study
      - Key papers to read
      - Practical milestones
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
