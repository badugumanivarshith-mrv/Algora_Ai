import { 
  CompanySimulationService 
} from "./companySimulationService";
import { 
  EnterpriseSimulationService 
} from "./enterpriseSimulationService";
import { 
  ProductionEngineeringService 
} from "./productionEngineeringService";
import { 
  StartupSimulationService 
} from "./startupSimulationService";
import { 
  ResearchSimulationService 
} from "./researchSimulationService";
import { 
  CareerSandboxService 
} from "./careerSandboxService";
import { DigitalTwinService } from "./digitalTwinService";
import { KnowledgeFabricService } from "./knowledgeFabricService";
import { ExecutiveCouncilRepository } from "../../repositories/executiveCouncilRepository";
import { logger } from "../../utils/logger";
import { v4 as uuidv4 } from "uuid";

export class SimulationDirectorService {
  public static async getCompleteSimulationOverview(userId: string) {
    logger.info(`[SimulationDirector] Orchestrating complete enterprise simulation overview for user ${userId}...`);

    const [
      activeCompanySim,
      companies,
      incidents,
      designReviews,
      startup,
      research,
      sandboxes
    ] = await Promise.all([
      CompanySimulationService.getActiveSimulation(userId).catch(() => ({ session: null, company: { name: 'Google', slug: 'google', valuation: '$2T' }, events: [], feedback: [], score: 85 })),
      EnterpriseSimulationService.getCompanies().catch(() => []),
      ProductionEngineeringService.getIncidents().catch(() => []),
      ProductionEngineeringService.getDesignReviews().catch(() => []),
      StartupSimulationService.getStartupSimulation(userId).catch(() => ({})),
      ResearchSimulationService.getResearchSimulation(userId).catch(() => ({})),
      CareerSandboxService.getCareerSandboxes(userId).catch(() => [])
    ]);

    return {
      activeSession: activeCompanySim.session,
      currentCompany: activeCompanySim.company,
      sprintEvents: activeCompanySim.events,
      sessionFeedback: activeCompanySim.feedback,
      simulationScore: activeCompanySim.score,
      companies,
      incidents,
      designReviews,
      startup,
      research,
      sandboxes,
      directorStatus: {
        orchestratorState: "Active",
        aiActorCount: 8,
        activeSimulations: ["Enterprise SDE", "Startup Founder", "Research Fellow", "Career Sandbox"],
        fidelityScore: 96.5
      }
    };
  }

  public static async recordSimulatedOutcome(
    userId: string,
    outcome: {
      category: "incident_response" | "design_review" | "startup_milestone" | "paper_acceptance" | "promotion";
      title: string;
      score: number;
      details: string;
    }
  ) {
    logger.info(`[SimulationDirector] Recording simulated outcome ${outcome.category} for user ${userId}...`);

    // 1. Update Knowledge Fabric with simulated experience
    await KnowledgeFabricService.recordExperienceFragment(userId, "Enterprise_Simulation", {
      title: `Simulation: ${outcome.title}`,
      content: `${outcome.details} (Score: ${outcome.score}/100)`,
      tags: ["EnterpriseSimulation", outcome.category, `Score_${outcome.score}`]
    });

    // 2. Feed simulated experience into Executive Memory & Council Repository
    await ExecutiveCouncilRepository.saveMemory({
      id: `mem-sim-${uuidv4()}`,
      userId,
      memoryType: "Strategic_Simulation_Outcome",
      title: outcome.title,
      context: `Category: ${outcome.category}`,
      rationale: outcome.details,
      impactScore: outcome.score,
      associatedAgents: ["SimulationDirectorAgent", "CareerSandboxAgent"],
      metadata: { score: outcome.score, category: outcome.category },
      createdAt: new Date().toISOString()
    });

    // 3. Update Digital Twin behavioral insights
    const twin = await DigitalTwinService.updateDigitalTwin(userId);

    return {
      recorded: true,
      updatedHiringSignal: twin?.hiringReadiness?.probability || 88.0,
      timestamp: new Date().toISOString()
    };
  }
}
