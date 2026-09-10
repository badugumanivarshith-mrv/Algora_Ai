import { Router } from "express";
import { UserController } from "../controllers/userController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

const router = Router();

router.get("/profile", requireAuth, UserController.getProfile);

router.put(
  "/profile",
  requireAuth,
  validateBody([
    { field: "fullName", type: "string", maxLength: 100 },
    { field: "bio", type: "string", maxLength: 500 },
    { field: "institution", type: "string", maxLength: 120 },
    { field: "githubHandle", type: "string", maxLength: 50 },
    { field: "preferredLanguage", type: "string" },
  ]),
  UserController.updateProfile
);

export default router;
