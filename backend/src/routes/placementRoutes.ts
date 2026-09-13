import { Router, Request, Response } from "express";
import { placementRepo } from "../repositories/placementRepository";

const router = Router();

router.get("/companies", (req: Request, res: Response) => {
  const companies = placementRepo.listCompanies();
  res.json({ success: true, companies });
});

router.get("/drives", (req: Request, res: Response) => {
  const drives = placementRepo.listDrives();
  res.json({ success: true, drives });
});

router.get("/shortlists", (req: Request, res: Response) => {
  const driveId = req.query.driveId as string | undefined;
  const shortlists = placementRepo.listShortlists(driveId);
  res.json({ success: true, shortlists });
});

router.post("/drives/:id/apply", (req: Request, res: Response) => {
  const driveId = req.params.id;
  const { name, email, collegeName, readinessScore } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: "Name and email are required to apply" });
  }
  const result = placementRepo.applyDrive(driveId, {
    name,
    email,
    collegeName: collegeName || "Algora Institute of Tech",
    readinessScore: readinessScore ? Number(readinessScore) : 82,
  });
  res.json(result);
});

router.get("/analytics", (req: Request, res: Response) => {
  const analytics = placementRepo.getPlacementAnalytics();
  res.json({ success: true, analytics });
});

export default router;
