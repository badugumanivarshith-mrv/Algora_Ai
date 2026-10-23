/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Master API Routes Specification
 */

import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as learningController from '../controllers/learning.controller';
import * as problemsController from '../controllers/problems.controller';
import * as projectsController from '../controllers/projects.controller';
import * as aiController from '../controllers/ai.controller';
import * as reviewController from '../controllers/review.controller';
import * as analyticsController from '../controllers/analytics.controller';
import * as notificationsController from '../controllers/notifications.controller';
import * as contestsController from '../controllers/contests.controller';
import * as interviewsController from '../controllers/interviews.controller';
import * as communityController from '../controllers/community.controller';
import * as facultyController from '../controllers/faculty.controller';
import * as recruiterController from '../controllers/recruiter.controller';
import * as placementsController from '../controllers/placements.controller';
import * as knowledgeGraphController from '../controllers/knowledgeGraph.controller';
import * as careerOSController from '../controllers/careerOS.controller';
import * as marketplaceController from '../controllers/marketplace.controller';
import crypto from 'crypto';
import { realtimeBroadcaster } from '../services/realtimeService';
import { requireAuth, optionalAuth, requireRole } from '../middlewares/auth.middleware';
import { validateBody, validateEmail } from '../middlewares/validation.middleware';
import { authLimiter, aiLimiter, judgeLimiter } from '../middlewares/rateLimit.middleware';

import { getPostgresConnectionStatus, pool } from '../db/db';
import { getEnvAudit } from '../config/index';

export const apiRouter = Router();

// Healthcheck & Operational Probes
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ALGORA Backend API', timestamp: new Date().toISOString() });
});

apiRouter.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

apiRouter.get('/health/ready', (req, res) => {
  const status = getPostgresConnectionStatus();
  if (status.connected) {
    res.status(200).json({
      status: 'ready',
      ready: true,
      database: status,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'unavailable',
      ready: false,
      database: status,
      message: 'Primary database connection offline. Service not ready to handle production traffic.',
      timestamp: new Date().toISOString()
    });
  }
});

apiRouter.get('/health/env', (req, res) => {
  res.json(getEnvAudit());
});

apiRouter.get('/health/db', (req, res) => {
  const status = getPostgresConnectionStatus();
  res.json({
    status: status.connected ? 'healthy' : 'fallback',
    connection: status,
    databaseName: 'neondb',
    timestamp: new Date().toISOString()
  });
});

apiRouter.get('/health/metrics', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    memory: {
      rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
      heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      externalMb: Math.round((mem.external / 1024 / 1024) * 100) / 100,
    },
    database: {
      totalClients: pool.totalCount,
      idleClients: pool.idleCount,
      waitingClients: pool.waitingCount,
    },
    realtime: {
      activeSSEConnections: realtimeBroadcaster.getConnectedClientsCount(),
    },
    timestamp: new Date().toISOString()
  });
});

// 1. Authentication Routes
apiRouter.post('/auth/register', authLimiter.middleware(), validateBody(['name', 'email', 'password']), validateEmail, authController.register);
apiRouter.post('/auth/login', authLimiter.middleware(), validateBody(['email', 'password']), validateEmail, authController.login);
apiRouter.post('/auth/refresh', validateBody(['refreshToken']), authController.refreshToken);
apiRouter.post('/auth/logout', authController.logout);
apiRouter.post('/auth/password-reset-request', authLimiter.middleware(), validateEmail, authController.requestPasswordReset);
apiRouter.post('/auth/password-reset', authLimiter.middleware(), validateBody(['resetToken', 'newPassword']), authController.resetPassword);
apiRouter.get('/auth/profile', requireAuth, authController.getProfile);

// 2. Learning Tracks & Progression Routes
apiRouter.get('/learning/tracks', optionalAuth, learningController.getTracks);
apiRouter.get('/learning/tracks/:trackId', optionalAuth, learningController.getTrackById);
apiRouter.get('/learning/topics/:topicId', optionalAuth, learningController.getTopicDetail);
apiRouter.post('/learning/topics/:topicId/stage', requireAuth, learningController.updateTopicStageProgress);

// 3. Problems & Code Execution Routes
apiRouter.get('/problems', optionalAuth, problemsController.getProblems);
apiRouter.get('/problems/:idOrSlug', optionalAuth, problemsController.getProblemById);
apiRouter.get('/problems/:problemId/hints', optionalAuth, problemsController.getProblemHints);
apiRouter.post('/problems/run', judgeLimiter.middleware(), problemsController.runCode);
apiRouter.post('/problems/submit', judgeLimiter.middleware(), optionalAuth, problemsController.submitCode);

// 4. Projects Routes (Beginner, Intermediate, Advanced)
apiRouter.get('/projects', optionalAuth, projectsController.getProjects);
apiRouter.get('/projects/:projectId', optionalAuth, projectsController.getProjectById);
apiRouter.post('/projects/:projectId/enroll', requireAuth, projectsController.enrollProject);
apiRouter.post('/projects/:projectId/tasks/toggle', requireAuth, projectsController.toggleProjectTask);
apiRouter.post('/projects/:projectId/toggle-task', requireAuth, projectsController.toggleProjectTask);
apiRouter.post('/projects/:projectId/submit', requireAuth, projectsController.submitProject);

// 5. AI Mentor & Intelligence Routes
apiRouter.post('/ai/mentor/chat', aiLimiter.middleware(), optionalAuth, aiController.mentorChat);
apiRouter.post('/ai/mentor', aiLimiter.middleware(), optionalAuth, aiController.mentorChat);
apiRouter.get('/ai/analyst/report', optionalAuth, aiController.aiAnalystReport);
apiRouter.get('/ai/planner', requireAuth, aiController.getAIStudyPlan);
apiRouter.post('/ai/planner', aiLimiter.middleware(), requireAuth, aiController.createAIStudyPlan);
apiRouter.get('/ai/recommendations', requireAuth, aiController.getAIRecommendations);

// 6. Daily Review & Spaced Repetition Routes
apiRouter.get('/reviews/queue', optionalAuth, reviewController.getReviewQueue);
apiRouter.post('/reviews/:reviewId/rate', optionalAuth, reviewController.submitReviewRating);
apiRouter.post('/reviews/card', optionalAuth, reviewController.createReviewCard);

// 7. Analytics & Leaderboard Routes
apiRouter.get('/analytics/dashboard', optionalAuth, analyticsController.getDashboardAnalytics);
apiRouter.get('/analytics/faculty', optionalAuth, analyticsController.getFacultyAnalytics);
apiRouter.get('/leaderboard', analyticsController.getLeaderboard);

// 8. Persistent Notifications Routes
apiRouter.get('/notifications', requireAuth, notificationsController.getNotifications);
apiRouter.get('/notifications/unread-count', requireAuth, notificationsController.getUnreadCount);
apiRouter.patch('/notifications/read-all', requireAuth, notificationsController.markAllAsRead);
apiRouter.patch('/notifications/:id/read', requireAuth, notificationsController.markAsRead);
apiRouter.delete('/notifications/:id', requireAuth, notificationsController.deleteNotification);

// 9. Contest System Routes
apiRouter.get('/contests', optionalAuth, contestsController.getContests);
apiRouter.get('/contests/:id', optionalAuth, contestsController.getContestById);
apiRouter.post('/contests', requireAuth, contestsController.createContest);
apiRouter.post('/contests/:id/register', requireAuth, contestsController.registerForContest);
apiRouter.post('/contests/:id/submit', requireAuth, contestsController.submitContestSolution);
apiRouter.get('/contests/:id/leaderboard', optionalAuth, contestsController.getContestLeaderboard);

// 10. Real-time SSE Event Stream Route
apiRouter.get('/realtime/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const clientId = crypto.randomUUID();
  const userId = req.query.userId as string | undefined;
  realtimeBroadcaster.addClient(clientId, res, userId);
});

// 11. AI Interview Coach & Placement Intelligence Routes
apiRouter.post('/interviews/sessions', requireAuth, interviewsController.startInterviewSession);
apiRouter.post('/interviews/sessions/:id/evaluate', requireAuth, interviewsController.evaluateInterviewSession);
apiRouter.get('/interviews/sessions', requireAuth, interviewsController.getInterviewSessions);
apiRouter.get('/interviews/sessions/:id', requireAuth, interviewsController.getInterviewSessionById);
apiRouter.get('/interviews/analytics', requireAuth, interviewsController.getPlacementAnalytics);

// 12. Community, Forums & Peer Learning Collaboration Routes
apiRouter.post('/community/groups', requireAuth, communityController.createStudyGroup);
apiRouter.get('/community/groups', optionalAuth, communityController.getStudyGroups);
apiRouter.post('/community/groups/:groupId/join', requireAuth, communityController.joinStudyGroup);
apiRouter.get('/community/groups/:groupId/chats', optionalAuth, communityController.getStudyGroupChats);
apiRouter.post('/community/groups/:groupId/chats', requireAuth, communityController.postStudyGroupChat);
apiRouter.post('/community/forum', requireAuth, communityController.createForumPost);
apiRouter.get('/community/forum', optionalAuth, communityController.getForumPosts);
apiRouter.get('/community/forum/:postId', optionalAuth, communityController.getForumPostById);
apiRouter.post('/community/forum/:postId/comments', requireAuth, communityController.createForumComment);
apiRouter.post('/community/reviews', requireAuth, communityController.createSolutionReview);
apiRouter.get('/community/reviews', optionalAuth, communityController.getSolutionReviews);
apiRouter.post('/community/reviews/:reviewId/comments', requireAuth, communityController.createSolutionReviewComment);
apiRouter.get('/community/presence', optionalAuth, communityController.getPresenceCount);

// 13. Faculty & Institution Intelligence Routes
apiRouter.get('/faculty/overview', requireAuth, requireRole('faculty', 'admin'), facultyController.getFacultyOverview);
apiRouter.get('/faculty/risk', requireAuth, requireRole('faculty', 'admin'), facultyController.getRiskIntelligence);
apiRouter.post('/faculty/intervention', requireAuth, requireRole('faculty', 'admin'), facultyController.createIntervention);

// 14. Recruiter & Placement Portal Routes
apiRouter.post('/recruiter/jobs', requireAuth, requireRole('recruiter', 'admin'), recruiterController.createJob);
apiRouter.put('/recruiter/jobs/:id', requireAuth, requireRole('recruiter', 'admin'), recruiterController.editJob);
apiRouter.delete('/recruiter/jobs/:id', requireAuth, requireRole('recruiter', 'admin'), recruiterController.deleteJob);
apiRouter.get('/recruiter/jobs', optionalAuth, recruiterController.getJobs);
apiRouter.get('/recruiter/candidates', requireAuth, requireRole('recruiter', 'admin'), recruiterController.getCandidateProfiles);
apiRouter.post('/recruiter/applications', requireAuth, recruiterController.applyToJob);
apiRouter.get('/recruiter/applications', requireAuth, recruiterController.getJobApplications);
apiRouter.patch('/recruiter/applications', requireAuth, requireRole('recruiter', 'admin'), recruiterController.updateApplicationStatus);
apiRouter.post('/recruiter/offers', requireAuth, requireRole('recruiter', 'admin'), recruiterController.sendOffer);

// 15. Enterprise Placements & Drives
apiRouter.post('/placements/drives', requireAuth, requireRole('faculty', 'admin'), placementsController.createPlacementDrive);
apiRouter.get('/placements/drives', optionalAuth, placementsController.getPlacementDrives);
apiRouter.post('/placements/register', requireAuth, placementsController.registerForDrive);
apiRouter.get('/placements/registrations', requireAuth, placementsController.getDriveRegistrations);
apiRouter.post('/placements/interviews', requireAuth, requireRole('faculty', 'recruiter', 'admin'), placementsController.createInterviewRound);
apiRouter.post('/placements/offers', requireAuth, requireRole('faculty', 'recruiter', 'admin'), placementsController.awardOffer);
apiRouter.get('/placements/partnerships', optionalAuth, placementsController.getCompanyPartnerships);
apiRouter.post('/placements/partnerships', requireAuth, requireRole('faculty', 'admin'), placementsController.createCompanyPartnership);

// 16. AI Knowledge Graph & Skill Gap Diagnostic
apiRouter.get('/knowledge/graph', requireAuth, knowledgeGraphController.getKnowledgeGraph);
apiRouter.get('/knowledge/gap', requireAuth, knowledgeGraphController.getSkillGapReport);
apiRouter.post('/knowledge/gap', requireAuth, knowledgeGraphController.triggerSkillGapComputation);

// 17. AI Career Operating System (Phase 19)
apiRouter.get('/career/profile', requireAuth, careerOSController.getCareerProfile);
apiRouter.patch('/career/profile', requireAuth, careerOSController.updateCareerProfile);
apiRouter.get('/career/milestones', requireAuth, careerOSController.getMilestones);
apiRouter.post('/career/milestones', requireAuth, careerOSController.createMilestone);

// 18. Industry Projects Marketplace (Phase 20)
apiRouter.get('/marketplace/projects', requireAuth, marketplaceController.getMarketplaceProjects);
apiRouter.post('/marketplace/projects', requireAuth, requireRole('recruiter', 'faculty', 'admin'), marketplaceController.createMarketplaceProject);
apiRouter.post('/marketplace/apply', requireAuth, marketplaceController.applyToProject);
apiRouter.get('/marketplace/portfolio', requireAuth, marketplaceController.getPortfolios);
apiRouter.post('/marketplace/portfolio', requireAuth, marketplaceController.createPortfolioEntry);
apiRouter.get('/marketplace/certificates', requireAuth, marketplaceController.getCertificates);
apiRouter.post('/marketplace/certificates', requireAuth, requireRole('faculty', 'admin'), marketplaceController.issueCertificate);
apiRouter.get('/marketplace/teams', requireAuth, marketplaceController.getProjectTeams);
apiRouter.post('/marketplace/teams', requireAuth, marketplaceController.createProjectTeam);
apiRouter.get('/marketplace/mentors', requireAuth, marketplaceController.getMentorAssignments);
apiRouter.post('/marketplace/mentors', requireAuth, requireRole('faculty', 'admin'), marketplaceController.assignMentor);


