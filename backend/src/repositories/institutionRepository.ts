export interface DepartmentEntity {
  id: string;
  institutionId: string;
  name: string;
  code: string;
  headOfDepartment: string;
  facultyCount: number;
  studentCount: number;
}

export interface FacultyEntity {
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

export interface StudentBatchEntity {
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

export interface ClassroomEntity {
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

export interface AssignmentEntity {
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

export interface ClassroomAnnouncementEntity {
  id: string;
  classroomId: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: string;
  pinned: boolean;
}

export interface StudentProgressItem {
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

export interface InstitutionEntity {
  id: string;
  name: string;
  slug: string;
  logo: string;
  tier: "Enterprise" | "Collegiate Prime" | "University Standard";
  domain: string;
  departmentsCount: number;
  facultyCount: number;
  studentCount: number;
  totalProblemsSolved: number;
  avgPlacementReadiness: number;
  createdAt: string;
}

class InstitutionRepository {
  private institutions: InstitutionEntity[] = [
    {
      id: "inst-01",
      name: "Algora Institute of Technology",
      slug: "ait",
      logo: "🏛️",
      tier: "Enterprise",
      domain: "ait.algora.edu",
      departmentsCount: 4,
      facultyCount: 28,
      studentCount: 1420,
      totalProblemsSolved: 84920,
      avgPlacementReadiness: 81.4,
      createdAt: "2025-01-10T00:00:00.000Z",
    },
    {
      id: "inst-02",
      name: "National School of Computer Science",
      slug: "nscs",
      logo: "🎓",
      tier: "Collegiate Prime",
      domain: "nscs.edu",
      departmentsCount: 3,
      facultyCount: 19,
      studentCount: 890,
      totalProblemsSolved: 51200,
      avgPlacementReadiness: 76.8,
      createdAt: "2025-02-15T00:00:00.000Z",
    },
  ];

  private departments: DepartmentEntity[] = [
    {
      id: "dept-01",
      institutionId: "inst-01",
      name: "Computer Science & Engineering",
      code: "CSE",
      headOfDepartment: "Dr. Alan Turing",
      facultyCount: 12,
      studentCount: 620,
    },
    {
      id: "dept-02",
      institutionId: "inst-01",
      name: "Artificial Intelligence & Data Science",
      code: "AIDS",
      headOfDepartment: "Dr. Barbara Liskov",
      facultyCount: 8,
      studentCount: 410,
    },
    {
      id: "dept-03",
      institutionId: "inst-01",
      name: "Software Systems Engineering",
      code: "SSE",
      headOfDepartment: "Prof. Dennis Ritchie",
      facultyCount: 5,
      studentCount: 260,
    },
  ];

  private faculty: FacultyEntity[] = [
    {
      id: "fac-01",
      institutionId: "inst-01",
      departmentId: "dept-01",
      name: "Prof. Marcus Vance",
      email: "m.vance@ait.algora.edu",
      designation: "Associate Professor",
      coursesCount: 3,
      rating: 4.9,
      status: "active",
    },
    {
      id: "fac-02",
      institutionId: "inst-01",
      departmentId: "dept-01",
      name: "Dr. Elena Rostova",
      email: "e.rostova@ait.algora.edu",
      designation: "Professor & Chair",
      coursesCount: 2,
      rating: 4.8,
      status: "active",
    },
    {
      id: "fac-03",
      institutionId: "inst-01",
      departmentId: "dept-02",
      name: "Dr. Kenji Sato",
      email: "k.sato@ait.algora.edu",
      designation: "Assistant Professor",
      coursesCount: 2,
      rating: 4.7,
      status: "active",
    },
  ];

  private batches: StudentBatchEntity[] = [
    {
      id: "batch-2025-a",
      institutionId: "inst-01",
      departmentId: "dept-01",
      name: "CSE Class of 2025 - Sec A",
      year: 2025,
      section: "A",
      studentCount: 65,
      avgAccuracy: 78.4,
      activeContestRank: 4,
    },
    {
      id: "batch-2026-b",
      institutionId: "inst-01",
      departmentId: "dept-01",
      name: "CSE Class of 2026 - Sec B",
      year: 2026,
      section: "B",
      studentCount: 58,
      avgAccuracy: 71.2,
      activeContestRank: 12,
    },
  ];

  private classrooms: ClassroomEntity[] = [
    {
      id: "cls-01",
      institutionId: "inst-01",
      facultyId: "fac-01",
      facultyName: "Prof. Marcus Vance",
      name: "CS301 — Advanced Data Structures",
      code: "CS301",
      joinCode: "ALG-CS301",
      department: "CSE",
      semester: "Semester 5",
      section: "Sec A",
      studentCount: 52,
      createdAt: "2025-08-01T00:00:00.000Z",
      announcementsCount: 4,
      assignmentsCount: 4,
    },
    {
      id: "cls-02",
      institutionId: "inst-01",
      facultyId: "fac-01",
      facultyName: "Prof. Marcus Vance",
      name: "CS402 — Competitive Problem Solving Lab",
      code: "CS402",
      joinCode: "ALG-CPS402",
      department: "CSE",
      semester: "Semester 7",
      section: "Honors",
      studentCount: 38,
      createdAt: "2025-08-10T00:00:00.000Z",
      announcementsCount: 2,
      assignmentsCount: 3,
    },
  ];

  private assignments: AssignmentEntity[] = [
    {
      id: "asg-01",
      classroomId: "cls-01",
      title: "Module 1 — Dynamic Programming & Subsequence Optimization",
      description: "Solve the 4 curated DP algorithmic challenges covering memoization, tabulations, and bitmask states.",
      problemIds: ["two-sum", "longest-palindromic-substring", "climbing-stairs"],
      problemTitles: ["Two Sum", "Longest Palindromic Substring", "Climbing Stairs"],
      dueDate: "2026-09-20T23:59:59.000Z",
      maxScore: 100,
      submittedCount: 47,
      totalStudents: 52,
      gradedCount: 45,
      avgScore: 84.5,
      status: "active",
    },
    {
      id: "asg-02",
      classroomId: "cls-01",
      title: "Module 2 — Graph Shortest Paths & Topological Sort",
      description: "Implement Dijkstra's, Floyd-Warshall, and Kahn's algorithm for dependency ordering.",
      problemIds: ["course-schedule", "network-delay-time"],
      problemTitles: ["Course Schedule", "Network Delay Time"],
      dueDate: "2026-09-28T23:59:59.000Z",
      maxScore: 100,
      submittedCount: 38,
      totalStudents: 52,
      gradedCount: 30,
      avgScore: 76.2,
      status: "active",
    },
  ];

  private announcements: ClassroomAnnouncementEntity[] = [
    {
      id: "ann-01",
      classroomId: "cls-01",
      authorName: "Prof. Marcus Vance",
      title: "Mid-Term Algorithmic Assessment Schedule Released",
      content: "The proctored live coding assessment will occur on Friday at 2:00 PM UTC. Review Trie and Graph optimizations.",
      createdAt: "2026-09-08T10:00:00.000Z",
      pinned: true,
    },
    {
      id: "ann-02",
      classroomId: "cls-01",
      authorName: "Prof. Marcus Vance",
      title: "Weekly Office Hours via Algora Live Code Stream",
      content: "Join the interactive Q&A session tomorrow at 4:00 PM for deep dives into DP state compression.",
      createdAt: "2026-09-06T14:30:00.000Z",
      pinned: false,
    },
  ];

  private studentsRoster: StudentProgressItem[] = [
    { id: "stu-01", studentId: "u_arjun_01", name: "Arjun Sharma", email: "arjun@ait.edu", rollNumber: "21CS004", solvedCount: 347, accuracy: 82, streak: 28, lastActive: "15m ago", isAtRisk: false, gradeScore: 94, attendanceRate: 98 },
    { id: "stu-02", studentId: "u_priya_02", name: "Priya Patel", email: "priya@ait.edu", rollNumber: "21CS001", solvedCount: 148, accuracy: 88, streak: 32, lastActive: "2h ago", isAtRisk: false, gradeScore: 91, attendanceRate: 96 },
    { id: "stu-03", studentId: "u_sneha_03", name: "Sneha Reddy", email: "sneha@ait.edu", rollNumber: "21CS003", solvedCount: 172, accuracy: 91, streak: 28, lastActive: "1h ago", isAtRisk: false, gradeScore: 95, attendanceRate: 100 },
    { id: "stu-04", studentId: "u_rahul_04", name: "Rahul Kumar", email: "rahul@ait.edu", rollNumber: "21CS002", solvedCount: 96, accuracy: 72, streak: 14, lastActive: "5h ago", isAtRisk: false, gradeScore: 78, attendanceRate: 88 },
    { id: "stu-05", studentId: "u_kavya_05", name: "Kavya Singh", email: "kavya@ait.edu", rollNumber: "21CS005", solvedCount: 38, accuracy: 45, streak: 2, lastActive: "3d ago", isAtRisk: true, riskReason: "Low problem activity & 45% accuracy in Trees/DP", gradeScore: 54, attendanceRate: 65 },
    { id: "stu-06", studentId: "u_ananya_06", name: "Ananya Iyer", email: "ananya@ait.edu", rollNumber: "21CS007", solvedCount: 22, accuracy: 36, streak: 0, lastActive: "5d ago", isAtRisk: true, riskReason: "Inactive for 5 days; missing Assignment 1", gradeScore: 42, attendanceRate: 50 },
    { id: "stu-07", studentId: "u_deepika_07", name: "Deepika Sharma", email: "deepika@ait.edu", rollNumber: "21CS009", solvedCount: 41, accuracy: 52, streak: 3, lastActive: "2d ago", isAtRisk: true, riskReason: "Struggling with Time-Limit-Exceeded on recursion", gradeScore: 61, attendanceRate: 72 },
    { id: "stu-08", studentId: "u_vikram_08", name: "Vikram Nair", email: "vikram@ait.edu", rollNumber: "21CS008", solvedCount: 118, accuracy: 79, streak: 19, lastActive: "4h ago", isAtRisk: false, gradeScore: 85, attendanceRate: 92 },
  ];

  // Institution APIs
  getInstitution(): InstitutionEntity {
    return this.institutions[0];
  }

  listDepartments(): DepartmentEntity[] {
    return this.departments;
  }

  listFaculty(): FacultyEntity[] {
    return this.faculty;
  }

  listBatches(): StudentBatchEntity[] {
    return this.batches;
  }

  // Classroom APIs
  listClassrooms(): ClassroomEntity[] {
    return this.classrooms;
  }

  getClassroom(id: string): ClassroomEntity | undefined {
    return this.classrooms.find((c) => c.id === id || c.joinCode === id.toUpperCase());
  }

  createClassroom(data: { name: string; code: string; department: string; semester: string; section: string; facultyName?: string }): ClassroomEntity {
    const codeClean = data.code.toUpperCase().replace(/\s+/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newClass: ClassroomEntity = {
      id: `cls-${Date.now()}`,
      institutionId: "inst-01",
      facultyId: "fac-01",
      facultyName: data.facultyName || "Prof. Marcus Vance",
      name: data.name,
      code: data.code,
      joinCode: `ALG-${codeClean}-${randomSuffix}`,
      department: data.department,
      semester: data.semester,
      section: data.section,
      studentCount: 1,
      createdAt: new Date().toISOString(),
      announcementsCount: 0,
      assignmentsCount: 0,
    };
    this.classrooms.unshift(newClass);
    return newClass;
  }

  joinClassroomByCode(code: string): { success: boolean; classroom?: ClassroomEntity; message: string } {
    const clean = code.trim().toUpperCase();
    const classroom = this.classrooms.find((c) => c.joinCode.toUpperCase() === clean || c.code.toUpperCase() === clean);
    if (!classroom) {
      return { success: false, message: "Invalid classroom join code." };
    }
    classroom.studentCount += 1;
    return { success: true, classroom, message: `Successfully enrolled in ${classroom.name}!` };
  }

  // Assignment APIs
  listAssignments(classroomId?: string): AssignmentEntity[] {
    if (classroomId) {
      return this.assignments.filter((a) => a.classroomId === classroomId);
    }
    return this.assignments;
  }

  createAssignment(data: { classroomId: string; title: string; description: string; problemTitles: string[]; dueDate: string; maxScore?: number }): AssignmentEntity {
    const newAssignment: AssignmentEntity = {
      id: `asg-${Date.now()}`,
      classroomId: data.classroomId,
      title: data.title,
      description: data.description,
      problemIds: data.problemTitles.map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, "-")),
      problemTitles: data.problemTitles,
      dueDate: data.dueDate,
      maxScore: data.maxScore || 100,
      submittedCount: 0,
      totalStudents: 52,
      gradedCount: 0,
      avgScore: 0,
      status: "active",
    };
    this.assignments.unshift(newAssignment);
    const cls = this.classrooms.find((c) => c.id === data.classroomId);
    if (cls) cls.assignmentsCount += 1;
    return newAssignment;
  }

  // Announcements
  listAnnouncements(classroomId: string): ClassroomAnnouncementEntity[] {
    return this.announcements.filter((a) => a.classroomId === classroomId);
  }

  createAnnouncement(data: { classroomId: string; authorName: string; title: string; content: string }): ClassroomAnnouncementEntity {
    const ann: ClassroomAnnouncementEntity = {
      id: `ann-${Date.now()}`,
      classroomId: data.classroomId,
      authorName: data.authorName,
      title: data.title,
      content: data.content,
      createdAt: new Date().toISOString(),
      pinned: false,
    };
    this.announcements.unshift(ann);
    const cls = this.classrooms.find((c) => c.id === data.classroomId);
    if (cls) cls.announcementsCount += 1;
    return ann;
  }

  // Student Progress & Roster
  getStudentRoster(classroomId?: string): StudentProgressItem[] {
    return this.studentsRoster;
  }

  generateAiStudentReport(studentId: string): {
    student: StudentProgressItem;
    aiDiagnostic: {
      overallVerdict: string;
      strengths: string[];
      weakAreas: string[];
      retentionProbability: number;
      recommendedInterventions: string[];
      predictedPlacementReadiness: number;
    };
  } {
    const student = this.studentsRoster.find((s) => s.id === studentId || s.studentId === studentId) || this.studentsRoster[0];

    const isHighPerformer = student.accuracy >= 80;
    const isAtRisk = student.isAtRisk;

    return {
      student,
      aiDiagnostic: {
        overallVerdict: isHighPerformer
          ? `${student.name} demonstrates superior mastery across Dynamic Programming and Graph Theory with high submission consistency (${student.streak} day streak).`
          : isAtRisk
          ? `${student.name} is showing critical warning signs: low problem cadence and high failure rates in Tree traversals and recursion time complexity.`
          : `${student.name} maintains steady progress with strong fundamentals in linear data structures; requires additional guidance on advanced graph heuristics.`,
        strengths: isHighPerformer
          ? ["Optimal Space Complexity", "Edge Case Coverage (100%)", "Fast Execution Speed (Top 5%)"]
          : ["Array Manipulation", "Two-Pointer Logic", "Good Code Formatting"],
        weakAreas: isHighPerformer
          ? ["Bit Manipulation under strict time constraints"]
          : isAtRisk
          ? ["Recursion Stack Overflow prevention", "Dynamic Programming Top-down memoization", "Consistent daily engagement"]
          : ["Dynamic Programming Transition Formulas", "Binary Search Lower Bound edge cases"],
        retentionProbability: isHighPerformer ? 98 : isAtRisk ? 46 : 84,
        predictedPlacementReadiness: isHighPerformer ? 94 : isAtRisk ? 38 : 72,
        recommendedInterventions: isAtRisk
          ? [
              "Assign 1-on-1 peer mentor session on Recursion fundamentals",
              "Provide simplified step-by-step visual trace problems",
              "Set daily micro-milestone goal of 1 easy problem before 6 PM",
            ]
          : [
              "Encourage participation in Friday collegiate division contests",
              "Recommend Advanced Graph & Trie algorithmic track",
            ],
      },
    };
  }
}

export const institutionRepo = new InstitutionRepository();
