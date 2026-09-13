export interface ModerationReportEntity {
  id: string;
  reporterId: string;
  reporterUsername: string;
  targetType: "discussion" | "reply" | "user" | "group_chat";
  targetId: string;
  targetTitle: string;
  reason: "spam" | "harassment" | "cheating" | "inappropriate" | "plagiarism";
  details?: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  actionTaken?: string;
  moderatorId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ModeratedUserEntity {
  id: string;
  userId: string;
  username: string;
  restrictionType: "banned" | "muted" | "warning";
  reason: string;
  expiresAt?: string;
  issuedBy?: string;
  createdAt: string;
}

const memoryReports = new Map<string, ModerationReportEntity>();
const memoryModeratedUsers = new Map<string, ModeratedUserEntity>();

// Seed sample reports for moderation queue
const initialReports: ModerationReportEntity[] = [
  {
    id: "rep-1",
    reporterId: "u-3",
    reporterUsername: "Rohan Verma",
    targetType: "discussion",
    targetId: "disc-spam-1",
    targetTitle: "Buy crypto contest bot 100% win",
    reason: "spam",
    details: "Automated link promoting external telegram bot.",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "rep-2",
    reporterId: "u-2",
    reporterUsername: "Priya Patel",
    targetType: "reply",
    targetId: "reply-cheat-1",
    targetTitle: "Live contest solution leakage",
    reason: "cheating",
    details: "User posted code for active contest problem before round ended.",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

initialReports.forEach((r) => memoryReports.set(r.id, r));

export class ModerationRepository {
  public static async createReport(data: Omit<ModerationReportEntity, "id" | "status" | "createdAt">): Promise<ModerationReportEntity> {
    const id = `rep-${Date.now()}`;
    const report: ModerationReportEntity = {
      ...data,
      id,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    memoryReports.set(id, report);
    return report;
  }

  public static async listReports(status?: string): Promise<ModerationReportEntity[]> {
    let arr = Array.from(memoryReports.values());
    if (status && status !== "all") {
      arr = arr.filter((r) => r.status === status);
    }
    return arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async resolveReport(reportId: string, moderatorId: string, action: string, newStatus: "resolved" | "dismissed"): Promise<ModerationReportEntity | null> {
    const report = memoryReports.get(reportId);
    if (!report) return null;
    report.status = newStatus;
    report.actionTaken = action;
    report.moderatorId = moderatorId;
    report.resolvedAt = new Date().toISOString();
    return report;
  }

  public static async moderateUser(data: {
    userId: string;
    username: string;
    restrictionType: "banned" | "muted" | "warning";
    reason: string;
    expiresAt?: string;
    issuedBy?: string;
  }): Promise<ModeratedUserEntity> {
    const id = `mod-${Date.now()}`;
    const entry: ModeratedUserEntity = {
      id,
      userId: data.userId,
      username: data.username,
      restrictionType: data.restrictionType,
      reason: data.reason,
      expiresAt: data.expiresAt,
      issuedBy: data.issuedBy,
      createdAt: new Date().toISOString(),
    };
    memoryModeratedUsers.set(data.userId, entry);
    return entry;
  }

  public static async listModeratedUsers(): Promise<ModeratedUserEntity[]> {
    return Array.from(memoryModeratedUsers.values());
  }
}
