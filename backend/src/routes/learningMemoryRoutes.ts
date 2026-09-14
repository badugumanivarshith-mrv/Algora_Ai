import { Router } from "express";
import { LearningMemoryController } from "../controllers/learningMemoryController";
import rateLimit from "express-rate-limit";

const memoryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: { success: false, error: "Too many memory system requests, please try again later." },
});

export const learningMemoryRoutes = Router();

learningMemoryRoutes.get("/overview", memoryLimiter, LearningMemoryController.getMemoryOverview);
learningMemoryRoutes.get("/retention", memoryLimiter, LearningMemoryController.getRetentionOverview);
learningMemoryRoutes.get("/daily-reviews", memoryLimiter, LearningMemoryController.getDailyReviews);
learningMemoryRoutes.post("/daily-reviews/complete", memoryLimiter, LearningMemoryController.completeReview);
learningMemoryRoutes.get("/daily-report", memoryLimiter, LearningMemoryController.getDailyReport);
learningMemoryRoutes.get("/streak", memoryLimiter, LearningMemoryController.getStreak);
learningMemoryRoutes.post("/flashcards/generate", memoryLimiter, LearningMemoryController.generateFlashcards);
learningMemoryRoutes.get("/flashcards", memoryLimiter, LearningMemoryController.getFlashcards);
learningMemoryRoutes.post("/revision-notes/generate", memoryLimiter, LearningMemoryController.generateRevisionNotes);
learningMemoryRoutes.get("/revision-notes", memoryLimiter, LearningMemoryController.getRevisionNotes);
learningMemoryRoutes.post("/quick-quiz/generate", memoryLimiter, LearningMemoryController.generateQuickQuiz);
