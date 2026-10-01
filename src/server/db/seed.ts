/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA PostgreSQL Database Seeder
 */

import { drizzleDb } from "./db";
import { users, learningTracks, topics, problems, projects, problemHints, dailyReviews, submissions, contests, contestProblems } from "./schema";
import {
  DEMO_USERS,
  SEED_TRACKS,
  SEED_TOPICS,
  SEED_PROBLEMS,
  SEED_HINTS,
  SEED_PROJECTS,
  SEED_SUBMISSIONS,
  SEED_REVIEWS
} from "./seedData";

export async function seedDatabase() {
  console.log("🌱 Starting ALGORA Production Database Seeding...");

  try {
    // 1. Seed Demo & Admin Users
    await drizzleDb.insert(users).values(DEMO_USERS).onConflictDoNothing();

    // 2. Seed Learning Tracks
    await drizzleDb.insert(learningTracks).values(SEED_TRACKS).onConflictDoNothing();

    // 3. Seed Topics
    await drizzleDb.insert(topics).values(SEED_TOPICS).onConflictDoNothing();

    // 4. Seed Problems
    await drizzleDb.insert(problems).values(SEED_PROBLEMS).onConflictDoNothing();

    // 5. Seed Problem Hints
    await drizzleDb.insert(problemHints).values(SEED_HINTS).onConflictDoNothing();

    // 6. Seed Projects
    await drizzleDb.insert(projects).values(SEED_PROJECTS).onConflictDoNothing();

    // 7. Seed Submissions
    const submissionsToInsert = SEED_SUBMISSIONS.map(s => ({
      ...s,
      createdAt: new Date(s.createdAt)
    }));
    await drizzleDb.insert(submissions).values(submissionsToInsert).onConflictDoNothing();

    // 8. Seed Daily Reviews
    const reviewsToInsert = SEED_REVIEWS.map(r => ({
      ...r,
      createdAt: new Date(r.createdAt)
    }));
    await drizzleDb.insert(dailyReviews).values(reviewsToInsert).onConflictDoNothing();

    // 9. Seed Contest
    const sampleContestId = "c1111111-1111-1111-1111-111111111111";
    await drizzleDb.insert(contests).values({
      id: sampleContestId,
      title: "Algora Weekly Sprint #148",
      slug: "algora-weekly-148",
      description: "90-minute algorithmic contest featuring Array, Dynamic Programming, and Graph challenges.",
      startTime: new Date(Date.now() - 15 * 60 * 1000), // started 15 mins ago
      endTime: new Date(Date.now() + 75 * 60 * 1000),   // ends in 75 mins
      durationMinutes: 90,
      status: "active",
      createdAt: new Date()
    }).onConflictDoNothing();

    await drizzleDb.insert(contestProblems).values([
      {
        id: "c1111111-1111-1111-1111-111111111112",
        contestId: sampleContestId,
        problemId: "two-sum",
        orderIndex: 1,
        points: 100
      },
      {
        id: "c2222222-2222-2222-2222-222222222222",
        contestId: sampleContestId,
        problemId: "longest-palindromic-substring",
        orderIndex: 2,
        points: 200
      }
    ]).onConflictDoNothing();

    console.log("✅ Database seeding completed successfully!");
  } catch (err) {
    console.error("⚠️ Seeding warning:", err);
  }
}
