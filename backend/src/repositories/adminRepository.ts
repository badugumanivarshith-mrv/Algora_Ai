import { Database } from "../db/connection";
import {
  AdminEntity,
  RoleEntity,
  PermissionEntity,
  AdminAuditLogEntity,
} from "../types";
import { logger } from "../utils/logger";

const DEFAULT_ROLES: RoleEntity[] = [
  {
    id: "role-super-admin",
    name: "Super Admin",
    description: "Full platform control across all CMS modules, user accounts, and infrastructure settings.",
    permissions: ["*"],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "role-content-manager",
    name: "Content Manager",
    description: "Create, edit, publish, and structure algorithmic problems, topics, and curriculum paths.",
    permissions: [
      "problems:read",
      "problems:write",
      "problems:publish",
      "problems:delete",
      "topics:read",
      "topics:write",
      "curriculum:read",
      "curriculum:write",
      "achievements:read",
      "achievements:write",
      "analytics:read",
    ],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "role-contest-coordinator",
    name: "Contest Coordinator",
    description: "Schedule, configure, and supervise live and timed programming contests.",
    permissions: [
      "contests:read",
      "contests:write",
      "contests:publish",
      "contests:delete",
      "problems:read",
      "analytics:read",
    ],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "role-instructor",
    name: "Instructor / Faculty",
    description: "Review student progress, create practice problems, and manage course curriculums.",
    permissions: [
      "problems:read",
      "problems:write",
      "topics:read",
      "curriculum:read",
      "analytics:read",
    ],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_PERMISSIONS: PermissionEntity[] = [
  { id: "perm-1", key: "problems:read", name: "View Problems", description: "View problem definitions, test cases, and hidden test cases", module: "problems", createdAt: new Date().toISOString() },
  { id: "perm-2", key: "problems:write", name: "Create & Edit Problems", description: "Create new problems, modify starter codes, tags, and test cases", module: "problems", createdAt: new Date().toISOString() },
  { id: "perm-3", key: "problems:publish", name: "Publish Problems", description: "Toggle problem publication status to live student workspaces", module: "problems", createdAt: new Date().toISOString() },
  { id: "perm-4", key: "problems:delete", name: "Delete Problems", description: "Remove problems from the platform permanently or archive", module: "problems", createdAt: new Date().toISOString() },
  
  { id: "perm-5", key: "topics:read", name: "View Topics", description: "View topic taxonomy and learning tracks", module: "topics", createdAt: new Date().toISOString() },
  { id: "perm-6", key: "topics:write", name: "Manage Topics", description: "Create, reorder, and update topics and prerequisite mappings", module: "topics", createdAt: new Date().toISOString() },
  
  { id: "perm-7", key: "curriculum:read", name: "View Curriculum", description: "View learning paths, modules, and lesson sequences", module: "curriculum", createdAt: new Date().toISOString() },
  { id: "perm-8", key: "curriculum:write", name: "Manage Curriculum", description: "Create and update learning paths, modules, and lesson links", module: "curriculum", createdAt: new Date().toISOString() },

  { id: "perm-9", key: "contests:read", name: "View Contests", description: "View all scheduled and active contests", module: "contests", createdAt: new Date().toISOString() },
  { id: "perm-10", key: "contests:write", name: "Manage Contests", description: "Create and configure contest problems, scoring, and windows", module: "contests", createdAt: new Date().toISOString() },
  { id: "perm-11", key: "contests:publish", name: "Publish Contests", description: "Launch and open contests to participant registrations", module: "contests", createdAt: new Date().toISOString() },

  { id: "perm-12", key: "achievements:read", name: "View Achievements", description: "View badge criteria and unlock triggers", module: "achievements", createdAt: new Date().toISOString() },
  { id: "perm-13", key: "achievements:write", name: "Manage Achievements", description: "Create badges, XP values, and unlock conditions", module: "achievements", createdAt: new Date().toISOString() },

  { id: "perm-14", key: "analytics:read", name: "View Platform Analytics", description: "View global metrics, submission graphs, and retention analytics", module: "analytics", createdAt: new Date().toISOString() },
  { id: "perm-15", key: "settings:manage", name: "System Settings", description: "Configure platform system flags and execution limits", module: "settings", createdAt: new Date().toISOString() },
  { id: "perm-16", key: "users:manage", name: "Manage Users & Admins", description: "Assign admin roles and grant permissions", module: "users", createdAt: new Date().toISOString() },
];

export class AdminRepository {
  private inMemoryRoles: Map<string, RoleEntity> = new Map();
  private inMemoryPermissions: Map<string, PermissionEntity> = new Map();
  private inMemoryAdmins: Map<string, AdminEntity> = new Map();
  private inMemoryAuditLogs: AdminAuditLogEntity[] = [];

  constructor() {
    DEFAULT_ROLES.forEach((r) => this.inMemoryRoles.set(r.id, r));
    DEFAULT_PERMISSIONS.forEach((p) => this.inMemoryPermissions.set(p.id, p));

    // Seed default admin for demo user
    const defaultAdmin: AdminEntity = {
      id: "adm-usr-arjun-patel",
      userId: "usr-arjun-patel",
      roleId: "role-super-admin",
      isSuperAdmin: true,
      customPermissions: ["*"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: "usr-arjun-patel",
        email: "arjun.patel@algora.edu",
        username: "arjun_patel",
        fullName: "Arjun Patel",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role: "admin",
      },
      role: DEFAULT_ROLES[0],
    };
    this.inMemoryAdmins.set(defaultAdmin.userId, defaultAdmin);

    // Initial audit log
    this.inMemoryAuditLogs.push({
      id: "log-init-1",
      adminId: "usr-arjun-patel",
      adminName: "Arjun Patel",
      action: "INITIALIZE_ADMIN_CMS",
      entityType: "setting",
      entityId: "cms-init",
      details: { message: "Admin CMS Phase 8 initialization complete with role-based access control." },
      createdAt: new Date().toISOString(),
    });
  }

  public async getAdminByUserId(userId: string): Promise<AdminEntity | null> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `
          SELECT 
            a.id, a.user_id as "userId", a.role_id as "roleId", a.is_super_admin as "isSuperAdmin",
            a.custom_permissions as "customPermissions", a.created_at as "createdAt", a.updated_at as "updatedAt",
            u.email, u.username, u.role as "userRole",
            p.full_name as "fullName", p.avatar_url as "avatarUrl",
            r.name as "roleName", r.permissions as "rolePermissions"
          FROM admins a
          JOIN users u ON a.user_id = u.id
          LEFT JOIN profiles p ON u.id = p.user_id
          LEFT JOIN roles r ON a.role_id = r.id
          WHERE a.user_id = $1;
        `,
          [userId]
        );

        if (rows.length > 0) {
          const row = rows[0];
          return {
            id: row.id,
            userId: row.userId,
            roleId: row.roleId,
            isSuperAdmin: Boolean(row.isSuperAdmin),
            customPermissions: Array.isArray(row.customPermissions) ? row.customPermissions : [],
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            user: {
              id: row.userId,
              email: row.email,
              username: row.username,
              fullName: row.fullName,
              avatarUrl: row.avatarUrl,
              role: row.userRole,
            },
            role: row.roleName
              ? {
                  id: row.roleId,
                  name: row.roleName,
                  description: "",
                  permissions: Array.isArray(row.rolePermissions) ? row.rolePermissions : [],
                  isSystem: true,
                  createdAt: row.createdAt,
                  updatedAt: row.updatedAt,
                }
              : undefined,
          };
        }
      } catch (err: any) {
        logger.warn(`[AdminRepo] DB query error, using in-memory: ${err.message}`);
      }
    }

    return this.inMemoryAdmins.get(userId) || null;
  }

  public async getAllAdmins(): Promise<AdminEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(`
          SELECT 
            a.id, a.user_id as "userId", a.role_id as "roleId", a.is_super_admin as "isSuperAdmin",
            a.custom_permissions as "customPermissions", a.created_at as "createdAt", a.updated_at as "updatedAt",
            u.email, u.username, u.role as "userRole",
            p.full_name as "fullName", p.avatar_url as "avatarUrl",
            r.name as "roleName", r.permissions as "rolePermissions"
          FROM admins a
          JOIN users u ON a.user_id = u.id
          LEFT JOIN profiles p ON u.id = p.user_id
          LEFT JOIN roles r ON a.role_id = r.id
          ORDER BY a.created_at ASC;
        `);

        return rows.map((row) => ({
          id: row.id,
          userId: row.userId,
          roleId: row.roleId,
          isSuperAdmin: Boolean(row.isSuperAdmin),
          customPermissions: Array.isArray(row.customPermissions) ? row.customPermissions : [],
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          user: {
            id: row.userId,
            email: row.email,
            username: row.username,
            fullName: row.fullName,
            avatarUrl: row.avatarUrl,
            role: row.userRole,
          },
          role: row.roleName
            ? {
                id: row.roleId,
                name: row.roleName,
                description: "",
                permissions: Array.isArray(row.rolePermissions) ? row.rolePermissions : [],
                isSystem: true,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
              }
            : undefined,
        }));
      } catch (err: any) {
        logger.warn(`[AdminRepo] DB query error, using in-memory: ${err.message}`);
      }
    }

    return Array.from(this.inMemoryAdmins.values());
  }

  public async getAllRoles(): Promise<RoleEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<RoleEntity>(`SELECT * FROM roles ORDER BY created_at ASC;`);
        if (rows.length > 0) return rows;
      } catch (err: any) {
        logger.warn(`[AdminRepo] DB query error, using in-memory: ${err.message}`);
      }
    }
    return Array.from(this.inMemoryRoles.values());
  }

  public async getAllPermissions(): Promise<PermissionEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<PermissionEntity>(`SELECT * FROM permissions ORDER BY module, key ASC;`);
        if (rows.length > 0) return rows;
      } catch (err: any) {
        logger.warn(`[AdminRepo] DB query error, using in-memory: ${err.message}`);
      }
    }
    return Array.from(this.inMemoryPermissions.values());
  }

  public async recordAuditLog(log: Omit<AdminAuditLogEntity, "id" | "createdAt">): Promise<AdminAuditLogEntity> {
    const entity: AdminAuditLogEntity = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `
          INSERT INTO admin_audit_logs (id, admin_id, action, entity_type, entity_id, details, ip_address, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `,
          [
            entity.id,
            entity.adminId,
            entity.action,
            entity.entityType,
            entity.entityId,
            JSON.stringify(entity.details || {}),
            entity.ipAddress || null,
            entity.createdAt,
          ]
        );
      } catch (err: any) {
        logger.warn(`[AdminRepo] DB audit log insert error: ${err.message}`);
      }
    }

    this.inMemoryAuditLogs.unshift(entity);
    if (this.inMemoryAuditLogs.length > 200) {
      this.inMemoryAuditLogs.pop();
    }

    return entity;
  }

  public async getAuditLogs(limit: number = 50): Promise<AdminAuditLogEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `
          SELECT 
            l.id, l.admin_id as "adminId", l.action, l.entity_type as "entityType",
            l.entity_id as "entityId", l.details, l.ip_address as "ipAddress", l.created_at as "createdAt",
            COALESCE(p.full_name, u.username, 'Administrator') as "adminName"
          FROM admin_audit_logs l
          LEFT JOIN users u ON l.admin_id = u.id
          LEFT JOIN profiles p ON u.id = p.user_id
          ORDER BY l.created_at DESC
          LIMIT $1;
        `,
          [limit]
        );

        if (rows.length > 0) {
          return rows.map((r) => ({
            ...r,
            details: typeof r.details === "string" ? JSON.parse(r.details) : r.details,
          }));
        }
      } catch (err: any) {
        logger.warn(`[AdminRepo] DB audit logs error: ${err.message}`);
      }
    }

    return this.inMemoryAuditLogs.slice(0, limit);
  }
}

export const adminRepository = new AdminRepository();
