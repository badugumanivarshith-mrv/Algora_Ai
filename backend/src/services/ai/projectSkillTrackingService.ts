import { ProjectWorkspaceRepository } from "../../repositories/projectWorkspaceRepository";
import { RedisManager } from "../../redis/redisClient";

export class ProjectSkillTrackingService {
  public static async trackSkillGrowth(workspaceId: string, userId: string, activityType: string, metadata: any) {
    const skillsToLog = [];
    
    if (activityType === 'TaskCompletion') {
      const tags = metadata.tags || [];
      for (const tag of tags) {
        skillsToLog.push({
          name: tag,
          category: this.categorizeSkill(tag),
          gain: 2
        });
      }
    } else if (activityType === 'ProjectSubmission') {
      skillsToLog.push({ name: 'Project Implementation', category: 'Fullstack', gain: 10 });
      skillsToLog.push({ name: 'Software Architecture', category: 'Design', gain: 5 });
    }

    if (skillsToLog.length > 0) {
      await ProjectWorkspaceRepository.saveSkillProgress(workspaceId, userId, skillsToLog);
      await RedisManager.del(`project:skills:${userId}`);
    }
  }

  private static categorizeSkill(skill: string): string {
    const s = skill.toLowerCase();
    if (['react', 'vue', 'tailwind', 'css', 'html'].some(k => s.includes(k))) return 'Frontend';
    if (['node', 'express', 'python', 'django', 'nest', 'golang'].some(k => s.includes(k))) return 'Backend';
    if (['postgres', 'mongo', 'redis', 'sql', 'nosql'].some(k => s.includes(k))) return 'Database';
    if (['docker', 'k8s', 'aws', 'gcp', 'ci', 'cd'].some(k => s.includes(k))) return 'DevOps';
    if (['gemini', 'openai', 'llm', 'ml', 'pytorch', 'tensorflow'].some(k => s.includes(k))) return 'AI Engineering';
    return 'General';
  }

  public static async getUserSkillMetrics(userId: string) {
    const cacheKey = `project:skills:${userId}`;
    const cached = await RedisManager.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const metrics = await ProjectWorkspaceRepository.getSkillProgress(userId);
    await RedisManager.set(cacheKey, JSON.stringify(metrics), 3600);
    return metrics;
  }
}
