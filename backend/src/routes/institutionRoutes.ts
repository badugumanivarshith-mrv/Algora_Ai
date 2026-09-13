import { Router, Request, Response } from "express";
import { institutionRepo } from "../repositories/institutionRepository";

const router = Router();

// Institution details & structure
router.get("/details", (req: Request, res: Response) => {
  const institution = institutionRepo.getInstitution();
  res.json({ success: true, institution });
});

router.get("/departments", (req: Request, res: Response) => {
  const departments = institutionRepo.listDepartments();
  res.json({ success: true, departments });
});

router.get("/faculty", (req: Request, res: Response) => {
  const faculty = institutionRepo.listFaculty();
  res.json({ success: true, faculty });
});

router.get("/batches", (req: Request, res: Response) => {
  const batches = institutionRepo.listBatches();
  res.json({ success: true, batches });
});

// Classrooms
router.get("/classrooms", (req: Request, res: Response) => {
  const classrooms = institutionRepo.listClassrooms();
  res.json({ success: true, classrooms });
});

router.get("/classrooms/:id", (req: Request, res: Response) => {
  const classroom = institutionRepo.getClassroom(req.params.id);
  if (!classroom) {
    return res.status(404).json({ success: false, message: "Classroom not found" });
  }
  res.json({ success: true, classroom });
});

router.post("/classrooms", (req: Request, res: Response) => {
  const { name, code, department, semester, section, facultyName } = req.body;
  if (!name || !code) {
    return res.status(400).json({ success: false, message: "Name and code are required" });
  }
  const newClass = institutionRepo.createClassroom({
    name,
    code,
    department: department || "CSE",
    semester: semester || "Semester 5",
    section: section || "A",
    facultyName,
  });
  res.status(201).json({ success: true, classroom: newClass });
});

router.post("/classrooms/join", (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: "Join code is required" });
  }
  const result = institutionRepo.joinClassroomByCode(code);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// Assignments
router.get("/assignments", (req: Request, res: Response) => {
  const classroomId = req.query.classroomId as string | undefined;
  const assignments = institutionRepo.listAssignments(classroomId);
  res.json({ success: true, assignments });
});

router.post("/assignments", (req: Request, res: Response) => {
  const { classroomId, title, description, problemTitles, dueDate, maxScore } = req.body;
  if (!classroomId || !title || !problemTitles?.length) {
    return res.status(400).json({ success: false, message: "Classroom ID, title and problem titles are required" });
  }
  const assignment = institutionRepo.createAssignment({
    classroomId,
    title,
    description: description || "",
    problemTitles,
    dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
    maxScore: maxScore ? Number(maxScore) : 100,
  });
  res.status(201).json({ success: true, assignment });
});

// Announcements
router.get("/announcements", (req: Request, res: Response) => {
  const classroomId = req.query.classroomId as string;
  if (!classroomId) {
    return res.status(400).json({ success: false, message: "classroomId is required" });
  }
  const announcements = institutionRepo.listAnnouncements(classroomId);
  res.json({ success: true, announcements });
});

router.post("/announcements", (req: Request, res: Response) => {
  const { classroomId, authorName, title, content } = req.body;
  if (!classroomId || !title || !content) {
    return res.status(400).json({ success: false, message: "Classroom ID, title, and content are required" });
  }
  const ann = institutionRepo.createAnnouncement({
    classroomId,
    authorName: authorName || "Faculty Instructor",
    title,
    content,
  });
  res.status(201).json({ success: true, announcement: ann });
});

// Students & AI Reports
router.get("/roster", (req: Request, res: Response) => {
  const classroomId = req.query.classroomId as string | undefined;
  const roster = institutionRepo.getStudentRoster(classroomId);
  res.json({ success: true, roster });
});

router.get("/students/:id/ai-report", (req: Request, res: Response) => {
  const report = institutionRepo.generateAiStudentReport(req.params.id);
  res.json({ success: true, report });
});

export default router;
