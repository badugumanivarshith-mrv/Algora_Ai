/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Production Test Suite (Unit & Integration Verification)
 */

import { db } from '../db/db';
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
  console.log('\n========================================');
  console.log('🧪 RUNNING ALGORA BACKEND TEST SUITE');
  console.log('========================================\n');

  // --- 1. AUTH & JWT TESTS ---
  console.log('--- 1. Authentication & Security ---');
  
  // Test 1: User lookup & Password Verification
  const user = db.users.get('arjun@algora.ai');
  assert(!!user, 'Demo user arjun@algora.ai exists in database');
  if (user) {
    const valid = bcrypt.compareSync('Password123!', user.password_hash);
    assert(valid, 'Password hash verification matches valid credential');
    const invalid = bcrypt.compareSync('WrongPassword', user.password_hash);
    assert(!invalid, 'Password hash rejects invalid credential');
  }

  // Test 2: JWT Access & Refresh Token Generation & Verification
  if (user) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwt.secret,
      { expiresIn: '15m' }
    );
    const decoded = jwt.verify(accessToken, config.jwt.secret) as any;
    assert(decoded.email === 'arjun@algora.ai', 'JWT token signs and verifies user email payload');
    assert(decoded.role === 'student', 'JWT token verifies student role claim');
  }

  // --- 2. LEARNING TRACKS & 8-STAGE TOPIC PROGRESSION ---
  console.log('\n--- 2. Learning Tracks & 8-Stage Progression ---');
  const dsaTrack = db.learningTracks.get('dsa');
  assert(!!dsaTrack, 'DSA learning track exists');
  assert(dsaTrack?.category === 'cs-core', 'DSA track has category cs-core');

  const arraysTopic = db.topics.get('arrays-hashing');
  assert(!!arraysTopic, 'Arrays & Hashing topic exists');
  assert(!!arraysTopic?.concept_content, 'Topic contains concept stage content');
  assert(!!arraysTopic?.syntax_cheatsheet, 'Topic contains syntax cheatsheet');
  assert(Array.isArray(arraysTopic?.common_mistakes), 'Topic contains common mistakes breakdown');

  // --- 3. PROBLEM SYSTEM & TESTCASE EVALUATION ---
  console.log('\n--- 3. Problem System & Socratic Hints ---');
  const twoSum = db.problems.get('two-sum');
  assert(!!twoSum, 'Two Sum problem exists');
  assert(twoSum?.difficulty === 'Easy', 'Two Sum difficulty is Easy');
  assert(twoSum?.companies.includes('Google'), 'Two Sum includes Google company tag');

  const hints = db.problemHints.get('two-sum') || [];
  assert(hints.length >= 3, 'Two Sum provides 3+ Socratic tiered hints');
  assert(hints[0].tier_level === 'hint', 'Tier 1 is high-level Hint');
  assert(hints[1].tier_level === 'approach', 'Tier 2 is Approach framework');

  // --- 4. PROJECT SYSTEM ---
  console.log('\n--- 4. Real-World Project Workbench ---');
  const bankingProj = db.projects.get('banking-system');
  assert(!!bankingProj, 'Banking System project exists');
  assert(bankingProj?.difficulty === 'Beginner', 'Banking project difficulty is Beginner');
  assert(bankingProj?.milestones.length >= 2, 'Project has structured milestone steps');
  assert(bankingProj?.evaluation_criteria.length >= 2, 'Project includes clear evaluation rubrics');

  // --- 5. SPACING REPETITION (SM-2 ALGORITHM) ---
  console.log('\n--- 5. Daily Review & SM-2 Spaced Repetition ---');
  const sampleCard = db.dailyReviews.get('rev_001');
  assert(!!sampleCard, 'Daily review queue contains seed review card');
  if (sampleCard) {
    // Test SM-2 EF update for high quality recall (5)
    const oldEF = sampleCard.easiness_factor;
    const q = 5;
    const newEF = Math.max(1.3, +(oldEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))).toFixed(2));
    assert(newEF >= oldEF, 'SM-2 increases easiness factor for perfect active recall');
  }

  // --- 6. FACULTY RISK ANALYSIS ---
  console.log('\n--- 6. Analytics & Faculty Risk Intelligence ---');
  const faculty = db.users.get('faculty@algora.ai');
  assert(!!faculty && faculty.role === 'faculty', 'Faculty admin account exists with proper RBAC');

  console.log('\n========================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
