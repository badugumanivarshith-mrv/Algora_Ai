import axios from 'axios';

const API_BASE = '/api/aios';

export const aiosApi = {
  getAgents: async () => {
    const { data } = await axios.get(`${API_BASE}/agents`);
    return data;
  },
  createAgent: async (agent: any) => {
    const { data } = await axios.post(`${API_BASE}/agent`, agent);
    return data;
  },
  getGoals: async () => {
    const { data } = await axios.get(`${API_BASE}/goals`);
    return data;
  },
  createGoal: async (goal: any) => {
    const { data } = await axios.post(`${API_BASE}/goal`, goal);
    return data;
  },
  executeAgent: async (intent: string) => {
    const { data } = await axios.post(`${API_BASE}/execute`, { intent });
    return data;
  },
  getRecommendations: async () => {
    const { data } = await axios.get(`${API_BASE}/recommendations`);
    return data;
  },
  getAnalytics: async () => {
    const { data } = await axios.get(`${API_BASE}/analytics`);
    return data;
  },
  getMarketplace: async (filters: any = {}) => {
    const { data } = await axios.get(`${API_BASE}/marketplace`, { params: filters });
    return data;
  },
  installAgent: async (id: string) => {
    const { data } = await axios.post(`${API_BASE}/marketplace/${id}/install`);
    return data;
  },
  rateAgent: async (id: string, rating: number, review?: string) => {
    const { data } = await axios.post(`${API_BASE}/marketplace/${id}/rate`, { rating, review });
    return data;
  },
  getTemplates: async () => {
    const { data } = await axios.get(`${API_BASE}/templates`);
    return data;
  },
  createTemplate: async (template: any) => {
    const { data } = await axios.post(`${API_BASE}/templates`, template);
    return data;
  },
  executeWorkflow: async (id: string, input: any = {}) => {
    const { data } = await axios.post(`${API_BASE}/workflows/${id}/execute`, { input });
    return data;
  },
  getTeams: async () => {
    const { data } = await axios.get(`${API_BASE}/teams`);
    return data;
  },
  createTeam: async (team: any) => {
    const { data } = await axios.post(`${API_BASE}/teams`, team);
    return data;
  },
  getProductivityAnalytics: async () => {
    const { data } = await axios.get(`${API_BASE}/productivity/analytics`);
    return data;
  },
  getAutomationSuggestions: async () => {
    const { data } = await axios.get(`${API_BASE}/productivity/suggestions`);
    return data;
  },
  getIntegrations: async () => {
    const { data } = await axios.get(`${API_BASE}/integrations`);
    return data;
  },
  connectIntegration: async (integration: any) => {
    const { data } = await axios.post(`${API_BASE}/integrations/connect`, integration);
    return data;
  },
  getWorkflows: async () => {
    const { data } = await axios.get(`${API_BASE}/automation/workflows`);
    return data;
  },
  createWorkflow: async (workflow: any) => {
    const { data } = await axios.post(`${API_BASE}/automation/workflows`, workflow);
    return data;
  },
  getTasks: async () => {
    const { data } = await axios.get(`${API_BASE}/tasks`);
    return data;
  },
  getOpsMetrics: async () => {
    const { data } = await axios.get(`${API_BASE}/ops/metrics`);
    return data;
  },
  getExecutionHistory: async () => {
    const { data } = await axios.get(`${API_BASE}/ops/executions`);
    return data;
  },
  getExecutionDetails: async (id: string) => {
    const { data } = await axios.get(`${API_BASE}/ops/executions/${id}`);
    return data;
  },
  getAgentHealth: async (id: string) => {
    const { data } = await axios.get(`${API_BASE}/ops/agents/${id}/health`);
    return data;
  },
  getAlerts: async () => {
    const { data } = await axios.get(`${API_BASE}/ops/alerts`);
    return data;
  },
  resolveAlert: async (id: string) => {
    const { data } = await axios.post(`${API_BASE}/ops/alerts/${id}/resolve`);
    return data;
  },
  optimizeWorkflow: async (id: string) => {
    const { data } = await axios.post(`${API_BASE}/ops/workflows/${id}/optimize`);
    return data;
  },
  getGlobalGraph: async () => {
    const { data } = await axios.get(`${API_BASE}/intel/graph`);
    return data;
  },
  getIntelligenceProfile: async () => {
    const { data } = await axios.get(`${API_BASE}/intel/profile`);
    return data;
  },
  syncKnowledge: async () => {
    const { data } = await axios.post(`${API_BASE}/intel/sync`);
    return data;
  },
  getExecutiveDashboard: async () => {
    const { data } = await axios.get(`${API_BASE}/executive/dashboard`);
    return data;
  },
  evaluateStrategicDecisions: async () => {
    const { data } = await axios.post(`${API_BASE}/executive/evaluate`);
    return data;
  },
  executeDecisionAction: async (recommendationId: string, action: string, feedback?: string) => {
    const { data } = await axios.post(`${API_BASE}/executive/action`, { recommendationId, action, feedback });
    return data;
  },
  setStrategicGoal: async (goalType: string, customDetails?: any) => {
    const { data } = await axios.post(`${API_BASE}/executive/goal`, { goalType, customDetails });
    return data;
  },
  getExecutiveArchetypes: async () => {
    const { data } = await axios.get(`${API_BASE}/executive/archetypes`);
    return data;
  },
  askExecutiveAdvisor: async (question: string) => {
    const { data } = await axios.post(`${API_BASE}/executive/ask`, { question });
    return data;
  },

  // V4.6 Autonomous Execution Layer & Digital Twin Intelligence API
  getDigitalTwin: async () => {
    const { data } = await axios.get(`${API_BASE}/digital-twin`);
    return data;
  },
  getExecutiveForecast: async () => {
    const { data } = await axios.get(`${API_BASE}/executive-forecast`);
    return data;
  },
  getSimulations: async () => {
    const { data } = await axios.get(`${API_BASE}/simulations`);
    return data;
  },
  createSimulation: async (params: { timeframe: string; dailyStudyHours?: number; focusArea?: string; targetCompany?: string }) => {
    const { data } = await axios.post(`${API_BASE}/simulations`, params);
    return data;
  },
  getAutonomousPlan: async () => {
    const { data } = await axios.get(`${API_BASE}/autonomous-plan`);
    return data;
  },
  createAutonomousPlan: async (goalId?: string) => {
    const { data } = await axios.post(`${API_BASE}/autonomous-plan`, { goalId });
    return data;
  },
  completePlanAction: async (actionId: string, outcomeData?: any) => {
    const { data } = await axios.post(`${API_BASE}/autonomous-plan/action/${actionId}/complete`, { outcomeData });
    return data;
  },
  getOpportunities: async () => {
    const { data } = await axios.get(`${API_BASE}/opportunities`);
    return data;
  },
  getExecutionTimeline: async () => {
    const { data } = await axios.get(`${API_BASE}/execution-timeline`);
    return data;
  },
  adaptStrategy: async () => {
    const { data } = await axios.post(`${API_BASE}/adaptive-strategy/adapt`);
    return data;
  },

  // V4.7 Multi-Agent Executive Council & Autonomous Career OS API
  getExecutiveCouncil: async () => {
    const { data } = await axios.get(`${API_BASE}/executive/council`);
    return data;
  },
  runExecutiveDebate: async (params: { topic?: string; agentAId?: string; agentBId?: string }) => {
    const { data } = await axios.post(`${API_BASE}/executive/debate`, params);
    return data;
  },
  getLifePlans: async () => {
    const { data } = await axios.get(`${API_BASE}/executive/plans`);
    return data;
  },
  getStrategicCampaigns: async () => {
    const { data } = await axios.get(`${API_BASE}/executive/campaigns`);
    return data;
  },
  getExecutiveOpportunities: async () => {
    const { data } = await axios.get(`${API_BASE}/executive/opportunities`);
    return data;
  },
  getExecutiveForecastModel: async () => {
    const { data } = await axios.get(`${API_BASE}/executive/forecast`);
    return data;
  },
  getExecutiveMemories: async () => {
    const { data } = await axios.get(`${API_BASE}/executive/memory`);
    return data;
  },
  recalculateExecutiveCouncil: async () => {
    const { data } = await axios.post(`${API_BASE}/executive/recalculate`);
    return data;
  },

  // V4.8 Autonomous Enterprise Simulation & Career Sandbox API
  getSimulationOverview: async () => {
    const { data } = await axios.get(`${API_BASE}/enterprise-simulations/overview`);
    return data;
  },
  startCompanySimulation: async (params: { companySlug?: string; role?: string }) => {
    const { data } = await axios.post(`${API_BASE}/enterprise-simulations/start`, params);
    return data;
  },
  submitSimulationAction: async (params: { sessionId: string; eventId: string; actionPayload: any }) => {
    const { data } = await axios.post(`${API_BASE}/enterprise-simulations/action`, params);
    return data;
  },
  getSimulationHistory: async () => {
    const { data } = await axios.get(`${API_BASE}/enterprise-simulations/history`);
    return data;
  },
  getSimulationScore: async () => {
    const { data } = await axios.get(`${API_BASE}/enterprise-simulations/score`);
    return data;
  },
  getSimulationFeedback: async (sessionId: string) => {
    const { data } = await axios.get(`${API_BASE}/enterprise-simulations/feedback?sessionId=${sessionId}`);
    return data;
  },
  getCareerSandboxes: async () => {
    const { data } = await axios.get(`${API_BASE}/enterprise-simulations/career-sandbox`);
    return data;
  },
  getCompanyDetails: async (slug: string) => {
    const { data } = await axios.get(`${API_BASE}/enterprise-simulations/company?slug=${slug}`);
    return data;
  },
  mitigateIncident: async (params: { incidentId: string; userMitigation: string }) => {
    const { data } = await axios.post(`${API_BASE}/enterprise-simulations/incident/mitigate`, params);
    return data;
  },
  pitchStartupInvestors: async (params: { pitchDeck: any }) => {
    const { data } = await axios.post(`${API_BASE}/enterprise-simulations/startup/pitch`, params);
    return data;
  },
  submitResearchRebuttal: async (params: { rebuttalText: string }) => {
    const { data } = await axios.post(`${API_BASE}/enterprise-simulations/research/rebuttal`, params);
    return data;
  },
  simulatePromotion: async (params: { pathSlug: string }) => {
    const { data } = await axios.post(`${API_BASE}/enterprise-simulations/career/promote`, params);
    return data;
  }
};
