import { ProjectWorkspaceRepository } from "../../repositories/projectWorkspaceRepository";
import { RedisManager } from "../../redis/redisClient";

export class ProjectAnalyticsService {
  public static async computeWorkspaceAnalytics(workspaceId: string) {
    const tasks = await ProjectWorkspaceRepository.getTasks(workspaceId);
    const milestones = await ProjectWorkspaceRepository.getMilestones(workspaceId);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
    const milestonePerf = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    // Simplified quality and productivity scores for now
    const analytics = {
      completion_rate: Math.round(completionRate),
      milestone_performance: Math.round(milestonePerf),
      team_productivity: Math.round((completionRate + milestonePerf) / 2),
      quality_score: 85 // Mocked for base, updated by ProjectReviewService
    };

    await ProjectWorkspaceRepository.saveAnalytics(workspaceId, analytics);
    return analytics;
  }

  public static async getUserProjectSummary(userId: string) {
    const cacheKey = `project:analytics:${userId}`;
    const cached = await RedisManager.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const workspaces = await ProjectWorkspaceRepository.listWorkspaces(userId);
    const allAnalytics = await Promise.all(workspaces.map(w => ProjectWorkspaceRepository.getAnalytics(w.id)));
    
    const summary = {
      totalWorkspaces: workspaces.length,
      avgCompletion: allAnalytics.length > 0 
        ? allAnalytics.reduce((acc, a) => acc + (a?.completion_rate || 0), 0) / allAnalytics.length 
        : 0,
      totalSkills: 15 // Example
    };

    await RedisManager.set(cacheKey, JSON.stringify(summary), 3600);
    return summary;
  }
}
