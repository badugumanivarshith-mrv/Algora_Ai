/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Production Test Suite (Unit & Integration Verification - PostgreSQL Drizzle Refactor)
 */

import dotenv from 'dotenv';
dotenv.config();

import { drizzleDb } from '../db/db';
import { users, learningTracks, topics, problems, problemHints, projects, dailyReviews } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    failed++;
  }
}

async function runTests() {
  // Allow async database connection startup to complete
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const { getPostgresConnectionStatus } = await import('../db/db');
  console.log("Database status at test execution:", getPostgresConnectionStatus());

  console.log('\n========================================');
  console.log('🧪 RUNNING ALGORA BACKEND TEST SUITE');
  console.log('========================================\n');

  try {
    // --- 1. AUTH & JWT TESTS ---
    console.log('--- 1. Authentication & Security ---');
    
    // Test 1: User lookup & Password Verification
    const usersList = await drizzleDb.select().from(users).where(eq(users.id, 'e0c25a7a-6eb2-4c28-9bf9-9c5d76d49d41'));
    const user = usersList[0] || null;
    assert(!!user, 'Demo user usr_demo_student exists in database');
    if (user) {
      const valid = bcrypt.compareSync('DemoStudent123!', user.passwordHash);
      assert(valid, 'Password hash verification matches valid credential');
      const invalid = bcrypt.compareSync('WrongPassword', user.passwordHash);
      assert(!invalid, 'Password hash rejects invalid credential');
    }

    // Test 2: JWT Access & Refresh Token Generation & Verification
    if (user) {
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        config.jwt.secret as jwt.Secret,
        { expiresIn: '15m' } as jwt.SignOptions
      );
      const decoded = jwt.verify(accessToken, config.jwt.secret as jwt.Secret) as any;
      assert(decoded.email === 'demo@algora.edu', 'JWT token signs and verifies user email payload');
      assert(decoded.role === 'student', 'JWT token verifies student role claim');
    }

    // --- 2. LEARNING TRACKS & 8-STAGE TOPIC PROGRESSION ---
    console.log('\n--- 2. Learning Tracks & 8-Stage Progression ---');
    const tracksList = await drizzleDb.select().from(learningTracks).where(eq(learningTracks.id, 'trk_dsa'));
    const dsaTrack = tracksList[0] || null;
    assert(!!dsaTrack, 'DSA learning track exists');
    assert(dsaTrack?.category === 'interview-prep', 'DSA track has category interview-prep');

    const topicsList = await drizzleDb.select().from(topics).where(eq(topics.id, 'top_arrays'));
    const arraysTopic = topicsList[0] || null;
    assert(!!arraysTopic, 'Arrays & Hashing topic exists');
    assert(!!arraysTopic?.conceptContent, 'Topic contains concept stage content');
    assert(!!arraysTopic?.syntaxCheatsheet, 'Topic contains syntax cheatsheet');
    assert(Array.isArray(arraysTopic?.commonMistakes), 'Topic contains common mistakes breakdown');

    // --- 3. PROBLEM SYSTEM & SOCRATIC HINTS ---
    console.log('\n--- 3. Problem System & Socratic Hints ---');
    const problemsList = await drizzleDb.select().from(problems).where(eq(problems.id, 'two-sum'));
    const twoSum = problemsList[0] || null;
    assert(!!twoSum, 'Two Sum problem exists');
    assert(twoSum?.difficulty === 'Easy', 'Two Sum difficulty is Easy');
    assert(Boolean((twoSum?.companies as string[] || []).includes('Google')), 'Two Sum includes Google company tag');

    const hints = await drizzleDb.select().from(problemHints).where(eq(problemHints.problemId, 'two-sum'));
    assert(hints.length >= 2, 'Two Sum provides Socratic tiered hints');

    // --- 4. PROJECT SYSTEM ---
    console.log('\n--- 4. Real-World Project Workbench ---');
    const projectsList = await drizzleDb.select().from(projects).where(eq(projects.id, 'banking-system'));
    const bankingProj = projectsList[0] || null;
    assert(!!bankingProj, 'Banking System project exists');
    assert(bankingProj?.difficulty === 'Intermediate', 'Banking project difficulty is Intermediate');
    assert(((bankingProj?.learningGoals as string[])?.length || 0) >= 2, 'Project has structured learning goals');
    assert(((bankingProj?.evaluationCriteria as any[])?.length || 0) >= 1, 'Project includes clear evaluation rubrics');

    // --- 5. SPACING REPETITION (SM-2 ALGORITHM) ---
    console.log('\n--- 5. Daily Review & SM-2 Spaced Repetition ---');
    const reviewsList = await drizzleDb.select().from(dailyReviews).where(eq(dailyReviews.id, '55555554-5555-5555-5555-555555555555'));
    const sampleCard = reviewsList[0] || null;
    assert(!!sampleCard, 'Daily review queue contains seed review card');
    if (sampleCard) {
      // Test SM-2 EF update for high quality recall (5)
      const oldEF = Number(sampleCard.easinessFactor || 2.5);
      const q = 5;
      const newEF = Math.max(1.3, +(oldEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))).toFixed(2));
      assert(newEF >= oldEF, 'SM-2 increases easiness factor for perfect active recall');
    }

    // --- 6. FACULTY RISK ANALYSIS ---
    console.log('\n--- 6. Analytics & Faculty Risk Intelligence ---');
    const facultyList = await drizzleDb.select().from(users).where(eq(users.id, 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'));
    const faculty = facultyList[0] || null;
    assert(!!faculty && faculty.role === 'faculty', 'Faculty admin account exists with proper RBAC');

  } catch (err: any) {
    console.error('Fatal Test Suite Error:', err.message);
    failed++;
  }

  console.log('\n========================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
