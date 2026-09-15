import { defaultAIProvider } from "./geminiProvider";

export class LiteratureReviewService {
  public static async generateReview(topic: string, papers: string[]) {
    const prompt = `
      Generate a comprehensive literature review for the topic: "${topic}".
      Use the following paper summaries/abstracts as references:
      ${papers.join("\n\n")}
      
      Structure the review with:
      1. Introduction to the topic
      2. Comparison of different approaches
      3. Current trends and state-of-the-art
      4. Identified gaps
      5. Conclusion
    `;

    return await defaultAIProvider.generateRawText(prompt);
  }

  public static async analyzeTrends(topic: string) {
    const prompt = `Analyze the current research trends in "${topic}". Identify the most active sub-fields and emerging technologies.`;
    return await defaultAIProvider.generateRawText(prompt);
  }
}
