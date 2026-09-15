import { EnterpriseRepository, CourseEntity } from "../../repositories/enterpriseRepository";
import { UniversityService } from "./universityService";
import { RedisManager } from "../../redis/redisClient";

export class CourseService {
  public static async getCourses(universityId?: string): Promise<CourseEntity[]> {
    let courses = await EnterpriseRepository.getCourses(universityId);
    if (courses.length === 0) {
      courses = await this.seedDefaultCourses(universityId);
    }
    return courses;
  }

  public static async getUserCourseProgress(userId: string): Promise<any> {
    const redisKey = `course:progress:${userId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback
      }
    }

    const progress = {
      userId,
      completedCoursesCount: 4,
      totalCreditsEarned: 16,
      currentSemester: 5,
      gpa: 3.88,
      activeCourses: [
        { code: "CS-401", title: "Advanced Data Structures & Algorithms", progressPercent: 88 },
        { code: "AI-502", title: "Deep Neural Networks & Gemini Architecture", progressPercent: 92 },
        { code: "CS-405", title: "Distributed Database Systems & Cloud SQL", progressPercent: 78 },
      ],
    };

    await RedisManager.set(redisKey, JSON.stringify(progress), 3600);
    return progress;
  }

  public static async createCourse(data: { universityId: string; departmentId?: string; title: string; code: string; credits?: number; semester?: number }): Promise<CourseEntity> {
    return await EnterpriseRepository.createCourse(data);
  }

  private static async seedDefaultCourses(universityId?: string): Promise<CourseEntity[]> {
    const universities = await UniversityService.getUniversities();
    const targetId = universityId || universities[0]?.id || "univ_default";

    const c1 = await EnterpriseRepository.createCourse({
      universityId: targetId,
      title: "CS-401: Advanced Data Structures & Algorithm Design",
      code: "CS-401",
      credits: 4,
      semester: 5,
    });

    const c2 = await EnterpriseRepository.createCourse({
      universityId: targetId,
      title: "AI-502: Deep Neural Networks & Large Language Models",
      code: "AI-502",
      credits: 4,
      semester: 6,
    });

    const c3 = await EnterpriseRepository.createCourse({
      universityId: targetId,
      title: "CS-405: Distributed Systems & Microservice Architecture",
      code: "CS-405",
      credits: 3,
      semester: 5,
    });

    return [c1, c2, c3];
  }
}
