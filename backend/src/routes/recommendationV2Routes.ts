import { Router, Request, Response } from "express";
import { recommendationV2Repo } from "../repositories/recommendationV2Repository";

const router = Router();

router.get("/skill-gaps", (req: Request, res: Response) => {
  const gaps = recommendationV2Repo.getSkillGaps();
  res.json({ success: true, skillGaps: gaps });
});

router.get("/difficulty-predictions", (req: Request, res: Response) => {
  const predictions = recommendationV2Repo.getDifficultyPredictions();
  res.json({ success: true, difficultyPredictions: predictions });
});

router.get("/retention-forecast", (req: Request, res: Response) => {
  const forecast = recommendationV2Repo.getRetentionForecast();
  res.json({ success: true, retentionForecast: forecast });
});

router.get("/personalized-roadmap", (req: Request, res: Response) => {
  const goal = (req.query.goal as string) || "FAANG SDE-2";
  const roadmap = recommendationV2Repo.generatePersonalizedRoadmap(goal);
  res.json({ success: true, roadmap });
});

export default router;
