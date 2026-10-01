/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Production Database Engine (PostgreSQL + Drizzle ORM with Connection Pooling)
 */

import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

// Connection pooling configuration for production database connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Mani%408239@localhost:5432/algora_db';

const isNeon = DATABASE_URL.includes('neon.tech') || DATABASE_URL.includes('sslmode=require');

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20, // Max clients in connection pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: isNeon ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', () => {
  // Prevent unhandled pool errors from terminating dev server process
});

const originalDrizzleDb = drizzle(pool, { schema });

// Connection state tracker
let isPostgresConnected = false;

// Determine local persistence path
const PERSISTENT_DB_PATH = path.join(process.cwd(), 'persistent_db.json');

// Standard entities interface matching our database schemas
export interface UserEntity {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'student' | 'admin' | 'faculty';
  college: string;
  avatar_url?: string;
  xp: number;
  level: number;
  streak: number;
  target_company: string;
  daily_goal_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface RefreshTokenEntity {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface PasswordResetTokenEntity {
  id: string;
  user_id: string;
  reset_token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface LearningTrackEntity {
  id: string;
  title: string;
  description: string;
  category: 'languages' | 'cs-core' | 'interview-prep';
  icon: string;
  color: string;
  order_index: number;
}

export interface TopicEntity {
  id: string;
  track_id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_minutes: number;
  concept_content: string;
  syntax_cheatsheet: string;
  interactive_examples: any[];
  common_mistakes: any[];
  interview_questions: any[];
  prerequisite_topic_id?: string;
}

export interface ProblemEntity {
  id: string;
  topic_id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: Array<{ input: string; output: string; note?: string }>;
  constraints: string[];
  tags: string[];
  companies: string[];
  starter_code: Record<string, string>;
  solution_code: Record<string, string>;
  test_cases: Array<{ input: any; expected: any; hidden?: boolean }>;
  acceptance_rate: number;
  learning_objectives: string[];
}

export interface ProblemHintEntity {
  id: string;
  problem_id: string;
  tier_level: 'hint' | 'approach' | 'algorithm' | 'pseudocode' | 'partial_code' | 'solution';
  order_index: number;
  title: string;
  content: string;
}

export interface SubmissionEntity {
  id: string;
  user_id: string;
  problem_id: string;
  code: string;
  language: 'python' | 'cpp' | 'java' | 'c';
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  execution_time_ms: number;
  memory_mb: number;
  passed_test_cases: number;
  total_test_cases: number;
  error_message?: string;
  created_at: string;
}

export interface ProjectEntity {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  summary: string;
  overview: string;
  architecture_overview: string;
  estimated_hours: number;
  learning_goals: string[];
  prerequisites: string[];
  evaluation_criteria: Array<{ criterion: string; weight: number; description: string }>;
  milestones: Array<{
    id: string;
    milestone_number: number;
    title: string;
    description: string;
    tasks: Array<{ id: string; title: string; required: boolean }>;
    learning_tips: string[];
  }>;
}

export interface UserProjectEntity {
  id: string;
  user_id: string;
  project_id: string;
  status: 'in_progress' | 'completed' | 'submitted';
  completed_task_ids: string[];
  reflection_notes: string;
  repo_url?: string;
  demo_url?: string;
  ai_feedback?: string;
  score: number;
  started_at: string;
  completed_at?: string;
}

export interface UserTopicProgressEntity {
  id: string;
  user_id: string;
  topic_id: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  concept_completed: boolean;
  syntax_completed: boolean;
  examples_completed: boolean;
  mistakes_completed: boolean;
  problems_completed_count: number;
  assignment_completed: boolean;
  project_completed: boolean;
  interview_completed: boolean;
  mastery_score: number;
  last_studied_at: string;
}

export interface DailyReviewEntity {
  id: string;
  user_id: string;
  item_type: 'problem' | 'concept' | 'mistake_card';
  item_id: string;
  title: string;
  subtopic: string;
  front_content: string;
  back_content: string;
  easiness_factor: number;
  interval_days: number;
  repetition_number: number;
  next_review_date: string;
  last_reviewed_at?: string;
  created_at: string;
}

import {
  DEMO_USERS,
  SEED_TRACKS,
  SEED_TOPICS,
  SEED_PROBLEMS,
  SEED_HINTS,
  SEED_PROJECTS,
  SEED_SUBMISSIONS,
  SEED_REVIEWS
} from './seedData';

// Global In-Memory and persistent JSON Fallback Engine
function loadLocalDb(): any {
  try {
    if (fs.existsSync(PERSISTENT_DB_PATH)) {
      return JSON.parse(fs.readFileSync(PERSISTENT_DB_PATH, 'utf-8'));
    }
  } catch {}
  
  // Build fallback database from single source of truth (seedData.ts)
  const progress = [
    {
      id: 'utp_001',
      userId: 'e0c25a7a-6eb2-4c28-9bf9-9c5d76d49d41',
      topicId: 'top_arrays',
      status: 'in_progress',
      conceptCompleted: true,
      syntaxCompleted: true,
      examplesCompleted: true,
      mistakesCompleted: false,
      problemsCompletedCount: 5,
      assignmentCompleted: false,
      projectCompleted: false,
      interviewCompleted: false,
      completedStages: ['Concept', 'Syntax', 'Examples'],
      masteryScore: 88,
      lastStudiedAt: new Date().toISOString(),
    }
  ];

  const initialDb = {
    users: DEMO_USERS,
    learning_tracks: SEED_TRACKS,
    topics: SEED_TOPICS,
    user_topic_progress: progress,
    problems: SEED_PROBLEMS,
    problem_hints: SEED_HINTS,
    projects: SEED_PROJECTS,
    user_projects: [],
    submissions: SEED_SUBMISSIONS,
    daily_reviews: SEED_REVIEWS,
  };

  try {
    fs.writeFileSync(PERSISTENT_DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
  } catch {}

  return initialDb;
}

function saveLocalDb(data: any) {
  try {
    fs.writeFileSync(PERSISTENT_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

function getTableName(table: any): string {
  if (!table) return 'unknown';
  if (typeof table === 'string') return table;
  const name = table[Symbol.for('drizzle:Name')] || table.config?.name || table._?.name;
  return name || 'unknown';
}

function matchCondition(row: any, cond: any): boolean {
  if (!cond) return true;

  // Handle compound conditions (AND / OR)
  if (cond.conditions || cond.operators) {
    const list = cond.conditions || cond.operators || [];
    const operator = cond.filterType || cond.operator || 'and';
    if (operator === 'and') {
      return list.every((c: any) => matchCondition(row, c));
    }
    if (operator === 'or') {
      return list.some((c: any) => matchCondition(row, c));
    }
  }

  // Parse SQL chunks for binary comparisons
  if (cond.queryChunks && Array.isArray(cond.queryChunks)) {
    let colName = null;
    let colValue = null;
    for (let i = 0; i < cond.queryChunks.length; i++) {
      const chunk = cond.queryChunks[i];
      if (chunk && chunk.name) {
        colName = chunk.name;
      }
      if (chunk && chunk.constructor?.name === 'Param' && chunk.value !== undefined) {
        colValue = chunk.value;
      }
    }

    if (colName) {
      const camelColName = colName.replace(/_([a-z])/g, (g: string) => g[1].toUpperCase());
      const val = row[colName] !== undefined ? row[colName] : row[camelColName];
      return String(val) === String(colValue);
    }
  }

  // Fallback to legacy column parsing
  const colName = cond.left?.name || cond.left?.config?.name;
  let colValue = cond.right;

  if (colValue && typeof colValue === 'object') {
    if (colValue.value !== undefined) {
      colValue = colValue.value;
    } else if (colValue.param !== undefined) {
      colValue = colValue.param;
    }
  }

  if (colName) {
    const camelColName = colName.replace(/_([a-z])/g, (g: string) => g[1].toUpperCase());
    const val = row[colName] !== undefined ? row[colName] : row[camelColName];
    return String(val) === String(colValue);
  }

  return true;
}

// Fluent Chainable Query Builder for transparent Drizzle Failover
class FallbackQueryBuilder {
  private table: any;
  private action: 'select' | 'insert' | 'update' | 'delete';
  private whereConds: any[] = [];
  private insertValues: any = null;
  private updateSet: any = null;

  constructor(action: 'select' | 'insert' | 'update' | 'delete', table?: any) {
    this.action = action;
    this.table = table;
  }

  from(table: any) {
    this.table = table;
    return this;
  }

  where(...conds: any[]) {
    this.whereConds.push(...conds);
    return this;
  }

  values(data: any) {
    this.insertValues = data;
    return this;
  }

  set(data: any) {
    this.updateSet = data;
    return this;
  }

  returning() {
    return this;
  }

  onConflictDoNothing() {
    return this;
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const result = await this.execute();
      if (onfulfilled) return onfulfilled(result);
      return result;
    } catch (err) {
      if (onrejected) return onrejected(err);
      throw err;
    }
  }

  private async execute() {
    const tableName = getTableName(this.table);
    const data = loadLocalDb();
    const rows = data[tableName] || [];

    console.log("EXECUTE IN FALLBACK:", { tableName, action: this.action, whereLength: this.whereConds.length, rowsLength: rows.length });

    if (this.action === 'select') {
      let filtered = [...rows];
      for (const cond of this.whereConds) {
        filtered = filtered.filter(row => matchCondition(row, cond));
      }
      return filtered;
    }

    if (this.action === 'insert') {
      const valueList = Array.isArray(this.insertValues) ? this.insertValues : [this.insertValues];
      const insertedRows = [];
      for (const val of valueList) {
        const newRow = {
          id: val.id || 'id_' + Math.random().toString(36).substr(2, 9),
          ...val,
          createdAt: val.createdAt || new Date().toISOString(),
          updatedAt: val.updatedAt || new Date().toISOString()
        };
        rows.push(newRow);
        insertedRows.push(newRow);
      }
      data[tableName] = rows;
      saveLocalDb(data);
      return insertedRows;
    }

    if (this.action === 'update') {
      const updatedRows = [];
      for (let i = 0; i < rows.length; i++) {
        let match = true;
        for (const cond of this.whereConds) {
          if (!matchCondition(rows[i], cond)) {
            match = false;
            break;
          }
        }
        if (match) {
          rows[i] = { ...rows[i], ...this.updateSet, updatedAt: new Date().toISOString() };
          updatedRows.push(rows[i]);
        }
      }
      data[tableName] = rows;
      saveLocalDb(data);
      return updatedRows;
    }

    if (this.action === 'delete') {
      const remaining = [];
      const deleted = [];
      for (const row of rows) {
        let match = true;
        for (const cond of this.whereConds) {
          if (!matchCondition(row, cond)) {
            match = false;
            break;
          }
        }
        if (match) {
          deleted.push(row);
        } else {
          remaining.push(row);
        }
      }
      data[tableName] = remaining;
      saveLocalDb(data);
      return deleted;
    }

    return [];
  }
}

function isConnectionError(err: any): boolean {
  if (!err) return false;
  const msg = String(err.message || err.code || "");
  return (
    msg.includes("ECONNREFUSED") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("connection timeout") ||
    msg.includes("Failed query") ||
    msg.includes("Connection terminated")
  );
}

function convertToFallbackBuilder(prop: any, args: any[]): any {
  if (prop === 'select') {
    return new FallbackQueryBuilder('select');
  }
  if (prop === 'insert') {
    return new FallbackQueryBuilder('insert', args[0]);
  }
  if (prop === 'update') {
    return new FallbackQueryBuilder('update', args[0]);
  }
  if (prop === 'delete') {
    return new FallbackQueryBuilder('delete', args[0]);
  }
  return null;
}

// Transparent fail-safe Drizzle Proxy Wrapper
export const drizzleDb = new Proxy(originalDrizzleDb, {
  get(target, prop, receiver) {
    const useFallback = !isPostgresConnected;

    if (useFallback) {
      if (prop === 'select') {
        return () => new FallbackQueryBuilder('select');
      }
      if (prop === 'insert') {
        return (table: any) => new FallbackQueryBuilder('insert', table);
      }
      if (prop === 'update') {
        return (table: any) => new FallbackQueryBuilder('update', table);
      }
      if (prop === 'delete') {
        return (table: any) => new FallbackQueryBuilder('delete', table);
      }
    }

    const value = Reflect.get(target, prop, receiver);
    if (typeof value === 'function') {
      return function (...args: any[]) {
        try {
          const res = value.apply(target, args);
          if (res && typeof res.then === 'function') {
            const originalThen = res.then;
            res.then = function (onfulfilled: any, onrejected: any) {
              return originalThen.call(res, onfulfilled, async (err: any) => {
                if (isConnectionError(err)) {
                  isPostgresConnected = false;
                  const fallbackBuilder = convertToFallbackBuilder(prop, args);
                  if (fallbackBuilder) {
                    return fallbackBuilder.then(onfulfilled, onrejected);
                  }
                }
                if (onrejected) return onrejected(err);
                throw err;
              });
            };
          }
          return res;
        } catch (err) {
          if (isConnectionError(err)) {
            isPostgresConnected = false;
            const fallbackBuilder = convertToFallbackBuilder(prop, args);
            if (fallbackBuilder) return fallbackBuilder;
          }
          throw err;
        }
      };
    }
    return value;
  }
});

// Self-initializing loaded database
loadLocalDb();

export function getPostgresConnectionStatus() {
  return {
    connected: isPostgresConnected,
    primaryStorage: isPostgresConnected ? 'PostgreSQL' : 'persistent_db.json',
    databaseUrl: DATABASE_URL.replace(/:([^:@]+)@/, ':******@')
  };
}

// Background startup connection validator
(async () => {
  try {
    const client = await pool.connect();
    isPostgresConnected = true;
    console.log("[DB] Connected successfully to PostgreSQL primary storage!");
    client.release();
    
    // Auto-run migrations if PostgreSQL is connected
    try {
      const checkRes = await pool.query("SELECT to_regclass('public.users') as exists;");
      if (!checkRes.rows[0] || !checkRes.rows[0].exists) {
        console.log("[DB] Table 'users' not found. Running auto-migrations...");
        const schemaPath = path.join(process.cwd(), "src", "server", "db", "schema.sql");
        if (fs.existsSync(schemaPath)) {
          const sql = fs.readFileSync(schemaPath, "utf-8");
          await pool.query(sql);
          console.log("[DB] Auto-migrations completed successfully!");
          
          // Seed the database
          const { seedDatabase } = await import("./seed");
          await seedDatabase();
          console.log("[DB] Database seeded successfully!");
        }
      }
    } catch (migErr: any) {
      console.error("[DB] Migration error during startup:", migErr.message);
    }
  } catch (err: any) {
    isPostgresConnected = false;
    console.log("[DB] PostgreSQL primary storage offline. Fallback active. Error:", err.message);
  }
})();
