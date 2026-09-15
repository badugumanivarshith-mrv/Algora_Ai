import { 
  SimulationRepository, 
  StartupSimulationRecord 
} from "../../repositories/simulationRepository";
import { KnowledgeFabricService } from "./knowledgeFabricService";
import { logger } from "../../utils/logger";
import { v4 as uuidv4 } from "uuid";

export class StartupSimulationService {
  public static async getStartupSimulation(userId: string): Promise<StartupSimulationRecord> {
    let startup = await SimulationRepository.getStartupByUserId(userId);
    if (!startup) {
      startup = {
        id: `startup-${uuidv4()}`,
        userId,
        startupName: "NexusAI Labs",
        marketVertical: "Autonomous Developer Infrastructure & Agents",
        stage: "Seed Stage",
        capitalRaised: 750000.00,
        runwayMonths: 16,
        burnRate: 28000.00,
        mrr: 14500.00,
        productStatus: "V2_Production_Beta",
        investorFeedback: [
          {
            partner: "Marc Andreessen (AI Partner)",
            firm: "Horizon Ventures",
            verdict: "Strong Conviction",
            valuationCap: "$12M Safe",
            quote: "Exceptional technical moats around multi-agent concurrency and telemetry. Focus on expanding enterprise net retention.",
            score: 94
          },
          {
            partner: "Elad Gil (Angel)",
            firm: "Autonomous Capital",
            verdict: "Participating",
            valuationCap: "$12M Safe",
            quote: "Impressive early developer adoption. Recommendation: double down on open-source core + enterprise VPC deployment.",
            score: 91
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await SimulationRepository.saveStartup(startup);
    }
    return startup;
  }

  public static async pitchInvestors(
    userId: string,
    pitchDeck: {
      tagline: string;
      problem: string;
      solution: string;
      moat: string;
      traction: string;
      ask: string;
    }
  ): Promise<{
    score: number;
    valuationOffer: string;
    investorComments: string[];
    nextMilestone: string;
  }> {
    logger.info(`[StartupSimulation] Evaluating investor pitch deck for user ${userId}...`);

    let score = 82;
    const comments: string[] = [];

    if (pitchDeck.moat.toLowerCase().includes("data flywheel") || pitchDeck.moat.toLowerCase().includes("proprietary") || pitchDeck.moat.toLowerCase().includes("developer lock-in")) {
      score += 8;
      comments.push("Distinct defensibility story with compounding data advantages.");
    }
    if (pitchDeck.traction.toLowerCase().includes("mrr") || pitchDeck.traction.toLowerCase().includes("retention") || pitchDeck.traction.toLowerCase().includes("github")) {
      score += 6;
      comments.push("Quantitative traction demonstrates strong PMF velocity.");
    }

    const finalScore = Math.min(98, score);
    const valuation = finalScore >= 90 ? "$15M Post-Money Valuation" : "$8M Safe Cap";

    // Update startup record
    const startup = await this.getStartupSimulation(userId);
    startup.capitalRaised += finalScore >= 90 ? 1500000 : 500000;
    startup.stage = "Series A Preparation";
    startup.runwayMonths = 24;
    startup.updatedAt = new Date().toISOString();
    await SimulationRepository.saveStartup(startup);

    await KnowledgeFabricService.recordExperienceFragment(userId, "Startup_Innovation", {
      title: `Raised Seed Capital in Autonomous Startup Simulation (${valuation})`,
      content: `Secured simulated venture investment based on developer platform metrics and autonomous agent moats.`,
      tags: ["StartupFounder", "Fundraising", "SeedRound"]
    });

    return {
      score: finalScore,
      valuationOffer: valuation,
      investorComments: comments.length > 0 ? comments : ["Well-structured presentation. Increase speed of enterprise pilots."],
      nextMilestone: "Reach $50k MRR and close 3 Fortune 500 enterprise pilot agreements."
    };
  }
}
