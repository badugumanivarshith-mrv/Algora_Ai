import { EnterpriseRepository, AssignmentV2Entity, AssignmentSubmissionV2Entity } from "../../repositories/enterpriseRepository";
import { ClassroomService } from "./classroomService";

export class AssignmentService {
  public static async getAssignments(classroomId?: string): Promise<AssignmentV2Entity[]> {
    let assignments = await EnterpriseRepository.getAssignments(classroomId);
    if (assignments.length === 0) {
      assignments = await this.seedDefaultAssignments(classroomId);
    }
    return assignments;
  }

  public static async createAssignment(data: { classroomId: string; title: string; description?: string; dueDate?: Date; maxPoints?: number }): Promise<AssignmentV2Entity> {
    return await EnterpriseRepository.createAssignment(data);
  }

  public static async submitAssignment(data: { assignmentId: string; userId: string; submissionContent: string; score?: number }): Promise<AssignmentSubmissionV2Entity> {
    return await EnterpriseRepository.submitAssignment(data);
  }

  public static async getSubmissions(userId: string): Promise<AssignmentSubmissionV2Entity[]> {
    let subs = await EnterpriseRepository.getSubmissions(userId);
    if (subs.length === 0) {
      const assignments = await this.getAssignments();
      if (assignments.length > 0) {
        const sub = await EnterpriseRepository.submitAssignment({
          assignmentId: assignments[0].id,
          userId,
          submissionContent: "Optimized Graph Traversal with Bellman-Ford & Dijkstra algorithm implementation in C++.",
          score: 96,
        });
        subs = [sub];
      }
    }
    return subs;
  }

  private static async seedDefaultAssignments(classroomId?: string): Promise<AssignmentV2Entity[]> {
    const classrooms = await ClassroomService.getClassrooms();
    const targetClassroomId = classroomId || classrooms[0]?.id || "cls_default";

    const a1 = await EnterpriseRepository.createAssignment({
      classroomId: targetClassroomId,
      title: "Assignment 1: Dynamic Programming & Topological Sorting Lab",
      description: "Implement parallel DAG task scheduling with memory constraints.",
      maxPoints: 100,
    });

    const a2 = await EnterpriseRepository.createAssignment({
      classroomId: classrooms[1]?.id || targetClassroomId,
      title: "Assignment 2: Transformer Fine-Tuning & Quantization",
      description: "Evaluate 4-bit vs 8-bit quantized Gemini model throughput on GPU clusters.",
      maxPoints: 100,
    });

    return [a1, a2];
  }
}
