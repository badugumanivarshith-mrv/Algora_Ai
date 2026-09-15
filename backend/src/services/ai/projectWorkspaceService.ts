import { ProjectWorkspaceRepository, ProjectWorkspaceEntity } from "../../repositories/projectWorkspaceRepository";
import { RedisManager } from "../../redis/redisClient";
import { AgentRepository } from "../../repositories/agentRepository";
import { logger } from "../../utils/logger";

export class ProjectWorkspaceService {
  private static CACHE_TTL = 3600;

  public static async createWorkspace(userId: string, data: any): Promise<ProjectWorkspaceEntity> {
    logger.info(`Creating workspace for user ${userId}: ${data.name}`);
    const workspace = await ProjectWorkspaceRepository.createWorkspace({
      ...data,
      owner_id: userId
    });

    // V4.0 AI OS Integration: Log to Project Agent memory
    await AgentRepository.saveMemory("project-agent", userId, `workspace_${workspace.id}`, `User started new project: ${workspace.name}`, 6);

    return workspace;
  }

  public static async getWorkspace(workspaceId: string): Promise<ProjectWorkspaceEntity | null> {
    const cacheKey = `project:workspace:${workspaceId}`;
    const cached = await RedisManager.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const workspace = await ProjectWorkspaceRepository.getWorkspace(workspaceId);
    if (workspace) {
      await RedisManager.set(cacheKey, JSON.stringify(workspace), this.CACHE_TTL);
    }
    return workspace;
  }

  public static async listWorkspaces(userId: string): Promise<ProjectWorkspaceEntity[]> {
    return await ProjectWorkspaceRepository.listWorkspaces(userId);
  }

  public static async updateWorkspace(workspaceId: string, data: any): Promise<ProjectWorkspaceEntity> {
    const workspace = await ProjectWorkspaceRepository.updateWorkspace(workspaceId, data);
    await RedisManager.del(`project:workspace:${workspaceId}`);
    return workspace;
  }

  public static async deleteWorkspace(workspaceId: string): Promise<void> {
    await ProjectWorkspaceRepository.deleteWorkspace(workspaceId);
    await RedisManager.del(`project:workspace:${workspaceId}`);
  }
}
