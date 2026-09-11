import { NotificationRepository, NotificationEntity } from "../repositories/notificationRepository";

export class NotificationService {
  static async getUserNotifications(userId: string): Promise<{
    notifications: NotificationEntity[];
    unreadCount: number;
  }> {
    const list = await NotificationRepository.findByUserId(userId);
    const unreadCount = list.filter((n) => !n.isRead).length;
    return {
      notifications: list,
      unreadCount,
    };
  }

  static async markNotificationAsRead(id: string): Promise<boolean> {
    return NotificationRepository.markAsRead(id);
  }

  static async markAllAsRead(userId: string): Promise<void> {
    return NotificationRepository.markAllAsRead(userId);
  }

  static async createNotification(data: {
    userId: string;
    type: NotificationEntity["type"];
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, any>;
  }): Promise<NotificationEntity> {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const record: NotificationEntity = {
      id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      isRead: false,
      metadata: data.metadata,
      createdAt: new Date().toISOString(),
    };

    return NotificationRepository.create(record);
  }

  static async broadcastAnnouncement(data: {
    title: string;
    message: string;
    link?: string;
  }): Promise<NotificationEntity> {
    return this.createNotification({
      userId: "all",
      type: "admin_announcement",
      title: data.title,
      message: data.message,
      link: data.link,
    });
  }

  static async listAllAnnouncements(): Promise<NotificationEntity[]> {
    const all = await NotificationRepository.listAll();
    return all.filter((n) => n.type === "admin_announcement" || n.userId === "all");
  }
}
