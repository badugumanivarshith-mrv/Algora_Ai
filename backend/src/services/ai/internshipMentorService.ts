import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../../utils/logger";

export class InternshipMentorService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

  public static async getDailyMentoring(userId: string, internshipTitle: string, currentTask: string, progress: any) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        As an AI Internship Mentor, provide daily guidance for a student in a "${internshipTitle}" program.
        Current Task: ${currentTask}
        Overall Progress: ${JSON.stringify(progress)}
        
        Provide:
        - dailyObjective: What to focus on today
        - technicalGuidance: Best practices or tips for the current task
        - productivityTip: How to stay efficient
        - nextSteps: What to do after this task
      `;

      const result = await model.generateContent(prompt);
      return { mentoring: result.response.text() };
    } catch (e: any) {
      logger.error(`getDailyMentoring error: ${e.message}`);
      return { mentoring: "Keep pushing forward! Focus on your current task and ensure code quality." };
    }
  }

  public static async provideCoaching(userId: string, performanceMetrics: any) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Analyze these internship performance metrics and provide coaching:
        Metrics: ${JSON.stringify(performanceMetrics)}
        
        Suggest 3 ways to improve productivity and technical depth.
      `;

      const result = await model.generateContent(prompt);
      return { coaching: result.response.text() };
    } catch (e: any) {
      return { coaching: "Consistency is key. Try to complete tasks within estimates and seek feedback early." };
    }
  }
}
