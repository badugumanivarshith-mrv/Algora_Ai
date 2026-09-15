import { defaultAIProvider } from "./geminiProvider";

export class ResearchRoadmapService {
  public static async generateRoadmap(params: {
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Publication';
    domain: string;
    interests: string[];
    masteryScores: any[];
  }) {
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

    return await defaultAIProvider.generateRawText(prompt);
  }
}
