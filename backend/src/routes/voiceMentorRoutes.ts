import { Router } from "express";
import { VoiceMentorController } from "../controllers/voiceMentorController";
import rateLimit from "express-rate-limit";

const voiceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { success: false, error: "Too many voice requests, please try again later." },
});

export const voiceMentorRoutes = Router();

voiceMentorRoutes.post("/session/start", voiceLimiter, VoiceMentorController.startSession);
voiceMentorRoutes.post("/session/end", voiceLimiter, VoiceMentorController.endSession);
voiceMentorRoutes.get("/session/:id", voiceLimiter, VoiceMentorController.getSession);

voiceMentorRoutes.post("/chat", voiceLimiter, VoiceMentorController.voiceChat);
voiceMentorRoutes.post("/learn", voiceLimiter, VoiceMentorController.learnTopic);
voiceMentorRoutes.post("/code-help", voiceLimiter, VoiceMentorController.codeHelp);
voiceMentorRoutes.post("/company-prep", voiceLimiter, VoiceMentorController.companyPrep);

voiceMentorRoutes.post("/interview/start", voiceLimiter, VoiceMentorController.startInterview);
voiceMentorRoutes.post("/interview/answer", voiceLimiter, VoiceMentorController.answerInterview);
voiceMentorRoutes.post("/interview/end", voiceLimiter, VoiceMentorController.endInterview);

voiceMentorRoutes.post("/quiz/start", voiceLimiter, VoiceMentorController.startQuiz);
voiceMentorRoutes.post("/quiz/answer", voiceLimiter, VoiceMentorController.answerQuiz);

voiceMentorRoutes.get("/review", voiceLimiter, VoiceMentorController.getReview);
voiceMentorRoutes.get("/analytics", voiceLimiter, VoiceMentorController.getAnalytics);
