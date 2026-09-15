import { AgentRepository } from "../../repositories/agentRepository";
import { RedisManager } from "../../redis/redisClient";
import { logger } from "../../utils/logger";

export class AgentMarketplaceService {
  private static CACHE_TTL = 3600;

  public static async listMarketplace(filters: any = {}) {
    const cacheKey = `agent:market:list:${JSON.stringify(filters)}`;
    const cached = await RedisManager.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const agents = await AgentRepository.getMarketplaceAgents(filters);
    await RedisManager.set(cacheKey, JSON.stringify(agents), this.CACHE_TTL);
    return agents;
  }

  public static async installAgent(userId: string, marketplaceId: string) {
    const install = await AgentRepository.installAgent(userId, marketplaceId);
    logger.info(`[Marketplace] User ${userId} installed agent ${marketplaceId}`);
    
    // Clear analytics cache
    await RedisManager.del(`agent:analytics:${userId}`);
    
    return install;
  }

  public static async rateAgent(userId: string, marketplaceId: string, rating: number, review?: string) {
    const result = await AgentRepository.rateAgent(userId, marketplaceId, rating, review);
    // Invalidate marketplace cache
    await RedisManager.del(`agent:market:list:{}`);
    return result;
  }

  public static async getAnalytics(userId: string) {
    const cacheKey = `agent:analytics:${userId}`;
    const cached = await RedisManager.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const analytics = await AgentRepository.getAnalytics(userId);
    await RedisManager.set(cacheKey, JSON.stringify(analytics), this.CACHE_TTL);
    return analytics;
  }

  public static async publishAgent(userId: string, data: any) {
    const result = await AgentRepository.publishToMarketplace(userId, data);
    await RedisManager.del(`agent:market:list:{}`);
    return result;
  }
}
