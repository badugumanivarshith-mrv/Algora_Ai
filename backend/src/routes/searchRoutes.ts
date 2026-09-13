import { Router, Request, Response } from "express";
import { searchRepo } from "../repositories/searchRepository";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || "";
    const category = req.query.category as string | undefined;
    const results = await searchRepo.search(q, category);
    res.json({ success: true, ...results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Search failed" });
  }
});

export default router;
