import { defaultAIProvider } from "./geminiProvider";
import { logger } from "../../utils/logger";

export class TaskPlanningService {
  public static async generateSprintPlan(workspaceName: string, description: string, durationWeeks: number = 2) {
    try {
      const prompt = `
        As an AI Project Manager, generate a ${durationWeeks}-week sprint plan for a project named "${workspaceName}".
        Project Description: ${description}
        
        Provide a JSON response with:
        - sprintGoals: Array of goals
        - weeklyBreakdown: Array of objects with { week: number, tasks: string[] }
        - milestones: Array of objects with { title: string, deliverable: string }
        - roadmap: A short implementation roadmap
      `;

      const text = await defaultAIProvider.generateRawText(prompt);
      const cleaned = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e: any) {
      logger.error(`generateSprintPlan error: ${e.message}`);
      return { error: "Failed to generate sprint plan" };
    }
  }

  public static async generateMilestoneBreakdown(milestoneTitle: string, description: string) {
    try {
      const prompt = `
        Break down the milestone "${milestoneTitle}" into actionable tasks.
        Context: ${description}
        
        Return a JSON list of task objects with { title: string, description: string, estimatedDays: number }.
      `;

      const text = await defaultAIProvider.generateRawText(prompt);
      const cleaned = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e: any) {
      logger.error(`generateMilestoneBreakdown error: ${e.message}`);
      return [];
    }
  }
}
