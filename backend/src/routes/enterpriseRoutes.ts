import { Router } from "express";
import { EnterpriseController } from "../controllers/enterpriseController";

const router = Router();

// Universities
router.get("/universities", EnterpriseController.getUniversities);
router.post("/universities", EnterpriseController.createUniversity);

// Departments & Faculty
router.get("/departments", EnterpriseController.getDepartments);
router.get("/faculty", EnterpriseController.getFaculty);
router.get("/faculty/dashboard/:facultyId?", EnterpriseController.getFacultyDashboard);

// Courses & Progress
router.get("/courses", EnterpriseController.getCourses);
router.get("/user-progress", EnterpriseController.getUserCourseProgress);

// Classrooms
router.get("/classrooms", EnterpriseController.getClassrooms);

// Attendance
router.get("/attendance", EnterpriseController.getAttendance);
router.post("/attendance", EnterpriseController.recordAttendance);

// Assignments
router.get("/assignments", EnterpriseController.getAssignments);
router.post("/assignments/submit", EnterpriseController.submitAssignment);

// Placement Drives
router.get("/placement-drives", EnterpriseController.getPlacementDrives);
router.post("/placement-drives/register", EnterpriseController.registerForPlacementDrive);

// University Analytics & Leaderboard
router.get("/analytics", EnterpriseController.getUniversityAnalytics);

export default router;
