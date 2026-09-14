import { Request, Response } from "express";
import { RoomService } from "../services/ai/roomService";
import { RealtimeSyncService } from "../services/ai/realtimeSyncService";
import { PairProgrammingService } from "../services/ai/pairProgrammingService";
import { MockInterviewRoomService } from "../services/ai/mockInterviewRoomService";
import { CollaborationAnalyticsService } from "../services/ai/collaborationAnalyticsService";
import { CollaborationService } from "../services/ai/collaborationService";
import { CollaborationRepository } from "../repositories/collaborationRepository";
import { logger } from "../utils/logger";

export class CollaborationController {
  public static async createRoom(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const { name, roomType, problemId, company, language, initialCode } = req.body;

      const room = await RoomService.createRoom({
        name: name || "Live Coding Room",
        roomType: roomType || "Practice",
        hostUserId: userId,
        problemId,
        company,
        language: language || "typescript",
        initialCode,
      });

      res.status(201).json({ success: true, room });
    } catch (e: any) {
      logger.error(`[CollaborationController.createRoom] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async listRooms(req: Request, res: Response) {
    try {
      const { roomType } = req.query;
      const rooms = await RoomService.listRooms(roomType as string);
      res.json({ success: true, rooms });
    } catch (e: any) {
      logger.error(`[CollaborationController.listRooms] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getRoom(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const room = await RoomService.getRoom(id);
      if (!room) {
        return res.status(404).json({ success: false, error: "Room not found" });
      }
      const participants = await CollaborationRepository.getParticipants(id);
      const messages = await CollaborationRepository.getMessages(id);
      const whiteboard = await CollaborationRepository.getWhiteboard(id);

      res.json({ success: true, room, participants, messages, whiteboard });
    } catch (e: any) {
      logger.error(`[CollaborationController.getRoom] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async joinRoom(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const userName = (req as any).user?.username || "Collaborator";
      const { id } = req.params;
      const { role } = req.body;

      const result = await RoomService.joinRoom(id, userId, userName, role);
      res.json({ success: true, ...result });
    } catch (e: any) {
      logger.error(`[CollaborationController.joinRoom] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async leaveRoom(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const { id } = req.params;

      await RoomService.leaveRoom(id, userId);
      res.json({ success: true, message: "Left room successfully" });
    } catch (e: any) {
      logger.error(`[CollaborationController.leaveRoom] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async syncCode(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const { id } = req.params;
      const { code } = req.body;

      const result = await RealtimeSyncService.syncCode(id, userId, code);
      res.json({ success: true, ...result });
    } catch (e: any) {
      logger.error(`[CollaborationController.syncCode] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async switchRoles(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { driverUserId, navigatorUserId } = req.body;

      const result = await PairProgrammingService.switchRoles(id, driverUserId, navigatorUserId);
      res.json({ success: true, ...result });
    } catch (e: any) {
      logger.error(`[CollaborationController.switchRoles] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async evaluateInterview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { company, code, transcript } = req.body;

      const evaluation = await MockInterviewRoomService.evaluateInterviewSession({
        roomId: id,
        company: company || "Amazon",
        code,
        transcript,
      });

      res.json({ success: true, evaluation });
    } catch (e: any) {
      logger.error(`[CollaborationController.evaluateInterview] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async sendChatMessage(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const userName = (req as any).user?.username || "Collaborator";
      const { id } = req.params;
      const { message, codeContext, isAiRequested } = req.body;

      const userMsg = await CollaborationRepository.saveMessage(id, userId, userName, message, "text");

      let aiMsg = null;
      if (isAiRequested || message.toLowerCase().includes("@ai") || message.toLowerCase().includes("hint")) {
        aiMsg = await CollaborationService.generateAIChatResponse({
          roomId: id,
          userId,
          userName,
          message,
          codeContext,
        });
      }

      res.json({ success: true, message: userMsg, aiMessage: aiMsg });
    } catch (e: any) {
      logger.error(`[CollaborationController.sendChatMessage] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async syncWhiteboard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { shapes } = req.body;

      const result = await RealtimeSyncService.syncWhiteboard(id, shapes);
      res.json({ success: true, ...result });
    } catch (e: any) {
      logger.error(`[CollaborationController.syncWhiteboard] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const analytics = await CollaborationAnalyticsService.getUserAnalytics(userId);
      res.json({ success: true, analytics });
    } catch (e: any) {
      logger.error(`[CollaborationController.getAnalytics] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }
}
