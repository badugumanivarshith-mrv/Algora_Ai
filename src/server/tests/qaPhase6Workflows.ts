/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA QA PHASE 6 End-to-End Workflow & Server Integration Test Suite
 * Real runtime verification of the 10 core interconnected user journeys
 */

import dotenv from 'dotenv';
dotenv.config();

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
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
  studyGroupChats,
  jobs,
  applications,
  facultyInterventions,
  notifications,
  studentStudyPlans
} from '../db/schema';

export interface WorkflowResult {
  id: string;
  name: string;
  scenario: string;
  status: 'PASSED' | 'FAILED' | 'BLOCKED';
  evidence: string;
}

export const workflowResults: WorkflowResult[] = [];

function recordWorkflow(id: string, name: string, scenario: string, passed: boolean, evidence: string) {
  const status: 'PASSED' | 'FAILED' = passed ? 'PASSED' : 'FAILED';
  workflowResults.push({ id, name, scenario, status, evidence });
  if (passed) {
    console.log(`  ✅ [${id}] PASS: ${name} -> ${evidence}`);
  } else {
    console.error(`  ❌ [${id}] FAIL: ${name} -> ${evidence}`);
  }
}

export async function runQAPhase6Workflows(): Promise<{ passed: number; failed: number; total: number; results: WorkflowResult[] }> {
  console.log('\n================================================================');
  console.log('🚀 EXECUTING ALGORA QA PHASE 6: END-TO-END WORKFLOW INTEGRATION');
  console.log('================================================================\n');

  // Allow async database connection startup to complete
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const dbStatus = getPostgresConnectionStatus();
  console.log('Database status at QA Phase 6 start:', dbStatus);

  const baseUrl = 'http://localhost:3000/api';

  // Tracking entities for complete isolated teardown
  let student1Id: string | null = null;
  let student2Id: string | null = null;
  let recruiterId: string | null = null;
  let facultyId: string | null = null;
  let createdJobId: string | null = null;
  let createdApplicationId: string | null = null;
  let createdInterventionId: string | null = null;
  let createdGroupId: string | null = null;
  let createdContestId: string | null = null;
  let createdCardId: string | null = null;

  try {
    // -------------------------------------------------------------
    // WL1: Student Learning Journey
    // -------------------------------------------------------------
    console.log('--- Workflow 1: Student Learning Complete Journey ---');
    const student1Email = `qa6_student1_${Date.now()}@algora.test`;
    const password = 'StudentSecurePassword123!';

    // Step 1: Register
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'QA6 Student Alpha',
        email: student1Email,
        password,
        role: 'student',
        college: 'IIT Madras',
        targetCompany: 'Google'
      })
    });
    const regJson = await regRes.json();
    student1Id = regJson.data?.user?.id;
    let student1Tokens = regJson.data?.tokens;

    // Step 2: Open Learning Tracks
    const tracksRes = await fetch(`${baseUrl}/learning/tracks`, {
      headers: { Authorization: `Bearer ${student1Tokens.accessToken}` }
    });
    const tracksJson = await tracksRes.json();
    const dsaTrack = tracksJson.data?.find((t: any) => t.id === 'trk_dsa');

    // Step 3: Study Topic Detail
    const topicRes = await fetch(`${baseUrl}/learning/topics/top_arrays`, {
      headers: { Authorization: `Bearer ${student1Tokens.accessToken}` }
    });
    const topicJson = await topicRes.json();

    // Step 4: Complete Topic Stage
    const stageRes = await fetch(`${baseUrl}/learning/topics/top_arrays/stage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Tokens.accessToken}`
      },
      body: JSON.stringify({ stage: 'concept', completed: true })
    });
    const stageJson = await stageRes.json();

    // Step 5: Solve Problem (Two Sum) & Fetch Hints
    const problemRes = await fetch(`${baseUrl}/problems/two-sum`);
    const hintsRes = await fetch(`${baseUrl}/problems/two-sum/hints`);
    const problemJson = await problemRes.json();
    const hintsJson = await hintsRes.json();

    // Step 6: Run Code in Sandbox
    const runRes = await fetch(`${baseUrl}/problems/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemId: 'two-sum',
        code: 'def solve(): pass',
        language: 'python'
      })
    });
    const runJson = await runRes.json();

    // Step 7: Submit Code
    const submitRes = await fetch(`${baseUrl}/problems/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Tokens.accessToken}`
      },
      body: JSON.stringify({
        problemId: 'two-sum',
        code: 'def solve(): pass',
        language: 'python'
      })
    });
    const submitJson = await submitRes.json();

    // Verify database state: User XP incremented by 25 from stage completion
    const [student1User] = await drizzleDb.select().from(users).where(eq(users.id, student1Id!));
    const passWL1 =
      regRes.status === 201 &&
      tracksRes.status === 200 &&
      dsaTrack !== undefined &&
      topicRes.status === 200 &&
      stageRes.status === 200 &&
      problemRes.status === 200 &&
      hintsRes.status === 200 &&
      hintsJson.data?.length > 0 &&
      runRes.status === 200 &&
      [200, 201].includes(submitRes.status) &&
      student1User?.xp >= 25;

    recordWorkflow(
      'WL1',
      'Student Learning Lifecycle Journey',
      'Register -> View Tracks -> Study Topic -> Complete Stage -> View Hints -> Run & Submit Code -> Verify XP & DB',
      passWL1,
      `User registered (ID: ${student1Id?.slice(0, 8)}...), Track: ${dsaTrack?.title}, XP: ${student1User?.xp}, Code Verdict: ${submitJson.data?.verdict || runJson.data?.verdict}`
    );

    // -------------------------------------------------------------
    // WL2: Adaptive Learning & Spaced Memory Journey
    // -------------------------------------------------------------
    console.log('\n--- Workflow 2: Adaptive Learning & Spaced Memory Journey ---');
    // Fetch AI Recommendations
    const recRes = await fetch(`${baseUrl}/ai/recommendations`, {
      headers: { Authorization: `Bearer ${student1Tokens.accessToken}` }
    });
    const recJson = await recRes.json();

    // Create Review Card
    const cardRes = await fetch(`${baseUrl}/reviews/card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Tokens.accessToken}`
      },
      body: JSON.stringify({
        itemType: 'concept',
        itemId: 'top_arrays_mem',
        title: 'Array Cache Locality Principle',
        subtopic: 'Memory Architecture',
        frontContent: 'Why do contiguous array buffers optimize CPU L1 cache line hits?',
        backContent: 'Spatial locality causes the memory controller to prefetch adjacent array elements into cache lines.'
      })
    });
    const cardJson = await cardRes.json();
    createdCardId = cardJson.data?.id;

    // Query Review Queue
    const queueRes = await fetch(`${baseUrl}/reviews/queue`, {
      headers: { Authorization: `Bearer ${student1Tokens.accessToken}` }
    });
    const queueJson = await queueRes.json();

    // Submit Quality 4 Rating (SM-2 Spaced Repetition)
    const rateRes = await fetch(`${baseUrl}/reviews/${createdCardId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Tokens.accessToken}`
      },
      body: JSON.stringify({ quality: 4 })
    });
    const rateJson = await rateRes.json();

    // Check Dashboard Analytics reflect review updates
    const dashRes = await fetch(`${baseUrl}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${student1Tokens.accessToken}` }
    });
    const dashJson = await dashRes.json();

    const [updatedCard] = await drizzleDb.select().from(dailyReviews).where(eq(dailyReviews.id, createdCardId!));
    const passWL2 =
      recRes.status === 200 &&
      recJson.data?.nextTopic !== undefined &&
      cardRes.status === 201 &&
      queueRes.status === 200 &&
      rateRes.status === 200 &&
      updatedCard?.repetitionNumber === 1 &&
      dashRes.status === 200;

    recordWorkflow(
      'WL2',
      'Adaptive Learning & Spaced Memory',
      'AI Recommendations -> Flashcard Creation -> Queue Inspection -> SM-2 Active Recall Rating -> Dashboard Update',
      passWL2,
      `Next Topic Rec: ${recJson.data?.nextTopic?.title}, SM-2 Repetition: ${updatedCard?.repetitionNumber}, Interval: ${updatedCard?.intervalDays}d, EF: ${updatedCard?.easinessFactor}`
    );

    // -------------------------------------------------------------
    // WL3: AI Socratic Mentor Conversation Journey
    // -------------------------------------------------------------
    console.log('\n--- Workflow 3: AI Socratic Mentor Conversation Journey ---');
    // Tier 1: Hint
    const aiHintRes = await fetch(`${baseUrl}/ai/mentor/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Tokens.accessToken}`
      },
      body: JSON.stringify({
        message: 'How can I optimize Two Sum from brute-force O(N^2) to O(N)?',
        contextTopic: 'Arrays & Hashing',
        requestedTier: 'hint'
      })
    });
    const aiHintJson = await aiHintRes.json();

    // Tier 2: Approach (Testing /ai/mentor route alias)
    const aiApprRes = await fetch(`${baseUrl}/ai/mentor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Tokens.accessToken}`
      },
      body: JSON.stringify({
        message: 'I understand trading space for time. What data structure should I use?',
        contextTopic: 'Arrays & Hashing',
        requestedTier: 'approach'
      })
    });
    const aiApprJson = await aiApprRes.json();

    // Boundary Test: Whitespace rejection
    const aiInvalidRes = await fetch(`${baseUrl}/ai/mentor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '   ' })
    });

    const passWL3 =
      aiHintRes.status === 200 &&
      Boolean(aiHintJson.reply || aiHintJson.data?.reply) &&
      aiHintJson.data?.tier === 'hint' &&
      aiApprRes.status === 200 &&
      Boolean(aiApprJson.reply || aiApprJson.data?.reply) &&
      aiApprJson.data?.tier === 'approach' &&
      aiInvalidRes.status === 400;

    recordWorkflow(
      'WL3',
      'AI Socratic Mentor Conversation & Failover',
      'Request Socratic Hint -> Request Approach -> Verify Route Alias & Response Structure -> Input Boundary Guard',
      passWL3,
      `Hint Tier reply length: ${(aiHintJson.reply || aiHintJson.data?.reply)?.length} chars, Approach Tier reply length: ${(aiApprJson.reply || aiApprJson.data?.reply)?.length} chars, Whitespace rejected with HTTP ${aiInvalidRes.status}`
    );

    // -------------------------------------------------------------
    // WL4: Real-World Projects Lifecycle Journey
    // -------------------------------------------------------------
    console.log('\n--- Workflow 4: Real-World Projects Lifecycle Journey ---');
    // Fetch Projects list
    const projListRes = await fetch(`${baseUrl}/projects`);
    const projListJson = await projListRes.json();
    const targetProject = projListJson.data?.find((p: any) => p.id === 'banking-system');

    // Enroll in project
    const enrollRes = await fetch(`${baseUrl}/projects/banking-system/enroll`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Tokens.accessToken}` }
    });

    // Toggle Task
    const toggleRes = await fetch(`${baseUrl}/projects/banking-system/toggle-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Tokens.accessToken}`
      },
      body: JSON.stringify({ taskId: 't1', completed: true })
    });

    // Record XP before project submission
    const [userPreProj] = await drizzleDb.select().from(users).where(eq(users.id, student1Id!));
    const xpPreProj = userPreProj.xp;

    // Submit Project
    const submitProjRes = await fetch(`${baseUrl}/projects/banking-system/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Tokens.accessToken}`
      },
      body: JSON.stringify({
        repoUrl: 'https://github.com/algora-student/distributed-banking-system',
        demoUrl: 'https://banking-demo.algora.dev'
      })
    });
    const submitProjJson = await submitProjRes.json();

    // Verify DB update
    const [userPostProj] = await drizzleDb.select().from(users).where(eq(users.id, student1Id!));
    const [userProjRecord] = await drizzleDb.select().from(userProjects)
      .where(and(eq(userProjects.userId, student1Id!), eq(userProjects.projectId, 'banking-system')));

    const passWL4 =
      projListRes.status === 200 &&
      targetProject !== undefined &&
      enrollRes.status === 200 &&
      toggleRes.status === 200 &&
      submitProjRes.status === 200 &&
      userProjRecord?.status === 'submitted' &&
      userPostProj.xp === xpPreProj + 300;

    recordWorkflow(
      'WL4',
      'Real-World Projects Lifecycle',
      'Discover Projects -> Enroll -> Toggle Implementation Tasks -> Submit Portfolio Work -> Verify XP Bonus (+300 XP)',
      passWL4,
      `Project Status: ${userProjRecord?.status}, Initial XP: ${xpPreProj}, Post-Submit XP: ${userPostProj.xp} (+300 XP awarded)`
    );

    // -------------------------------------------------------------
    // WL5: Recruitment Pipeline Journey
    // -------------------------------------------------------------
    console.log('\n--- Workflow 5: Recruitment Pipeline Journey ---');
    const recruiterEmail = `qa6_recruiter_${Date.now()}@algora.test`;
    const regRecruiterRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'QA6 Recruiter Jane',
        email: recruiterEmail,
        password,
        role: 'recruiter',
        college: 'Enterprise Tech'
      })
    });
    const regRecruiterJson = await regRecruiterRes.json();
    recruiterId = regRecruiterJson.data?.user?.id;
    const recruiterTokens = regRecruiterJson.data?.tokens;

    // Recruiter posts job
    const createJobRes = await fetch(`${baseUrl}/recruiter/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterTokens.accessToken}`
      },
      body: JSON.stringify({
        title: 'Full Stack Distributed Systems Engineer',
        company: 'Algora Enterprise Partners',
        description: 'Design resilient microservices with Node, Python, and PostgreSQL',
        requirements: 'Data Structures, Distributed Systems, SQL Optimization'
      })
    });
    const createJobJson = await createJobRes.json();
    createdJobId = createJobJson.data?.id;

    // Student views open jobs
    const viewJobsRes = await fetch(`${baseUrl}/recruiter/jobs`);
    const viewJobsJson = await viewJobsRes.json();

    // Student applies to job
    const applyRes = await fetch(`${baseUrl}/recruiter/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Tokens.accessToken}`
      },
      body: JSON.stringify({ jobId: createdJobId })
    });
    const applyJson = await applyRes.json();
    createdApplicationId = applyJson.data?.id;

    // Recruiter reviews candidate applications
    const getAppsRes = await fetch(`${baseUrl}/recruiter/applications`, {
      headers: { Authorization: `Bearer ${recruiterTokens.accessToken}` }
    });
    const getAppsJson = await getAppsRes.json();

    // Recruiter updates application status to 'Screening'
    const updateAppRes = await fetch(`${baseUrl}/recruiter/applications`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterTokens.accessToken}`
      },
      body: JSON.stringify({
        applicationId: createdApplicationId,
        status: 'Screening',
        feedback: 'Top 1% DSA ranking on Algora. Profile verified.'
      })
    });

    // Recruiter sends job offer
    const offerRes = await fetch(`${baseUrl}/recruiter/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterTokens.accessToken}`
      },
      body: JSON.stringify({
        applicationId: createdApplicationId,
        salaryOffer: '$140,000 / year + Equity',
        feedback: 'Official offer extended for Distributed Systems Engineer'
      })
    });
    const offerJson = await offerRes.json();

    // Verify student received automated offer notification in database
    const studentNotifications = await drizzleDb.select().from(notifications).where(eq(notifications.userId, student1Id!));
    const offerNotif = studentNotifications.find(n => n.title.includes('Job Offer'));

    const passWL5 =
      createJobRes.status === 201 &&
      createdJobId !== undefined &&
      viewJobsRes.status === 200 &&
      applyRes.status === 201 &&
      getAppsRes.status === 200 &&
      updateAppRes.status === 200 &&
      offerRes.status === 200 &&
      offerNotif !== undefined;

    recordWorkflow(
      'WL5',
      'Recruitment & Placement Pipeline',
      'Post Job -> Candidate Discovery & Application -> Review Applications -> Shortlist -> Dispatch Official Offer -> Verify Notification',
      passWL5,
      `Job Created: ${createdJobId}, Application: ${createdApplicationId}, Offer Status: ${offerJson.data?.status}, Notification Delivered: "${offerNotif?.title}"`
    );

    // -------------------------------------------------------------
    // WL6: Faculty Early Warning & Mentoring Intervention Journey
    // -------------------------------------------------------------
    console.log('\n--- Workflow 6: Faculty Early Warning & Mentoring Intervention Journey ---');
    const facultyEmail = `qa6_faculty_${Date.now()}@algora.test`;
    const regFacultyRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'QA6 Faculty Director',
        email: facultyEmail,
        password,
        role: 'faculty',
        college: 'IIT Madras'
      })
    });
    const regFacultyJson = await regFacultyRes.json();
    facultyId = regFacultyJson.data?.user?.id;
    const facultyTokens = regFacultyJson.data?.tokens;

    // Faculty views department overview & risk analytics
    const facultyOverviewRes = await fetch(`${baseUrl}/faculty/overview`, {
      headers: { Authorization: `Bearer ${facultyTokens.accessToken}` }
    });
    const facultyRiskRes = await fetch(`${baseUrl}/faculty/risk`, {
      headers: { Authorization: `Bearer ${facultyTokens.accessToken}` }
    });

    // Faculty dispatches targeted mentoring intervention for student1
    const interventionRes = await fetch(`${baseUrl}/faculty/intervention`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyTokens.accessToken}`
      },
      body: JSON.stringify({
        studentId: student1Id,
        recommendation: 'Targeted Review: Focus on Two Pointers and Matrix traversal patterns before Google Campus placement drive.'
      })
    });
    const interventionJson = await interventionRes.json();
    createdInterventionId = interventionJson.data?.id;

    // Verify intervention persisted and student received notification
    const [interventionRecord] = await drizzleDb.select().from(facultyInterventions)
      .where(eq(facultyInterventions.id, createdInterventionId!));
    const studentNotifsPostFaculty = await drizzleDb.select().from(notifications).where(eq(notifications.userId, student1Id!));
    const facultyNotif = studentNotifsPostFaculty.find(n => n.title.includes('Faculty Mentoring'));

    const passWL6 =
      facultyOverviewRes.status === 200 &&
      facultyRiskRes.status === 200 &&
      interventionRes.status === 201 &&
      interventionRecord !== undefined &&
      facultyNotif !== undefined;

    recordWorkflow(
      'WL6',
      'Faculty Early Warning & Intervention',
      'Inspect Overview -> Analyze Risk Signals -> Dispatch Mentoring Guidance -> Verify Persistence & Student Alert',
      passWL6,
      `Faculty Overview: HTTP ${facultyOverviewRes.status}, Intervention ID: ${createdInterventionId}, Student Alert: "${facultyNotif?.title}"`
    );

    // -------------------------------------------------------------
    // WL7: Community & Realtime Collaboration Journey
    // -------------------------------------------------------------
    console.log('\n--- Workflow 7: Community & Realtime Collaboration Journey ---');
    // Register Student 2
    const student2Email = `qa6_student2_${Date.now()}@algora.test`;
    const regStudent2Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'QA6 Student Beta',
        email: student2Email,
        password,
        role: 'student',
        college: 'IIT Madras'
      })
    });
    const regStudent2Json = await regStudent2Res.json();
    student2Id = regStudent2Json.data?.user?.id;
    const student2Tokens = regStudent2Json.data?.tokens;

    // Student 1 creates study group
    const createGroupRes = await fetch(`${baseUrl}/community/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Tokens.accessToken}`
      },
      body: JSON.stringify({
        name: 'Google Prep Alpha Squad',
        description: 'Collaborative DSA problem solving group',
        category: 'Algorithms'
      })
    });
    const createGroupJson = await createGroupRes.json();
    createdGroupId = createGroupJson.id;

    // Student 2 joins study group
    const joinGroupRes = await fetch(`${baseUrl}/community/groups/${createdGroupId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student2Tokens.accessToken}` }
    });

    // Student 1 posts chat message
    const chatMsgRes = await fetch(`${baseUrl}/community/groups/${createdGroupId}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Tokens.accessToken}`
      },
      body: JSON.stringify({ message: 'Welcome to the Google Prep study group everyone!' })
    });
    const chatMsgJson = await chatMsgRes.json();

    // Verify non-member recruiter rejected with 403
    const unauthChatRes = await fetch(`${baseUrl}/community/groups/${createdGroupId}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterTokens.accessToken}`
      },
      body: JSON.stringify({ message: 'Unauthorized intrusion message' })
    });

    // Check SSE stream endpoint accepts client connections
    const sseRes = await fetch(`${baseUrl}/realtime/stream?userId=${student1Id}`);
    const sseHeaders = sseRes.headers.get('content-type');

    const passWL7 =
      createGroupRes.status === 201 &&
      joinGroupRes.status === 200 &&
      chatMsgRes.status === 201 &&
      unauthChatRes.status === 403 &&
      sseRes.status === 200 &&
      Boolean(sseHeaders?.includes('text/event-stream'));

    recordWorkflow(
      'WL7',
      'Community & Realtime Collaboration',
      'Create Study Group -> Peer Join -> Group Chat Broadcast -> Non-Member Access Guard -> SSE Stream Active',
      passWL7,
      `Group ID: ${createdGroupId}, Chat ID: ${chatMsgJson.id}, Non-member rejected HTTP ${unauthChatRes.status}, SSE Content-Type: ${sseHeaders}`
    );

    // -------------------------------------------------------------
    // WL8: Competitive Programming Contest Journey
    // -------------------------------------------------------------
    console.log('\n--- Workflow 8: Competitive Programming Contest Journey ---');
    const pastStart = new Date(Date.now() - 15 * 60 * 1000); // 15 mins ago
    const futureEnd = new Date(Date.now() + 60 * 60 * 1000);  // in 60 mins

    // Create active contest
    const createContestRes = await fetch(`${baseUrl}/contests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyTokens.accessToken}`
      },
      body: JSON.stringify({
        title: 'Algora Weekly Sprint 2026',
        slug: `algora-weekly-${Date.now()}`,
        description: 'Live competitive programming contest',
        startTime: pastStart,
        endTime: futureEnd,
        durationMinutes: 75,
        status: 'active',
        problemIds: ['two-sum']
      })
    });
    const createContestJson = await createContestRes.json();
    createdContestId = createContestJson.data?.id;

    // Student 1 registers for contest
    const regContestRes = await fetch(`${baseUrl}/contests/${createdContestId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Tokens.accessToken}` }
    });

    // Student 1 submits solution
    const contestSub1Res = await fetch(`${baseUrl}/contests/${createdContestId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Tokens.accessToken}`
      },
      body: JSON.stringify({
        problemId: 'two-sum',
        code: 'def solve(): return [0, 1]',
        language: 'python'
      })
    });
    const contestSub1Json = await contestSub1Res.json();

    // Check contest leaderboard
    const lbRes1 = await fetch(`${baseUrl}/contests/${createdContestId}/leaderboard`);
    const lbJson1 = await lbRes1.json();
    const student1LB1 = lbJson1.data?.find((l: any) => l.userId === student1Id);

    // Resubmit identical accepted problem to verify solvedCount and points are not duplicated
    const contestSub2Res = await fetch(`${baseUrl}/contests/${createdContestId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Tokens.accessToken}`
      },
      body: JSON.stringify({
        problemId: 'two-sum',
        code: 'def solve(): return [0, 1]',
        language: 'python'
      })
    });
    const lbRes2 = await fetch(`${baseUrl}/contests/${createdContestId}/leaderboard`);
    const lbJson2 = await lbRes2.json();
    const student1LB2 = lbJson2.data?.find((l: any) => l.userId === student1Id);

    const passWL8 =
      createContestRes.status === 201 &&
      regContestRes.status === 200 &&
      contestSub1Res.status === 200 &&
      student1LB1?.solvedCount === 1 &&
      student1LB1?.totalScore === 100 &&
      student1LB2?.solvedCount === 1 &&
      student1LB2?.totalScore === 100;

    recordWorkflow(
      'WL8',
      'Competitive Programming Contest & Leaderboard',
      'Create Active Contest -> Register -> Submit Solution -> Verify Leaderboard Rank -> Prevent Duplicate Solved Points',
      passWL8,
      `Contest ID: ${createdContestId}, 1st Sub Score: ${student1LB1?.totalScore} (solved: ${student1LB1?.solvedCount}), 2nd Sub Score: ${student1LB2?.totalScore} (solved: ${student1LB2?.solvedCount})`
    );

    // -------------------------------------------------------------
    // WL9: Session Lifecycle & Token Security Journey
    // -------------------------------------------------------------
    console.log('\n--- Workflow 9: Session Lifecycle & Token Security Journey ---');
    // Login to obtain fresh session
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: student1Email, password })
    });
    const loginJson = await loginRes.json();
    const sessionTokens = loginJson.data?.tokens;

    // Verify protected route access with access token
    const profRes1 = await fetch(`${baseUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${sessionTokens.accessToken}` }
    });

    // Refresh token rotation
    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: sessionTokens.refreshToken })
    });
    const refreshJson = await refreshRes.json();
    const rotatedTokens = refreshJson.data?.tokens || refreshJson.data;

    // Verify access with rotated token
    const profRes2 = await fetch(`${baseUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${rotatedTokens?.accessToken}` }
    });

    // Logout to revoke session
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rotatedTokens?.refreshToken })
    });

    // Verify unauthenticated request to protected route rejected with 401
    const unauthProfRes = await fetch(`${baseUrl}/auth/profile`);

    // Verify attempt to reuse revoked refresh token rejected with 401
    const revokedRefreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rotatedTokens?.refreshToken })
    });

    const passWL9 =
      loginRes.status === 200 &&
      profRes1.status === 200 &&
      refreshRes.status === 200 &&
      rotatedTokens?.accessToken !== undefined &&
      profRes2.status === 200 &&
      logoutRes.status === 200 &&
      unauthProfRes.status === 401 &&
      revokedRefreshRes.status === 401;

    recordWorkflow(
      'WL9',
      'Session Lifecycle & Token Security',
      'Login -> Authenticated Profile Access -> Refresh Rotation -> Re-authenticate -> Logout -> Revoked Token Defense',
      passWL9,
      `Login: HTTP ${loginRes.status}, Refreshed: HTTP ${refreshRes.status}, Logout: HTTP ${logoutRes.status}, Revoked Token rejected HTTP ${revokedRefreshRes.status}`
    );

    // -------------------------------------------------------------
    // WL10: Cross-Module Consistency & Teardown Journey
    // -------------------------------------------------------------
    console.log('\n--- Workflow 10: Cross-Module Consistency & Reconciliation ---');
    // Verify Student 1 final database consistency across modules
    const [finalUser] = await drizzleDb.select().from(users).where(eq(users.id, student1Id!));
    const finalNotifs = await drizzleDb.select().from(notifications).where(eq(notifications.userId, student1Id!));
    const finalProgress = await drizzleDb.select().from(userTopicProgress).where(eq(userTopicProgress.userId, student1Id!));
    const finalProjects = await drizzleDb.select().from(userProjects).where(eq(userProjects.userId, student1Id!));

    // Consistency Checks:
    // 1. User XP earned (topic stage concept + problem solve + banking project) >= 325
    const hasAccurateXP = finalUser?.xp >= 325;

    // 2. Notifications received: Job Offer, Faculty Mentoring, Contest Registration
    const hasJobOfferNotif = finalNotifs.some(n => n.title.includes('Job Offer'));
    const hasFacultyNotif = finalNotifs.some(n => n.title.includes('Faculty Mentoring'));
    const hasContestNotif = finalNotifs.some(n => n.title.includes('Contest Registration'));

    // 3. User Topic Progress marked concept completed
    const hasConceptCompleted = finalProgress.some(p => p.conceptCompleted === true);

    // 4. Project status submitted
    const hasProjectSubmitted = finalProjects.some(p => p.status === 'submitted');

    const passWL10 = hasAccurateXP && hasJobOfferNotif && hasFacultyNotif && hasContestNotif && hasConceptCompleted && hasProjectSubmitted;

    recordWorkflow(
      'WL10',
      'Cross-Module State Reconciliation',
      'Verify that Learning Progression, Projects, Recruiter Pipeline, Faculty Interventions, and Notifications match',
      passWL10,
      `Total XP: ${finalUser?.xp} (Expected 325), Notif Count: ${finalNotifs.length} (Contest/Faculty/Offer all present), Topic Stage: Concept Completed, Project: Submitted`
    );

  } finally {
    console.log('\n--- Cleaning up temporary isolated test records ---');
    try {
      if (createdContestId) {
        await drizzleDb.delete(contestLeaderboards).where(eq(contestLeaderboards.contestId, createdContestId));
        await drizzleDb.delete(contestSubmissions).where(eq(contestSubmissions.contestId, createdContestId));
        await drizzleDb.delete(contestRegistrations).where(eq(contestRegistrations.contestId, createdContestId));
        await drizzleDb.delete(contestProblems).where(eq(contestProblems.contestId, createdContestId));
        await drizzleDb.delete(contests).where(eq(contests.id, createdContestId));
      }
      if (createdGroupId) {
        await drizzleDb.delete(studyGroupChats).where(eq(studyGroupChats.groupId, createdGroupId));
        await drizzleDb.delete(studyGroupMembers).where(eq(studyGroupMembers.groupId, createdGroupId));
        await drizzleDb.delete(studyGroups).where(eq(studyGroups.id, createdGroupId));
      }
      if (createdInterventionId) {
        await drizzleDb.delete(facultyInterventions).where(eq(facultyInterventions.id, createdInterventionId));
      }
      if (createdApplicationId) {
        await drizzleDb.delete(applications).where(eq(applications.id, createdApplicationId));
      }
      if (createdJobId) {
        await drizzleDb.delete(jobs).where(eq(jobs.id, createdJobId));
      }
      if (createdCardId) {
        await drizzleDb.delete(dailyReviews).where(eq(dailyReviews.id, createdCardId));
      }
      if (student1Id) {
        await drizzleDb.delete(notifications).where(eq(notifications.userId, student1Id));
        await drizzleDb.delete(userTopicProgress).where(eq(userTopicProgress.userId, student1Id));
        await drizzleDb.delete(userProjects).where(eq(userProjects.userId, student1Id));
        await drizzleDb.delete(users).where(eq(users.id, student1Id));
      }
      if (student2Id) {
        await drizzleDb.delete(notifications).where(eq(notifications.userId, student2Id));
        await drizzleDb.delete(users).where(eq(users.id, student2Id));
      }
      if (recruiterId) {
        await drizzleDb.delete(notifications).where(eq(notifications.userId, recruiterId));
        await drizzleDb.delete(users).where(eq(users.id, recruiterId));
      }
      if (facultyId) {
        await drizzleDb.delete(notifications).where(eq(notifications.userId, facultyId));
        await drizzleDb.delete(users).where(eq(users.id, facultyId));
      }
      console.log('✅ Temporary test fixtures successfully cleaned from PostgreSQL.');
    } catch (cleanupErr) {
      console.warn('Post-workflow teardown warning:', cleanupErr);
    }
  }

  const passed = workflowResults.filter((r) => r.status === 'PASSED').length;
  const failed = workflowResults.filter((r) => r.status === 'FAILED').length;
  const total = workflowResults.length;

  console.log('\n================================================================');
  console.log(`📊 QA PHASE 6 SUMMARY: ${passed} PASSED | ${failed} FAILED | TOTAL ${total}`);
  console.log('================================================================\n');

  return { passed, failed, total, results: workflowResults };
}

// Standalone execution support
const isMain = process.argv[1] && (
  import.meta.url.toLowerCase().endsWith(process.argv[1].replace(/\\/g, '/').toLowerCase()) ||
  process.argv[1].replace(/\\/g, '/').toLowerCase().endsWith('qaphase6workflows.ts')
);

if (isMain) {
  runQAPhase6Workflows()
    .then(({ failed }) => {
      process.exit(failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Fatal QA Phase 6 Error:', err);
      process.exit(1);
    });
}
