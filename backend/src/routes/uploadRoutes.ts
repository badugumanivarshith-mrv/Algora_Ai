import { Router } from "express";
import multer from "multer";
import { UploadController } from "../controllers/uploadController";
import { optionalAuthMiddleware, requireAuth } from "../middleware/auth";
import { uploadLimiter } from "../middleware/rateLimit";

const router = Router();

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max file size
  },
});

router.post("/", uploadLimiter, optionalAuthMiddleware, upload.single("file"), UploadController.uploadFile);
router.get("/", UploadController.listFiles);
router.get("/:id", UploadController.getFile);
router.delete("/:id", requireAuth, UploadController.deleteFile);

export default router;
