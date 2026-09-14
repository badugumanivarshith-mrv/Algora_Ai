import { CollaborationRepository, CollaborationRoomEntity } from "../../repositories/collaborationRepository";
import { RedisManager } from "../../redis/redisClient";
import { logger } from "../../utils/logger";

export class RoomService {
  public static async createRoom(params: {
    name: string;
    roomType: string;
    hostUserId: string;
    problemId?: string;
    company?: string;
    language?: string;
    initialCode?: string;
  }): Promise<CollaborationRoomEntity> {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const room = await CollaborationRepository.createRoom({
      id: roomId,
      ...params,
    });

    await RedisManager.set(
      `collab:room:${roomId}`,
      JSON.stringify(room),
      3600
    );

    await CollaborationRepository.addParticipant(roomId, params.hostUserId, "Host User", "Host");

    return room;
  }

  public static async getRoom(roomId: string): Promise<CollaborationRoomEntity | null> {
    const cached = await RedisManager.get(`collab:room:${roomId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback to DB
      }
    }

    const room = await CollaborationRepository.getRoom(roomId);
    if (room) {
      await RedisManager.set(`collab:room:${roomId}`, JSON.stringify(room), 3600);
    }
    return room;
  }

  public static async listRooms(roomType?: string): Promise<CollaborationRoomEntity[]> {
    return await CollaborationRepository.listRooms(roomType);
  }

  public static async joinRoom(roomId: string, userId: string, userName: string, role: string = "Participant") {
    const room = await this.getRoom(roomId);
    if (!room) {
      throw new Error("Collaboration room not found");
    }

    const participant = await CollaborationRepository.addParticipant(roomId, userId, userName, role);
    
    // Update Redis presence
    const presenceKey = `collab:presence:${roomId}`;
    const presenceData = await RedisManager.get(presenceKey);
    let participants = presenceData ? JSON.parse(presenceData) : [];
    if (!participants.some((p: any) => p.userId === userId)) {
      participants.push({ userId, userName, role, joinedAt: new Date().toISOString() });
    }
    await RedisManager.set(presenceKey, JSON.stringify(participants), 3600);

    return { room, participant, participants };
  }

  public static async leaveRoom(roomId: string, userId: string) {
    await CollaborationRepository.removeParticipant(roomId, userId);

    const presenceKey = `collab:presence:${roomId}`;
    const presenceData = await RedisManager.get(presenceKey);
    if (presenceData) {
      let participants = JSON.parse(presenceData);
      participants = participants.filter((p: any) => p.userId !== userId);
      await RedisManager.set(presenceKey, JSON.stringify(participants), 3600);
    }
  }
}
