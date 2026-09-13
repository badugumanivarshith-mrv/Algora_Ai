export interface CompanyProfileEntity {
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

export interface PlacementDriveEntity {
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

export interface CandidateShortlistEntity {
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

export interface PlacementAnalyticsSummary {
  totalDrives: number;
  totalOffersExtended: number;
  avgPackageLpa: number;
  highestPackageLpa: number;
  overallBatchReadiness: number;
  tier1ClearedRate: number;
  topRecruitingDomains: { domain: string; percentage: number }[];
  cohortReadinessDistribution: { bucket: string; count: number }[];
}

class PlacementRepository {
  private companies: CompanyProfileEntity[] = [
    {
      id: "comp-01",
      name: "Google",
      logo: "🔴🟡🟢🔵",
      industry: "Big Tech / Systems",
      location: "Mountain View / Bangalore / Hyderabad",
      openRolesCount: 14,
      avgPackageLpa: "42 - 58 LPA",
      hiringStatus: "actively_hiring",
      requiredSkills: ["Advanced Graphs", "Dynamic Programming", "System Architecture", "Concurrency"],
      minReadinessScore: 85,
      description: "Engineering high-throughput global infrastructure, distributed systems, and modern AI platforms.",
    },
    {
      id: "comp-02",
      name: "Stripe",
      logo: "💳",
      industry: "Fintech / Payments",
      location: "San Francisco / Remote / Dublin",
      openRolesCount: 8,
      avgPackageLpa: "48 - 65 LPA",
      hiringStatus: "actively_hiring",
      requiredSkills: ["API Design", "Distributed Systems", "Data Structures", "High Reliability"],
      minReadinessScore: 88,
      description: "Building the economic infrastructure of the internet with uncompromising reliability.",
    },
    {
      id: "comp-03",
      name: "Citadel Securities",
      logo: "⚡",
      industry: "Quantitative Trading / HFT",
      location: "Chicago / New York / London",
      openRolesCount: 5,
      avgPackageLpa: "90 - 140 LPA",
      hiringStatus: "actively_hiring",
      requiredSkills: ["Ultra-low latency C++", "Lock-free structures", "Advanced Math / Probabilities", "DP"],
      minReadinessScore: 92,
      description: "High-frequency algorithmic market-making and quantitative analytics on microsecond scales.",
    },
    {
      id: "comp-04",
      name: "Amazon",
      logo: "📦",
      industry: "E-Commerce / Cloud AWS",
      location: "Seattle / Bangalore / Austin",
      openRolesCount: 22,
      avgPackageLpa: "32 - 46 LPA",
      hiringStatus: "upcoming_drive",
      requiredSkills: ["Object-Oriented Design", "Trees & Graphs", "Leadership Principles", "Scalability"],
      minReadinessScore: 78,
      description: "Customer-obsessed cloud services, automated fulfillment systems, and enterprise tools.",
    },
  ];

  private drives: PlacementDriveEntity[] = [
    {
      id: "drv-01",
      companyId: "comp-01",
      companyName: "Google",
      companyLogo: "🔴🟡🟢🔵",
      roleTitle: "Software Development Engineer (SWE-L3)",
      packageDescription: "₹45,00,000 CTC + Stock Units",
      eligibilityCgpa: 8.0,
      eligibilityReadiness: 85,
      testDate: "2026-09-22T10:00:00.000Z",
      applicationDeadline: "2026-09-18T23:59:59.000Z",
      registeredCandidates: 284,
      shortlistedCount: 38,
      status: "open",
      rounds: ["Online Algorithmic Assessment (90m)", "Technical Screen 1 (DSA)", "Technical Screen 2 (System & Concurrency)", "Googliness & Leadership"],
    },
    {
      id: "drv-02",
      companyId: "comp-02",
      companyName: "Stripe",
      companyLogo: "💳",
      roleTitle: "Backend Infrastructure Engineer",
      packageDescription: "₹52,00,000 CTC + Signing Bonus",
      eligibilityCgpa: 8.2,
      eligibilityReadiness: 88,
      testDate: "2026-09-25T14:00:00.000Z",
      applicationDeadline: "2026-09-20T23:59:59.000Z",
      registeredCandidates: 196,
      shortlistedCount: 24,
      status: "open",
      rounds: ["System Debugging & DSA Screen", "API Architecture Pairing", "Technical Deep Dive", "Manager Fit"],
    },
    {
      id: "drv-03",
      companyId: "comp-04",
      companyName: "Amazon",
      companyLogo: "📦",
      roleTitle: "Cloud Solutions & SDE-1",
      packageDescription: "₹34,00,000 CTC",
      eligibilityCgpa: 7.5,
      eligibilityReadiness: 78,
      testDate: "2026-10-02T10:00:00.000Z",
      applicationDeadline: "2026-09-28T23:59:59.000Z",
      registeredCandidates: 410,
      shortlistedCount: 65,
      status: "open",
      rounds: ["OA (2 Coding + Work Style Simulation)", "Virtual Technical Loop (3 Rounds)", "Bar Raiser Interview"],
    },
  ];

  private shortlists: CandidateShortlistEntity[] = [
    {
      id: "cand-01",
      studentId: "u_arjun_01",
      name: "Arjun Sharma",
      email: "arjun@ait.edu",
      rollNumber: "21CS004",
      collegeName: "Algora Institute of Tech",
      readinessScore: 94,
      algoraRating: 2180,
      problemsSolved: 347,
      cgpa: 9.1,
      status: "interview_scheduled",
      appliedDriveId: "drv-01",
      appliedDriveTitle: "Google SWE-L3",
      notes: "Top 2% candidate in DSA speed. Passed OA with 100% test cases in 38 mins.",
    },
    {
      id: "cand-02",
      studentId: "u_sneha_03",
      name: "Sneha Reddy",
      email: "sneha@ait.edu",
      rollNumber: "21CS003",
      collegeName: "Algora Institute of Tech",
      readinessScore: 92,
      algoraRating: 2110,
      problemsSolved: 172,
      cgpa: 9.4,
      status: "interview_scheduled",
      appliedDriveId: "drv-01",
      appliedDriveTitle: "Google SWE-L3",
      notes: "Exemplary graph algorithmic proofs and clean modular code structure.",
    },
    {
      id: "cand-03",
      studentId: "u_priya_02",
      name: "Priya Patel",
      email: "priya@ait.edu",
      rollNumber: "21CS001",
      collegeName: "Algora Institute of Tech",
      readinessScore: 89,
      algoraRating: 2045,
      problemsSolved: 148,
      cgpa: 8.9,
      status: "shortlisted",
      appliedDriveId: "drv-02",
      appliedDriveTitle: "Stripe Backend Infrastructure",
      notes: "High concurrency aptitude; strong performance in system interview track.",
    },
    {
      id: "cand-04",
      studentId: "u_vikram_08",
      name: "Vikram Nair",
      email: "vikram@ait.edu",
      rollNumber: "21CS008",
      collegeName: "Algora Institute of Tech",
      readinessScore: 83,
      algoraRating: 1890,
      problemsSolved: 118,
      cgpa: 8.4,
      status: "shortlisted",
      appliedDriveId: "drv-03",
      appliedDriveTitle: "Amazon SDE-1",
      notes: "Solid binary search and tree optimization fundamentals.",
    },
  ];

  listCompanies(): CompanyProfileEntity[] {
    return this.companies;
  }

  listDrives(): PlacementDriveEntity[] {
    return this.drives;
  }

  listShortlists(driveId?: string): CandidateShortlistEntity[] {
    if (driveId) {
      return this.shortlists.filter((s) => s.appliedDriveId === driveId);
    }
    return this.shortlists;
  }

  applyDrive(driveId: string, candidate: { name: string; email: string; collegeName: string; readinessScore: number }): { success: boolean; message: string } {
    const drive = this.drives.find((d) => d.id === driveId);
    if (!drive) return { success: false, message: "Drive not found" };

    drive.registeredCandidates += 1;
    const isAutoShortlist = candidate.readinessScore >= drive.eligibilityReadiness;

    if (isAutoShortlist) {
      drive.shortlistedCount += 1;
      this.shortlists.unshift({
        id: `cand-${Date.now()}`,
        studentId: `u_${Date.now()}`,
        name: candidate.name,
        email: candidate.email,
        rollNumber: "21CS" + Math.floor(100 + Math.random() * 900),
        collegeName: candidate.collegeName || "Algora Institute of Tech",
        readinessScore: candidate.readinessScore,
        algoraRating: 1950,
        problemsSolved: 130,
        cgpa: 8.7,
        status: "shortlisted",
        appliedDriveId: drive.id,
        appliedDriveTitle: `${drive.companyName} ${drive.roleTitle}`,
        notes: "Auto-shortlisted via Algora AI Placement Readiness score threshold.",
      });
    }

    return {
      success: true,
      message: isAutoShortlist
        ? `Application successful! Your readiness score (${candidate.readinessScore}%) meets the ${drive.companyName} threshold. You have been auto-shortlisted for Round 1.`
        : `Application registered for ${drive.companyName} ${drive.roleTitle}. Results will be published after initial screening.`,
    };
  }

  getPlacementAnalytics(): PlacementAnalyticsSummary {
    return {
      totalDrives: 14,
      totalOffersExtended: 184,
      avgPackageLpa: 28.6,
      highestPackageLpa: 112.0,
      overallBatchReadiness: 81.4,
      tier1ClearedRate: 43.8,
      topRecruitingDomains: [
        { domain: "Distributed Systems & Cloud", percentage: 38 },
        { domain: "Full-Stack & Frontend Architecture", percentage: 26 },
        { domain: "AI / ML & Data Engineering", percentage: 21 },
        { domain: "Quantitative Trading & Low Latency", percentage: 15 },
      ],
      cohortReadinessDistribution: [
        { bucket: "90-100% (Elite Tier)", count: 42 },
        { bucket: "80-89% (FAANG Ready)", count: 88 },
        { bucket: "70-79% (Product Ready)", count: 124 },
        { bucket: "50-69% (Needs Revision)", count: 64 },
        { bucket: "<50% (At Risk)", count: 18 },
      ],
    };
  }
}

export const placementRepo = new PlacementRepository();
