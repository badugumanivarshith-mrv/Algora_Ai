import axios from "axios";

const API_BASE = "/api/aios/cognitive";

export interface CognitiveProfileResponse {
  profile: {
    id: string;
    userId: string;
    workingMemoryScore: number;
    longTermMemoryScore: number;
    retrievalAbilityScore: number;
    problemSolvingScore: number;
    reasoningScore: number;
    patternRecognitionScore: number;
    abstractionScore: number;
    learningVelocityScore: number;
    focusCapacityScore: number;
    knowledgeTransferScore: number;
    adaptabilityScore: number;
  };
  compositeCognitiveIndex: number;
  learningProfile: {
    primaryStyle: string;
    focusOptimalMinutes: number;
    recommendedBreakIntervalMinutes: number;
    stressResilienceIndex: number;
  };
  problemSolvingProfile: {
    dominantStrategy: string;
    decompositionSpeedScore: number;
    firstPrinciplesDepth: number;
    creativeSynthesesScore: number;
  };
  knowledgeTransferScore: number;
  adaptabilityScore: number;
  aiSynthesis: string;
}

export interface LearningDNAResponse {
  profile: {
    id: string;
    userId: string;
    archetype: string;
    preferredLearningMode: string;
    retentionRatePct: number;
    practiceEffectiveness: number;
    readingEffectiveness: number;
    videoEffectiveness: number;
    projectEffectiveness: number;
    dominantTraits: string[];
    learningSuperpowers: string[];
  };
  archetypeDetails: {
    title: string;
    description: string;
    keyStrengths: string[];
    potentialBlindspots: string[];
  };
  learningModeBreakdown: Array<{
    mode: string;
    effectivenessScore: number;
    recommendedSharePct: number;
  }>;
  retentionMatrix: Array<{
    timeframe: string;
    expectedRetentionPct: number;
  }>;
  aiRecommendations: string[];
}

export interface AGIResearchResponse {
  projects: Array<{
    id: string;
    title: string;
    domain: string;
    objective: string;
    status: string;
    researchPlan: string[];
    readingSequence: string[];
    evaluationFramework: any;
    updatedAt: string;
  }>;
  environments: Array<{
    domain: string;
    description: string;
    activeBenchmark: string;
    maturityScore: number;
  }>;
  aiAssistantCapabilities: string[];
}

export interface SuperintelligenceResponse {
  simulations: Array<{
    id: string;
    simulationName: string;
    timeHorizonYears: number;
    skillEvolution: any;
    researchImpact: any;
    careerOutcomes: any;
    startupProbability: number;
    leadershipGrowth: number;
    technicalDepth: number;
    aiSynthesis: string;
    createdAt: string;
  }>;
  activeForecast: {
    oneYear: any;
    threeYear: any;
    fiveYear: any;
    tenYear: any;
  };
  overallSuperintelligenceScore: number;
}

export interface CognitiveBottleneckResponse {
  bottlenecks: Array<{
    id: string;
    bottleneckType: string;
    severity: string;
    title: string;
    description: string;
    impactArea: string;
    recoveryPlan: string[];
    status: string;
    detectedAt: string;
  }>;
  activeCount: number;
  highestSeverityBottleneck: any;
  recoveryPlans: any[];
  overallCognitiveHealthScore: number;
}

export interface KnowledgeCompoundingResponse {
  records: Array<{
    id: string;
    sourceDomain: string;
    targetImpactArea: string;
    multiplier: number;
    synergyDescription: string;
  }>;
  overallCompoundingMultiplier: number;
  compoundingGraph: Array<{
    sourceDomain: string;
    targetImpactArea: string;
    multiplier: number;
    synergyDescription: string;
  }>;
  topSynergyVector: string;
  aiInsights: string;
}

export const cognitiveApi = {
  getCognitiveProfile: async (): Promise<CognitiveProfileResponse> => {
    const res = await axios.get(`${API_BASE}/profile`);
    return res.data.data;
  },
  getLearningDNA: async (): Promise<LearningDNAResponse> => {
    const res = await axios.get(`${API_BASE}/dna`);
    return res.data.data;
  },
  getAGIResearch: async (): Promise<AGIResearchResponse> => {
    const res = await axios.get(`${API_BASE}/agi-research`);
    return res.data.data;
  },
  generateResearchPlan: async (title: string, domain: string, objective: string) => {
    const res = await axios.post(`${API_BASE}/agi-research/plan`, { title, domain, objective });
    return res.data.data;
  },
  getSuperintelligence: async (): Promise<SuperintelligenceResponse> => {
    const res = await axios.get(`${API_BASE}/superintelligence`);
    return res.data.data;
  },
  simulateSuperintelligence: async (simulationName: string, timeHorizonYears: number) => {
    const res = await axios.post(`${API_BASE}/superintelligence/simulate`, { simulationName, timeHorizonYears });
    return res.data.data;
  },
  getMetaLearning: async () => {
    const res = await axios.get(`${API_BASE}/meta-learning`);
    return res.data.data;
  },
  getCognitiveBottlenecks: async (): Promise<CognitiveBottleneckResponse> => {
    const res = await axios.get(`${API_BASE}/bottlenecks`);
    return res.data.data;
  },
  getKnowledgeCompounding: async (): Promise<KnowledgeCompoundingResponse> => {
    const res = await axios.get(`${API_BASE}/compounding`);
    return res.data.data;
  }
};
