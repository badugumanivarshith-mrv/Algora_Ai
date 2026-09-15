import { Router } from "express";
import { AIOSController } from "../controllers/aiosController";
import { optionalAuth } from "../middleware/auth";
import { aiLimiter } from "../middleware/rateLimit";

const router = Router();

router.use(optionalAuth);
router.use(aiLimiter);

router.get("/agents", AIOSController.getAgents);
router.post("/agent", AIOSController.createAgent);

router.get("/goals", AIOSController.getGoals);
router.post("/goal", AIOSController.createGoal);

router.post("/execute", AIOSController.executeAgent);
router.get("/recommendations", AIOSController.getRecommendations);
router.get("/analytics", AIOSController.getAnalytics);

// Builder & Marketplace Routes
router.get("/templates", AIOSController.getTemplates);
router.post("/templates", AIOSController.createTemplate);
router.get("/marketplace", AIOSController.getMarketplace);
router.post("/marketplace/:id/install", AIOSController.installAgent);
router.post("/marketplace/:id/rate", AIOSController.rateAgent);
router.post("/workflows/:id/execute", AIOSController.executeWorkflow);
router.get("/teams", AIOSController.getTeams);
router.post("/teams", AIOSController.createTeam);

// Productivity & Integration Routes
router.get("/productivity/analytics", AIOSController.getProductivityAnalytics);
router.get("/productivity/suggestions", AIOSController.getAutomationSuggestions);
router.get("/integrations", AIOSController.getIntegrations);
router.post("/integrations/connect", AIOSController.connectIntegration);
router.get("/automation/workflows", AIOSController.getWorkflows);
router.post("/automation/workflows", AIOSController.createWorkflow);
router.get("/tasks", AIOSController.getTasks);

// Operational & Observability Routes
router.get("/ops/metrics", AIOSController.getOperationalMetrics);
router.get("/ops/executions", AIOSController.getExecutionHistory);
router.get("/ops/executions/:id", AIOSController.getExecutionDetails);
router.get("/ops/agents/:id/health", AIOSController.getAgentHealth);
router.get("/ops/alerts", AIOSController.getAlerts);
router.post("/ops/alerts/:id/resolve", AIOSController.resolveAlert);
router.post("/ops/workflows/:id/optimize", AIOSController.optimizeWorkflow);

// Knowledge Fabric & Intelligence Routes
router.get("/intel/graph", AIOSController.getGlobalKnowledgeGraph);
router.get("/intel/profile", AIOSController.getIntelligenceProfile);
router.post("/intel/sync", AIOSController.syncKnowledge);

// Strategic Decision Engine & Personal AI Executive Routes
router.get("/executive/dashboard", AIOSController.getExecutiveDashboard);
router.post("/executive/evaluate", AIOSController.evaluateStrategicDecisions);
router.post("/executive/action", AIOSController.executeDecisionAction);
router.post("/executive/goal", AIOSController.setStrategicGoal);
router.get("/executive/archetypes", AIOSController.getExecutiveArchetypes);
router.post("/executive/ask", AIOSController.askExecutiveAdvisor);

// Autonomous Execution Layer & Digital Twin Intelligence Routes (V4.6)
router.get("/digital-twin", AIOSController.getDigitalTwin);
router.get("/executive-forecast", AIOSController.getExecutiveForecast);
router.get("/simulations", AIOSController.getSimulations);
router.post("/simulations", AIOSController.createSimulation);
router.get("/autonomous-plan", AIOSController.getAutonomousPlan);
router.post("/autonomous-plan", AIOSController.createAutonomousPlan);
router.post("/autonomous-plan/action/:id/complete", AIOSController.completePlanAction);
router.get("/opportunities", AIOSController.getOpportunities);
router.get("/execution-timeline", AIOSController.getExecutionTimeline);
router.post("/adaptive-strategy/adapt", AIOSController.adaptStrategy);

// Multi-Agent Executive Council & Autonomous Career OS Routes (V4.7)
router.get("/executive/council", AIOSController.getCouncil);
router.post("/executive/debate", AIOSController.runExecutiveDebate);
router.get("/executive/plans", AIOSController.getLifePlans);
router.get("/executive/campaigns", AIOSController.getStrategicCampaigns);
router.get("/executive/opportunities", AIOSController.getExecutiveOpportunities);
router.get("/executive/forecast", AIOSController.getExecutiveForecastModel);
router.get("/executive/memory", AIOSController.getExecutiveMemories);
router.post("/executive/recalculate", AIOSController.recalculateExecutiveCouncil);

// Autonomous Enterprise Simulation & Real-World Career Sandbox Routes (V4.8)
router.get("/enterprise-simulations/overview", AIOSController.getSimulationOverview);
router.post("/enterprise-simulations/start", AIOSController.startCompanySimulation);
router.post("/enterprise-simulations/action", AIOSController.submitSimulationAction);
router.get("/enterprise-simulations/history", AIOSController.getSimulationHistory);
router.get("/enterprise-simulations/score", AIOSController.getSimulationScore);
router.get("/enterprise-simulations/feedback", AIOSController.getSimulationFeedback);
router.get("/enterprise-simulations/career-sandbox", AIOSController.getCareerSandboxes);
router.get("/enterprise-simulations/company", AIOSController.getCompanyDetails);
router.post("/enterprise-simulations/incident/mitigate", AIOSController.mitigateIncident);
router.post("/enterprise-simulations/startup/pitch", AIOSController.pitchStartupInvestors);
router.post("/enterprise-simulations/research/rebuttal", AIOSController.submitResearchRebuttal);
router.post("/enterprise-simulations/career/promote", AIOSController.simulatePromotion);

// V4.9 Autonomous Skill Economy, Reputation Network & Talent Marketplace
router.get("/reputation", AIOSController.getReputation);
router.post("/reputation/recalculate", AIOSController.recalculateReputation);
router.get("/skills", AIOSController.getSkills);
router.get("/marketplace", AIOSController.getTalentMarketplace);
router.get("/opportunities", AIOSController.getMatchedOpportunities);
router.get("/portfolio", AIOSController.getPortfolio);
router.get("/benchmarks", AIOSController.getBenchmarks);
router.get("/collaborators", AIOSController.getCollaborators);

// V5.0 Autonomous AI University & Human Capability OS
router.get("/university", AIOSController.getUniversity);
router.post("/university/enroll", AIOSController.enrollUniversityDegree);
router.post("/university/recalculate", AIOSController.recalculateUniversity);
router.get("/capabilities", AIOSController.getCapabilities);
router.get("/mentors", AIOSController.getMentors);
router.post("/mentors/debate", AIOSController.conductMentorDebate);
router.get("/marketplace/learning", AIOSController.getLearningMarketplace);
router.get("/credentials", AIOSController.getCredentials);
router.post("/credentials/verify", AIOSController.verifyCredentialHash);
router.get("/potential", AIOSController.getPotential);
router.post("/potential/simulate", AIOSController.simulatePotentialTrajectory);
router.get("/impact", AIOSController.getGlobalImpact);
router.post("/impact/event", AIOSController.logImpactEvent);

// V5.1 Personal Superintelligence & AGI Research Lab
router.get("/cognitive/profile", AIOSController.getCognitiveProfile);
router.get("/cognitive/dna", AIOSController.getLearningDNA);
router.get("/cognitive/agi-research", AIOSController.getAGIResearchSummary);
router.post("/cognitive/agi-research/plan", AIOSController.generateResearchPlan);
router.get("/cognitive/superintelligence", AIOSController.getSuperintelligenceSummary);
router.post("/cognitive/superintelligence/simulate", AIOSController.runSuperintelligenceSimulation);
router.get("/cognitive/meta-learning", AIOSController.getMetaLearningSummary);
router.get("/cognitive/bottlenecks", AIOSController.getCognitiveBottleneckSummary);
router.get("/cognitive/compounding", AIOSController.getKnowledgeCompoundingSummary);

export default router;
