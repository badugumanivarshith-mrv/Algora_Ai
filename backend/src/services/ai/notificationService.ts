import { NotificationRepository, NotificationEntity } from "../../repositories/notificationRepository";
import { ProductivityRepository } from "../../repositories/productivityRepository";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../../utils/logger";

export class NotificationService {
  public static async notify(userId: string, type: NotificationEntity['type'], title: string, message: string, metadata: any = {}) {
    const prefs = await ProductivityRepository.getNotificationPreferences(userId);
    
    // Check if category is enabled
    const category = this.mapTypeToCategory(type);
    if (prefs.categories[category] === false) return;

    const notification: NotificationEntity = {
      id: `notif_${uuidv4()}`,
      userId,
      type,
      title,
      message,
      isRead: false,
      metadata,
      createdAt: new Date().toISOString()
    };

    await NotificationRepository.create(notification);
    logger.info(`[Notification] Sent ${type} to user ${userId}`);
    
    // In a real implementation, this would trigger Socket.io, Email, or Push notifications
    return notification;
  }

  private static mapTypeToCategory(type: string): string {
    if (type.includes('workflow')) return 'workflow';
    if (type.includes('agent')) return 'agent';
    if (type.includes('contest')) return 'career';
    if (type.includes('goal')) return 'career';
    return 'project';
  }

  public static async getNotifications(userId: string) {
    return await NotificationRepository.findByUserId(userId);
  }

  public static async markAsRead(id: string) {
    return await NotificationRepository.markAsRead(id);
  }
}
