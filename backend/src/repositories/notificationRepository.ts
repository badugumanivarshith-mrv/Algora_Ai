import { Database } from "../db/connection";

export interface NotificationEntity {
  id: string;
  userId: string; // specific user_id or 'all'
  type: "achievement_unlock" | "contest_reminder" | "daily_review" | "goal_completed" | "admin_announcement" | "mentor_tip";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

const notificationsStore = new Map<string, NotificationEntity>();

// Seed sample notifications
const seedNotifications: NotificationEntity[] = [
  {
    id: "notif-seed-1",
    userId: "all",
    type: "admin_announcement",
    title: "Algora Weekly Contest 42 Announced!",
    message: "Registration is now open. Compete with 5,000+ engineers this Saturday at 2:00 PM UTC.",
    link: "/contests",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "notif-seed-2",
    userId: "usr-student-1",
    type: "achievement_unlock",
    title: "Achievement Unlocked: Graph Pioneer",
    message: "You solved 10 graph algorithm problems in under 3 days! +150 XP awarded.",
    link: "/profile",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "notif-seed-3",
    userId: "usr-student-1",
    type: "mentor_tip",
    title: "AI Mentor Diagnostic Ready",
    message: "Your Socratic analysis identified high proficiency in Two Pointers and recommended practice on Coin Change.",
    link: "/mentor",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

seedNotifications.forEach((n) => notificationsStore.set(n.id, n));

export class NotificationRepository {
  static async create(notification: NotificationEntity): Promise<NotificationEntity> {
    notificationsStore.set(notification.id, notification);

    if (Database.isReady()) {
      try {
        await Database.query(
          `INSERT INTO notifications (id, user_id, type, title, message, link, is_read, metadata, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            notification.id,
            notification.userId,
            notification.type,
            notification.title,
            notification.message,
            notification.link || null,
            notification.isRead,
            JSON.stringify(notification.metadata || {}),
            notification.createdAt,
          ]
        );
      } catch (err) {
        console.warn("[NotificationRepository] DB insert fallback:", err);
      }
    }

    return notification;
  }

  static async findByUserId(userId: string): Promise<NotificationEntity[]> {
    if (Database.isReady()) {
      try {
        const res = await Database.query<NotificationEntity>(
          `SELECT id, user_id as "userId", type, title, message, link, is_read as "isRead", metadata, created_at as "createdAt"
           FROM notifications WHERE user_id = $1 OR user_id = 'all'
           ORDER BY created_at DESC LIMIT 50`,
          [userId]
        );
        if (res.rows.length > 0) return res.rows;
      } catch (err) {
        console.warn("[NotificationRepository] DB find fallback:", err);
      }
    }

    return Array.from(notificationsStore.values())
      .filter((n) => n.userId === userId || n.userId === "all" || n.userId === "usr-student-1")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async markAsRead(id: string): Promise<boolean> {
    const notif = notificationsStore.get(id);
    if (notif) {
      notif.isRead = true;
    }

    if (Database.isReady()) {
      try {
        await Database.query(`UPDATE notifications SET is_read = TRUE WHERE id = $1`, [id]);
      } catch (err) {
        console.warn("[NotificationRepository] DB mark read fallback:", err);
      }
    }

    return true;
  }

  static async markAllAsRead(userId: string): Promise<void> {
    for (const notif of notificationsStore.values()) {
      if (notif.userId === userId || notif.userId === "all") {
        notif.isRead = true;
      }
    }

    if (Database.isReady()) {
      try {
        await Database.query(`UPDATE notifications SET is_read = TRUE WHERE user_id = $1 OR user_id = 'all'`, [userId]);
      } catch (err) {
        console.warn("[NotificationRepository] DB mark all read fallback:", err);
      }
    }
  }

  static async listAll(): Promise<NotificationEntity[]> {
    return Array.from(notificationsStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}
