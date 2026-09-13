import { Request, Response } from "express";
import { DiscussionRepository } from "../repositories/discussionRepository";
import { StudyGroupRepository } from "../repositories/studyGroupRepository";
import { ContestTeamRepository } from "../repositories/contestTeamRepository";
import { MentorshipRepository } from "../repositories/mentorshipRepository";
import { InterviewRepository } from "../repositories/interviewRepository";
import { CommunityProfileRepository } from "../repositories/communityProfileRepository";
import { ModerationRepository } from "../repositories/moderationRepository";
import { PlatformAnalyticsRepository } from "../repositories/platformAnalyticsRepository";
import { AIInterviewService } from "../services/aiInterviewService";
import { WebSocketManager } from "../realtime/wsManager";

export class CommunityController {
  // 1. Discussions
  public static async listDiscussions(req: Request, res: Response): Promise<void> {
    try {
      const { problemSlug, contestId, category, tag, search, sort, limit, offset } = req.query;
      const data = await DiscussionRepository.list({
        problemSlug: problemSlug as string,
        contestId: contestId as string,
        category: category as string,
        tag: tag as string,
        search: search as string,
        sort: sort as any,
        limit: limit ? parseInt(limit as string, 10) : 20,
        offset: offset ? parseInt(offset as string, 10) : 0,
      });
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getDiscussion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const discussion = await DiscussionRepository.findById(id);
      if (!discussion) {
        res.status(404).json({ success: false, error: "Discussion not found" });
        return;
      }
      await DiscussionRepository.incrementViews(id);
      const replies = await DiscussionRepository.listReplies(id);
      res.json({ success: true, discussion, replies });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createDiscussion(req: Request, res: Response): Promise<void> {
    try {
      const { userId = "u-1", authorName = "Arjun Sharma", authorAvatar, problemSlug, contestId, category = "general", title, content, tags = [] } = req.body;
      if (!title || !content) {
        res.status(400).json({ success: false, error: "Title and content are required" });
        return;
      }

      const entity = await DiscussionRepository.create({
        userId,
        authorName,
        authorAvatar,
        problemSlug,
        contestId,
        category,
        title,
        content,
        tags,
      });

      // Log activity
      await CommunityProfileRepository.logActivity({
        userId,
        activityType: "discussion_created",
        title: `Published discussion: ${title}`,
        description: content.substring(0, 100),
        link: `/community`,
      });

      // Real-time broadcast
      WebSocketManager.broadcast("global", "NEW_DISCUSSION", entity);

      res.status(201).json({ success: true, discussion: entity });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async voteDiscussion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId = "u-1", targetType = "discussion", voteType = "up" } = req.body;
      const result = await DiscussionRepository.vote(userId, targetType as any, id, voteType as any);

      // Broadcast vote update
      WebSocketManager.broadcast(`discussion:${id}`, "VOTE_UPDATE", { targetId: id, targetType, ...result });

      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createReply(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId = "u-1", authorName = "Arjun Sharma", authorAvatar, parentReplyId, content, codeSnippet, language } = req.body;
      if (!content) {
        res.status(400).json({ success: false, error: "Content is required" });
        return;
      }

      const reply = await DiscussionRepository.createReply({
        discussionId: id,
        userId,
        authorName,
        authorAvatar,
        parentReplyId,
        content,
        codeSnippet,
        language,
      });

      // Real-time broadcast
      WebSocketManager.broadcast(`discussion:${id}`, "NEW_REPLY", reply);

      res.status(201).json({ success: true, reply });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async acceptAnswer(req: Request, res: Response): Promise<void> {
    try {
      const { id, replyId } = req.params;
      const { userId = "u-1" } = req.body;
      const ok = await DiscussionRepository.acceptAnswer(id, replyId, userId);
      if (!ok) {
        res.status(403).json({ success: false, error: "Only the discussion author can accept answers" });
        return;
      }

      WebSocketManager.broadcast(`discussion:${id}`, "ANSWER_ACCEPTED", { discussionId: id, replyId });
      res.json({ success: true, acceptedReplyId: replyId });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. Study Groups
  public static async listStudyGroups(req: Request, res: Response): Promise<void> {
    try {
      const { search, topic } = req.query;
      const groups = await StudyGroupRepository.list(search as string, topic as string);
      res.json({ success: true, groups });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getStudyGroup(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const group = await StudyGroupRepository.findById(id);
      if (!group) {
        res.status(404).json({ success: false, error: "Study group not found" });
        return;
      }
      const [members, messages, goals] = await Promise.all([
        StudyGroupRepository.getMembers(id),
        StudyGroupRepository.getMessages(id),
        StudyGroupRepository.getGoals(id),
      ]);
      res.json({ success: true, group, members, messages, goals });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createStudyGroup(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, ownerId = "u-1", targetTopic = "General DSA", targetGoal, isPrivate, maxMembers, avatarUrl } = req.body;
      if (!name || !description) {
        res.status(400).json({ success: false, error: "Name and description are required" });
        return;
      }

      const group = await StudyGroupRepository.create({
        name,
        description,
        ownerId,
        targetTopic,
        targetGoal: targetGoal || "Master 50 Hard problems together",
        isPrivate,
        maxMembers,
        avatarUrl,
      });

      WebSocketManager.broadcast("global", "NEW_STUDY_GROUP", group);
      res.status(201).json({ success: true, group });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async joinStudyGroup(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId = "u-1", username = "Arjun Sharma", fullName = "Arjun Sharma", avatarUrl } = req.body;
      const ok = await StudyGroupRepository.join(id, { id: userId, username, fullName, avatarUrl });
      if (!ok) {
        res.status(400).json({ success: false, error: "Unable to join group (group may be full or invalid)" });
        return;
      }

      WebSocketManager.broadcast(`group:${id}`, "MEMBER_JOINED", { groupId: id, userId, username });
      res.json({ success: true, message: "Joined group successfully" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async sendGroupMessage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId = "u-1", username = "Arjun Sharma", avatarUrl, message, messageType = "text", metadata } = req.body;
      if (!message) {
        res.status(400).json({ success: false, error: "Message is required" });
        return;
      }

      const msg = await StudyGroupRepository.addMessage({
        groupId: id,
        userId,
        username,
        avatarUrl,
        message,
        messageType,
        metadata,
      });

      // Broadcast to room
      WebSocketManager.broadcast(`group:${id}`, "GROUP_CHAT_MESSAGE", msg);
      res.status(201).json({ success: true, message: msg });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. Team Contests
  public static async listContestTeams(req: Request, res: Response): Promise<void> {
    try {
      const { contestId } = req.params;
      const teams = await ContestTeamRepository.getContestTeams(contestId);
      res.json({ success: true, teams });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createContestTeam(req: Request, res: Response): Promise<void> {
    try {
      const { contestId } = req.params;
      const { teamName, captainId = "u-1", captainUsername = "Arjun Sharma", maxMembers = 3 } = req.body;
      if (!teamName) {
        res.status(400).json({ success: false, error: "Team name is required" });
        return;
      }

      const team = await ContestTeamRepository.createTeam({
        contestId,
        teamName,
        captainId,
        captainUsername,
        maxMembers,
      });

      WebSocketManager.broadcast(`contest:${contestId}`, "TEAM_REGISTERED", team);
      res.status(201).json({ success: true, team });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async joinContestTeam(req: Request, res: Response): Promise<void> {
    try {
      const { contestId } = req.params;
      const { teamCode, userId = "u-1", username = "Arjun Sharma" } = req.body;
      if (!teamCode) {
        res.status(400).json({ success: false, error: "Team code is required" });
        return;
      }

      const team = await ContestTeamRepository.joinTeamByCode(contestId, teamCode, { id: userId, username });
      if (!team) {
        res.status(400).json({ success: false, error: "Invalid team code or team is full" });
        return;
      }

      WebSocketManager.broadcast(`contest:${contestId}`, "TEAM_MEMBER_JOINED", { teamId: team.id, userId, username });
      res.json({ success: true, team });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 4. Mentorship
  public static async listMentors(req: Request, res: Response): Promise<void> {
    try {
      const { specialty, search } = req.query;
      const mentors = await MentorshipRepository.listMentors(specialty as string, search as string);
      res.json({ success: true, mentors });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async requestMentorship(req: Request, res: Response): Promise<void> {
    try {
      const { mentorId, studentId = "u-1", studentUsername = "Arjun Sharma", message, targetRoleCompany } = req.body;
      if (!mentorId || !message) {
        res.status(400).json({ success: false, error: "Mentor ID and message are required" });
        return;
      }

      const request = await MentorshipRepository.createRequest({
        mentorId,
        studentId,
        studentUsername,
        message,
        targetRoleCompany: targetRoleCompany || "Google SWE L5",
      });

      // Notify mentor
      WebSocketManager.sendToUser(mentorId, "NEW_MENTORSHIP_REQUEST", request);
      res.status(201).json({ success: true, request });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getMyMentorship(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.query.userId as string) || "u-1";
      const [requests, sessions] = await Promise.all([
        MentorshipRepository.getRequestsForUser(userId),
        MentorshipRepository.getSessionsForUser(userId),
      ]);
      res.json({ success: true, requests, sessions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async scheduleSession(req: Request, res: Response): Promise<void> {
    try {
      const { mentorId, studentId = "u-1", title, scheduledAt, durationMinutes } = req.body;
      const session = await MentorshipRepository.createSession({
        mentorId,
        studentId,
        title: title || "Algorithmic & System Design Coaching",
        scheduledAt: scheduledAt || new Date(Date.now() + 86400000 * 2).toISOString(),
        durationMinutes,
      });
      res.status(201).json({ success: true, session });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 5. Interview Preparation Hub
  public static async listInterviewTracks(req: Request, res: Response): Promise<void> {
    try {
      const tracks = await InterviewRepository.listTracks();
      res.json({ success: true, tracks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async listInterviewQuestions(req: Request, res: Response): Promise<void> {
    try {
      const { trackSlug, type } = req.query;
      const questions = await InterviewRepository.listQuestions(trackSlug as string, type as string);
      res.json({ success: true, questions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async submitMockInterview(req: Request, res: Response): Promise<void> {
    try {
      const { userId = "u-1", trackSlug = "google-swe", interviewType = "coding", companyTarget = "Google SWE L4", questionTitle, questionPrompt, userResponse, codeSnippet, durationSeconds = 1800 } = req.body;

      // Evaluate via AI
      const evaluation = await AIInterviewService.evaluateMockInterview({
        trackSlug,
        interviewType,
        companyTarget,
        questionTitle: questionTitle || "Technical Round Assessment",
        questionPrompt: questionPrompt || "",
        userResponse: userResponse || "",
        codeSnippet,
      });

      const session = await InterviewRepository.saveMockSession({
        id: `mock-${Date.now()}`,
        userId,
        trackSlug,
        interviewType: interviewType as any,
        companyTarget,
        status: "completed",
        score: evaluation.score,
        durationSeconds,
        transcript: [
          { role: "ai", content: `Question: ${questionTitle}\n${questionPrompt}`, timestamp: new Date(Date.now() - durationSeconds * 1000).toISOString() },
          { role: "user", content: userResponse, timestamp: new Date().toISOString() },
        ],
        aiFeedback: {
          summary: evaluation.summary,
          readinessRating: evaluation.readinessRating,
          breakdown: evaluation.breakdown,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
        },
        createdAt: new Date().toISOString(),
      });

      // Log activity
      await CommunityProfileRepository.logActivity({
        userId,
        activityType: "mock_interview",
        title: `Completed ${companyTarget} Mock Interview`,
        description: `Scored ${evaluation.score}/100 (${evaluation.readinessRating})`,
        link: `/interview-hub`,
      });

      res.status(201).json({ success: true, session });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async listUserMockSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.query.userId as string) || "u-1";
      const sessions = await InterviewRepository.listUserMockSessions(userId);
      res.json({ success: true, sessions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 6. Community Profiles & Activity
  public static async getPublicProfile(req: Request, res: Response): Promise<void> {
    try {
      const { usernameOrId } = req.params;
      const userId = usernameOrId.startsWith("u-") ? usernameOrId : "u-1";
      const [reputation, timeline] = await Promise.all([
        CommunityProfileRepository.getReputation(userId),
        CommunityProfileRepository.getActivityTimeline(userId),
      ]);
      res.json({
        success: true,
        profile: {
          userId,
          username: "Arjun Sharma",
          handle: "@arjun_codes",
          headline: "Competitive Programmer & Senior SWE Candidate",
          institution: "IIT Delhi / Algora Academy",
          avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=arjun",
          level: 12,
          xp: 4820,
          eloRating: 1845,
          problemsSolved: 142,
          streakDays: 24,
          ...reputation,
          timeline,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async updateSocials(req: Request, res: Response): Promise<void> {
    try {
      const { userId = "u-1", links } = req.body;
      const reputation = await CommunityProfileRepository.updateSocialLinks(userId, links);
      res.json({ success: true, reputation });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 7. Admin Moderation & Community Analytics
  public static async createModerationReport(req: Request, res: Response): Promise<void> {
    try {
      const { reporterId = "u-1", reporterUsername = "Arjun Sharma", targetType, targetId, targetTitle, reason, details } = req.body;
      if (!targetType || !targetId || !reason) {
        res.status(400).json({ success: false, error: "Target type, ID, and reason are required" });
        return;
      }

      const report = await ModerationRepository.createReport({
        reporterId,
        reporterUsername,
        targetType,
        targetId,
        targetTitle: targetTitle || "Reported item",
        reason,
        details,
      });

      res.status(201).json({ success: true, report });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async listModerationReports(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      const reports = await ModerationRepository.listReports(status as string);
      res.json({ success: true, reports });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async resolveModerationReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { moderatorId = "admin-1", action = "Resolved by moderator", status = "resolved" } = req.body;
      const report = await ModerationRepository.resolveReport(id, moderatorId, action, status as any);
      res.json({ success: true, report });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async moderateUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId, username, restrictionType, reason, expiresAt, issuedBy = "admin-1" } = req.body;
      const entry = await ModerationRepository.moderateUser({
        userId,
        username: username || "User",
        restrictionType,
        reason,
        expiresAt,
        issuedBy,
      });
      res.status(201).json({ success: true, moderation: entry });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getPlatformAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 14;
      const [daily, overview] = await Promise.all([
        PlatformAnalyticsRepository.getDailyMetrics(days),
        PlatformAnalyticsRepository.getOverviewSummary(),
      ]);
      res.json({ success: true, daily, overview });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
