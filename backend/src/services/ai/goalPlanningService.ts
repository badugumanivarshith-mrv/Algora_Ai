import { GoogleGenerativeAI } from "@google/generative-ai";
import { AgentRepository } from "../../repositories/agentRepository";
import { logger } from "../../utils/logger";

export class GoalPlanningService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  public static async createGoalPlan(userId: string, goalTitle: string, targetDate: string) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Create a detailed execution plan for the following goal:
      Goal: "${goalTitle}"
      Target Date: ${targetDate}
      
      Break this down into 3-5 specific milestones. 
      For each milestone, provide a title and a brief description of what needs to be achieved.
      Format as JSON: { "milestones": [{ "title": "...", "description": "..." }] }
    `;

    try {
      const result = await model.generateContent(prompt);
      const plan = JSON.parse(result.response.text().replace(/```json|```/g, ''));
      
      const goal = await AgentRepository.createGoal(userId, {
        title: goalTitle,
        targetDate: new Date(targetDate),
        category: 'Personal'
      });

      for (const m of plan.milestones) {
        await Database.query(
          "INSERT INTO goal_milestones (id, goal_id, title, metadata) VALUES ($1, $2, $3, $4)",
          [`mile_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, goal.id, m.title, { description: m.description }]
        );
      }

      return goal;
    } catch (e: any) {
      logger.error(`Goal planning failed: ${e.message}`);
      throw e;
    }
  }
}

// Internal Database Import for the helper
import { Database } from "../../db/connection";
