import { Router } from "express";
import { AIOSController } from "../controllers/aiosController";

const router = Router();

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

export default router;
