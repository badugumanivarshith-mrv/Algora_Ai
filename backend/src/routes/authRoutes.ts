import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { authLimiter } from "../middleware/rateLimit";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validateBody([
    { field: "email", required: true, type: "email" },
    { field: "username", required: true, type: "string", minLength: 3, maxLength: 30 },
    { field: "password", required: true, type: "string", minLength: 6 },
  ]),
  AuthController.register
);

router.post(
  "/login",
  authLimiter,
  validateBody([
    { field: "emailOrUsername", required: true, type: "string", minLength: 2 },
    { field: "password", required: true, type: "string", minLength: 1 },
  ]),
  AuthController.login
);

router.post("/refresh", authLimiter, AuthController.refresh);
router.post("/logout", AuthController.logout);

router.post("/forgot-password", authLimiter, AuthController.forgotPassword);
router.post("/reset-password", authLimiter, AuthController.resetPassword);

router.post("/send-verification", requireAuth, AuthController.sendVerification);
router.post("/verify-email", AuthController.verifyEmail);

router.get("/me", requireAuth, AuthController.me);

export default router;
