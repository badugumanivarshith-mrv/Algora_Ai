import { AgentRepository } from "../../repositories/agentRepository";
import { RedisManager } from "../../redis/redisClient";

export class AgentMemoryService {
  public static async storeMemory(agentId: string, userId: string, key: string, value: string, importance: number = 1) {
    const memory = await AgentRepository.saveMemory(agentId, userId, key, value, importance);
    
    // Cache in Redis
    await RedisManager.set(`agent:memory:${agentId}:${key}`, value, 3600);
    
    return memory;
  }

  public static async retrieveMemory(agentId: string, key?: string) {
    if (key) {
      const cached = await RedisManager.get(`agent:memory:${agentId}:${key}`);
      if (cached) return cached;
    }
    
    return await AgentRepository.getMemory(agentId);
  }
}
