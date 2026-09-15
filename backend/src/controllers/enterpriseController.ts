import { Request, Response } from "express";
import { UniversityService } from "../services/ai/universityService";
import { FacultyService } from "../services/ai/facultyService";
import { CourseService } from "../services/ai/courseService";
import { ClassroomService } from "../services/ai/classroomService";
import { AttendanceService } from "../services/ai/attendanceService";
import { AssignmentService } from "../services/ai/assignmentService";
import { PlacementDriveService } from "../services/ai/placementDriveService";
import { UniversityAnalyticsService } from "../services/ai/universityAnalyticsService";
import { ContestAnalyticsService } from "../services/ai/contestAnalyticsService";
import { KnowledgeGraphService } from "../services/ai/knowledgeGraphService";
import { logger } from "../utils/logger";

export class EnterpriseController {
  // Universities
  public static async getUniversities(req: Request, res: Response) {
    try {
      const data = await UniversityService.getUniversities();
      return res.json({ success: true, data });
    } catch (e: any) {
      logger.error(`getUniversities error: ${e.message}`);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async createUniversity(req: Request, res: Response) {
    try {
      const { name, code, location } = req.body;
      const data = await UniversityService.createUniversity({ name, code, location });
      return res.json({ success: true, data });
    } catch (e: any) {
      logger.error(`createUniversity error: ${e.message}`);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // Departments & Faculty
  public static async getDepartments(req: Request, res: Response) {
    try {
      const universityId = req.query.universityId as string;
      const data = await FacultyService.getDepartments(universityId);
      return res.json({ success: true, data });
    } catch (e: any) {
      logger.error(`getDepartments error: ${e.message}`);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getFaculty(req: Request, res: Response) {
    try {
      const universityId = req.query.universityId as string;
      const data = await FacultyService.getFaculty(universityId);
      return res.json({ success: true, data });
    } catch (e: any) {
      logger.error(`getFaculty error: ${e.message}`);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getFacultyDashboard(req: Request, res: Response) {
    try {
      const facultyId = req.params.facultyId || "fac_demo";
      const data = await FacultyService.getFacultyDashboard(facultyId);
      return res.json({ success: true, data });
    } catch (e: any) {
      logger.error(`getFacultyDashboard error: ${e.message}`);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // Courses & Progress
  public static async getCourses(req: Request, res: Response) {
    try {
      const universityId = req.query.universityId as string;
      const data = await CourseService.getCourses(universityId);
      return res.json({ success: true, data });
    } catch (e: any) {
      logger.error(`getCourses error: ${e.message}`);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getUserCourseProgress(req: Request, res: Response) {
    try {
      const userId = (req.query.userId as string) || "usr_demo";
      const data = await CourseService.getUserCourseProgress(userId);
      return res.json({ success: true, data });
    } catch (e: any) {
      logger.error(`getUserCourseProgress error: ${e.message}`);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // Classrooms
  public static async getClassrooms(req: Request, res: Response) {
    try {
      const courseId = req.query.courseId as string;
      const data = await ClassroomService.getClassrooms(courseId);
      return res.json({ success: true, data });
    } catch (e: any) {
      logger.error(`getClassrooms error: ${e.message}`);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // Attendance
  public static async getAttendance(req: Request, res: Response) {
    try {
      const userId = (req.query.userId as string) || "usr_demo";
      const classroomId = req.query.classroomId as string;
      const data = await AttendanceService.getAttendance(userId, classroomId);
      const summary = await AttendanceService.getAttendanceSummary(userId);
      return res.json({ success: true, data, summary });
    } catch (e: any) {
      logger.error(`getAttendance error: ${e.message}`);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async recordAttendance(req: Request, res: Response) {
    try {
      const { classroomId, userId, status } = req.body;
      const data = await AttendanceService.recordAttendance({ classroomId, userId, status });
      return res.json({ success: true, data });
    } catch (e: any) {
      logger.error(`recordAttendance error: ${e.message}`);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // Assignments
  public static async getAssignments(req: Request, res: Response) {
    try {
      const classroomId = req.query.classroomId as string;
      const data = await AssignmentService.getAssignments(classroomId);
      return res.json({ success: true, data });
    } catch (e: any) {
      logger.error(`getAssignments error: ${e.message}`);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async submitAssignment(req: Request, res: Response) {
    try {
      const { assignmentId, userId, submissionContent, score } = req.body;
      const data = await AssignmentService.submitAssignment({ assignmentId, userId: userId || "usr_demo", submissionContent, score });
      return res.json({ success: true, data });
    } catch (e: any) {
      logger.error(`submitAssignment error: ${e.message}`);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // Placement Drives
  public static async getPlacementDrives(req: Request, res: Response) {
    try {
      const universityId = req.query.universityId as string;
      const data = await PlacementDriveService.getPlacementDrives(universityId);
      return res.json({ success: true, data });
    } catch (e: any) {
      logger.error(`getPlacementDrives error: ${e.message}`);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async registerForPlacementDrive(req: Request, res: Response) {
    try {
      const { driveId, userId } = req.body;
      const data = await PlacementDriveService.registerForDrive(driveId, userId || "usr_demo");
      return res.json({ success: true, data });
    } catch (e: any) {
      logger.error(`registerForPlacementDrive error: ${e.message}`);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // University Analytics & Leaderboards
  public static async getUniversityAnalytics(req: Request, res: Response) {
    try {
      const universityId = req.query.universityId as string;
      const analytics = await UniversityAnalyticsService.getAnalytics(universityId);
      const leaderboard = await ContestAnalyticsService.getUniversityLeaderboard(universityId || "univ_default");
      const interCollege = await ContestAnalyticsService.getInterCollegeRankings();
      const curriculum = await KnowledgeGraphService.getSemesterCurriculumMapping("usr_demo", 5);

      return res.json({
        success: true,
        data: {
          analytics,
          leaderboard,
          interCollege,
          curriculum,
        },
      });
    } catch (e: any) {
      logger.error(`getUniversityAnalytics error: ${e.message}`);
      return res.status(500).json({ success: false, error: e.message });
    }
  }
}
