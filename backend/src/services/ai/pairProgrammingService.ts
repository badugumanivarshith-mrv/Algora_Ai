import { CollaborationRepository } from "../../repositories/collaborationRepository";
import { RedisManager } from "../../redis/redisClient";

export class PairProgrammingService {
  public static async switchRoles(roomId: string, driverUserId: string, navigatorUserId: string) {
    await CollaborationRepository.updateRoomRoles(roomId, driverUserId, navigatorUserId);

    const cached = await RedisManager.get(`collab:room:${roomId}`);
    if (cached) {
      const room = JSON.parse(cached);
      room.driver_user_id = driverUserId;
      room.navigator_user_id = navigatorUserId;
      await RedisManager.set(`collab:room:${roomId}`, JSON.stringify(room), 3600);
    }

    await CollaborationRepository.saveMessage(
      roomId,
      "SYSTEM",
      "System",
      `Roles swapped! Driver is now ${driverUserId}, Navigator is ${navigatorUserId}.`,
      "system"
    );

    return { driverUserId, navigatorUserId, switchedAt: new Date().toISOString() };
  }
}
