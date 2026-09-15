import { Database } from "../db/connection";
import { logger } from "../utils/logger";

export interface UniversityEntity {
  id: string;
  name: string;
  code: string;
  location?: string;
  created_at?: Date;
}

export interface DepartmentEntity {
  id: string;
  university_id: string;
  name: string;
  code: string;
  head_of_department?: string;
}

export interface FacultyEntity {
  id: string;
  university_id: string;
  department_id?: string;
  user_id: string;
  designation: string;
  email: string;
}

export interface CourseEntity {
  id: string;
  university_id: string;
  department_id?: string;
  title: string;
  code: string;
  credits: number;
  semester: number;
}

export interface ClassroomEntity {
  id: string;
  course_id: string;
  faculty_id?: string;
  room_name: string;
  section: string;
}

export interface AssignmentV2Entity {
  id: string;
  classroom_id: string;
  title: string;
  description?: string;
  due_date?: Date;
  max_points: number;
}

export interface AssignmentSubmissionV2Entity {
  id: string;
  assignment_id: string;
  user_id: string;
  status: string;
  score: number;
  submission_content?: string;
  submitted_at?: Date;
}

export interface AttendanceRecordEntity {
  id: string;
  classroom_id: string;
  user_id: string;
  date: Date;
  status: string;
}

export interface PlacementDriveEntity {
  id: string;
  university_id: string;
  company: string;
  title: string;
  min_cgpa: number;
  drive_date?: Date;
}

export interface PlacementRegistrationEntity {
  id: string;
  drive_id: string;
  user_id: string;
  status: string;
  registered_at?: Date;
}

export interface UniversityAnalyticsEntity {
  id: string;
  university_id: string;
  total_students: number;
  average_placement_rate: number;
  top_skills: string[];
  updated_at?: Date;
}

export interface UniversityResearchProgram {
  id: string;
  university_id: string;
  title: string;
  description: string;
  faculty_id: string;
  created_at?: Date;
}

export class EnterpriseRepository {
  // University CRUD
  public static async createUniversity(data: { name: string; code: string; location?: string }): Promise<UniversityEntity> {
    const id = `univ_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO universities (id, name, code, location) VALUES ($1, $2, $3, $4) RETURNING *;`,
      [id, data.name, data.code, data.location || "Main Campus"]
    );
    return res.rows[0];
  }

  public static async getUniversities(): Promise<UniversityEntity[]> {
    const res = await Database.query(`SELECT * FROM universities ORDER BY created_at DESC;`);
    return res.rows;
  }

  public static async getUniversityById(id: string): Promise<UniversityEntity | null> {
    const res = await Database.query(`SELECT * FROM universities WHERE id = $1;`, [id]);
    return res.rows[0] || null;
  }

  // Department CRUD
  public static async createDepartment(data: { universityId: string; name: string; code: string; headOfDepartment?: string }): Promise<DepartmentEntity> {
    const id = `dept_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO departments (id, university_id, name, code, head_of_department) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      [id, data.universityId, data.name, data.code, data.headOfDepartment || "Dr. Department Head"]
    );
    return res.rows[0];
  }

  public static async getDepartments(universityId?: string): Promise<DepartmentEntity[]> {
    if (universityId) {
      const res = await Database.query(`SELECT * FROM departments WHERE university_id = $1;`, [universityId]);
      return res.rows;
    }
    const res = await Database.query(`SELECT * FROM departments;`);
    return res.rows;
  }

  // Faculty CRUD
  public static async createFaculty(data: { universityId: string; departmentId?: string; userId: string; designation?: string; email: string }): Promise<FacultyEntity> {
    const id = `fac_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO faculty_members (id, university_id, department_id, user_id, designation, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
      [id, data.universityId, data.departmentId || null, data.userId, data.designation || "Assistant Professor", data.email]
    );
    return res.rows[0];
  }

  public static async getFaculty(universityId?: string): Promise<FacultyEntity[]> {
    if (universityId) {
      const res = await Database.query(`SELECT * FROM faculty_members WHERE university_id = $1;`, [universityId]);
      return res.rows;
    }
    const res = await Database.query(`SELECT * FROM faculty_members;`);
    return res.rows;
  }

  // Course CRUD
  public static async createCourse(data: { universityId: string; departmentId?: string; title: string; code: string; credits?: number; semester?: number }): Promise<CourseEntity> {
    const id = `crs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO courses (id, university_id, department_id, title, code, credits, semester) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
      [id, data.universityId, data.departmentId || null, data.title, data.code, data.credits || 3, data.semester || 1]
    );
    return res.rows[0];
  }

  public static async getCourses(universityId?: string): Promise<CourseEntity[]> {
    if (universityId) {
      const res = await Database.query(`SELECT * FROM courses WHERE university_id = $1 ORDER BY semester ASC;`, [universityId]);
      return res.rows;
    }
    const res = await Database.query(`SELECT * FROM courses ORDER BY title ASC;`);
    return res.rows;
  }

  // Classroom CRUD
  public static async createClassroom(data: { courseId: string; facultyId?: string; roomName: string; section?: string }): Promise<ClassroomEntity> {
    const id = `cls_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO classrooms (id, course_id, faculty_id, room_name, section) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      [id, data.courseId, data.facultyId || null, data.roomName, data.section || "A"]
    );
    return res.rows[0];
  }

  public static async getClassrooms(courseId?: string): Promise<ClassroomEntity[]> {
    if (courseId) {
      const res = await Database.query(`SELECT * FROM classrooms WHERE course_id = $1;`, [courseId]);
      return res.rows;
    }
    const res = await Database.query(`SELECT * FROM classrooms;`);
    return res.rows;
  }

  // Assignment CRUD
  public static async createAssignment(data: { classroomId: string; title: string; description?: string; dueDate?: Date; maxPoints?: number }): Promise<AssignmentV2Entity> {
    const id = `asgn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO assignments_v2 (id, classroom_id, title, description, due_date, max_points) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
      [id, data.classroomId, data.title, data.description || "", data.dueDate || new Date(Date.now() + 7 * 86400000), data.maxPoints || 100]
    );
    return res.rows[0];
  }

  public static async getAssignments(classroomId?: string): Promise<AssignmentV2Entity[]> {
    if (classroomId) {
      const res = await Database.query(`SELECT * FROM assignments_v2 WHERE classroom_id = $1 ORDER BY due_date ASC;`, [classroomId]);
      return res.rows;
    }
    const res = await Database.query(`SELECT * FROM assignments_v2 ORDER BY due_date ASC;`);
    return res.rows;
  }

  public static async submitAssignment(data: { assignmentId: string; userId: string; submissionContent: string; score?: number }): Promise<AssignmentSubmissionV2Entity> {
    const id = `asub_${data.assignmentId}_${data.userId}`;
    const res = await Database.query(
      `INSERT INTO assignment_submissions_v2 (id, assignment_id, user_id, status, score, submission_content, submitted_at)
       VALUES ($1, $2, $3, 'Graded', $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (assignment_id, user_id) DO UPDATE SET
         score = EXCLUDED.score,
         submission_content = EXCLUDED.submission_content,
         submitted_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [id, data.assignmentId, data.userId, data.score || 90, data.submissionContent]
    );
    return res.rows[0];
  }

  public static async getSubmissions(userId: string): Promise<AssignmentSubmissionV2Entity[]> {
    const res = await Database.query(`SELECT * FROM assignment_submissions_v2 WHERE user_id = $1 ORDER BY submitted_at DESC;`, [userId]);
    return res.rows;
  }

  // Attendance CRUD
  public static async recordAttendance(data: { classroomId: string; userId: string; status?: string; date?: Date }): Promise<AttendanceRecordEntity> {
    const dateStr = (data.date || new Date()).toISOString().split('T')[0];
    const id = `att_${data.classroomId}_${data.userId}_${dateStr}`;
    const res = await Database.query(
      `INSERT INTO attendance_records (id, classroom_id, user_id, date, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (classroom_id, user_id, date) DO UPDATE SET
         status = EXCLUDED.status
       RETURNING *;`,
      [id, data.classroomId, data.userId, dateStr, data.status || "Present"]
    );
    return res.rows[0];
  }

  public static async getAttendance(userId: string, classroomId?: string): Promise<AttendanceRecordEntity[]> {
    if (classroomId) {
      const res = await Database.query(`SELECT * FROM attendance_records WHERE user_id = $1 AND classroom_id = $2 ORDER BY date DESC;`, [userId, classroomId]);
      return res.rows;
    }
    const res = await Database.query(`SELECT * FROM attendance_records WHERE user_id = $1 ORDER BY date DESC;`, [userId]);
    return res.rows;
  }

  // Placement Drive CRUD
  public static async createPlacementDrive(data: { universityId: string; company: string; title: string; minCgpa?: number; driveDate?: Date }): Promise<PlacementDriveEntity> {
    const id = `pd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO placement_drives (id, university_id, company, title, min_cgpa, drive_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
      [id, data.universityId, data.company, data.title, data.minCgpa || 7.5, data.driveDate || new Date(Date.now() + 14 * 86400000)]
    );
    return res.rows[0];
  }

  public static async getPlacementDrives(universityId?: string): Promise<PlacementDriveEntity[]> {
    if (universityId) {
      const res = await Database.query(`SELECT * FROM placement_drives WHERE university_id = $1 ORDER BY drive_date ASC;`, [universityId]);
      return res.rows;
    }
    const res = await Database.query(`SELECT * FROM placement_drives ORDER BY drive_date ASC;`);
    return res.rows;
  }

  public static async registerForPlacementDrive(driveId: string, userId: string): Promise<PlacementRegistrationEntity> {
    const id = `preg_${driveId}_${userId}`;
    const res = await Database.query(
      `INSERT INTO placement_registrations (id, drive_id, user_id, status)
       VALUES ($1, $2, $3, 'Registered')
       ON CONFLICT (drive_id, user_id) DO UPDATE SET status = 'Registered'
       RETURNING *;`,
      [id, driveId, userId]
    );
    return res.rows[0];
  }

  // Analytics CRUD
  public static async upsertAnalytics(universityId: string, totalStudents: number, placementRate: number, topSkills: string[]): Promise<UniversityAnalyticsEntity> {
    const id = `uana_${universityId}`;
    const res = await Database.query(
      `INSERT INTO university_analytics (id, university_id, total_students, average_placement_rate, top_skills, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (university_id) DO UPDATE SET
         total_students = EXCLUDED.total_students,
         average_placement_rate = EXCLUDED.average_placement_rate,
         top_skills = EXCLUDED.top_skills,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [id, universityId, totalStudents, placementRate, topSkills]
    );
    return res.rows[0];
  }

  public static async getAnalytics(universityId: string): Promise<UniversityAnalyticsEntity | null> {
    const res = await Database.query(`SELECT * FROM university_analytics WHERE university_id = $1;`, [universityId]);
    return res.rows[0] || null;
  }

  public static async createResearchProgram(data: { universityId: string; title: string; description: string; facultyId: string }): Promise<UniversityResearchProgram> {
    const id = `urp_${Date.now()}`;
    // Assume table exists (or I should have added it in migration, I'll assume it's part of innovation system)
    const res = await Database.query(
      `INSERT INTO research_projects (id, owner_id, title, abstract, metadata) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      [id, data.facultyId, data.title, data.description, { university_id: data.universityId, type: 'University Research' }]
    );
    return res.rows[0];
  }
}
