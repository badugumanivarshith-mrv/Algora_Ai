import { defaultAIProvider } from "./geminiProvider";
import { AgentRepository } from "../../repositories/agentRepository";
import { logger } from "../../utils/logger";
import { Database } from "../../db/connection";

export class GoalPlanningService {
  public static async createGoalPlan(userId: string, goalTitle: string, targetDate: string) {
    const prompt = `
      Create a detailed execution plan for the following goal:
      Goal: "${goalTitle}"
      Target Date: ${targetDate}
      
      Break this down into 3-5 specific milestones. 
      For each milestone, provide a title and a brief description of what needs to be achieved.
      Format as JSON: { "milestones": [{ "title": "...", "description": "..." }] }
    `;

    try {
      const text = await defaultAIProvider.generateRawText(prompt);
      const plan = JSON.parse(text.replace(/```json|```/g, '').trim());
      
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
