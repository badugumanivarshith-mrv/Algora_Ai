import { Router } from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import submissionRoutes from "./submissionRoutes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "healthy",
      service: "Algora API Backend",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/submissions", submissionRoutes);

export default router;
