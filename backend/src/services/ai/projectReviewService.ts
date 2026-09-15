import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../../utils/logger";

export class ProjectReviewService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

  public static async reviewProject(workspaceName: string, description: string, submissionUrl: string) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Evaluate the following project for production readiness:
        Project: ${workspaceName}
        Description: ${description}
        Submission URL: ${submissionUrl}
        
        Provide scores (0-100) and feedback for:
        1. Architecture
        2. Scalability
        3. Maintainability
        4. Documentation
        5. Testing Quality
        
        Return a JSON response:
        {
          "scores": { "architecture": number, "scalability": number, "maintainability": number, "documentation": number, "testing": number },
          "overallScore": number,
          "strengths": string[],
          "weaknesses": string[],
          "recommendations": string[]
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e: any) {
      logger.error(`reviewProject error: ${e.message}`);
      return { error: "Failed to review project" };
    }
  }
}
