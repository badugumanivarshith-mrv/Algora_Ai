import { Router, Request, Response } from "express";
import { searchRepo } from "../repositories/searchRepository";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const q = req.query.q as string || "";
  const category = req.query.category as string | undefined;
  const results = searchRepo.search(q, category);
  res.json({ success: true, ...results });
});

export default router;
