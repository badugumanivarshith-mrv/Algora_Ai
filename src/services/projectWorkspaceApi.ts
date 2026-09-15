import { ApiClient } from "./apiClient";

export class ProjectWorkspaceApi {
  public static async createWorkspace(data: any) {
    const res = await ApiClient.post("/projects/workspaces", data);
    return res;
  }

  public static async getWorkspaces() {
    const res = await ApiClient.get("/projects/workspaces");
    return res;
  }

  public static async getWorkspace(id: string) {
    const res = await ApiClient.get(`/projects/workspaces/${id}`);
    return res;
  }

  public static async createTask(data: any) {
    const res = await ApiClient.post("/projects/tasks", data);
    return res;
  }

  public static async updateTask(id: string, data: any) {
    const res = await ApiClient.put(`/projects/tasks/${id}`, data);
    return res;
  }

  public static async getMilestones(workspaceId: string) {
    const res = await ApiClient.get(`/projects/milestones/${workspaceId}`);
    return res;
  }

  public static async createMilestone(data: any) {
    const res = await ApiClient.post("/projects/milestones", data);
    return res;
  }

  public static async reviewProject(workspaceId: string, submissionUrl: string) {
    const res = await ApiClient.post("/projects/review", { workspaceId, submissionUrl });
    return res;
  }

  public static async getRecommendations() {
    const res = await ApiClient.post("/projects/recommendations");
    return res;
  }

  public static async getAnalytics(workspaceId?: string) {
    const res = await ApiClient.get("/projects/analytics", { params: { workspaceId } });
    return res;
  }

  public static async getInternships() {
    const res = await ApiClient.get("/projects/internships");
    return res;
  }

  public static async applyInternship(internshipId: string) {
    const res = await ApiClient.post("/projects/internships/apply", { internshipId });
    return res;
  }

  public static async getSkills() {
    const res = await ApiClient.get("/projects/skills");
    return res;
  }
}
