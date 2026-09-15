export interface DegreeCourse {
  id: string;
  degreeId: string;
  courseCode: string;
  courseName: string;
  semester: number;
  credits: number;
  description: string;
  syllabus: string[];
  learningOutcomes: string[];
  isCapstone: boolean;
  prerequisites?: string[];
}

export interface DegreeProgram {
  id: string;
  title: string;
  degreeType: string;
  domain: string;
  totalCredits: number;
  totalSemesters: number;
  description: string;
  careerOutcomes: string[];
  capstoneRequirement: {
    title: string;
    description: string;
    deliverables: string[];
  };
  graduationRequirements: {
    minCredits: number;
    minGpa: number;
    requiredCapstones: number;
    requiredVerifiedBadges: number;
  };
  courses?: DegreeCourse[];
}

export interface StudentDegree {
  id: string;
  userId: string;
  degreeId: string;
  status: 'Enrolled' | 'InPacing' | 'Graduated' | 'HonorsGraduated';
  currentSemester: number;
  creditsCompleted: number;
  gpa: number;
  completedCourseIds: string[];
  capstoneStatus: string;
  graduationReadinessPct: number;
  enrolledAt: string;
  updatedAt: string;
}

export interface GraduationAudit {
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
  remainingCourses: DegreeCourse[];
  estimatedGraduationSemesters: number;
  careerReadinessScore: number;
}

export interface CapabilityNode {
  id: string;
  domain: 'Technical' | 'Professional' | 'Research' | 'Entrepreneurship';
  name: string;
  category: string;
  level: 'Foundational' | 'Intermediate' | 'Advanced' | 'Mastery' | 'Frontier';
  description: string;
  masteryScore: number;
  dependencies?: string[];
  unlockedBy?: string[];
}

export interface CapabilityGraphSummary {
  totalCapabilities: number;
  domainAverages: {
    Technical: number;
    Professional: number;
    Research: number;
    Entrepreneurship: number;
  };
  highestCapability: CapabilityNode;
  emergingCapabilities: CapabilityNode[];
  recommendedFocusCapability: CapabilityNode;
  capabilityNodes: CapabilityNode[];
}

export interface MentorProfile {
  id: string;
  name: string;
  role: string;
  specialty: string;
  archetype: 'SoftwareEngineering' | 'AI' | 'Career' | 'Research' | 'Startup' | 'Leadership';
  bio: string;
  corePrinciples: string[];
  debatePersonality: string;
  avatarColor: string;
}

export interface MentorSession {
  id: string;
  userId: string;
  topic: string;
  sessionType: 'Debate' | 'ConsensusRecommendation' | 'PersonalizedIntervention' | 'Coaching';
  participatingMentorIds: string[];
  transcript: Array<{
    mentorName: string;
    mentorArchetype: string;
    statement: string;
    stance: string;
    confidence: number;
  }>;
  consensusDecision: string;
  actionItems: string[];
  createdAt: string;
}

export interface LearningMarketplaceOffering {
  id: string;
  title: string;
  offeringType: 'Course' | 'Certification' | 'Bootcamp' | 'Fellowship' | 'Workshop' | 'ResearchProgram';
  provider: string;
  durationWeeks: number;
  roiScore: number;
  completionProbability: number;
  hiringImpactPct: number;
  skillGainEstimate: string;
  costUsd: number;
  rating: number;
  skillsCovered: string[];
}

export interface LearningMarketplaceSummary {
  offerings: LearningMarketplaceOffering[];
  recommendedOffering: LearningMarketplaceOffering;
  totalOfferings: number;
  averageRoiScore: number;
  topCategories: string[];
}

export interface VerifiableCredential {
  id: string;
  userId: string;
  title: string;
  credentialType: 'Learning' | 'Contest' | 'Project' | 'Research' | 'Leadership' | 'EnterpriseSimulation';
  issuer: string;
  verificationHash: string;
  skillsValidated: string[];
  stackableParentId?: string;
  proofUrl: string;
  issuedAt: string;
}

export interface CredentialNetworkSummary {
  credentials: VerifiableCredential[];
  totalCredentials: number;
  credentialBreakdown: Record<string, number>;
  stackableBadges: {
    tierTitle: string;
    unlocked: boolean;
    requiredBadges: number;
    currentBadges: number;
  }[];
  verificationNodesActive: number;
  latestProofHash: string;
}

export interface PotentialProfile {
  id: string;
  userId: string;
  careerPotential: number;
  leadershipPotential: number;
  researchPotential: number;
  founderPotential: number;
  learningVelocity: number;
  longTermGrowthScore: number;
  growthDrivers: string[];
  strategicAccelerators: string[];
  updatedAt: string;
}

export interface PotentialForecast {
  id: string;
  userId: string;
  timeHorizonYears: number;
  projectedCareerTier: string;
  projectedCompensationUsd: number;
  projectedImpactScore: number;
  keyMilestones: string[];
  riskFactors: string[];
}

export interface HumanPotentialSummary {
  profile: PotentialProfile;
  forecasts: PotentialForecast[];
  compositePotentialIndex: number;
  trajectoryClass: 'SuperLinear' | 'HighExponential' | 'SteadyCompounding';
  aiSynthesisInsight: string;
}

export interface ImpactProfile {
  id: string;
  userId: string;
  overallImpactScore: number;
  openSourceImpact: number;
  researchImpact: number;
  educationImpact: number;
  mentorshipImpact: number;
  communityImpact: number;
  entrepreneurshipImpact: number;
  totalPeopleImpacted: number;
  updatedAt: string;
}

export interface ImpactEvent {
  id: string;
  userId: string;
  impactArea: 'Open Source' | 'Research' | 'Education' | 'Mentorship' | 'Community Building' | 'Entrepreneurship';
  title: string;
  metrics: string;
  reachCount: number;
  verificationSource: string;
  eventDate: string;
}

export interface GlobalImpactSummary {
  profile: ImpactProfile;
  events: ImpactEvent[];
  globalRankPercentile: number;
  impactScoreScaled1000: number;
  topImpactVector: string;
  upcomingForecasts: {
    year: number;
    projectedScore: number;
    projectedReach: number;
    milestone: string;
  }[];
}

export const universityApi = {
  async getUniversity(): Promise<{
    status: string;
    data: {
      degrees: DegreeProgram[];
      studentDegrees: StudentDegree[];
      audit: GraduationAudit | null;
    };
  }> {
    const res = await fetch('/api/aios/university');
    return res.json();
  },

  async enrollDegree(degreeId: string): Promise<{ status: string; data: StudentDegree }> {
    const res = await fetch('/api/aios/university/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ degreeId })
    });
    return res.json();
  },

  async recalculateUniversity(): Promise<{ status: string; data: { degrees: StudentDegree[]; audits: GraduationAudit[] } }> {
    const res = await fetch('/api/aios/university/recalculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  async getCapabilities(): Promise<{ status: string; data: CapabilityGraphSummary }> {
    const res = await fetch('/api/aios/capabilities');
    return res.json();
  },

  async getMentors(): Promise<{
    status: string;
    data: {
      mentors: MentorProfile[];
      sessions: MentorSession[];
    };
  }> {
    const res = await fetch('/api/aios/mentors');
    return res.json();
  },

  async conductMentorDebate(topic: string, mentorArchetypes?: string[]): Promise<{ status: string; data: MentorSession }> {
    const res = await fetch('/api/aios/mentors/debate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, mentorArchetypes })
    });
    return res.json();
  },

  async getLearningMarketplace(): Promise<{ status: string; data: LearningMarketplaceSummary }> {
    const res = await fetch('/api/aios/marketplace/learning');
    return res.json();
  },

  async getCredentials(): Promise<{ status: string; data: CredentialNetworkSummary }> {
    const res = await fetch('/api/aios/credentials');
    return res.json();
  },

  async verifyCredentialHash(hash: string): Promise<{ status: string; data: any }> {
    const res = await fetch('/api/aios/credentials/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash })
    });
    return res.json();
  },

  async getPotential(): Promise<{ status: string; data: HumanPotentialSummary }> {
    const res = await fetch('/api/aios/potential');
    return res.json();
  },

  async simulatePotentialTrajectory(targetRole: string): Promise<{ status: string; data: any }> {
    const res = await fetch('/api/aios/potential/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRole })
    });
    return res.json();
  },

  async getGlobalImpact(): Promise<{ status: string; data: GlobalImpactSummary }> {
    const res = await fetch('/api/aios/impact');
    return res.json();
  },

  async logImpactEvent(eventData: {
    impactArea: string;
    title: string;
    metrics: string;
    reachCount: number;
    verificationSource: string;
  }): Promise<{ status: string; data: ImpactEvent }> {
    const res = await fetch('/api/aios/impact/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    return res.json();
  }
};
