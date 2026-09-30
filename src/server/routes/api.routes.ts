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
import { requireAuth, optionalAuth, requireRole } from '../middlewares/auth.middleware';
import { validateBody, validateEmail } from '../middlewares/validation.middleware';

export const apiRouter = Router();

// Healthcheck
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ALGORA Backend API', timestamp: new Date().toISOString() });
});

// 1. Authentication Routes
apiRouter.post('/auth/register', validateBody(['name', 'email', 'password']), validateEmail, authController.register);
apiRouter.post('/auth/login', validateBody(['email', 'password']), validateEmail, authController.login);
apiRouter.post('/auth/refresh', validateBody(['refreshToken']), authController.refreshToken);
apiRouter.post('/auth/logout', authController.logout);
apiRouter.post('/auth/password-reset-request', validateEmail, authController.requestPasswordReset);
apiRouter.post('/auth/password-reset', validateBody(['resetToken', 'newPassword']), authController.resetPassword);
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
apiRouter.post('/problems/run', problemsController.runCode);
apiRouter.post('/problems/submit', optionalAuth, problemsController.submitCode);

// 4. Projects Routes (Beginner, Intermediate, Advanced)
apiRouter.get('/projects', optionalAuth, projectsController.getProjects);
apiRouter.get('/projects/:projectId', optionalAuth, projectsController.getProjectById);
apiRouter.post('/projects/:projectId/enroll', requireAuth, projectsController.enrollProject);
apiRouter.post('/projects/:projectId/tasks/toggle', requireAuth, projectsController.toggleProjectTask);
apiRouter.post('/projects/:projectId/submit', requireAuth, projectsController.submitProject);

// 5. AI Mentor & Intelligence Routes
apiRouter.post('/ai/mentor/chat', optionalAuth, aiController.mentorChat);
apiRouter.get('/ai/analyst/report', optionalAuth, aiController.aiAnalystReport);

// 6. Daily Review & Spaced Repetition Routes
apiRouter.get('/reviews/queue', optionalAuth, reviewController.getReviewQueue);
apiRouter.post('/reviews/:reviewId/rate', optionalAuth, reviewController.submitReviewRating);
apiRouter.post('/reviews/card', optionalAuth, reviewController.createReviewCard);

// 7. Analytics & Leaderboard Routes
apiRouter.get('/analytics/dashboard', optionalAuth, analyticsController.getDashboardAnalytics);
apiRouter.get('/analytics/faculty', optionalAuth, analyticsController.getFacultyAnalytics);
apiRouter.get('/leaderboard', analyticsController.getLeaderboard);
