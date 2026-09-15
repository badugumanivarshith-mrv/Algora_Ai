import { UniversityRepository, DegreeProgramRecord, StudentDegreeRecord, DegreeCourseRecord } from "../../repositories/universityRepository";
import { KnowledgeFabricRepository } from "../../repositories/knowledgeFabricRepository";
import { LearningMemoryRepository } from "../../repositories/learningMemoryRepository";
import { CareerRepository } from "../../repositories/careerRepository";
import { logger } from "../../utils/logger";

export interface GraduationAuditResult {
  degreeId: string;
  degreeTitle: string;
  isEligible: boolean;
  creditsCompleted: number;
  totalCreditsRequired: number;
  currentGpa: number;
  minGpaRequired: number;
  capstoneCompleted: boolean;
  verifiedBadgesCount: number;
  requiredBadgesCount: number;
  remainingCourses: DegreeCourseRecord[];
  estimatedGraduationSemesters: number;
  careerReadinessScore: number;
}

export class AutonomousUniversityService {
  public static async getDegrees(): Promise<DegreeProgramRecord[]> {
    return await UniversityRepository.getDegrees();
  }

  public static async getDegreeById(degreeId: string): Promise<DegreeProgramRecord | null> {
    return await UniversityRepository.getDegreeById(degreeId);
  }

  public static async getStudentDegrees(userId: string): Promise<StudentDegreeRecord[]> {
    return await UniversityRepository.getStudentDegrees(userId);
  }

  public static async enrollDegree(userId: string, degreeId: string): Promise<StudentDegreeRecord> {
    logger.info(`[AutonomousUniversityService] Enrolling user ${userId} in degree ${degreeId}`);
    const record = await UniversityRepository.enrollInDegree(userId, degreeId);

    // Sync into Knowledge Fabric
    try {
      const degree = await UniversityRepository.getDegreeById(degreeId);
      if (degree) {
        await KnowledgeFabricRepository.upsertEntity({
          id: `ent_deg_${degreeId}`,
          name: `Degree: ${degree.title}`,
          entityType: 'DegreeProgram',
          description: degree.description
        });
      }
    } catch (e) {
      logger.warn(`[AutonomousUniversityService] Knowledge Fabric sync error: ${e}`);
    }

    return record;
  }

  public static async runGraduationAudit(userId: string, degreeId: string): Promise<GraduationAuditResult> {
    const [degree, studentDegrees, credentials] = await Promise.all([
      UniversityRepository.getDegreeById(degreeId),
      UniversityRepository.getStudentDegrees(userId),
      UniversityRepository.getCredentials(userId)
    ]);

    if (!degree) {
      throw new Error(`Degree ${degreeId} not found`);
    }

    const studentEnrollment = studentDegrees.find(sd => sd.degreeId === degreeId) || {
      creditsCompleted: 32,
      gpa: 3.85,
      completedCourseIds: [],
      capstoneStatus: 'NotStarted'
    };

    const completedIds = new Set(studentEnrollment.completedCourseIds || []);
    const remainingCourses = (degree.courses || []).filter(c => !completedIds.has(c.id));
    const capstoneCompleted = studentEnrollment.capstoneStatus === 'Completed' || studentEnrollment.capstoneStatus === 'PassedDefense';
    
    const verifiedBadgesCount = credentials.length;
    const requiredBadgesCount = degree.graduationRequirements.requiredVerifiedBadges;
    const isGpaEligible = studentEnrollment.gpa >= degree.graduationRequirements.minGpa;
    const isCreditsEligible = studentEnrollment.creditsCompleted >= degree.graduationRequirements.minCredits;

    const isEligible = isGpaEligible && isCreditsEligible && (capstoneCompleted || degree.graduationRequirements.requiredCapstones === 0) && (verifiedBadgesCount >= requiredBadgesCount);

    const remainingCredits = Math.max(0, degree.totalCredits - studentEnrollment.creditsCompleted);
    const estimatedGraduationSemesters = Math.ceil(remainingCredits / 16);

    const careerReadinessScore = Math.min(99.0, Math.max(50.0, (studentEnrollment.creditsCompleted / degree.totalCredits) * 70 + (studentEnrollment.gpa / 4.0) * 30));

    return {
      degreeId: degree.id,
      degreeTitle: degree.title,
      isEligible,
      creditsCompleted: studentEnrollment.creditsCompleted,
      totalCreditsRequired: degree.totalCredits,
      currentGpa: studentEnrollment.gpa,
      minGpaRequired: degree.graduationRequirements.minGpa,
      capstoneCompleted,
      verifiedBadgesCount,
      requiredBadgesCount,
      remainingCourses,
      estimatedGraduationSemesters,
      careerReadinessScore: parseFloat(careerReadinessScore.toFixed(1))
    };
  }

  public static async completeCourse(userId: string, degreeId: string, courseId: string, grade: number = 4.0): Promise<StudentDegreeRecord> {
    const studentDegrees = await UniversityRepository.getStudentDegrees(userId);
    let enrollment = studentDegrees.find(sd => sd.degreeId === degreeId);

    if (!enrollment) {
      enrollment = await UniversityRepository.enrollInDegree(userId, degreeId);
    }

    const degree = await UniversityRepository.getDegreeById(degreeId);
    const course = degree?.courses?.find(c => c.id === courseId);
    const courseCredits = course?.credits || 4;

    if (!enrollment.completedCourseIds.includes(courseId)) {
      enrollment.completedCourseIds.push(courseId);
      enrollment.creditsCompleted += courseCredits;
      // Recalculate GPA
      enrollment.gpa = parseFloat(((enrollment.gpa * 0.9) + (grade * 0.1)).toFixed(2));
      enrollment.graduationReadinessPct = parseFloat(Math.min(100, (enrollment.creditsCompleted / (degree?.totalCredits || 128)) * 100).toFixed(1));
      
      if (enrollment.creditsCompleted >= (degree?.totalCredits || 128)) {
        enrollment.status = enrollment.gpa >= 3.9 ? 'HonorsGraduated' : 'Graduated';
      } else {
        enrollment.currentSemester = Math.min(8, Math.floor(enrollment.creditsCompleted / 16) + 1);
      }

      await UniversityRepository.updateStudentDegree(enrollment);
    }

    return enrollment;
  }

  public static async recalculateAllProgress(userId: string): Promise<{ degrees: StudentDegreeRecord[]; audits: GraduationAuditResult[] }> {
    const degrees = await UniversityRepository.getStudentDegrees(userId);
    const audits: GraduationAuditResult[] = [];

    for (const d of degrees) {
      const audit = await this.runGraduationAudit(userId, d.degreeId);
      audits.push(audit);
    }

    return { degrees, audits };
  }
}
