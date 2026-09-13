import { Router } from "express";
import { CommunityController } from "../controllers/communityController";

const router = Router();

// Discussions
router.get("/discussions", CommunityController.listDiscussions);
router.post("/discussions", CommunityController.createDiscussion);
router.get("/discussions/:id", CommunityController.getDiscussion);
router.post("/discussions/:id/vote", CommunityController.voteDiscussion);
router.post("/discussions/:id/replies", CommunityController.createReply);
router.post("/discussions/:id/replies/:replyId/accept", CommunityController.acceptAnswer);

// Study Groups
router.get("/study-groups", CommunityController.listStudyGroups);
router.post("/study-groups", CommunityController.createStudyGroup);
router.get("/study-groups/:id", CommunityController.getStudyGroup);
router.post("/study-groups/:id/join", CommunityController.joinStudyGroup);
router.post("/study-groups/:id/messages", CommunityController.sendGroupMessage);

// Team Contests
router.get("/contests/:contestId/teams", CommunityController.listContestTeams);
router.post("/contests/:contestId/teams", CommunityController.createContestTeam);
router.post("/contests/:contestId/teams/join", CommunityController.joinContestTeam);

// Mentorship
router.get("/mentors", CommunityController.listMentors);
router.post("/mentors/request", CommunityController.requestMentorship);
router.get("/mentorship/my", CommunityController.getMyMentorship);
router.post("/mentorship/schedule", CommunityController.scheduleSession);

// Interview Preparation Hub
router.get("/interview/tracks", CommunityController.listInterviewTracks);
router.get("/interview/questions", CommunityController.listInterviewQuestions);
router.post("/interview/mock/submit", CommunityController.submitMockInterview);
router.get("/interview/mock/sessions", CommunityController.listUserMockSessions);

// Public Community Profiles
router.get("/profile/:usernameOrId", CommunityController.getPublicProfile);
router.post("/profile/socials", CommunityController.updateSocials);

// Moderation & Platform Analytics
router.post("/moderation/report", CommunityController.createModerationReport);
router.get("/moderation/reports", CommunityController.listModerationReports);
router.post("/moderation/reports/:id/resolve", CommunityController.resolveModerationReport);
router.post("/moderation/users", CommunityController.moderateUser);
router.get("/analytics/platform", CommunityController.getPlatformAnalytics);

export default router;
