import dotenv from "dotenv";
dotenv.config();

import { pool, drizzleDb } from "./db";
import { users, submissions, userTopicProgress, userProjects, dailyReviews } from "./schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function runVerification() {
  console.log("================================================================================");
  console.log("🔥 RUNNING ALGORA END-TO-END REALITY VERIFICATION SCRIPT");
  console.log("================================================================================\n");

  try {
    const client = await pool.connect();
    console.log("✅ CONNECTED TO NEON CLOUD POSTGRESQL!\n");

    // ==========================================================
    // Test 1: User Registration Persistence
    // ==========================================================
    console.log("--- Test 1: User Registration ---");
    const testEmail = `verify_user_${Date.now()}@algora.edu`;
    const pwdHash = bcrypt.hashSync("TestVerify123!", 10);
    
    await drizzleDb.insert(users).values({
      id: "c8fce45c-0678-4eb7-a7dc-cc1e9dbb3ff9", // static test UUID
      name: "Verification User",
      email: testEmail,
      passwordHash: pwdHash,
      role: "student",
      college: "IIT Bombay"
    }).onConflictDoNothing();

    const regRes = await client.query(`
      SELECT id, name, email 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5;
    `);
    console.log("RAW POSTGRESQL RESPONSE:");
    console.log(JSON.stringify(regRes.rows, null, 2));
    console.log("\n");

    // ==========================================================
    // Test 2: Problem Submission Persistence
    // ==========================================================
    console.log("--- Test 2: Problem Submission ---");
    await drizzleDb.insert(submissions).values({
      id: "77777777-7777-7777-7777-777777777777",
      userId: "e0c25a7a-6eb2-4c28-9bf9-9c5d76d49d41", // demo student UUID
      problemId: "two-sum",
      code: "def solution(): pass",
      language: "python",
      status: "Accepted",
      executionTimeMs: 15,
      memoryMb: "15.4",
      passedTestCases: 3,
      totalTestCases: 3
    }).onConflictDoNothing();

    const subRes = await client.query(`
      SELECT id, user_id, problem_id, status 
      FROM submissions 
      ORDER BY created_at DESC 
      LIMIT 5;
    `);
    console.log("RAW POSTGRESQL RESPONSE:");
    console.log(JSON.stringify(subRes.rows, null, 2));
    console.log("\n");

    // ==========================================================
    // Test 3: Learning Progress Persistence
    // ==========================================================
    console.log("--- Test 3: Learning Progress ---");
    await drizzleDb.insert(userTopicProgress).values({
      id: "88888888-8888-8888-8888-888888888888",
      userId: "e0c25a7a-6eb2-4c28-9bf9-9c5d76d49d41",
      topicId: "top_arrays",
      status: "completed",
      conceptCompleted: true,
      syntaxCompleted: true,
      examplesCompleted: true,
      lastStudiedAt: new Date()
    }).onConflictDoNothing();

    const progRes = await client.query(`
      SELECT id, user_id, topic_id, status, concept_completed, syntax_completed 
      FROM user_topic_progress 
      ORDER BY created_at DESC 
      LIMIT 5;
    `);
    console.log("RAW POSTGRESQL RESPONSE:");
    console.log(JSON.stringify(progRes.rows, null, 2));
    console.log("\n");

    // ==========================================================
    // Test 4: Project Enrollment Persistence
    // ==========================================================
    console.log("--- Test 4: Project Enrollment ---");
    await drizzleDb.insert(userProjects).values({
      id: "99999999-9999-9999-9999-999999999999",
      userId: "e0c25a7a-6eb2-4c28-9bf9-9c5d76d49d41",
      projectId: "banking-system",
      status: "enrolled",
      completedTaskIds: [],
      score: 0,
      reflectionNotes: ""
    }).onConflictDoNothing();

    const projEnrollRes = await client.query(`
      SELECT id, user_id, project_id, status 
      FROM user_projects 
      ORDER BY created_at DESC 
      LIMIT 5;
    `);
    console.log("RAW POSTGRESQL RESPONSE:");
    console.log(JSON.stringify(projEnrollRes.rows, null, 2));
    console.log("\n");

    // ==========================================================
    // Test 5: Daily Review Persistence
    // ==========================================================
    console.log("--- Test 5: Daily Review ---");
    await drizzleDb.insert(dailyReviews).values({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      userId: "e0c25a7a-6eb2-4c28-9bf9-9c5d76d49d41",
      itemType: "problem",
      itemId: "two-sum",
      title: "Verify Daily Review Card",
      subtopic: "Arrays",
      frontContent: "What is 2+2?",
      backContent: "4",
      easinessFactor: "2.50",
      intervalDays: 1,
      repetitionNumber: 1,
      nextReviewDate: new Date().toISOString().split("T")[0]
    }).onConflictDoNothing();

    const revRes = await client.query(`
      SELECT id, user_id, item_id, title 
      FROM daily_reviews 
      ORDER BY created_at DESC 
      LIMIT 5;
    `);
    console.log("RAW POSTGRESQL RESPONSE:");
    console.log(JSON.stringify(revRes.rows, null, 2));
    console.log("\n");

    client.release();
    await pool.end();
  } catch (err: any) {
    console.error("❌ E2E VERIFICATION ERROR:", err.message);
  }
}

runVerification();
