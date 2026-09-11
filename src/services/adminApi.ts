import { ApiClient, ApiResponse } from "./apiClient";
import {
  AdminEntity,
  RoleEntity,
  PermissionEntity,
  AdminAuditLogEntity,
  ProblemCMSEntity,
  ProblemVersionEntity,
  TopicCMSEntity,
  CurriculumPathEntity,
  CurriculumModuleEntity,
  CurriculumLessonEntity,
  ContestEntity,
  ContestProblemEntity,
  AchievementCMSEntity,
  PlatformAnalyticsSummary,
  SystemSettingEntity,
  ProblemDifficulty,
} from "../types";

export interface AdminProfileResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  admin: AdminEntity;
  roles: RoleEntity[];
  permissions: PermissionEntity[];
}

export class AdminApi {
  // --- Admin Auth & Roles ---
  public static async getProfile(): Promise<ApiResponse<AdminProfileResponse>> {
    return ApiClient.request<AdminProfileResponse>("/admin/me");
  }

  public static async getAllAdmins(): Promise<ApiResponse<AdminEntity[]>> {
    return ApiClient.request<AdminEntity[]>("/admin/admins");
  }

  public static async getRoles(): Promise<ApiResponse<{ roles: RoleEntity[]; permissions: PermissionEntity[] }>> {
    return ApiClient.request<{ roles: RoleEntity[]; permissions: PermissionEntity[] }>("/admin/roles");
  }

  public static async getAuditLogs(limit: number = 50): Promise<ApiResponse<AdminAuditLogEntity[]>> {
    return ApiClient.request<AdminAuditLogEntity[]>(`/admin/audit-logs?limit=${limit}`);
  }

  // --- Problems CMS ---
  public static async getProblems(filters?: {
    search?: string;
    difficulty?: ProblemDifficulty;
    topic?: string;
    status?: "draft" | "published" | "archived";
    language?: string;
  }): Promise<ApiResponse<ProblemCMSEntity[]>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.difficulty) params.append("difficulty", filters.difficulty);
    if (filters?.topic) params.append("topic", filters.topic);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.language) params.append("language", filters.language);

    const qs = params.toString();
    return ApiClient.request<ProblemCMSEntity[]>(qs ? `/admin/problems?${qs}` : "/admin/problems");
  }

  public static async getProblemById(id: number): Promise<ApiResponse<ProblemCMSEntity & { versions?: ProblemVersionEntity[] }>> {
    return ApiClient.request<ProblemCMSEntity & { versions?: ProblemVersionEntity[] }>(`/admin/problems/${id}`);
  }

  public static async createProblem(data: Partial<ProblemCMSEntity>): Promise<ApiResponse<ProblemCMSEntity>> {
    return ApiClient.request<ProblemCMSEntity>("/admin/problems", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public static async updateProblem(id: number, data: Partial<ProblemCMSEntity>): Promise<ApiResponse<ProblemCMSEntity>> {
    return ApiClient.request<ProblemCMSEntity>(`/admin/problems/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  public static async deleteProblem(id: number): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.request<{ message: string }>(`/admin/problems/${id}`, {
      method: "DELETE",
    });
  }

  public static async togglePublishProblem(id: number): Promise<ApiResponse<ProblemCMSEntity>> {
    return ApiClient.request<ProblemCMSEntity>(`/admin/problems/${id}/publish`, {
      method: "POST",
    });
  }

  public static async getProblemVersions(id: number): Promise<ApiResponse<ProblemVersionEntity[]>> {
    return ApiClient.request<ProblemVersionEntity[]>(`/admin/problems/${id}/versions`);
  }

  // --- Topics CMS ---
  public static async getTopics(): Promise<ApiResponse<TopicCMSEntity[]>> {
    return ApiClient.request<TopicCMSEntity[]>("/admin/topics");
  }

  public static async getTopicById(id: string): Promise<ApiResponse<TopicCMSEntity>> {
    return ApiClient.request<TopicCMSEntity>(`/admin/topics/${id}`);
  }

  public static async createTopic(data: Partial<TopicCMSEntity>): Promise<ApiResponse<TopicCMSEntity>> {
    return ApiClient.request<TopicCMSEntity>("/admin/topics", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public static async updateTopic(id: string, data: Partial<TopicCMSEntity>): Promise<ApiResponse<TopicCMSEntity>> {
    return ApiClient.request<TopicCMSEntity>(`/admin/topics/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  public static async deleteTopic(id: string): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.request<{ message: string }>(`/admin/topics/${id}`, {
      method: "DELETE",
    });
  }

  public static async togglePublishTopic(id: string): Promise<ApiResponse<TopicCMSEntity>> {
    return ApiClient.request<TopicCMSEntity>(`/admin/topics/${id}/publish`, {
      method: "POST",
    });
  }

  public static async reorderTopics(orderedIds: string[]): Promise<ApiResponse<TopicCMSEntity[]>> {
    return ApiClient.request<TopicCMSEntity[]>("/admin/topics/reorder", {
      method: "POST",
      body: JSON.stringify({ orderedIds }),
    });
  }

  // --- Curriculum CMS ---
  public static async getCurriculumPaths(): Promise<ApiResponse<CurriculumPathEntity[]>> {
    return ApiClient.request<CurriculumPathEntity[]>("/admin/curriculum");
  }

  public static async getCurriculumPathById(id: string): Promise<ApiResponse<CurriculumPathEntity>> {
    return ApiClient.request<CurriculumPathEntity>(`/admin/curriculum/${id}`);
  }

  public static async createCurriculumPath(data: Partial<CurriculumPathEntity>): Promise<ApiResponse<CurriculumPathEntity>> {
    return ApiClient.request<CurriculumPathEntity>("/admin/curriculum", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public static async updateCurriculumPath(id: string, data: Partial<CurriculumPathEntity>): Promise<ApiResponse<CurriculumPathEntity>> {
    return ApiClient.request<CurriculumPathEntity>(`/admin/curriculum/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  public static async deleteCurriculumPath(id: string): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.request<{ message: string }>(`/admin/curriculum/${id}`, {
      method: "DELETE",
    });
  }

  public static async addModuleToPath(pathId: string, data: Partial<CurriculumModuleEntity>): Promise<ApiResponse<CurriculumModuleEntity>> {
    return ApiClient.request<CurriculumModuleEntity>(`/admin/curriculum/${pathId}/modules`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public static async addLessonToModule(
    pathId: string,
    moduleId: string,
    data: Partial<CurriculumLessonEntity>
  ): Promise<ApiResponse<CurriculumLessonEntity>> {
    return ApiClient.request<CurriculumLessonEntity>(`/admin/curriculum/${pathId}/modules/${moduleId}/lessons`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // --- Contests CMS ---
  public static async getContests(): Promise<ApiResponse<ContestEntity[]>> {
    return ApiClient.request<ContestEntity[]>("/admin/contests");
  }

  public static async getContestById(id: string): Promise<ApiResponse<ContestEntity>> {
    return ApiClient.request<ContestEntity>(`/admin/contests/${id}`);
  }

  public static async createContest(data: Partial<ContestEntity>): Promise<ApiResponse<ContestEntity>> {
    return ApiClient.request<ContestEntity>("/admin/contests", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public static async updateContest(id: string, data: Partial<ContestEntity>): Promise<ApiResponse<ContestEntity>> {
    return ApiClient.request<ContestEntity>(`/admin/contests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  public static async deleteContest(id: string): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.request<{ message: string }>(`/admin/contests/${id}`, {
      method: "DELETE",
    });
  }

  public static async addProblemToContest(contestId: string, data: Partial<ContestProblemEntity>): Promise<ApiResponse<ContestProblemEntity>> {
    return ApiClient.request<ContestProblemEntity>(`/admin/contests/${contestId}/problems`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public static async removeProblemFromContest(contestId: string, problemId: number): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.request<{ message: string }>(`/admin/contests/${contestId}/problems/${problemId}`, {
      method: "DELETE",
    });
  }

  // --- Achievements CMS ---
  public static async getAchievements(): Promise<ApiResponse<AchievementCMSEntity[]>> {
    return ApiClient.request<AchievementCMSEntity[]>("/admin/achievements");
  }

  public static async getAchievementById(id: string): Promise<ApiResponse<AchievementCMSEntity>> {
    return ApiClient.request<AchievementCMSEntity>(`/admin/achievements/${id}`);
  }

  public static async createAchievement(data: Partial<AchievementCMSEntity>): Promise<ApiResponse<AchievementCMSEntity>> {
    return ApiClient.request<AchievementCMSEntity>("/admin/achievements", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public static async updateAchievement(id: string, data: Partial<AchievementCMSEntity>): Promise<ApiResponse<AchievementCMSEntity>> {
    return ApiClient.request<AchievementCMSEntity>(`/admin/achievements/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  public static async deleteAchievement(id: string): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.request<{ message: string }>(`/admin/achievements/${id}`, {
      method: "DELETE",
    });
  }

  public static async togglePublishAchievement(id: string): Promise<ApiResponse<AchievementCMSEntity>> {
    return ApiClient.request<AchievementCMSEntity>(`/admin/achievements/${id}/publish`, {
      method: "POST",
    });
  }

  // --- Analytics & Settings ---
  public static async getAnalyticsSummary(): Promise<ApiResponse<PlatformAnalyticsSummary>> {
    return ApiClient.request<PlatformAnalyticsSummary>("/admin/analytics");
  }

  public static async getSettings(): Promise<ApiResponse<SystemSettingEntity[]>> {
    return ApiClient.request<SystemSettingEntity[]>("/admin/settings");
  }

  public static async updateSetting(key: string, data: { value: any; description?: string }): Promise<ApiResponse<SystemSettingEntity>> {
    return ApiClient.request<SystemSettingEntity>(`/admin/settings/${key}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // --- Phase 9: AI Telemetry, Observability & Broadcasts ---
  public static async getAIUsageSummary(): Promise<ApiResponse<any>> {
    return ApiClient.request<any>("/monitoring/ai-usage");
  }

  public static async getMonitoringMetrics(): Promise<ApiResponse<any>> {
    return ApiClient.request<any>("/monitoring/metrics");
  }

  public static async getDeepHealth(): Promise<ApiResponse<any>> {
    return ApiClient.request<any>("/monitoring/health-deep");
  }

  public static async getRecentErrors(): Promise<ApiResponse<any[]>> {
    return ApiClient.request<any[]>("/monitoring/errors");
  }

  public static async getJudgeStats(): Promise<ApiResponse<any>> {
    return ApiClient.request<any>("/monitoring/judge-stats");
  }

  public static async broadcastAnnouncement(data: { title: string; message: string; link?: string }): Promise<ApiResponse<any>> {
    return ApiClient.request<any>("/notifications/broadcast", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public static async getAnnouncements(): Promise<ApiResponse<any[]>> {
    return ApiClient.request<any[]>("/notifications/announcements");
  }

  public static async getUploads(category?: string): Promise<ApiResponse<any[]>> {
    const url = category ? `/uploads?category=${category}` : "/uploads";
    return ApiClient.request<any[]>(url);
  }

  public static async deleteUpload(id: string): Promise<ApiResponse<any>> {
    return ApiClient.request<any>(`/uploads/${id}`, {
      method: "DELETE",
    });
  }
}
