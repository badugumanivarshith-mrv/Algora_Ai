/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Persistent Notifications Controller (PostgreSQL + Real-Time SSE)
 */

import { Response } from "express";
import { drizzleDb } from "../db/db";
import { notifications, notificationPreferences } from "../db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { realtimeBroadcaster } from "../services/realtimeService";
import crypto from "crypto";

export async function createNotificationInternal(
  userId: string,
  title: string,
  message: string,
  type: string = "info",
  metadata: Record<string, any> = {}
) {
  try {
    const notifId = crypto.randomUUID();
    const newNotif = {
      id: notifId,
      userId,
      title,
      message,
      type,
      isRead: false,
      metadata,
      createdAt: new Date(),
    };

    await drizzleDb.insert(notifications).values(newNotif);

    // Stream real-time notification via SSE
    realtimeBroadcaster.sendToUser(userId, "notification", newNotif);
    return newNotif;
  } catch (err: any) {
    console.error("Error creating notification:", err.message);
    return null;
  }
}

export async function getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const list = await drizzleDb
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    res.status(200).json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getUnreadCount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const unreadList = await drizzleDb
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

    res.status(200).json({ success: true, count: unreadList.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    await drizzleDb
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));

    res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    await drizzleDb
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    await drizzleDb
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
