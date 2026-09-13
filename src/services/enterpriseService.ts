export interface InstitutionData {
  id: string;
  name: string;
  slug: string;
  logo: string;
  tier: string;
  domain: string;
  departmentsCount: number;
  facultyCount: number;
  studentCount: number;
  totalProblemsSolved: number;
  avgPlacementReadiness: number;
  createdAt: string;
}

export interface DepartmentData {
  id: string;
  institutionId: string;
  name: string;
  code: string;
  headOfDepartment: string;
  facultyCount: number;
  studentCount: number;
}

export interface FacultyData {
  id: string;
  institutionId: string;
  departmentId: string;
  name: string;
  email: string;
  designation: string;
  coursesCount: number;
  rating: number;
  status: "active" | "on-leave";
}

export interface StudentBatchData {
  id: string;
  institutionId: string;
  departmentId: string;
  name: string;
  year: number;
  section: string;
  studentCount: number;
  avgAccuracy: number;
  activeContestRank: number;
}

export interface ClassroomData {
  id: string;
  institutionId: string;
  facultyId: string;
  facultyName: string;
  name: string;
  code: string;
  joinCode: string;
  department: string;
  semester: string;
  section: string;
  studentCount: number;
  createdAt: string;
  announcementsCount: number;
  assignmentsCount: number;
}

export interface AssignmentData {
  id: string;
  classroomId: string;
  title: string;
  description: string;
  problemIds: string[];
  problemTitles: string[];
  dueDate: string;
  maxScore: number;
  submittedCount: number;
  totalStudents: number;
  gradedCount: number;
  avgScore: number;
  status: "active" | "past_due" | "draft";
}

export interface AnnouncementData {
  id: string;
  classroomId: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: string;
  pinned: boolean;
}

export interface StudentProgressData {
  id: string;
  studentId: string;
  name: string;
  email: string;
  rollNumber: string;
  solvedCount: number;
  accuracy: number;
  streak: number;
  lastActive: string;
  isAtRisk: boolean;
  riskReason?: string;
  gradeScore: number;
  attendanceRate: number;
}

export interface AiStudentReportData {
  student: StudentProgressData;
  aiDiagnostic: {
    overallVerdict: string;
    strengths: string[];
    weakAreas: string[];
    retentionProbability: number;
    recommendedInterventions: string[];
    predictedPlacementReadiness: number;
  };
}

export interface CompanyProfileData {
  id: string;
  name: string;
  logo: string;
  industry: string;
  location: string;
  openRolesCount: number;
  avgPackageLpa: string;
  hiringStatus: "actively_hiring" | "upcoming_drive" | "closed";
  requiredSkills: string[];
  minReadinessScore: number;
  description: string;
}

export interface PlacementDriveData {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  roleTitle: string;
  packageDescription: string;
  eligibilityCgpa: number;
  eligibilityReadiness: number;
  testDate: string;
  applicationDeadline: string;
  registeredCandidates: number;
  shortlistedCount: number;
  status: "open" | "evaluating" | "interviews_ongoing" | "completed";
  rounds: string[];
}

export interface CandidateShortlistData {
  id: string;
  studentId: string;
  name: string;
  email: string;
  rollNumber: string;
  collegeName: string;
  readinessScore: number;
  algoraRating: number;
  problemsSolved: number;
  cgpa: number;
  status: "shortlisted" | "review_pending" | "interview_scheduled" | "offer_extended";
  appliedDriveId: string;
  appliedDriveTitle: string;
  notes: string;
}

export interface PlacementAnalyticsData {
  totalDrives: number;
  totalOffersExtended: number;
  avgPackageLpa: number;
  highestPackageLpa: number;
  overallBatchReadiness: number;
  tier1ClearedRate: number;
  topRecruitingDomains: { domain: string; percentage: number }[];
  cohortReadinessDistribution: { bucket: string; count: number }[];
}

export interface CertificateData {
  id: string;
  certificateCode: string;
  recipientId: string;
  recipientName: string;
  title: string;
  type: "course" | "contest" | "skill";
  category: string;
  issueDate: string;
  scoreOrRank: string;
  verificationHash: string;
  status: "verified" | "revoked";
  skillsCovered: string[];
  instructorOrIssuer: string;
  description: string;
}

export interface GlobalSearchResultItem {
  id: string;
  category: "problem" | "topic" | "discussion" | "contest" | "mentor" | "group" | "classroom";
  title: string;
  subtitle: string;
  badge?: string;
  url: string;
  score: number;
}

export interface GlobalSearchResponseData {
  query: string;
  totalResults: number;
  resultsByCategory: {
    problems: GlobalSearchResultItem[];
    topics: GlobalSearchResultItem[];
    discussions: GlobalSearchResultItem[];
    contests: GlobalSearchResultItem[];
    mentors: GlobalSearchResultItem[];
    groups: GlobalSearchResultItem[];
    classrooms: GlobalSearchResultItem[];
  };
  topResults: GlobalSearchResultItem[];
}

export interface SkillGapData {
  topic: string;
  currentMastery: number;
  targetMastery: number;
  deficitPercentage: number;
  criticality: "High" | "Medium" | "Low";
  recommendedPrerequisites: string[];
  diagnosticInsight: string;
}

export interface DifficultyPredictionData {
  problemId: string;
  problemTitle: string;
  topic: string;
  nominalDifficulty: "Easy" | "Medium" | "Hard";
  predictedUserDifficultyScore: number;
  estimatedSolveTimeMinutes: number;
  expectedSuccessProbability: number;
  primaryChallengeReason: string;
}

export interface RetentionRiskData {
  topic: string;
  lastPracticedDaysAgo: number;
  estimatedMemoryRetention: number;
  decayRisk: "Critical Decay" | "Moderate Decay" | "Stable";
  suggestedSpacedRepetitionProblem: string;
  recommendedReviewDate: string;
}

export interface PersonalizedRoadmapData {
  targetGoal: string;
  targetCompanyTier: string;
  currentOverallMastery: number;
  projectedMasteryGain: number;
  estimatedWeeksToReadiness: number;
  weeklyPlan: {
    weekNumber: number;
    theme: string;
    focusAreas: string[];
    curatedProblems: { id: string; title: string; difficulty: string; predictedGain: string }[];
    milestoneAssessment: string;
  }[];
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const EnterpriseService = {
  // 1. Institution Portal
  async getInstitutionDetails(): Promise<{ institution: InstitutionData }> {
    return fetchJson<{ institution: InstitutionData }>("/api/institutions/details");
  },

  async listDepartments(): Promise<{ departments: DepartmentData[] }> {
    return fetchJson<{ departments: DepartmentData[] }>("/api/institutions/departments");
  },

  async listFaculty(): Promise<{ faculty: FacultyData[] }> {
    return fetchJson<{ faculty: FacultyData[] }>("/api/institutions/faculty");
  },

  async listBatches(): Promise<{ batches: StudentBatchData[] }> {
    return fetchJson<{ batches: StudentBatchData[] }>("/api/institutions/batches");
  },

  // 2. Classrooms & Faculty
  async listClassrooms(): Promise<{ classrooms: ClassroomData[] }> {
    return fetchJson<{ classrooms: ClassroomData[] }>("/api/classrooms/classrooms");
  },

  async getClassroom(id: string): Promise<{ classroom: ClassroomData }> {
    return fetchJson<{ classroom: ClassroomData }>(`/api/classrooms/classrooms/${id}`);
  },

  async createClassroom(data: { name: string; code: string; department: string; semester: string; section: string; facultyName?: string }): Promise<{ classroom: ClassroomData }> {
    return fetchJson<{ classroom: ClassroomData }>("/api/classrooms/classrooms", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async joinClassroom(code: string): Promise<{ success: boolean; classroom?: ClassroomData; message: string }> {
    return fetchJson<{ success: boolean; classroom?: ClassroomData; message: string }>("/api/classrooms/classrooms/join", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },

  // 3. Assignments & Announcements
  async listAssignments(classroomId?: string): Promise<{ assignments: AssignmentData[] }> {
    const q = classroomId ? `?classroomId=${classroomId}` : "";
    return fetchJson<{ assignments: AssignmentData[] }>(`/api/classrooms/assignments${q}`);
  },

  async createAssignment(data: { classroomId: string; title: string; description: string; problemTitles: string[]; dueDate: string; maxScore?: number }): Promise<{ assignment: AssignmentData }> {
    return fetchJson<{ assignment: AssignmentData }>("/api/classrooms/assignments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async listAnnouncements(classroomId: string): Promise<{ announcements: AnnouncementData[] }> {
    return fetchJson<{ announcements: AnnouncementData[] }>(`/api/classrooms/announcements?classroomId=${classroomId}`);
  },

  async createAnnouncement(data: { classroomId: string; authorName: string; title: string; content: string }): Promise<{ announcement: AnnouncementData }> {
    return fetchJson<{ announcement: AnnouncementData }>("/api/classrooms/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getRoster(classroomId?: string): Promise<{ roster: StudentProgressData[] }> {
    const q = classroomId ? `?classroomId=${classroomId}` : "";
    return fetchJson<{ roster: StudentProgressData[] }>(`/api/classrooms/roster${q}`);
  },

  async getAiStudentReport(studentId: string): Promise<{ report: AiStudentReportData }> {
    return fetchJson<{ report: AiStudentReportData }>(`/api/classrooms/students/${studentId}/ai-report`);
  },

  // 4. Recruitment & Placements
  async listCompanies(): Promise<{ companies: CompanyProfileData[] }> {
    return fetchJson<{ companies: CompanyProfileData[] }>("/api/placements/companies");
  },

  async listDrives(): Promise<{ drives: PlacementDriveData[] }> {
    return fetchJson<{ drives: PlacementDriveData[] }>("/api/placements/drives");
  },

  async listShortlists(driveId?: string): Promise<{ shortlists: CandidateShortlistData[] }> {
    const q = driveId ? `?driveId=${driveId}` : "";
    return fetchJson<{ shortlists: CandidateShortlistData[] }>(`/api/placements/shortlists${q}`);
  },

  async applyDrive(driveId: string, candidate: { name: string; email: string; collegeName: string; readinessScore: number }): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>(`/api/placements/drives/${driveId}/apply`, {
      method: "POST",
      body: JSON.stringify(candidate),
    });
  },

  async getPlacementAnalytics(): Promise<{ analytics: PlacementAnalyticsData }> {
    return fetchJson<{ analytics: PlacementAnalyticsData }>("/api/placements/analytics");
  },

  // 5. Certifications
  async listCertificates(userId?: string): Promise<{ certificates: CertificateData[] }> {
    const q = userId ? `?userId=${userId}` : "";
    return fetchJson<{ certificates: CertificateData[] }>(`/api/certificates/my-certificates${q}`);
  },

  async verifyCertificate(code: string): Promise<{ certificate: CertificateData }> {
    return fetchJson<{ certificate: CertificateData }>(`/api/certificates/verify/${encodeURIComponent(code)}`);
  },

  async issueCertificate(data: {
    recipientName: string;
    title: string;
    type: "course" | "contest" | "skill";
    category: string;
    scoreOrRank: string;
    skillsCovered: string[];
    description: string;
  }): Promise<{ certificate: CertificateData }> {
    return fetchJson<{ certificate: CertificateData }>("/api/certificates/issue", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 6. Global Search
  async searchGlobal(query: string, category?: string): Promise<GlobalSearchResponseData> {
    const q = encodeURIComponent(query);
    const cat = category ? `&category=${category}` : "";
    return fetchJson<GlobalSearchResponseData>(`/api/search?q=${q}${cat}`);
  },

  // 7. Recommendation Engine V2
  async getSkillGaps(): Promise<{ skillGaps: SkillGapData[] }> {
    return fetchJson<{ skillGaps: SkillGapData[] }>("/api/recommendations/v2/skill-gaps");
  },

  async getDifficultyPredictions(): Promise<{ difficultyPredictions: DifficultyPredictionData[] }> {
    return fetchJson<{ difficultyPredictions: DifficultyPredictionData[] }>("/api/recommendations/v2/difficulty-predictions");
  },

  async getRetentionForecast(): Promise<{ retentionForecast: RetentionRiskData[] }> {
    return fetchJson<{ retentionForecast: RetentionRiskData[] }>("/api/recommendations/v2/retention-forecast");
  },

  async getPersonalizedRoadmap(goal?: string): Promise<{ roadmap: PersonalizedRoadmapData }> {
    const g = goal ? `?goal=${encodeURIComponent(goal)}` : "";
    return fetchJson<{ roadmap: PersonalizedRoadmapData }>(`/api/recommendations/v2/personalized-roadmap${g}`);
  },
};
