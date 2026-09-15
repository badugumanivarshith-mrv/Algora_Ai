import { Request, Response } from "express";
import { AgentRepository } from "../repositories/agentRepository";
import { AgentOrchestratorService } from "../services/ai/agentOrchestratorService";
import { PersonalAIAssistantService } from "../services/ai/personalAIAssistantService";
import { GoalPlanningService } from "../services/ai/goalPlanningService";
import { RecommendationOrchestratorService } from "../services/ai/recommendationOrchestratorService";
import { PersonalProductivityService } from "../services/ai/personalProductivityService";
import { WorkflowEngineService } from "../services/ai/workflowEngineService";
import { AgentMarketplaceService } from "../services/ai/agentMarketplaceService";
import { IntegrationService } from "../services/ai/integrationService";
import { WorkflowAutomationService } from "../services/ai/workflowAutomationService";
import { AgentOperationsService } from "../services/ai/agentOperationsService";
import { AgentOperationsRepository } from "../repositories/agentOperationsRepository";
import { KnowledgeFabricService } from "../services/ai/knowledgeFabricService";
import { StrategicDecisionService } from "../services/ai/strategicDecisionService";
import { DigitalTwinService } from "../services/ai/digitalTwinService";
import { FutureSimulationService } from "../services/ai/futureSimulationService";
import { AutonomousExecutionPlanner } from "../services/ai/autonomousExecutionPlanner";
import { AdaptiveStrategyService } from "../services/ai/adaptiveStrategyService";
import { OpportunityDiscoveryService } from "../services/ai/opportunityDiscoveryService";
import { ExecutionTimelineService } from "../services/ai/executionTimelineService";
import { AgentCouncilService } from "../services/ai/agentCouncilService";
import { ExecutiveDebateService } from "../services/ai/executiveDebateService";
import { LifePlannerService } from "../services/ai/lifePlannerService";
import { StrategicCampaignService } from "../services/ai/strategicCampaignService";
import { ExecutiveMemoryService } from "../services/ai/executiveMemoryService";
import { SimulationDirectorService } from "../services/ai/simulationDirectorService";
import { CompanySimulationService } from "../services/ai/companySimulationService";
import { EnterpriseSimulationService } from "../services/ai/enterpriseSimulationService";
import { ProductionEngineeringService } from "../services/ai/productionEngineeringService";
import { StartupSimulationService } from "../services/ai/startupSimulationService";
import { ResearchSimulationService } from "../services/ai/researchSimulationService";
import { CareerSandboxService } from "../services/ai/careerSandboxService";
import { SimulationRepository } from "../repositories/simulationRepository";
import { ProductivityRepository } from "../repositories/productivityRepository";
import { logger } from "../utils/logger";

export class AIOSController {
  public static async getOperationalMetrics(req: Request, res: Response) {
    try {
      const metrics = await AgentOperationsService.getSystemHealth();
      res.json({ status: 'success', data: metrics });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getExecutionHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const history = await AgentOperationsRepository.getExecutionTimeline(userId);
      res.json({ status: 'success', data: history });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getExecutionDetails(req: Request, res: Response) {
    try {
      const steps = await AgentOperationsRepository.getExecutionSteps(req.params.id);
      res.json({ status: 'success', data: steps });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getAgentHealth(req: Request, res: Response) {
    try {
      const health = await AgentOperationsService.getAgentHealth(req.params.id);
      res.json({ status: 'success', data: health });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getAlerts(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const alerts = await AgentOperationsRepository.getActiveAlerts(userId);
      res.json({ status: 'success', data: alerts });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async resolveAlert(req: Request, res: Response) {
    try {
      const result = await AgentOperationsRepository.resolveAlert(req.params.id);
      res.json({ status: 'success', data: result });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async optimizeWorkflow(req: Request, res: Response) {
    try {
      const plan = await AgentOperationsService.optimizeWorkflow(req.params.id);
      res.json({ status: 'success', data: plan });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getAgents(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const agents = await AgentRepository.getAgents(userId);
      res.json({ status: 'success', data: agents });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async createAgent(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const agent = await AgentRepository.createAgent(userId, req.body);
      res.json({ status: 'success', data: agent });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async createGoal(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const goal = await GoalPlanningService.createGoalPlan(userId, req.body.title, req.body.targetDate);
      res.json({ status: 'success', data: goal });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getGoals(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const goals = await AgentRepository.getGoals(userId);
      res.json({ status: 'success', data: goals });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async executeAgent(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const result = await AgentOrchestratorService.orchestrate(userId, req.body.intent);
      res.json({ status: 'success', data: result });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getRecommendations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const recs = await RecommendationOrchestratorService.generateGlobalRecommendations(userId);
      res.json({ status: 'success', data: recs });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const stats = await AgentMarketplaceService.getAnalytics(userId);
      res.json({ status: 'success', data: stats });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  // Builder & Marketplace Endpoints
  public static async getTemplates(req: Request, res: Response) {
    try {
      const templates = await AgentRepository.getTemplates();
      res.json({ status: 'success', data: templates });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async createTemplate(req: Request, res: Response) {
    try {
      const template = await AgentRepository.createTemplate(req.body);
      res.json({ status: 'success', data: template });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getMarketplace(req: Request, res: Response) {
    try {
      const agents = await AgentMarketplaceService.listMarketplace(req.query);
      res.json({ status: 'success', data: agents });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async installAgent(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const install = await AgentMarketplaceService.installAgent(userId, req.params.id);
      res.json({ status: 'success', data: install });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async rateAgent(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const rating = await AgentMarketplaceService.rateAgent(userId, req.params.id, req.body.rating, req.body.review);
      res.json({ status: 'success', data: rating });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async executeWorkflow(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const result = await WorkflowEngineService.executeWorkflow(userId, req.params.id, req.body.input);
      res.json({ status: 'success', data: result });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async createTeam(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const team = await AgentRepository.createTeam(userId, req.body);
      res.json({ status: 'success', data: team });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getTeams(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const teams = await AgentRepository.getTeams(userId);
      res.json({ status: 'success', data: teams });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  // Productivity & Integrations
  public static async getProductivityAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const analytics = await PersonalProductivityService.getAnalytics(userId);
      res.json({ status: 'success', data: analytics });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getIntegrations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const integrations = await IntegrationService.getConnections(userId);
      res.json({ status: 'success', data: integrations });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async connectIntegration(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const { serviceName, accessToken, metadata } = req.body;
      const integration = await IntegrationService.connectService(userId, serviceName, accessToken, metadata);
      res.json({ status: 'success', data: integration });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getWorkflows(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const workflowsList = await ProductivityRepository.getWorkflows(userId);
      res.json({ status: 'success', data: workflowsList });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async createWorkflow(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const workflow = await WorkflowAutomationService.createWorkflow(userId, req.body);
      res.json({ status: 'success', data: workflow });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getTasks(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const tasks = await ProductivityRepository.getTasks(userId);
      res.json({ status: 'success', data: tasks });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getAutomationSuggestions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const suggestions = await PersonalProductivityService.getAIAssistantSuggestions(userId);
      res.json({ status: 'success', data: suggestions });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  // Knowledge Fabric & Intelligence Platform
  public static async getGlobalKnowledgeGraph(req: Request, res: Response) {
    try {
      await KnowledgeFabricService.initializeFabric(); // Ensure seeded
      const graph = await KnowledgeFabricService.getGlobalGraph();
      res.json({ status: 'success', data: graph });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getIntelligenceProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const data = await KnowledgeFabricService.getUserIntelligence(userId);
      res.json({ status: 'success', data });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async syncKnowledge(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const profile = await KnowledgeFabricService.syncUserKnowledge(userId);
      res.json({ status: 'success', data: profile });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  // ==========================================
  // Strategic Decision & Executive Endpoints
  // ==========================================

  public static async getExecutiveDashboard(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const dashboard = await StrategicDecisionService.getExecutiveProfile(userId);
      res.json({ status: 'success', data: dashboard });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async evaluateStrategicDecisions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const result = await StrategicDecisionService.evaluateStrategicDecisions(userId);
      res.json({ status: 'success', data: result });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async executeDecisionAction(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const { recommendationId, action, feedback } = req.body;
      if (!recommendationId || !action) {
        return res.status(400).json({ status: 'error', message: 'recommendationId and action are required' });
      }
      const result = await StrategicDecisionService.executeDecisionAction(userId, recommendationId, action, feedback);
      res.json({ status: 'success', data: result });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async setStrategicGoal(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const { goalType, customDetails } = req.body;
      if (!goalType) {
        return res.status(400).json({ status: 'error', message: 'goalType is required' });
      }
      const goal = await StrategicDecisionService.setStrategicGoal(userId, goalType, customDetails);
      res.json({ status: 'success', data: goal });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getExecutiveArchetypes(req: Request, res: Response) {
    try {
      res.json({ status: 'success', data: StrategicDecisionService.GOAL_ARCHETYPES });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async askExecutiveAdvisor(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const { question } = req.body;
      if (!question) {
        return res.status(400).json({ status: 'error', message: 'question is required' });
      }
      const answer = await StrategicDecisionService.answerExecutiveQuestion(userId, question);
      res.json({ status: 'success', data: { question, answer } });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  // Autonomous Execution Layer & Digital Twin Intelligence (V4.6)
  public static async getDigitalTwin(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const twin = await DigitalTwinService.getDigitalTwin(userId);
      res.json({ status: 'success', data: twin });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getExecutiveForecast(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const forecast = await DigitalTwinService.getForecastSummary(userId);
      res.json({ status: 'success', data: forecast });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getSimulations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const sims = await FutureSimulationService.getLatestSimulations(userId);
      res.json({ status: 'success', data: sims });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async createSimulation(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const { timeframe, dailyStudyHours, focusArea, targetCompany, customAssumptions } = req.body;
      const result = await FutureSimulationService.runSimulation(userId, {
        timeframe: timeframe || "6_months",
        dailyStudyHours: dailyStudyHours ? parseFloat(dailyStudyHours) : 2.5,
        focusArea,
        targetCompany,
        customAssumptions
      });
      res.json({ status: 'success', data: result });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getAutonomousPlan(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const plan = await AutonomousExecutionPlanner.getPlan(userId);
      res.json({ status: 'success', data: plan });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async createAutonomousPlan(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const { goalId } = req.body;
      const plan = await AutonomousExecutionPlanner.generateAutonomousPlan(userId, goalId);
      res.json({ status: 'success', data: plan });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async completePlanAction(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const actionId = req.params.id;
      const { outcomeData } = req.body;
      const result = await AutonomousExecutionPlanner.completeAction(userId, actionId, outcomeData);
      await ExecutionTimelineService.recordEvent(
        userId,
        "Action_Completed",
        "Execution Action Completed",
        `Successfully marked action ${actionId} as complete.`,
        "Success",
        outcomeData
      );
      res.json({ status: 'success', data: result });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getOpportunities(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const opps = await OpportunityDiscoveryService.getOpportunities(userId);
      res.json({ status: 'success', data: opps });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getExecutionTimeline(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const timeline = await ExecutionTimelineService.getTimeline(userId);
      res.json({ status: 'success', data: timeline });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async adaptStrategy(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const result = await AdaptiveStrategyService.evaluateAndAdapt(userId);
      res.json({ status: 'success', data: result });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  // Multi-Agent Executive Council & Autonomous Career OS (V4.7)
  public static async getCouncil(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const councilData = await AgentCouncilService.getCouncil(userId);
      res.json({ status: 'success', data: councilData });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async runExecutiveDebate(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const { topic, agentAId, agentBId } = req.body;
      const debate = await ExecutiveDebateService.runDebate(userId, { topic, agentAId, agentBId });
      res.json({ status: 'success', data: debate });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getLifePlans(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const plans = await LifePlannerService.getLifePlans(userId);
      res.json({ status: 'success', data: plans });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getStrategicCampaigns(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const campaigns = await StrategicCampaignService.getCampaigns(userId);
      res.json({ status: 'success', data: campaigns });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getExecutiveOpportunities(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const opps = await OpportunityDiscoveryService.getOpportunities(userId);
      res.json({ status: 'success', data: opps });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getExecutiveForecastModel(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const forecast = await FutureSimulationService.runCouncilImpactModeling(userId);
      res.json({ status: 'success', data: forecast });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getExecutiveMemories(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const memories = await ExecutiveMemoryService.getMemories(userId);
      res.json({ status: 'success', data: memories });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async recalculateExecutiveCouncil(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const result = await AgentCouncilService.conveneCouncil(userId);
      await LifePlannerService.generateLifePlans(userId);
      await OpportunityDiscoveryService.discoverOpportunities(userId);
      res.json({ status: 'success', data: result });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  // --- V4.8 Autonomous Enterprise Simulation & Career Sandbox Endpoints ---
  public static async getSimulationOverview(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const overview = await SimulationDirectorService.getCompleteSimulationOverview(userId);
      res.json({ status: 'success', data: overview });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async startCompanySimulation(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const { companySlug, role } = req.body;
      const result = await CompanySimulationService.startCompanySimulation(userId, companySlug || 'google', role || 'SDE_2');
      res.json({ status: 'success', data: result });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async submitSimulationAction(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const { sessionId, eventId, actionPayload } = req.body;
      const result = await CompanySimulationService.submitEngineeringAction(userId, sessionId, eventId, actionPayload);
      res.json({ status: 'success', data: result });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getSimulationHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const sessions = await SimulationRepository.getUserSessions(userId);
      res.json({ status: 'success', data: sessions });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getSimulationScore(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const score = await SimulationRepository.getLatestScore(userId);
      res.json({ status: 'success', data: score });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getSimulationFeedback(req: Request, res: Response) {
    try {
      const { sessionId } = req.query;
      const feedback = await SimulationRepository.getSessionFeedback(String(sessionId || ''));
      res.json({ status: 'success', data: feedback });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getCareerSandboxes(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const sandboxes = await CareerSandboxService.getCareerSandboxes(userId);
      res.json({ status: 'success', data: sandboxes });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async getCompanyDetails(req: Request, res: Response) {
    try {
      const { slug } = req.query;
      const company = await EnterpriseSimulationService.getCompany(String(slug || 'google'));
      res.json({ status: 'success', data: company });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async mitigateIncident(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const { incidentId, userMitigation } = req.body;
      const result = await ProductionEngineeringService.evaluateIncidentMitigation(userId, incidentId, userMitigation);
      await SimulationDirectorService.recordSimulatedOutcome(userId, {
        category: 'incident_response',
        title: `Mitigated Incident ${incidentId}`,
        score: result.score,
        details: result.analysis
      });
      res.json({ status: 'success', data: result });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async pitchStartupInvestors(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const { pitchDeck } = req.body;
      const result = await StartupSimulationService.pitchInvestors(userId, pitchDeck);
      res.json({ status: 'success', data: result });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async submitResearchRebuttal(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const { rebuttalText } = req.body;
      const result = await ResearchSimulationService.submitPaperRebuttal(userId, rebuttalText);
      res.json({ status: 'success', data: result });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }

  public static async simulatePromotion(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'user_1';
      const { pathSlug } = req.body;
      const result = await CareerSandboxService.simulatePromotion(userId, pathSlug);
      await SimulationDirectorService.recordSimulatedOutcome(userId, {
        category: 'promotion',
        title: `Simulated Promotion on ${pathSlug}`,
        score: 95,
        details: result.promotionDelta
      });
      res.json({ status: 'success', data: result });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  }
}
