import {
  SubmissionRecord,
  SupportedLanguage,
} from "../types";

const TOKEN_KEY = "algora_auth_token_v1";
const API_BASE = "/api";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  message?: string;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
}

export interface UserProfileData {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  institution: string;
  githubHandle?: string;
  preferredLanguage: string;
  rating: number;
  streakDays: number;
  totalXP: number;
}

export interface AuthUserData {
  id: string;
  email: string;
  username: string;
  role: string;
}

export class ApiClient {
  private static getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  public static setToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // ignore
    }
  }

  public static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const json = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: json.error || {
            code: `HTTP_${response.status}`,
            message: json.message || "An unexpected error occurred",
          },
        };
      }

      return json;
    } catch (err: any) {
      console.warn(`[ApiClient] Network request failed for ${url}, fallback mode engaged.`, err);
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: err.message || "Unable to reach the backend API. Using local fallback.",
        },
      };
    }
  }

  // --- Auth API ---
  public static async register(data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
    institution?: string;
  }): Promise<ApiResponse<{ token: string; user: AuthUserData; profile: UserProfileData }>> {
    const res = await this.request<{ token: string; user: AuthUserData; profile: UserProfileData }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    if (res.success && res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  public static async login(data: {
    emailOrUsername: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: AuthUserData; profile: UserProfileData }>> {
    const res = await this.request<{ token: string; user: AuthUserData; profile: UserProfileData }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    if (res.success && res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  public static async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } finally {
      this.setToken(null);
    }
  }

  public static async getMe(): Promise<ApiResponse<{ user: AuthUserData; profile: UserProfileData }>> {
    return this.request<{ user: AuthUserData; profile: UserProfileData }>("/auth/me");
  }

  // --- User API ---
  public static async getProfile(): Promise<ApiResponse<UserProfileData>> {
    return this.request<UserProfileData>("/users/profile");
  }

  public static async updateProfile(data: Partial<UserProfileData>): Promise<ApiResponse<UserProfileData>> {
    return this.request<UserProfileData>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // --- Health API ---
  public static async getDatabaseHealth(): Promise<ApiResponse<{
    status: string;
    databaseType: string;
    connected: boolean;
    latencyMs: number;
    migrationVersion: string;
    timestamp: string;
  }>> {
    return this.request<{
      status: string;
      databaseType: string;
      connected: boolean;
      latencyMs: number;
      migrationVersion: string;
      timestamp: string;
    }>("/health/database");
  }

  // --- Submission API ---
  public static async getSubmissions(params: {
    problemSlug?: string;
    status?: string;
    language?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<SubmissionRecord[]>> {
    const query = new URLSearchParams();
    if (params.problemSlug) query.append("problemSlug", params.problemSlug);
    if (params.status) query.append("status", params.status);
    if (params.language) query.append("language", params.language);
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.offset) query.append("offset", params.offset.toString());

    const qs = query.toString();
    const endpoint = qs ? `/submissions?${qs}` : "/submissions";
    return this.request<SubmissionRecord[]>(endpoint);
  }

  public static async createSubmission(data: {
    problemId: number;
    problemSlug: string;
    problemTitle: string;
    language: SupportedLanguage;
    code: string;
    status: string;
    runtimeMs: number;
    memoryMb: number;
    runtimePercentile?: number;
    memoryPercentile?: number;
    passedTests: number;
    totalTests: number;
    errorMessage?: string;
    compilationError?: string;
  }): Promise<ApiResponse<SubmissionRecord>> {
    return this.request<SubmissionRecord>("/submissions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}
