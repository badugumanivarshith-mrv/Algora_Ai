import { Router, Request, Response } from "express";
import { certificateRepo } from "../repositories/certificateRepository";

const router = Router();

router.get("/my-certificates", (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined;
  const certificates = certificateRepo.listCertificates(userId);
  res.json({ success: true, certificates });
});

router.get("/verify/:code", (req: Request, res: Response) => {
  const code = req.params.code;
  const certificate = certificateRepo.getCertificateByCode(code);
  if (!certificate) {
    return res.status(404).json({ success: false, message: "Certificate not found or invalid verification token." });
  }
  res.json({ success: true, certificate });
});

router.post("/issue", (req: Request, res: Response) => {
  const { recipientName, title, type, category, scoreOrRank, skillsCovered, description } = req.body;
  if (!recipientName || !title || !type) {
    return res.status(400).json({ success: false, message: "Recipient name, title, and type are required" });
  }
  const cert = certificateRepo.issueCertificate({
    recipientName,
    title,
    type,
    category: category || "Algorithms & Systems",
    scoreOrRank: scoreOrRank || "Distinction",
    skillsCovered: skillsCovered || ["Data Structures", "Problem Solving"],
    description: description || "Issued upon successful completion of curriculum benchmarks.",
  });
  res.status(201).json({ success: true, certificate: cert });
});

export default router;
