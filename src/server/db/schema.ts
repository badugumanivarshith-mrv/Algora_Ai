/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Production Database Schema (Drizzle ORM)
 */

import {
  pgTable, uuid, varchar, text, integer, boolean, numeric,
  timestamp, date, jsonb, index, uniqueIndex
} from "drizzle-orm/pg-core";

// ==========================================
// 1. USERS & AUTHENTICATION
// ==========================================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("student").notNull(),
  college: varchar("college", { length: 255 }).default("IIT Bombay"),
  avatarUrl: text("avatar_url"),
  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  streak: integer("streak").default(1).notNull(),
  targetCompany: varchar("target_company", { length: 100 }).default("Google"),
  dailyGoalMinutes: integer("daily_goal_minutes").default(45).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  emailIdx: index("idx_users_email").on(table.email),
  xpIdx: index("idx_users_xp").on(table.xp),
  roleIdx: index("idx_users_role").on(table.role)
}));

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index("idx_refresh_tokens_user").on(table.userId),
  tokenIdx: index("idx_refresh_tokens_token").on(table.token)
}));

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  resetToken: varchar("reset_token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  resetTokenIdx: index("idx_reset_token").on(table.resetToken)
}));

// ==========================================
// 2. LEARNING TRACKS & TOPICS (8-Stage Progression)
// ==========================================

export const learningTracks = pgTable("learning_tracks", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 100 }).default("Code2"),
  color: varchar("color", { length: 50 }).default("#2563eb"),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const topics = pgTable("topics", {
  id: varchar("id", { length: 100 }).primaryKey(),
  trackId: varchar("track_id", { length: 100 }).notNull().references(() => learningTracks.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").default(0),
  estimatedMinutes: integer("estimated_minutes").default(60),
  conceptContent: text("concept_content"),
  syntaxCheatsheet: text("syntax_cheatsheet"),
  interactiveExamples: jsonb("interactive_examples").default([]),
  commonMistakes: jsonb("common_mistakes").default([]),
  interviewQuestions: jsonb("interview_questions").default([]),
  prerequisiteTopicId: varchar("prerequisite_topic_id", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  trackIdx: index("idx_topics_track").on(table.trackId),
  orderIdx: index("idx_topics_order").on(table.trackId, table.orderIndex)
}));

export const userTopicProgress = pgTable("user_topic_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  topicId: varchar("topic_id", { length: 100 }).notNull().references(() => topics.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).default("locked").notNull(),
  conceptCompleted: boolean("concept_completed").default(false),
  syntaxCompleted: boolean("syntax_completed").default(false),
  examplesCompleted: boolean("examples_completed").default(false),
  mistakesCompleted: boolean("mistakes_completed").default(false),
  problemsCompletedCount: integer("problems_completed_count").default(0),
  assignmentCompleted: boolean("assignment_completed").default(false),
  projectCompleted: boolean("project_completed").default(false),
  interviewCompleted: boolean("interview_completed").default(false),
  masteryScore: integer("mastery_score").default(0),
  lastStudiedAt: timestamp("last_studied_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userTopicIdx: uniqueIndex("unique_user_topic").on(table.userId, table.topicId)
}));

// ==========================================
// 3. PROBLEM BANK & SOCRATIC HINTS
// ==========================================

export const problems = pgTable("problems", {
  id: varchar("id", { length: 100 }).primaryKey(),
  topicId: varchar("topic_id", { length: 100 }).notNull().references(() => topics.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  description: text("description").notNull(),
  examples: jsonb("examples").default([]).notNull(),
  constraints: jsonb("constraints").default([]).notNull(),
  tags: jsonb("tags").default([]),
  companies: jsonb("companies").default([]),
  starterCode: jsonb("starter_code").default({}).notNull(),
  solutionCode: jsonb("solution_code").default({}).notNull(),
  testCases: jsonb("test_cases").default([]).notNull(),
  acceptanceRate: numeric("acceptance_rate", { precision: 5, scale: 2 }).default("75.0"),
  learningObjectives: jsonb("learning_objectives").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  topicIdx: index("idx_problems_topic").on(table.topicId),
  diffIdx: index("idx_problems_difficulty").on(table.difficulty)
}));

export const problemHints = pgTable("problem_hints", {
  id: uuid("id").defaultRandom().primaryKey(),
  problemId: varchar("problem_id", { length: 100 }).notNull().references(() => problems.id, { onDelete: "cascade" }),
  tierLevel: varchar("tier_level", { length: 50 }).notNull(),
  orderIndex: integer("order_index").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  problemOrderIdx: index("idx_hints_problem").on(table.problemId, table.orderIndex)
}));

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  problemId: varchar("problem_id", { length: 100 }).notNull().references(() => problems.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  executionTimeMs: integer("execution_time_ms").default(0),
  memoryMb: numeric("memory_mb", { precision: 5, scale: 2 }).default("0.0"),
  passedTestCases: integer("passed_test_cases").default(0),
  totalTestCases: integer("total_test_cases").default(0),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index("idx_submissions_user").on(table.userId),
  problemIdx: index("idx_submissions_problem").on(table.problemId),
  statusIdx: index("idx_submissions_status").on(table.status),
  createdIdx: index("idx_submissions_created").on(table.createdAt)
}));

// ==========================================
// 4. PROJECTS ENGINE
// ==========================================

export const projects = pgTable("projects", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  summary: text("summary").notNull(),
  overview: text("overview").notNull(),
  architectureOverview: text("architecture_overview"),
  estimatedHours: integer("estimated_hours").default(10),
  learningGoals: jsonb("learning_goals").default([]),
  prerequisites: jsonb("prerequisites").default([]),
  evaluationCriteria: jsonb("evaluation_criteria").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const userProjects = pgTable("user_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: varchar("project_id", { length: 100 }).notNull().references(() => projects.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).default("in_progress"),
  completedTaskIds: jsonb("completed_task_ids").default([]),
  reflectionNotes: text("reflection_notes").default(""),
  repoUrl: text("repo_url"),
  demoUrl: text("demo_url"),
  aiFeedback: text("ai_feedback"),
  score: integer("score").default(0),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true })
}, (table) => ({
  userProjectIdx: uniqueIndex("unique_user_project").on(table.userId, table.projectId)
}));

// ==========================================
// 5. DAILY REVIEWS (SuperMemo-2 Spaced Repetition)
// ==========================================

export const dailyReviews = pgTable("daily_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemType: varchar("item_type", { length: 50 }).notNull(),
  itemId: varchar("item_id", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  subtopic: varchar("subtopic", { length: 100 }).notNull(),
  frontContent: text("front_content").notNull(),
  backContent: text("back_content").notNull(),
  easinessFactor: numeric("easiness_factor", { precision: 4, scale: 2 }).default("2.50"),
  intervalDays: integer("interval_days").default(1),
  repetitionNumber: integer("repetition_number").default(0),
  nextReviewDate: date("next_review_date").notNull(),
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userQueueIdx: index("idx_daily_reviews_queue").on(table.userId, table.nextReviewDate)
}));

// ==========================================
// 6. LEARNING MEMORY, COMPANY PREP, CONTESTS & VOICE
// ==========================================

export const companyReadiness = pgTable("company_readiness", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  companyId: varchar("company_id", { length: 100 }).notNull(),
  readinessScore: integer("readiness_score").default(0),
  solvedProblemsCount: integer("solved_problems_count").default(0),
  checkedResumeItems: jsonb("checked_resume_items").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const voiceInterviewSessions = pgTable("voice_interview_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  interviewType: varchar("interview_type", { length: 50 }).notNull(),
  companyId: varchar("company_id", { length: 100 }),
  transcriptJson: jsonb("transcript_json").default([]),
  overallScore: integer("overall_score").default(0),
  technicalScore: integer("technical_score").default(0),
  communicationScore: integer("communication_score").default(0),
  confidenceScore: integer("confidence_score").default(0),
  strengthsJson: jsonb("strengths_json").default([]),
  improvementsJson: jsonb("improvements_json").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const contestRatings = pgTable("contest_ratings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").default(1200).notNull(),
  peakRating: integer("peak_rating").default(1200).notNull(),
  ratingTier: varchar("rating_tier", { length: 50 }).default("Beginner"),
  ratingHistoryJson: jsonb("rating_history_json").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
