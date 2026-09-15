import { 
  SimulationRepository, 
  CareerSandboxRecord 
} from "../../repositories/simulationRepository";
import { DigitalTwinService } from "./digitalTwinService";
import { FutureSimulationService } from "./futureSimulationService";
import { logger } from "../../utils/logger";
import { v4 as uuidv4 } from "uuid";

export const DEFAULT_CAREER_PATHS: Array<Omit<CareerSandboxRecord, "id" | "userId" | "createdAt" | "updatedAt">> = [
  {
    pathSlug: "google-swe",
    pathTitle: "Google SWE: L3 to Staff L6 Fast-Track",
    targetCompany: "Google",
    startingLevel: "L3 / Software Engineer I",
    currentLevel: "L4 / Software Engineer II",
    targetLevel: "L6 / Staff Software Engineer",
    projectedTimelineMonths: 28,
    projectedSalaryTrajectory: [
      { year: "Year 1 (L3)", base: "$145k", equity: "$65k", bonus: "$25k", total: "$235,000" },
      { year: "Year 2 (L4)", base: "$175k", equity: "$110k", bonus: "$35k", total: "$320,000" },
      { year: "Year 3 (L5)", base: "$215k", equity: "$190k", bonus: "$50k", total: "$455,000" },
      { year: "Year 4 (L6 Staff)", base: "$270k", equity: "$310k", bonus: "$75k", total: "$655,000" }
    ],
    milestoneProgress: [
      { milestone: "L4 Promotion: Deliver Multi-Region Distributed Cache Invalidation", status: "Completed", date: "Month 6" },
      { milestone: "L5 Promotion: Lead Cross-Team Storage Engine Redesign (Borg/Colossus)", status: "In_Progress", targetMonth: "Month 18" },
      { milestone: "L6 Staff Packet: Author Org-Wide Infrastructure Architecture RFC", status: "Upcoming", targetMonth: "Month 28" }
    ],
    risks: [
      { risk: "Committee promo velocity slowdowns", probability: "Medium", mitigation: "Secure strong sponsorship from 2 Staff/Principal mentors early." },
      { risk: "Product roadmap pivot", probability: "Low", mitigation: "Anchor in foundational platform/infrastructure layers." }
    ]
  },
  {
    pathSlug: "ai-systems-engineer",
    pathTitle: "Frontier AI Systems Engineer: Foundation Model Infrastructure",
    targetCompany: "OpenAI / Anthropic",
    startingLevel: "Research Engineer (MTS-1)",
    currentLevel: "Research Engineer (MTS-2)",
    targetLevel: "Staff Member of Technical Staff (MTS-3)",
    projectedTimelineMonths: 24,
    projectedSalaryTrajectory: [
      { year: "Year 1 (MTS-1)", base: "$200k", equity: "$150k", bonus: "$40k", total: "$390,000" },
      { year: "Year 2 (MTS-2)", base: "$260k", equity: "$340k", bonus: "$60k", total: "$660,000" },
      { year: "Year 3 (MTS-3 Staff)", base: "$340k", equity: "$650k", bonus: "$100k", total: "$1,090,000" }
    ],
    milestoneProgress: [
      { milestone: "Multi-Node Triton Inference Acceleration Kernel Deployment", status: "Completed", date: "Month 4" },
      { milestone: "Zero-Bubble 16k GPU Distributed Training Pipeline", status: "In_Progress", targetMonth: "Month 12" },
      { milestone: "Next-Gen Speculative Decoding Engine Standard", status: "Upcoming", targetMonth: "Month 24" }
    ],
    risks: [
      { risk: "Rapid GPU hardware architecture churn (Blackwell/B200)", probability: "High", mitigation: "Build hardware-agnostic kernel compilers (Triton/Mojo)." }
    ]
  },
  {
    pathSlug: "startup-founder",
    pathTitle: "AI Infrastructure Founder: Pre-Seed to Series A Exit",
    targetCompany: "Venture-Backed Startup",
    startingLevel: "Solo Technical Founder",
    currentLevel: "Seed-Stage CEO / CTO",
    targetLevel: "Series A / Enterprise Scale Leader",
    projectedTimelineMonths: 36,
    projectedSalaryTrajectory: [
      { year: "Year 1 (Pre-Seed)", base: "$80k", equity: "70% Equity", bonus: "$0", total: "$80,000 + High Equity Upside" },
      { year: "Year 2 (Seed $3M)", base: "$150k", equity: "55% Equity ($15M Valuation)", bonus: "$0", total: "$150,000 + $8.25M Equity" },
      { year: "Year 3 (Series A $12M)", base: "$200k", equity: "42% Equity ($50M Valuation)", bonus: "$0", total: "$200,000 + $21.0M Equity" }
    ],
    milestoneProgress: [
      { milestone: "Release Open-Source Engine to 2,500 GitHub Stars", status: "Completed", date: "Month 3" },
      { milestone: "Close $50k MRR with 4 Enterprise Design Partners", status: "In_Progress", targetMonth: "Month 14" },
      { milestone: "Close $12M Series A led by Tier-1 Venture Fund", status: "Upcoming", targetMonth: "Month 24" }
    ],
    risks: [
      { risk: "Customer concentration risk with early design partners", probability: "Medium", mitigation: "Diversify across FinTech and HealthTech sectors." }
    ]
  }
];

export class CareerSandboxService {
  public static async getCareerSandboxes(userId: string): Promise<CareerSandboxRecord[]> {
    let sandboxes = await SimulationRepository.getSandboxesByUserId(userId);
    if (sandboxes.length === 0) {
      for (const def of DEFAULT_CAREER_PATHS) {
        const record: CareerSandboxRecord = {
          id: `sandbox-${def.pathSlug}-${uuidv4()}`,
          userId,
          ...def,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await SimulationRepository.saveSandbox(record);
      }
      sandboxes = await SimulationRepository.getSandboxesByUserId(userId);
    }
    return sandboxes;
  }

  public static async simulatePromotion(
    userId: string,
    pathSlug: string
  ): Promise<{
    updatedSandbox: CareerSandboxRecord;
    promotionDelta: string;
    newComp: string;
  }> {
    logger.info(`[CareerSandbox] Simulating promotion evaluation for user ${userId} on path ${pathSlug}...`);

    const sandboxes = await this.getCareerSandboxes(userId);
    const sandbox = sandboxes.find(s => s.pathSlug === pathSlug) || sandboxes[0];

    sandbox.currentLevel = sandbox.targetLevel;
    sandbox.updatedAt = new Date().toISOString();
    await SimulationRepository.saveSandbox(sandbox);

    return {
      updatedSandbox: sandbox,
      promotionDelta: `Promoted to ${sandbox.targetLevel}! Verified by calibration committee.`,
      newComp: sandbox.projectedSalaryTrajectory?.[sandbox.projectedSalaryTrajectory.length - 1]?.total || "$520,000+"
    };
  }
}
