/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA QA PHASE 5 Test Suite (TC76–TC100)
 * Realistic, Evidence-Based Verification of Security, Progression, AI, Judge, Projects, Contests, Community & Roles
 */

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { eq, and } from 'drizzle-orm';
import { drizzleDb, getPostgresConnectionStatus } from '../db/db';
import {
  users,
  passwordResetTokens,
  dailyReviews,
  userTopicProgress,
  projects,
  userProjects,
  contests,
  contestProblems,
  contestRegistrations,
  contestSubmissions,
  contestLeaderboards,
  studyGroups,
  studyGroupMembers,
  jobs,
  marketplaceProjects,
  certificates,
  placementDrives,
  studentStudyPlans
} from '../db/schema';
import { apiRouter } from '../routes/api.routes';
import { errorHandler } from '../middlewares/error.middleware';

export interface TestResult {
  id: string;
  name: string;
  scenario: string;
  status: 'PASSED' | 'FAILED' | 'BLOCKED';
  evidence: string;
}

export const testResults: TestResult[] = [];

function recordTest(id: string, name: string, scenario: string, passed: boolean, evidence: string) {
  const status: 'PASSED' | 'FAILED' = passed ? 'PASSED' : 'FAILED';
  testResults.push({ id, name, scenario, status, evidence });
  if (passed) {
    console.log(`  ✅ [${id}] PASS: ${name} -> ${evidence}`);
  } else {
    console.error(`  ❌ [${id}] FAIL: ${name} -> ${evidence}`);
  }
}

export async function runQAPhase5(): Promise<{ passed: number; failed: number; total: number; results: TestResult[] }> {
  console.log('\n================================================================');
  console.log('🚀 EXECUTING ALGORA QA PHASE 5 REGRESSION SUITE (TC76–TC100)');
  console.log('================================================================\n');

  // Allow async database connection startup to complete
  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log('Database status at QA Phase 5 start:', getPostgresConnectionStatus());

  // Tracking references for isolated test teardown
  let createdDriveId: string | null = null;
  let createdCertId: string | null = null;
  let createdJobId: string | null = null;
  let createdSm2CardId: string | null = null;
  let createdGroupId: string | null = null;
  let createdUpcomingContestId: string | null = null;
  let createdActiveContestId: string | null = null;

  // 1. Setup local Express test server on ephemeral port
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/api', apiRouter);
  app.use(errorHandler);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  // 2. Provision isolated test accounts with clearly identifiable IDs
  const studentEmailA = `qa_student_a_${Date.now()}@algora.test`;
  const studentEmailB = `qa_student_b_${Date.now()}@algora.test`;
  const facultyEmail = `qa_faculty_${Date.now()}@algora.test`;
  const recruiterEmailA = `qa_recruiter_a_${Date.now()}@algora.test`;
  const recruiterEmailB = `qa_recruiter_b_${Date.now()}@algora.test`;

  const commonPassword = 'Password123!';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(commonPassword, salt);

  const studentAId = crypto.randomUUID();
  const studentBId = crypto.randomUUID();
  const facultyId = crypto.randomUUID();
  const recruiterAId = crypto.randomUUID();
  const recruiterBId = crypto.randomUUID();

  await drizzleDb.insert(users).values([
    {
      id: studentAId,
      name: 'QA Student Alpha',
      email: studentEmailA,
      passwordHash,
      role: 'student',
      college: 'IIT Bombay',
      xp: 150,
      level: 1,
      streak: 5,
      targetCompany: 'Google'
    },
    {
      id: studentBId,
      name: 'QA Student Beta',
      email: studentEmailB,
      passwordHash,
      role: 'student',
      college: 'IIT Delhi',
      xp: 200,
      level: 1,
      streak: 3,
      targetCompany: 'Amazon'
    },
    {
      id: facultyId,
      name: 'QA Faculty Admin',
      email: facultyEmail,
      passwordHash,
      role: 'faculty',
      college: 'IIT Bombay',
      xp: 999,
      level: 5,
      streak: 20,
      targetCompany: 'Faculty'
    },
    {
      id: recruiterAId,
      name: 'QA Recruiter Alice',
      email: recruiterEmailA,
      passwordHash,
      role: 'recruiter',
      college: 'Tech Corp',
      xp: 500,
      level: 2,
      streak: 10,
      targetCompany: 'Google'
    },
    {
      id: recruiterBId,
      name: 'QA Recruiter Bob',
      email: recruiterEmailB,
      passwordHash,
      role: 'recruiter',
      college: 'Innovate LLC',
      xp: 500,
      level: 2,
      streak: 10,
      targetCompany: 'Meta'
    }
  ]);

  // Helper function for login to obtain tokens
  async function login(email: string): Promise<{ accessToken: string; refreshToken: string }> {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: commonPassword })
    });
    const json = await res.json();
    if (!json.success || !json.data?.tokens) {
      throw new Error(`Login failed for ${email} (status ${res.status}): ${JSON.stringify(json)}`);
    }
    return json.data.tokens;
  }

  const studentATokens = await login(studentEmailA);
  const studentBTokens = await login(studentEmailB);
  const facultyTokens = await login(facultyEmail);
  const recruiterATokens = await login(recruiterEmailA);
  const recruiterBTokens = await login(recruiterEmailB);

  try {
    // -------------------------------------------------------------
    // TC76: Password Reset Request Flow & Token Generation
    // -------------------------------------------------------------
    console.log('--- Suite 1: Authentication, Session & Isolation ---');
    const res76 = await fetch(`${baseUrl}/auth/password-reset-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmailA })
    });
    const json76 = await res76.json();
    const tokenRecord76 = await drizzleDb.select().from(passwordResetTokens).where(eq(passwordResetTokens.userId, studentAId));
    const pass76 = res76.status === 200 && json76.success === true && tokenRecord76.length > 0 && !tokenRecord76[0].used;
    recordTest(
      'TC76',
      'Password Reset Request Token Issuance',
      'Request password reset for registered student and verify DB token insertion',
      pass76,
      `HTTP ${res76.status}, Token stored in DB: ${tokenRecord76[0]?.resetToken?.slice(0, 10)}...`
    );

    // -------------------------------------------------------------
    // TC77: Password Reset Execution & Re-authentication
    // -------------------------------------------------------------
    const activeResetToken = tokenRecord76[0].resetToken;
    const newPassword = 'BrandNewPassword999!';
    
    // First test invalid token rejection
    const res77Invalid = await fetch(`${baseUrl}/auth/password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken: 'non_existent_token_123', newPassword })
    });
    
    // Submit valid reset
    const res77 = await fetch(`${baseUrl}/auth/password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken: activeResetToken, newPassword })
    });
    const json77 = await res77.json();

    // Verify user can now log in with the new password
    const loginWithNewPass = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmailA, password: newPassword })
    });
    const pass77 = res77Invalid.status === 400 && res77.status === 200 && json77.success === true && loginWithNewPass.status === 200;
    recordTest(
      'TC77',
      'Password Reset Execution & Credential Update',
      'Submit password reset token and verify user password hash update and login with new password',
      pass77,
      `Invalid token rejected (HTTP ${res77Invalid.status}), Reset HTTP ${res77.status}, Login with new password HTTP ${loginWithNewPass.status}`
    );

    // -------------------------------------------------------------
    // TC78: Refresh Token Invalidation on Logout
    // -------------------------------------------------------------
    const freshLogin78 = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmailA, password: newPassword })
    });
    const tokens78 = (await freshLogin78.json()).data.tokens;

    // Logout to revoke refresh token
    const logoutRes78 = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens78.refreshToken })
    });

    // Attempt to refresh access token using the revoked token
    const refreshRes78 = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens78.refreshToken })
    });
    const pass78 = logoutRes78.status === 200 && refreshRes78.status === 401;
    recordTest(
      'TC78',
      'Refresh Token Revocation on Logout',
      'Verify that logging out invalidates refresh token in DB, preventing token reuse',
      pass78,
      `Logout HTTP ${logoutRes78.status}, Revoked Refresh attempt HTTP ${refreshRes78.status} (401 Unauthorized)`
    );

    // -------------------------------------------------------------
    // TC79: Account Isolation in Daily Review
    // -------------------------------------------------------------
    // Student B creates a review card
    const cardResB = await fetch(`${baseUrl}/reviews/card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentBTokens.accessToken}`
      },
      body: JSON.stringify({
        title: 'User B Confidential Flashcard',
        frontContent: 'Binary Search Invariant',
        backContent: 'low <= high'
      })
    });
    const cardB = (await cardResB.json()).data;

    // Student A attempts to submit rating for Student B's card
    const crossRateRes79 = await fetch(`${baseUrl}/reviews/${cardB.id}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentATokens.accessToken}`
      },
      body: JSON.stringify({ quality: 5 })
    });
    const pass79 = crossRateRes79.status === 403;
    recordTest(
      'TC79',
      'Account Isolation: Daily Review Cross-User Rating',
      'User A attempts to rate and reschedule User B review card; verify 403 Forbidden',
      pass79,
      `Cross-account rating rejected with HTTP ${crossRateRes79.status}`
    );

    // -------------------------------------------------------------
    // TC80: Authorization Boundary: Faculty Portal Access
    // -------------------------------------------------------------
    console.log('\n--- Suite 2: Role-Based Authorization Boundaries ---');
    const studentFacultyRes80 = await fetch(`${baseUrl}/faculty/overview`, {
      headers: { Authorization: `Bearer ${studentATokens.accessToken}` }
    });
    const studentRiskRes80 = await fetch(`${baseUrl}/faculty/risk`, {
      headers: { Authorization: `Bearer ${studentATokens.accessToken}` }
    });
    const facultyOverviewRes80 = await fetch(`${baseUrl}/faculty/overview`, {
      headers: { Authorization: `Bearer ${facultyTokens.accessToken}` }
    });
    const pass80 = studentFacultyRes80.status === 403 && studentRiskRes80.status === 403 && facultyOverviewRes80.status === 200;
    recordTest(
      'TC80',
      'Faculty Portal RBAC Enforcement',
      'Student token rejected with 403 Forbidden on /faculty/overview and /faculty/risk; Faculty allowed with 200',
      pass80,
      `Student Overview: HTTP ${studentFacultyRes80.status}, Student Risk: HTTP ${studentRiskRes80.status}, Faculty Overview: HTTP ${facultyOverviewRes80.status}`
    );

    // -------------------------------------------------------------
    // TC81: Authorization Boundary: Recruiter Portal Access
    // -------------------------------------------------------------
    const studentJobRes81 = await fetch(`${baseUrl}/recruiter/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentATokens.accessToken}`
      },
      body: JSON.stringify({
        title: 'Illegal Job Post',
        company: 'Malicious Inc',
        description: 'Should be rejected',
        requirements: 'None'
      })
    });
    const recruiterJobRes81 = await fetch(`${baseUrl}/recruiter/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterATokens.accessToken}`
      },
      body: JSON.stringify({
        title: 'Senior Systems Engineer',
        company: 'Google Cloud',
        description: 'Design distributed architectures',
        requirements: 'DSA & Distributed Systems'
      })
    });
    const pass81 = studentJobRes81.status === 403 && recruiterJobRes81.status === 201;
    recordTest(
      'TC81',
      'Recruiter Portal RBAC Enforcement',
      'Student token rejected with 403 on job creation; Recruiter accepted with 201 Created',
      pass81,
      `Student create job: HTTP ${studentJobRes81.status}, Recruiter create job: HTTP ${recruiterJobRes81.status}`
    );

    // -------------------------------------------------------------
    // TC82: Recruiter Job Cross-Ownership Boundary
    // -------------------------------------------------------------
    const jobAData = (await recruiterJobRes81.json()).data;
    if (jobAData?.id) createdJobId = jobAData.id;
    // Recruiter B attempts to edit Recruiter A's job
    const editJobRes82 = await fetch(`${baseUrl}/recruiter/jobs/${jobAData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterBTokens.accessToken}`
      },
      body: JSON.stringify({ title: 'Hijacked Job Title' })
    });
    // Recruiter B attempts to delete Recruiter A's job
    const deleteJobRes82 = await fetch(`${baseUrl}/recruiter/jobs/${jobAData.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${recruiterBTokens.accessToken}`
      }
    });
    const pass82 = editJobRes82.status === 403 && deleteJobRes82.status === 403;
    recordTest(
      'TC82',
      'Recruiter Job Cross-Ownership Protection',
      'Recruiter B attempts to edit or delete Recruiter A job posting; verify 403 Forbidden',
      pass82,
      `Edit other recruiter job: HTTP ${editJobRes82.status}, Delete other recruiter job: HTTP ${deleteJobRes82.status}`
    );

    // -------------------------------------------------------------
    // TC83: Enterprise Placements Role Control
    // -------------------------------------------------------------
    const studentDriveRes83 = await fetch(`${baseUrl}/placements/drives`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentATokens.accessToken}`
      },
      body: JSON.stringify({ title: 'Student Placement Drive', company: 'Self Hired' })
    });
    const facultyDriveRes83 = await fetch(`${baseUrl}/placements/drives`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyTokens.accessToken}`
      },
      body: JSON.stringify({ title: 'Google Fall Campus Drive', company: 'Google India', eligibilityXp: 100 })
    });
    const driveAData = (await facultyDriveRes83.json()).data;
    if (driveAData?.id) createdDriveId = driveAData.id;
    const pass83 = studentDriveRes83.status === 403 && facultyDriveRes83.status === 201;
    recordTest(
      'TC83',
      'Enterprise Placement Drive Creation RBAC',
      'Student unauthorized to create placement drives (403); Faculty authorized (201)',
      pass83,
      `Student drive create: HTTP ${studentDriveRes83.status}, Faculty drive create: HTTP ${facultyDriveRes83.status}`
    );

    // -------------------------------------------------------------
    // TC84: Marketplace Certificate Issuance RBAC
    // -------------------------------------------------------------
    const studentCertRes84 = await fetch(`${baseUrl}/marketplace/certificates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentATokens.accessToken}`
      },
      body: JSON.stringify({ title: 'Fraudulent Master Certificate' })
    });
    const facultyCertRes84 = await fetch(`${baseUrl}/marketplace/certificates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyTokens.accessToken}`
      },
      body: JSON.stringify({ userId: studentAId, title: 'Verified Distributed Systems Fellow' })
    });
    const certAData = (await facultyCertRes84.json()).data;
    if (certAData?.id) createdCertId = certAData.id;
    const pass84 = studentCertRes84.status === 403 && facultyCertRes84.status === 201;
    recordTest(
      'TC84',
      'Marketplace Certificate Issuance Protection',
      'Student unauthorized to self-issue verified industry certificates (403); Faculty authorized (201)',
      pass84,
      `Student cert issue: HTTP ${studentCertRes84.status}, Faculty cert issue: HTTP ${facultyCertRes84.status}`
    );

    // -------------------------------------------------------------
    // TC85: Topic Stage Progression Input Validation
    // -------------------------------------------------------------
    console.log('\n--- Suite 3: Learning Progression & Mastery Calculations ---');
    const invalidStageRes85 = await fetch(`${baseUrl}/learning/topics/top_arrays/stage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentATokens.accessToken}`
      },
      body: JSON.stringify({ stage: 'astrophysics_deep_dive', completed: true })
    });
    const pass85 = invalidStageRes85.status === 400;
    recordTest(
      'TC85',
      'Topic Stage Progression Key Validation',
      'Rejects invalid topic stage name with 400 Bad Request',
      pass85,
      `Invalid stage submission rejected with HTTP ${invalidStageRes85.status}`
    );

    // -------------------------------------------------------------
    // TC86: Stage Completion Infinite XP Exploit Prevention
    // -------------------------------------------------------------
    // Get initial XP of student B
    const userBefore86 = (await drizzleDb.select().from(users).where(eq(users.id, studentBId)))[0];
    const initialXp86 = userBefore86.xp;

    // First completion of concept stage -> should award +25 XP
    const firstStageRes = await fetch(`${baseUrl}/learning/topics/top_arrays/stage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentBTokens.accessToken}`
      },
      body: JSON.stringify({ stage: 'concept', completed: true })
    });
    const userMid86 = (await drizzleDb.select().from(users).where(eq(users.id, studentBId)))[0];
    const xpAfterFirst = userMid86.xp;

    // Repeated completion of already-completed concept stage -> should NOT award XP again
    const secondStageRes = await fetch(`${baseUrl}/learning/topics/top_arrays/stage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentBTokens.accessToken}`
      },
      body: JSON.stringify({ stage: 'concept', completed: true })
    });
    const userAfter86 = (await drizzleDb.select().from(users).where(eq(users.id, studentBId)))[0];
    const xpAfterSecond = userAfter86.xp;

    const pass86 = xpAfterFirst === initialXp86 + 25 && xpAfterSecond === xpAfterFirst;
    recordTest(
      'TC86',
      'Stage Completion Infinite XP Exploit Prevention',
      'Repeated submission of completed stage does not award duplicate XP points',
      pass86,
      `Initial XP: ${initialXp86}, After 1st completion: ${xpAfterFirst} (+25), After 2nd attempt: ${xpAfterSecond} (+0)`
    );

    // -------------------------------------------------------------
    // TC87: Dynamic Track Progress Calculation
    // -------------------------------------------------------------
    const tracksRes87 = await fetch(`${baseUrl}/learning/tracks`, {
      headers: { Authorization: `Bearer ${studentBTokens.accessToken}` }
    });
    const tracksJson87 = await tracksRes87.json();
    const dsaTrack87 = tracksJson87.data.find((t: any) => t.id === 'trk_dsa');
    const pass87 = tracksRes87.status === 200 && dsaTrack87 !== undefined && typeof dsaTrack87.totalTopics === 'number';
    recordTest(
      'TC87',
      'Learning Track Progress Calculation',
      'Verify /learning/tracks returns structured topic stats and progress for authenticated user',
      pass87,
      `DSA Track totalTopics: ${dsaTrack87?.totalTopics}, completedTopics: ${dsaTrack87?.completedTopics}`
    );

    // -------------------------------------------------------------
    // TC88: AI Mentor Input Validation
    // -------------------------------------------------------------
    console.log('\n--- Suite 4: AI Intelligence & Socratic Mentorship ---');
    const emptyMsgRes88 = await fetch(`${baseUrl}/ai/mentor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '   ' })
    });
    const hugeMsgRes88 = await fetch(`${baseUrl}/ai/mentor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'A'.repeat(5000) })
    });
    const validMsgRes88 = await fetch(`${baseUrl}/ai/mentor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'How do I optimize two sum?', requestedTier: 'hint' })
    });
    const pass88 = emptyMsgRes88.status === 400 && hugeMsgRes88.status === 400 && validMsgRes88.status === 200;
    recordTest(
      'TC88',
      'AI Mentor Input Validation & Boundary Limits',
      'Rejects whitespace-only and oversized messages (>4000 chars) with 400; accepts valid prompt with 200',
      pass88,
      `Whitespace: HTTP ${emptyMsgRes88.status}, Oversized: HTTP ${hugeMsgRes88.status}, Valid: HTTP ${validMsgRes88.status}`
    );

    // -------------------------------------------------------------
    // TC89: AI Mentor Socratic Ladder Tier Scaffolding
    // -------------------------------------------------------------
    const tiers = ['hint', 'approach', 'algorithm', 'pseudocode', 'partial_code'];
    let allTiersValid = true;
    for (const tier of tiers) {
      const res = await fetch(`${baseUrl}/ai/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Explain Kadane algorithm', requestedTier: tier })
      });
      const data = (await res.json()).data;
      if (!data || data.tier !== tier || !data.reply) {
        allTiersValid = false;
        break;
      }
    }
    recordTest(
      'TC89',
      'AI Mentor Socratic Ladder Tier Progression',
      'Verify Socratic scaffolding tiers: hint -> approach -> algorithm -> pseudocode -> partial_code',
      allTiersValid,
      `Validated 5 Socratic tiers successfully`
    );

    // -------------------------------------------------------------
    // TC90: AI Study Planner Parameter Validation
    // -------------------------------------------------------------
    const invalidPlanRes90 = await fetch(`${baseUrl}/ai/planner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentATokens.accessToken}`
      },
      body: JSON.stringify({ targetCompany: 'Google', timelineWeeks: -5 })
    });
    const validPlanRes90 = await fetch(`${baseUrl}/ai/planner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentATokens.accessToken}`
      },
      body: JSON.stringify({ targetCompany: 'Google', timelineWeeks: 6 })
    });
    const pass90 = invalidPlanRes90.status === 400 && validPlanRes90.status === 201;
    recordTest(
      'TC90',
      'AI Study Planner Timeline Validation',
      'Rejects negative timelineWeeks (-5) with 400 Bad Request; accepts valid timeline (6 weeks) with 201',
      pass90,
      `Negative timeline HTTP ${invalidPlanRes90.status}, Valid timeline HTTP ${validPlanRes90.status}`
    );

    // -------------------------------------------------------------
    // TC91: Code Judge Unsupported Language Validation
    // -------------------------------------------------------------
    console.log('\n--- Suite 5: Code Judge Sandbox & Execution Telemetry ---');
    const invalidLangRes91 = await fetch(`${baseUrl}/problems/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemId: 'two-sum',
        code: 'puts "hello"',
        language: 'ruby'
      })
    });
    const pass91 = invalidLangRes91.status === 400;
    recordTest(
      'TC91',
      'Code Judge Language Parameter Validation',
      'Rejects unsupported/malformed language identifier with 400 Bad Request',
      pass91,
      `Unsupported language 'ruby' returned HTTP ${invalidLangRes91.status}`
    );

    // -------------------------------------------------------------
    // TC92: Hidden Test Case Input/Output Masking
    // -------------------------------------------------------------
    const { codeJudge } = await import('../services/judgeService');
    const judgeHiddenRes = await codeJudge.executeSubmission({
      submissionId: crypto.randomUUID(),
      userId: studentAId,
      problemId: 'two-sum',
      code: 'def solve(): pass',
      language: 'python',
      testCases: [
        { input: '[2,7,11,15], 9', expected: '[0,1]', hidden: false },
        { input: '[100,200,300], 500', expected: '[1,2]', hidden: true }
      ]
    });
    const hiddenDetail = judgeHiddenRes.testDetails.find((t) => t.hidden === true);
    const pass92 = hiddenDetail !== undefined && hiddenDetail.input === '[Hidden Test Case]' && hiddenDetail.expected === '[Hidden Expected Output]';
    recordTest(
      'TC92',
      'Hidden Test Case Masking in Judge Telemetry',
      'Ensures test cases marked as hidden do not leak private input/expected outputs to client',
      pass92,
      `Hidden test input: "${hiddenDetail?.input}", expected: "${hiddenDetail?.expected}"`
    );

    // -------------------------------------------------------------
    // TC93: Execution Sandbox Time Limit Enforcement
    // -------------------------------------------------------------
    const judgeTleRes = await codeJudge.executeSubmission({
      submissionId: crypto.randomUUID(),
      userId: studentAId,
      problemId: 'sandbox',
      code: 'while True: pass',
      language: 'python',
      testCases: [{ input: 'infinite_loop', expected: 'none' }],
      timeLimitMs: 1000
    });
    const pass93 = judgeTleRes.verdict === 'Time Limit Exceeded';
    recordTest(
      'TC93',
      'Code Execution Sandbox Timeout (TLE) Detection',
      'Execution timeout triggers Time Limit Exceeded verdict within configured limit',
      pass93,
      `Verdict: ${judgeTleRes.verdict}, Execution time: ${judgeTleRes.executionTimeMs}ms`
    );

    // -------------------------------------------------------------
    // TC94: Compilation / Syntax Error Diagnosis
    // -------------------------------------------------------------
    const judgeSyntaxRes = await codeJudge.executeSubmission({
      submissionId: crypto.randomUUID(),
      userId: studentAId,
      problemId: 'sandbox',
      code: 'int main() { syntax_error missing semicolon }',
      language: 'cpp',
      testCases: [{ input: '1', expected: '1' }]
    });
    const pass94 = judgeSyntaxRes.verdict === 'Compilation Error' && !!judgeSyntaxRes.errorMessage;
    recordTest(
      'TC94',
      'Compilation / Syntax Error Diagnostic Reporting',
      'Invalid syntax submission yields Compilation Error verdict with error diagnostics',
      pass94,
      `Verdict: ${judgeSyntaxRes.verdict}, Message: "${judgeSyntaxRes.errorMessage}"`
    );

    // -------------------------------------------------------------
    // TC95: Daily Review SM-2 Low Recall Reset
    // -------------------------------------------------------------
    console.log('\n--- Suite 6: Daily Review & Projects System ---');
    // Create card with existing repetitions
    const sm2CardId = crypto.randomUUID();
    await drizzleDb.insert(dailyReviews).values({
      id: sm2CardId,
      userId: studentAId,
      itemType: 'concept',
      itemId: 'arrays_sm2',
      title: 'Arrays Contiguous Allocation',
      subtopic: 'Memory',
      frontContent: 'What is array cache locality?',
      backContent: 'Spatial and temporal locality',
      easinessFactor: '2.50',
      intervalDays: 6,
      repetitionNumber: 2,
      nextReviewDate: new Date().toISOString().split('T')[0]
    });

    // Rate with low quality score (2) -> Should reset repetition number to 0 and interval to 1
    const sm2RateRes = await fetch(`${baseUrl}/reviews/${sm2CardId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentATokens.accessToken}`
      },
      body: JSON.stringify({ quality: 2 })
    });
    const sm2Json = await sm2RateRes.json();
    const updatedCard95 = (await drizzleDb.select().from(dailyReviews).where(eq(dailyReviews.id, sm2CardId)))[0];
    const pass95 = sm2RateRes.status === 200 && updatedCard95.repetitionNumber === 0 && updatedCard95.intervalDays === 1;
    recordTest(
      'TC95',
      'SuperMemo-2 Spaced Repetition Reset on Recall Failure',
      'Rating quality < 3 resets repetitionNumber to 0 and intervalDays to 1',
      pass95,
      `Repetition number: ${updatedCard95?.repetitionNumber}, Interval days: ${updatedCard95?.intervalDays}`
    );

    // -------------------------------------------------------------
    // TC96: Daily Review Rating Boundaries & UUID Guard
    // -------------------------------------------------------------
    const rateNegativeRes = await fetch(`${baseUrl}/reviews/${sm2CardId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentATokens.accessToken}`
      },
      body: JSON.stringify({ quality: -1 })
    });
    const rateExcessRes = await fetch(`${baseUrl}/reviews/${sm2CardId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentATokens.accessToken}`
      },
      body: JSON.stringify({ quality: 6 })
    });
    const rateNonUuidRes = await fetch(`${baseUrl}/reviews/non-uuid-string/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentATokens.accessToken}`
      },
      body: JSON.stringify({ quality: 4 })
    });
    const pass96 = rateNegativeRes.status === 400 && rateExcessRes.status === 400 && rateNonUuidRes.status === 404;
    recordTest(
      'TC96',
      'Daily Review Quality Score & UUID Format Validation',
      'Rejects rating < 0, > 5 with 400 Bad Request; rejects invalid UUID with 404 Not Found',
      pass96,
      `Negative quality: HTTP ${rateNegativeRes.status}, >5 quality: HTTP ${rateExcessRes.status}, Malformed UUID: HTTP ${rateNonUuidRes.status}`
    );

    // -------------------------------------------------------------
    // TC97: Real-World Projects Duplicate Submission XP Exploit
    // -------------------------------------------------------------
    // Enroll Student B in banking-system
    await fetch(`${baseUrl}/projects/banking-system/enroll`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentBTokens.accessToken}` }
    });

    const userBeforeProj = (await drizzleDb.select().from(users).where(eq(users.id, studentBId)))[0];
    const xpBeforeProj = userBeforeProj.xp;

    // 1st project submission -> awards +300 XP
    const submitProjRes1 = await fetch(`${baseUrl}/projects/banking-system/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentBTokens.accessToken}`
      },
      body: JSON.stringify({ repoUrl: 'https://github.com/student/bank', demoUrl: 'https://bank.demo' })
    });
    const userMidProj = (await drizzleDb.select().from(users).where(eq(users.id, studentBId)))[0];
    const xpAfterProj1 = userMidProj.xp;

    // 2nd project submission -> should NOT award +300 XP again
    const submitProjRes2 = await fetch(`${baseUrl}/projects/banking-system/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentBTokens.accessToken}`
      },
      body: JSON.stringify({ repoUrl: 'https://github.com/student/bank', demoUrl: 'https://bank.demo' })
    });
    const userAfterProj = (await drizzleDb.select().from(users).where(eq(users.id, studentBId)))[0];
    const xpAfterProj2 = userAfterProj.xp;

    const pass97 = xpAfterProj1 === xpBeforeProj + 300 && xpAfterProj2 === xpAfterProj1;
    recordTest(
      'TC97',
      'Project Submission Duplicate XP Exploit Prevention',
      'Repeated submission of already submitted project does not award duplicate +300 XP',
      pass97,
      `Initial XP: ${xpBeforeProj}, After 1st submit: ${xpAfterProj1} (+300), After 2nd submit: ${xpAfterProj2} (+0)`
    );

    // -------------------------------------------------------------
    // TC98: Study Group Non-Member Chat Authorization Boundary
    // -------------------------------------------------------------
    console.log('\n--- Suite 7: Community & Contest Integrity ---');
    // Student A creates study group
    const groupRes = await fetch(`${baseUrl}/community/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentATokens.accessToken}`
      },
      body: JSON.stringify({ name: 'Private DSA Squad', description: 'Internal mock group' })
    });
    const groupData = await groupRes.json();
    const groupId = groupData.id;
    if (groupId) createdGroupId = groupId;

    // Student B (not a member) attempts to post chat into Student A's group
    const unauthChatRes = await fetch(`${baseUrl}/community/groups/${groupId}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentBTokens.accessToken}`
      },
      body: JSON.stringify({ message: 'Intrusion chat message' })
    });
    const pass98 = unauthChatRes.status === 403;
    recordTest(
      'TC98',
      'Study Group Chat Membership Authorization',
      'Non-member user rejected with 403 Forbidden when attempting to post in study group',
      pass98,
      `Non-member post chat returned HTTP ${unauthChatRes.status}`
    );

    // -------------------------------------------------------------
    // TC99: Premature Contest Submission Prevention
    // -------------------------------------------------------------
    const upcomingContestId = crypto.randomUUID();
    createdUpcomingContestId = upcomingContestId;
    const futureStart = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours in future
    const futureEnd = new Date(Date.now() + 4 * 60 * 60 * 1000);

    await drizzleDb.insert(contests).values({
      id: upcomingContestId,
      title: 'Upcoming Algora Grand Prix',
      slug: `grand-prix-${Date.now()}`,
      description: 'Starting in 2 hours',
      startTime: futureStart,
      endTime: futureEnd,
      status: 'upcoming'
    });

    // Register user for contest
    await fetch(`${baseUrl}/contests/${upcomingContestId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentATokens.accessToken}` }
    });

    // Attempt solution submission before contest start
    const earlySubRes = await fetch(`${baseUrl}/contests/${upcomingContestId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentATokens.accessToken}`
      },
      body: JSON.stringify({ problemId: 'two-sum', code: 'def solve(): pass', language: 'python' })
    });
    const pass99 = earlySubRes.status === 400;
    recordTest(
      'TC99',
      'Premature Contest Submission Prevention',
      'Submitting solutions to an upcoming contest before its startTime returns 400 Bad Request',
      pass99,
      `Premature submission rejected with HTTP ${earlySubRes.status}`
    );

    // -------------------------------------------------------------
    // TC100: Contest Leaderboard Solved Count Integrity
    // -------------------------------------------------------------
    const activeContestId = crypto.randomUUID();
    createdActiveContestId = activeContestId;
    const pastStart = new Date(Date.now() - 30 * 60 * 1000); // started 30 mins ago
    const activeEnd = new Date(Date.now() + 60 * 60 * 1000); // ends in 60 mins

    await drizzleDb.insert(contests).values({
      id: activeContestId,
      title: 'Active Algora Sprint',
      slug: `active-sprint-${Date.now()}`,
      description: 'Active sprint now',
      startTime: pastStart,
      endTime: activeEnd,
      status: 'active'
    });

    // Register student A for active contest
    await fetch(`${baseUrl}/contests/${activeContestId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentATokens.accessToken}` }
    });

    // 1st accepted submission
    const contestSub1 = await fetch(`${baseUrl}/contests/${activeContestId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentATokens.accessToken}`
      },
      body: JSON.stringify({ problemId: 'two-sum', code: 'def solve(): return [0, 1]', language: 'python' })
    });

    // Get leaderboard solvedCount after 1st submission
    const lbRows1 = await drizzleDb.select().from(contestLeaderboards)
      .where(and(eq(contestLeaderboards.contestId, activeContestId), eq(contestLeaderboards.userId, studentAId)));
    const solvedCount1 = lbRows1[0]?.solvedCount || 0;

    // 2nd submission for the EXACT SAME problem (already accepted)
    const contestSub2 = await fetch(`${baseUrl}/contests/${activeContestId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentATokens.accessToken}`
      },
      body: JSON.stringify({ problemId: 'two-sum', code: 'def solve(): return [0, 1]', language: 'python' })
    });

    // Get leaderboard solvedCount after 2nd submission
    const lbRows2 = await drizzleDb.select().from(contestLeaderboards)
      .where(and(eq(contestLeaderboards.contestId, activeContestId), eq(contestLeaderboards.userId, studentAId)));
    const solvedCount2 = lbRows2[0]?.solvedCount || 0;

    const pass100 = contestSub1.status === 200 && solvedCount1 === 1 && solvedCount2 === 1;
    recordTest(
      'TC100',
      'Contest Leaderboard Solved Count Integrity',
      'Resubmitting an already accepted contest problem does not erroneously increment solvedCount',
      pass100,
      `1st submission solvedCount: ${solvedCount1}, 2nd duplicate submission solvedCount: ${solvedCount2}`
    );

  } finally {
    // Clean up temporary test data to maintain database isolation
    try {
      if (createdActiveContestId) {
        await drizzleDb.delete(contestLeaderboards).where(eq(contestLeaderboards.contestId, createdActiveContestId));
        await drizzleDb.delete(contestSubmissions).where(eq(contestSubmissions.contestId, createdActiveContestId));
        await drizzleDb.delete(contestRegistrations).where(eq(contestRegistrations.contestId, createdActiveContestId));
        await drizzleDb.delete(contests).where(eq(contests.id, createdActiveContestId));
      }
      if (createdUpcomingContestId) {
        await drizzleDb.delete(contestRegistrations).where(eq(contestRegistrations.contestId, createdUpcomingContestId));
        await drizzleDb.delete(contests).where(eq(contests.id, createdUpcomingContestId));
      }
      if (createdGroupId) {
        await drizzleDb.delete(studyGroupMembers).where(eq(studyGroupMembers.groupId, createdGroupId));
        await drizzleDb.delete(studyGroups).where(eq(studyGroups.id, createdGroupId));
      }
      if (createdJobId) {
        await drizzleDb.delete(jobs).where(eq(jobs.id, createdJobId));
      }
      if (createdDriveId) {
        await drizzleDb.delete(placementDrives).where(eq(placementDrives.id, createdDriveId));
      }
      if (createdCertId) {
        await drizzleDb.delete(certificates).where(eq(certificates.id, createdCertId));
      }
      await drizzleDb.delete(dailyReviews).where(eq(dailyReviews.userId, studentAId));
      await drizzleDb.delete(dailyReviews).where(eq(dailyReviews.userId, studentBId));
      await drizzleDb.delete(userTopicProgress).where(eq(userTopicProgress.userId, studentAId));
      await drizzleDb.delete(userTopicProgress).where(eq(userTopicProgress.userId, studentBId));
      await drizzleDb.delete(userProjects).where(eq(userProjects.userId, studentAId));
      await drizzleDb.delete(userProjects).where(eq(userProjects.userId, studentBId));
      await drizzleDb.delete(studentStudyPlans).where(eq(studentStudyPlans.userId, studentAId));
      await drizzleDb.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, studentAId));
      await drizzleDb.delete(users).where(eq(users.id, studentAId));
      await drizzleDb.delete(users).where(eq(users.id, studentBId));
      await drizzleDb.delete(users).where(eq(users.id, facultyId));
      await drizzleDb.delete(users).where(eq(users.id, recruiterAId));
      await drizzleDb.delete(users).where(eq(users.id, recruiterBId));
    } catch (cleanupErr) {
      console.warn('Post-test fixture cleanup warning:', cleanupErr);
    }

    // Clean up temporary server
    server.close();
  }

  const passed = testResults.filter((r) => r.status === 'PASSED').length;
  const failed = testResults.filter((r) => r.status === 'FAILED').length;
  const total = testResults.length;

  console.log('\n================================================================');
  console.log(`📊 QA PHASE 5 SUMMARY: ${passed} PASSED | ${failed} FAILED | TOTAL ${total}`);
  console.log('================================================================\n');

  return { passed, failed, total, results: testResults };
}

// Allow standalone execution
const isMain = process.argv[1] && (
  import.meta.url.toLowerCase().endsWith(process.argv[1].replace(/\\/g, '/').toLowerCase()) ||
  process.argv[1].replace(/\\/g, '/').toLowerCase().endsWith('qaphase5tests.ts')
);

if (isMain) {
  runQAPhase5()
    .then(({ failed }) => {
      if (failed > 0) process.exit(1);
    })
    .catch((err) => {
      console.error('Fatal QA Runner Error:', err);
      process.exit(1);
    });
}
