/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Production Database Schema (Drizzle ORM)
 */

import {
  pgTable, uuid, varchar, text, integer, boolean, numeric,
  timestamp, date, jsonb, index, uniqueIndex, real
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
  reputationScore: integer("reputation_score").default(100).notNull(),
  contributionScore: integer("contribution_score").default(50).notNull(),
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

// ==========================================
// 7. PERSISTENT NOTIFICATIONS & CONTESTS
// ==========================================

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default("info").notNull(), // 'review', 'contest', 'level_up', 'project', 'ai', 'system'
  isRead: boolean("is_read").default(false).notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userReadIdx: index("idx_notifications_user_read").on(table.userId, table.isRead)
}));

export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  emailEnabled: boolean("email_enabled").default(true),
  pushEnabled: boolean("push_enabled").default(true),
  contestEnabled: boolean("contest_enabled").default(true),
  reviewEnabled: boolean("review_enabled").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const contests = pgTable("contests", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description").notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes").default(90).notNull(),
  status: varchar("status", { length: 50 }).default("upcoming").notNull(), // 'upcoming', 'active', 'ended'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const contestProblems = pgTable("contest_problems", {
  id: uuid("id").defaultRandom().primaryKey(),
  contestId: uuid("contest_id").notNull().references(() => contests.id, { onDelete: "cascade" }),
  problemId: varchar("problem_id", { length: 100 }).notNull().references(() => problems.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").default(1).notNull(),
  points: integer("points").default(100).notNull()
});

export const contestRegistrations = pgTable("contest_registrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  contestId: uuid("contest_id").notNull().references(() => contests.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  registeredAt: timestamp("registered_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  uniqueReg: uniqueIndex("unique_user_contest_reg").on(table.userId, table.contestId)
}));

export const contestSubmissions = pgTable("contest_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  contestId: uuid("contest_id").notNull().references(() => contests.id, { onDelete: "cascade" }),
  problemId: varchar("problem_id", { length: 100 }).notNull().references(() => problems.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  submissionId: uuid("submission_id").references(() => submissions.id, { onDelete: "set null" }),
  status: varchar("status", { length: 50 }).notNull(),
  pointsAwarded: integer("points_awarded").default(0),
  penaltyMinutes: integer("penalty_minutes").default(0),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull()
});

export const contestLeaderboards = pgTable("contest_leaderboards", {
  id: uuid("id").defaultRandom().primaryKey(),
  contestId: uuid("contest_id").notNull().references(() => contests.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  totalScore: integer("total_score").default(0).notNull(),
  totalPenaltyMinutes: integer("total_penalty_minutes").default(0).notNull(),
  rank: integer("rank").default(0),
  solvedCount: integer("solved_count").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  uniqueLeaderboard: uniqueIndex("unique_user_contest_lb").on(table.userId, table.contestId)
}));

// ==========================================
// 8. STUDY GROUPS & DISCUSSIONS
// ==========================================

export const studyGroups = pgTable("study_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).default("General").notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const studyGroupMembers = pgTable("study_group_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => studyGroups.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  uniqueMember: uniqueIndex("unique_user_group").on(table.userId, table.groupId)
}));

export const studyGroupChats = pgTable("study_group_chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => studyGroups.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userName: varchar("user_name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const forumPosts = pgTable("forum_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // 'general', 'topic', 'problem', 'project'
  referenceId: varchar("reference_id", { length: 100 }), // can match topicId, problemId, projectId
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userName: varchar("user_name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  upvotes: integer("upvotes").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const forumComments = pgTable("forum_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").notNull().references(() => forumPosts.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userName: varchar("user_name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ==========================================
// 9. PEER LEARNING & SOLUTION REVIEWS
// ==========================================

export const solutionReviews = pgTable("solution_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  problemId: varchar("problem_id", { length: 100 }).notNull().references(() => problems.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const solutionReviewComments = pgTable("solution_review_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  reviewId: uuid("review_id").notNull().references(() => solutionReviews.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userName: varchar("user_name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ==========================================
// 10. AI STUDY PLANS & FACULTY INTERVENTIONS
// ==========================================

export const studentStudyPlans = pgTable("student_study_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planJson: jsonb("plan_json").notNull(),
  weeklyGoalMinutes: integer("weekly_goal_minutes").default(200).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const facultyInterventions = pgTable("faculty_interventions", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  facultyId: uuid("faculty_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  recommendation: text("recommendation").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // 'pending', 'sent', 'actioned'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ==========================================
// 11. RECRUITER PORTAL & PLACEMENTS
// ==========================================

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  description: text("description").notNull(),
  location: varchar("location", { length: 255 }).default("Remote").notNull(),
  type: varchar("type", { length: 50 }).default("Full-Time").notNull(), // 'Full-Time', 'Internship'
  salary: varchar("salary", { length: 100 }),
  requirements: text("requirements").notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const applications = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobId: uuid("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).default("Applied").notNull(), // 'Applied', 'Screening', 'Interviewing', 'Offered', 'Rejected'
  feedback: text("feedback"),
  appliedAt: timestamp("applied_at", { withTimezone: true }).defaultNow().notNull()
});

// ==========================================
// 12. ENTERPRISE PLACEMENT ECOSYSTEM
// ==========================================

export const placementDrives = pgTable("placement_drives", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  eligibilityCgpa: real("eligibility_cgpa").default(7.0).notNull(),
  eligibilityXp: integer("eligibility_xp").default(100).notNull(),
  status: varchar("status", { length: 50 }).default("upcoming").notNull(), // 'upcoming', 'ongoing', 'completed'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const driveRegistrations = pgTable("drive_registrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  driveId: uuid("drive_id").notNull().references(() => placementDrives.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  registeredAt: timestamp("registered_at", { withTimezone: true }).defaultNow().notNull()
});

export const interviewRounds = pgTable("interview_rounds", {
  id: uuid("id").defaultRandom().primaryKey(),
  registrationId: uuid("registration_id").notNull().references(() => driveRegistrations.id, { onDelete: "cascade" }),
  roundNumber: integer("round_number").default(1).notNull(),
  roundType: varchar("round_type", { length: 100 }).notNull(), // 'Coding', 'System Design', 'HR'
  interviewerFeedback: text("interviewer_feedback"),
  score: integer("score"),
  status: varchar("status", { length: 50 }).default("scheduled").notNull(), // 'scheduled', 'passed', 'failed'
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).defaultNow().notNull()
});

export const offers = pgTable("offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  registrationId: uuid("registration_id").notNull().references(() => driveRegistrations.id, { onDelete: "cascade" }),
  packageAmount: varchar("package_amount", { length: 100 }).notNull(), // e.g. "32 LPA"
  status: varchar("status", { length: 50 }).default("pending").notNull(), // 'pending', 'accepted', 'declined'
  offeredAt: timestamp("offered_at", { withTimezone: true }).defaultNow().notNull()
});

export const companyPartnerships = pgTable("company_partnerships", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  partnershipTier: varchar("partnership_tier", { length: 100 }).default("Gold").notNull(), // 'Gold', 'Platinum', 'Silver'
  signedAt: timestamp("signed_at", { withTimezone: true }).defaultNow().notNull()
});

// ==========================================
// 13. AI KNOWLEDGE GRAPH & SKILLS
// ==========================================

export const skillGraphNodes = pgTable("skill_graph_nodes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // 'Data Structure', 'Algorithm', 'System Design'
  difficultyLevel: varchar("difficulty_level", { length: 50 }).default("Medium").notNull()
});

export const skillGraphEdges = pgTable("skill_graph_edges", {
  id: uuid("id").defaultRandom().primaryKey(),
  fromNodeId: uuid("from_node_id").notNull().references(() => skillGraphNodes.id, { onDelete: "cascade" }),
  toNodeId: uuid("to_node_id").notNull().references(() => skillGraphNodes.id, { onDelete: "cascade" }),
  relationshipType: varchar("relationship_type", { length: 100 }).default("prerequisite").notNull() // 'prerequisite', 'relates_to'
});

export const learningRecommendations = pgTable("learning_recommendations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  nodeId: uuid("node_id").notNull().references(() => skillGraphNodes.id, { onDelete: "cascade" }),
  priority: varchar("priority", { length: 50 }).default("Medium").notNull(), // 'High', 'Medium', 'Low'
  status: varchar("status", { length: 50 }).default("active").notNull(), // 'active', 'completed'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const skillGapReports = pgTable("skill_gap_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  score: integer("score").default(70).notNull(),
  reportJson: jsonb("report_json").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ==========================================
// 14. AI CAREER OPERATING SYSTEM
// ==========================================

export const careerPaths = pgTable("career_paths", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  targetRole: varchar("target_role", { length: 100 }).notNull(), // 'Software Engineer', 'AI Engineer', etc.
  requiredSkillsJson: jsonb("required_skills_json").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const userCareerProfiles = pgTable("user_career_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetRoleId: varchar("target_role_id", { length: 100 }).default("Software Engineer").notNull(),
  resumeScore: integer("resume_score").default(85).notNull(),
  interviewReadinessScore: integer("interview_readiness_score").default(78).notNull(),
  placementProbability: integer("placement_probability").default(82).notNull(), // percentage
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const careerMilestones = pgTable("career_milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // 'pending', 'completed'
  targetDate: varchar("target_date", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const careerSkillGaps = pgTable("career_skill_gaps", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  skillName: varchar("skill_name", { length: 255 }).notNull(),
  gapLevel: varchar("gap_level", { length: 50 }).default("Moderate").notNull(), // 'Critical', 'Moderate', 'Low'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// ==========================================
// 15. INDUSTRY PROJECTS MARKETPLACE
// ==========================================

export const marketplaceProjects = pgTable("marketplace_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  description: text("description").notNull(),
  techStack: varchar("tech_stack", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("open").notNull(), // 'open', 'in_progress', 'completed'
  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const marketplaceApplications = pgTable("marketplace_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => marketplaceProjects.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // 'pending', 'accepted', 'rejected'
  appliedAt: timestamp("applied_at", { withTimezone: true }).defaultNow().notNull()
});

export const projectTeams = pgTable("project_teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => marketplaceProjects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  membersJson: jsonb("members_json").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const mentorAssignments = pgTable("mentor_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => marketplaceProjects.id, { onDelete: "cascade" }),
  mentorId: uuid("mentor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull()
});

export const portfolioEntries = pgTable("portfolio_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  projectUrl: text("project_url"),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const certificates = pgTable("certificates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  issuedBy: varchar("issued_by", { length: 255 }).default("Algora Academy").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull()
});

