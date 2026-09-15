import { EnterpriseRepository, ClassroomEntity } from "../../repositories/enterpriseRepository";
import { CourseService } from "./courseService";

export class ClassroomService {
  public static async getClassrooms(courseId?: string): Promise<ClassroomEntity[]> {
    let classrooms = await EnterpriseRepository.getClassrooms(courseId);
    if (classrooms.length === 0) {
      classrooms = await this.seedDefaultClassrooms(courseId);
    }
    return classrooms;
  }

  public static async createClassroom(data: { courseId: string; facultyId?: string; roomName: string; section?: string }): Promise<ClassroomEntity> {
    return await EnterpriseRepository.createClassroom(data);
  }

  private static async seedDefaultClassrooms(courseId?: string): Promise<ClassroomEntity[]> {
    const courses = await CourseService.getCourses();
    const targetCourseId = courseId || courses[0]?.id || "crs_default";

    const cl1 = await EnterpriseRepository.createClassroom({
      courseId: targetCourseId,
      roomName: "Turing Hall 101 - Algorithms Lab",
      section: "Section A",
    });

    const cl2 = await EnterpriseRepository.createClassroom({
      courseId: courses[1]?.id || targetCourseId,
      roomName: "Liskov AI Auditorium B",
      section: "Section B",
    });

    return [cl1, cl2];
  }
}
