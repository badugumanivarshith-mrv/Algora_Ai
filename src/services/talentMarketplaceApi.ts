export interface ReputationProfile {
  id: string;
  userId: string;
  reputationScore: number;
  trustScore: number;
  expertiseScore: number;
  influenceScore: number;
  growthScore: number;
  learningReputation: number;
  contestReputation: number;
  researchReputation: number;
  openSourceReputation: number;
  projectReputation: number;
  collaborationReputation: number;
  leadershipReputation: number;
  hiringReputation: number;
  percentileRank: number;
  breakdown: Record<string, { score: number; weight: string; verifiedUnits: number }>;
  verifiedCredentials: Array<{
    id: string;
    name: string;
    category: string;
    issuer: string;
    issuedAt: string;
    verificationHash: string;
  }>;
  updatedAt: string;
}

export interface ReputationEvent {
  id: string;
  userId: string;
  eventType: string;
  category: string;
  title: string;
  delta: number;
  proofUrl?: string;
  verificationSource: string;
  timestamp: string;
}

export interface SkillAsset {
  id: string;
  userId: string;
  skillCategory: string;
  skillName: string;
  proficiencyLevel: string;
  masteryScore: number;
  verifiedProofs: Array<Record<string, any>>;
  marketDemandScore: number;
  scarcityIndex: number;
  industryRelevance: number;
  estimatedAssetValue: number;
  growthRatePct: number;
  updatedAt: string;
}

export interface SkillValuation {
  id: string;
  skillName: string;
  category: string;
  marketDemandIndex: number;
  scarcityScore: number;
  averageCompPremium: number;
  trendDirection: string;
  topEmployers: string[];
  calculatedAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  opportunityType: string;
  organization: string;
  location: string;
  compensationRange: string;
  equityRange?: string;
  description: string;
  requiredSkills: string[];
  minimumReputation: number;
  urgency: string;
  applicationUrl: string;
  createdAt: string;
}

export interface OpportunityMatch {
  id: string;
  opportunityId: string;
  userId: string;
  matchPercentage: number;
  roiScore: number;
  successProbability: number;
  skillOverlap: string[];
  missingPrerequisites: string[];
  strategicRationale: string;
  status: string;
  matchedAt: string;
}

export interface TalentProfile {
  id: string;
  userId: string;
  headline: string;
  preferredRoles: string[];
  availabilityStatus: string;
  targetCompensation: number;
  preferredLocations: string[];
  reputationBadge: string;
  verifiedSkills: Array<{ skill: string; badge: string }>;
  profileSummary: string;
  visibility: string;
  updatedAt: string;
}

export interface TeamRecommendation {
  id: string;
  userId: string;
  candidateId: string;
  candidateName: string;
  candidateHeadline: string;
  candidateReputation: number;
  recommendationType: string;
  synergyScore: number;
  complementarySkills: string[];
  recommendedProjectTopic: string;
  whyMatched: string;
  createdAt: string;
}

export interface CollaborationProfile {
  id: string;
  userId: string;
  teamEffectivenessScore: number;
  communicationStyle: string;
  collaborationStrengths: string[];
  preferredCollabTypes: string[];
  leadershipGrowthScore: number;
  projectSuccessRate: number;
  pastCollaborationsCount: number;
  updatedAt: string;
}

export interface PortfolioSnapshot {
  id: string;
  userId: string;
  portfolioTitle: string;
  careerNarrative: string;
  executiveSummary: string;
  aggregatedProjects: Array<{
    id: string;
    title: string;
    category: string;
    role: string;
    techStack: string[];
    metrics: string;
    verifiedUrl: string;
    status: string;
    proofBadge: string;
  }>;
  aggregatedContests: Array<{
    contestName: string;
    rank: string;
    ratingDelta: string;
    date: string;
    percentile: string;
  }>;
  aggregatedResearch: Array<{
    paperTitle: string;
    venue: string;
    status: string;
    impactSummary: string;
  }>;
  aggregatedSimulations: Array<{
    scenario: string;
    score: string;
    resolutionTime?: string;
    valuation?: string;
    feedback: string;
  }>;
  aggregatedInternships: Array<{
    company: string;
    role: string;
    period: string;
    outcomes: string;
  }>;
  achievementTimeline: Array<{
    date: string;
    event: string;
    type: string;
  }>;
  verifiedProofCount: number;
  shareableSlug: string;
  generatedAt: string;
}

export interface IndustryBenchmark {
  id: string;
  targetRole: string;
  overallReadinessPct: number;
  rankingPercentile: number;
  skillGapAnalysis: Array<{
    dimension: string;
    userScore: number;
    targetScore: number;
    status: string;
  }>;
  strengths: string[];
  improvementPaths: string[];
  estimatedTimeToHireWeeks: number;
  benchmarkData: {
    baseComp: string;
    totalComp: string;
    interviewPassRate: string;
  };
  calculatedAt: string;
}

export const talentMarketplaceApi = {
  async getReputation(): Promise<{ status: string; data: { profile: ReputationProfile; events: ReputationEvent[] } }> {
    const res = await fetch('/api/aios/reputation');
    return res.json();
  },

  async recalculateReputation(): Promise<{ status: string; data: { profile: ReputationProfile; events: ReputationEvent[] } }> {
    const res = await fetch('/api/aios/reputation/recalculate', { method: 'POST' });
    return res.json();
  },

  async getSkills(): Promise<{
    status: string;
    data: {
      assets: SkillAsset[];
      valuations: SkillValuation[];
      summary: { totalValuation: number; highestValuedSkill: string; annualAppreciationRate: number; skillsCount: number };
    };
  }> {
    const res = await fetch('/api/aios/skills');
    return res.json();
  },

  async getMarketplace(type?: string): Promise<{
    status: string;
    data: {
      profile: TalentProfile;
      opportunities: Opportunity[];
      analytics: any;
    };
  }> {
    const query = type ? `?type=${encodeURIComponent(type)}` : '';
    const res = await fetch(`/api/aios/marketplace${query}`);
    return res.json();
  },

  async getOpportunities(): Promise<{
    status: string;
    data: {
      matches: OpportunityMatch[];
      discovered: any[];
    };
  }> {
    const res = await fetch('/api/aios/opportunities');
    return res.json();
  },

  async getPortfolio(): Promise<{ status: string; data: { portfolio: PortfolioSnapshot } }> {
    const res = await fetch('/api/aios/portfolio');
    return res.json();
  },

  async getBenchmarks(): Promise<{ status: string; data: { benchmarks: IndustryBenchmark[] } }> {
    const res = await fetch('/api/aios/benchmarks');
    return res.json();
  },

  async getCollaborators(): Promise<{
    status: string;
    data: {
      profile: CollaborationProfile;
      recommendations: TeamRecommendation[];
    };
  }> {
    const res = await fetch('/api/aios/collaborators');
    return res.json();
  }
};
