import { GoogleGenerativeAI } from "@google/generative-ai";

export class LiteratureReviewService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  public static async generateReview(topic: string, papers: string[]) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  public static async analyzeTrends(topic: string) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze the current research trends in "${topic}". Identify the most active sub-fields and emerging technologies.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
