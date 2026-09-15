const API_BASE = "/api/intelligence";

export interface KnowledgeNode {
  id: string;
  topic: string;
  subtopic: string;
  category: string;
  difficulty_level: string;
  description: string;
  prerequisites: string[];
}

export interface KnowledgeEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  relationship_type: string;
  weight: number;
}

export interface MasteryScore {
  id: string;
  user_id: string;
  topic: string;
  subtopic: string;
  mastery_rating: number;
  retention_score: number;
  revision_score: number;
  difficulty_score: number;
  last_practiced_at: string;
}

export interface KnowledgeGap {
  id: string;
  gap_type: string;
  topic: string;
  subtopic?: string;
  severity: string;
  detected_reason: string;
  remediation_action: string;
  is_resolved: boolean;
}

export interface KnowledgePrediction {
  id: string;
  prediction_type: string;
  topic?: string;
  risk_probability: number;
  prediction_reason: string;
  suggested_prevention: string;
}

export interface LearningRecommendation {
  id: string;
  recommendation_type: string;
  title: string;
  description: string;
  target_resource?: string;
  priority: string;
  is_completed: boolean;
}

export interface IntelligenceDashboard {
  graph: { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] };
  masteryScores: MasteryScore[];
  avgMastery: number;
  gaps: KnowledgeGap[];
  blockers: { blockerTopics: string[]; prerequisiteChain: any[] };
  predictions: KnowledgePrediction[];
  recommendations: LearningRecommendation[];
  companyReadiness: number;
  interviewReadiness: number;
}

export class LearningIntelligenceApi {
  public static async getDashboard(): Promise<{ success: boolean } & IntelligenceDashboard> {
    const res = await fetch(`${API_BASE}/dashboard`);
    return await res.json();
  }

  public static async getGraph(): Promise<{ success: boolean; graph: { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } }> {
    const res = await fetch(`${API_BASE}/graph`);
    return await res.json();
  }

  public static async getMastery(): Promise<{ success: boolean; masteryScores: MasteryScore[] }> {
    const res = await fetch(`${API_BASE}/mastery`);
    return await res.json();
  }

  public static async updateMastery(data: {
    topic: string;
    subtopic: string;
    correctSubmissions: number;
    totalAttempts: number;
    difficultyLevel?: string;
  }): Promise<{ success: boolean; score: MasteryScore }> {
    const res = await fetch(`${API_BASE}/mastery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  }

  public static async getGaps(): Promise<{ success: boolean; gaps: KnowledgeGap[] }> {
    const res = await fetch(`${API_BASE}/gaps`);
    return await res.json();
  }

  public static async getPredictions(): Promise<{ success: boolean; predictions: KnowledgePrediction[] }> {
    const res = await fetch(`${API_BASE}/predictions`);
    return await res.json();
  }

  public static async getRecommendations(): Promise<{ success: boolean; recommendations: LearningRecommendation[] }> {
    const res = await fetch(`${API_BASE}/recommendations`);
    return await res.json();
  }
}
