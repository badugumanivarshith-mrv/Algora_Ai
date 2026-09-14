import { CollaborationRepository } from "../../repositories/collaborationRepository";
import { RedisManager } from "../../redis/redisClient";

export class RealtimeSyncService {
  public static async syncCode(roomId: string, userId: string, code: string) {
    await CollaborationRepository.updateRoomCode(roomId, code);
    await CollaborationRepository.saveCodeHistory(roomId, userId, code, "type");

    // Update Cache
    const cached = await RedisManager.get(`collab:room:${roomId}`);
    if (cached) {
      const room = JSON.parse(cached);
      room.current_code = code;
      await RedisManager.set(`collab:room:${roomId}`, JSON.stringify(room), 3600);
    }

    return { roomId, code, updatedAt: new Date().toISOString() };
  }

  public static async updateCursor(roomId: string, userId: string, cursorPosition: { line: number; column: number }) {
    const presenceKey = `collab:presence:${roomId}`;
    const presenceData = await RedisManager.get(presenceKey);
    if (presenceData) {
      let participants = JSON.parse(presenceData);
      participants = participants.map((p: any) => {
        if (p.userId === userId) {
          return { ...p, cursorPosition };
        }
        return p;
      });
      await RedisManager.set(presenceKey, JSON.stringify(participants), 3600);
    }
  }

  public static async syncWhiteboard(roomId: string, shapes: any) {
    await CollaborationRepository.updateWhiteboard(roomId, shapes);
    return { roomId, shapes, updatedAt: new Date().toISOString() };
  }

  public static async getWhiteboard(roomId: string) {
    return await CollaborationRepository.getWhiteboard(roomId);
  }
}
