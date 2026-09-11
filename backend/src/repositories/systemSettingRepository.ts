import { SystemSettingEntity } from "../types";

const DEFAULT_SETTINGS: SystemSettingEntity[] = [
  {
    key: "platform_maintenance_mode",
    value: false,
    description: "When enabled, non-admin access is paused with a maintenance banner.",
    category: "general",
    isPublic: true,
    updatedAt: new Date().toISOString(),
  },
  {
    key: "max_code_execution_seconds",
    value: 5,
    description: "Maximum execution time threshold in sandbox for user test runs.",
    category: "submissions",
    isPublic: false,
    updatedAt: new Date().toISOString(),
  },
  {
    key: "max_memory_limit_mb",
    value: 256,
    description: "Maximum memory allocation in megabytes for sandboxed problem evaluations.",
    category: "submissions",
    isPublic: false,
    updatedAt: new Date().toISOString(),
  },
  {
    key: "contest_anti_cheat_strict",
    value: true,
    description: "Enforce window focus loss detection and multi-tab warning triggers during rated contests.",
    category: "contests",
    isPublic: true,
    updatedAt: new Date().toISOString(),
  },
  {
    key: "ai_mentor_enabled",
    value: true,
    description: "Enable the real-time AI Socrates debugging assistant in the coding workspace.",
    category: "ui",
    isPublic: true,
    updatedAt: new Date().toISOString(),
  },
  {
    key: "supported_submission_languages",
    value: ["Python", "C++", "Java", "C"],
    description: "List of officially compiled and evaluated languages in the execution engine.",
    category: "general",
    isPublic: true,
    updatedAt: new Date().toISOString(),
  },
];

export class SystemSettingRepository {
  private inMemorySettings: Map<string, SystemSettingEntity> = new Map();

  constructor() {
    DEFAULT_SETTINGS.forEach((s) => this.inMemorySettings.set(s.key, s));
  }

  public async getAll(): Promise<SystemSettingEntity[]> {
    return Array.from(this.inMemorySettings.values());
  }

  public async getByKey(key: string): Promise<SystemSettingEntity | null> {
    return this.inMemorySettings.get(key) || null;
  }

  public async setSetting(
    key: string,
    value: any,
    description?: string,
    category?: SystemSettingEntity["category"],
    isPublic?: boolean,
    updatedBy?: string
  ): Promise<SystemSettingEntity> {
    const existing = this.inMemorySettings.get(key);
    const now = new Date().toISOString();

    const entity: SystemSettingEntity = {
      key,
      value,
      description: description ?? existing?.description ?? "",
      category: category ?? existing?.category ?? "general",
      isPublic: isPublic ?? existing?.isPublic ?? false,
      updatedBy: updatedBy || "usr-arjun-patel",
      updatedAt: now,
    };

    this.inMemorySettings.set(key, entity);
    return entity;
  }
}

export const systemSettingRepository = new SystemSettingRepository();
