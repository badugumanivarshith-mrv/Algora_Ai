import { Router } from "express";
import { GamificationController } from "../controllers/gamificationController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/profile", optionalAuth, GamificationController.getGamificationProfile);
router.get("/rating-history", optionalAuth, GamificationController.getRatingHistory);
router.get("/xp-history", optionalAuth, GamificationController.getXPHistory);
router.get("/achievements", optionalAuth, GamificationController.getAchievements);
router.post("/award-xp", optionalAuth, GamificationController.awardXP);
router.post("/check-achievements", optionalAuth, GamificationController.checkAchievements);

export default router;
