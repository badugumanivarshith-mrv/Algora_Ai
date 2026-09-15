import { EnterpriseRepository, FacultyEntity, DepartmentEntity } from "../../repositories/enterpriseRepository";
import { UniversityService } from "./universityService";
import { RedisManager } from "../../redis/redisClient";

export class FacultyService {
  public static async getFaculty(universityId?: string): Promise<FacultyEntity[]> {
    let fac = await EnterpriseRepository.getFaculty(universityId);
    if (fac.length === 0) {
      fac = await this.seedDefaultFaculty(universityId);
    }
    return fac;
  }

  public static async getFacultyDashboard(facultyId: string): Promise<any> {
    const redisKey = `faculty:dashboard:${facultyId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback
      }
    }

    const dashboard = {
      facultyId,
      assignedCourses: 4,
      totalStudentsTaught: 180,
      activeClassrooms: 3,
      pendingAssignmentsToGrade: 12,
      averageClassAttendance: "94.2%",
    };

    await RedisManager.set(redisKey, JSON.stringify(dashboard), 3600);
    return dashboard;
  }

  public static async getDepartments(universityId?: string): Promise<DepartmentEntity[]> {
    let depts = await EnterpriseRepository.getDepartments(universityId);
    if (depts.length === 0) {
      const universities = await UniversityService.getUniversities();
      const targetId = universityId || universities[0]?.id || "univ_default";
      depts = await this.seedDefaultDepartments(targetId);
    }
    return depts;
  }

  private static async seedDefaultFaculty(universityId?: string): Promise<FacultyEntity[]> {
    const universities = await UniversityService.getUniversities();
    const targetId = universityId || universities[0]?.id || "univ_default";
    const depts = await this.getDepartments(targetId);

    const f1 = await EnterpriseRepository.createFaculty({
      universityId: targetId,
      departmentId: depts[0]?.id,
      userId: "usr_prof_smith",
      designation: "Head Professor & Dean of AI Studies",
      email: "prof.smith@algora.edu",
    });

    const f2 = await EnterpriseRepository.createFaculty({
      universityId: targetId,
      departmentId: depts[1]?.id || depts[0]?.id,
      userId: "usr_prof_jones",
      designation: "Associate Professor of Computer Systems",
      email: "prof.jones@algora.edu",
    });

    return [f1, f2];
  }

  private static async seedDefaultDepartments(universityId: string): Promise<DepartmentEntity[]> {
    const d1 = await EnterpriseRepository.createDepartment({
      universityId,
      name: "Department of Computer Science & Artificial Intelligence",
      code: "CS-AI",
      headOfDepartment: "Dr. Alan Turing",
    });

    const d2 = await EnterpriseRepository.createDepartment({
      universityId,
      name: "Department of Software Engineering & Cloud Computing",
      code: "SE-CLOUD",
      headOfDepartment: "Dr. Barbara Liskov",
    });

    return [d1, d2];
  }
}
