import { WebSocketManager } from "../realtime/wsManager";
import { RealtimeSyncService } from "../services/ai/realtimeSyncService";
import { RoomService } from "../services/ai/roomService";
import { logger } from "../utils/logger";

export class RoomSocketHandler {
  public static async handleJoinRoom(roomId: string, userId: string, userName: string) {
    try {
      await RoomService.joinRoom(roomId, userId, userName);
      WebSocketManager.broadcast(roomId, "ROOM_USER_JOINED", {
        userId,
        userName,
        joinedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.error(`[RoomSocket] handleJoinRoom error: ${err.message}`);
    }
  }

  public static async handleCodeSync(roomId: string, userId: string, code: string) {
    try {
      await RealtimeSyncService.syncCode(roomId, userId, code);
      WebSocketManager.broadcast(roomId, "CODE_UPDATE", {
        userId,
        code,
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.error(`[RoomSocket] handleCodeSync error: ${err.message}`);
    }
  }

  public static async handleCursorSync(roomId: string, userId: string, cursorPosition: any) {
    try {
      await RealtimeSyncService.updateCursor(roomId, userId, cursorPosition);
      WebSocketManager.broadcast(roomId, "CURSOR_UPDATE", {
        userId,
        cursorPosition,
      });
    } catch (err: any) {
      logger.error(`[RoomSocket] handleCursorSync error: ${err.message}`);
    }
  }

  public static async handleWhiteboardSync(roomId: string, shapes: any) {
    try {
      await RealtimeSyncService.syncWhiteboard(roomId, shapes);
      WebSocketManager.broadcast(roomId, "WHITEBOARD_UPDATE", {
        shapes,
      });
    } catch (err: any) {
      logger.error(`[RoomSocket] handleWhiteboardSync error: ${err.message}`);
    }
  }
}
