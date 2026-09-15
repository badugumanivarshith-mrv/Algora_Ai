import {
  ExecutiveCouncilRepository,
  ExecutiveDebateRecord
} from "../../repositories/executiveCouncilRepository";
import { ExecutiveMemoryService } from "./executiveMemoryService";
import { DigitalTwinService } from "./digitalTwinService";
import { RedisManager } from "../../redis/redisClient";
import { logger } from "../../utils/logger";
import { v4 as uuidv4 } from "uuid";

export interface DebateRequest {
  topic?: string;
  challengerAgent?: string;
  defenderAgent?: string;
  agentAId?: string;
  agentBId?: string;
}

export class ExecutiveDebateService {
  private static CACHE_TTL = 3600;

  public static async runDebate(userId: string, req: DebateRequest = {}): Promise<ExecutiveDebateRecord> {
    const topic = req.topic || "Contests vs Projects: Where should the next 40 hours of engineering effort be allocated?";
    const challenger = req.challengerAgent || req.agentAId || "Contest Executive (Kaelen Voss)";
    const defender = req.defenderAgent || req.agentBId || "Project Executive (Aria Chen)";

    logger.info(`[ExecutiveDebate] Staging executive debate between ${challenger} and ${defender} on "${topic}" for user ${userId}...`);

    const twin = await DigitalTwinService.getDigitalTwin(userId);
    const targetCompany = twin.readinessForecast?.targetCompany || "Google";
    const contestRating = twin.contestRatings?.rating || 1650;

    let debateData: Partial<ExecutiveDebateRecord>;

    if (topic.toLowerCase().includes("research") || topic.toLowerCase().includes("hiring")) {
      debateData = {
        topic: "Research Lab Publications vs FAANG Hiring Interview Simulations",
        challengerAgent: "Research Executive (Dr. Julian Thorne)",
        defenderAgent: "Career Executive (Marcus Sterling)",
        transcript: [
          {
            speaker: "Dr. Julian Thorne (Research Executive)",
            argumentType: "Opening Thesis",
            text: "Co-authoring a peer-reviewed paper in AI Systems sets this engineer apart from 99% of candidates. A workshop paper at NeurIPS/ICLR proves genuine innovation and critical depth."
          },
          {
            speaker: "Marcus Sterling (Career Executive)",
            argumentType: "Rebuttal & Market Grounding",
            text: `While prestigious, FAANG L4 technical recruiters screen heavily on DSA speed and system design fundamentals first. A research paper won't compensate if the candidate fails a 45-minute timed OA on sliding windows and graphs.`
          },
          {
            speaker: "Dr. Julian Thorne (Research Executive)",
            argumentType: "Counter-Argument",
            text: "Top-tier AI Labs and Research Scientist tracks offer 40% higher compensation and bypass standard recruiter screening pools with direct referrals."
          },
          {
            speaker: "Council Synthesis & Compromise",
            argumentType: "Consensus Conclusion",
            text: `Career Executive establishes the baseline required to pass ${targetCompany} technical screens, while Research Executive's publication efforts are condensed into a targeted 4-hour weekly benchmarking slot.`
          }
        ],
        winnerAgent: "Career Executive (Marcus Sterling)",
        justification: `Immediate placement timelines require clearing the algorithmic technical filter first. Securing the ${targetCompany} L4 offer provides the foundation to pursue industrial research initiatives.`,
        opportunityCostAnalysis: "Postponing full-time research by 6 weeks carries a negligible h-index penalty, whereas failing the upcoming hiring drive incurs an 8-month delay.",
        expectedRoi: 93.5,
        resourceAllocation: {
          "Career Preparation (OA/Mock)": "70% (14 hrs/week)",
          "Research Benchmarking": "30% (6 hrs/week)"
        }
      };
    } else if (topic.toLowerCase().includes("startup") || topic.toLowerCase().includes("google")) {
      debateData = {
        topic: "Google L4 Systems Engineering vs Indie Startup MVP Launch",
        challengerAgent: "Startup Executive (Zara Rostova)",
        defenderAgent: "Career Executive (Marcus Sterling)",
        transcript: [
          {
            speaker: "Zara Rostova (Startup Executive)",
            argumentType: "Market Upside Pitch",
            text: "Deploying our high-throughput cache as a commercial developer tool captures real user telemetry, developer grant funding ($10k+), and massive upside."
          },
          {
            speaker: "Marcus Sterling (Career Executive)",
            argumentType: "Risk-Adjusted Value Analysis",
            text: "A Google L4 SWE package provides guaranteed $220k+ compensation, tier-1 brand credentials, and mentorship. The cache engine can serve as the primary portfolio centerpiece for the Google Systems interview."
          },
          {
            speaker: "Zara Rostova (Startup Executive)",
            argumentType: "Synthesis Agreement",
            text: "Agreed. We can position the startup codebase as an open-source technical artifact, capturing both hiring credibility and non-dilutive grant eligibility simultaneously."
          }
        ],
        winnerAgent: "Career Executive (Marcus Sterling) [Co-operative Strategy]",
        justification: "Leveraging the startup architecture as the technical capstone for FAANG interviews maximizes both career outcomes and engineering credibility with zero downside.",
        opportunityCostAnalysis: "Pure startup bootstrapping without brand backing has an 85% early failure risk; using the artifact for Google L4 placement yields guaranteed high-value outcomes.",
        expectedRoi: 95.0,
        resourceAllocation: {
          "Big Tech Systems Preparation": "65% (13 hrs/week)",
          "Open-Source MVP Hardening": "35% (7 hrs/week)"
        }
      };
    } else {
      // Default: Contest vs Projects
      debateData = {
        topic: "Competitive Programming Contests vs Production Capstone Projects",
        challengerAgent: "Contest Executive (Kaelen Voss)",
        defenderAgent: "Project Executive (Aria Chen)",
        transcript: [
          {
            speaker: "Kaelen Voss (Contest Executive)",
            argumentType: "Algorithmic Speed Thesis",
            text: `Current rating is ${contestRating}. Pushing past 1850+ guarantees automatic recruiter shortlisting and instant credibility across global technical screens.`
          },
          {
            speaker: "Aria Chen (Project Executive)",
            argumentType: "Architectural Depth Thesis",
            text: "Contest ratings get you to the screen; production-grade distributed systems get you the actual offer. Staff and Senior interviewers demand deep knowledge of consensus protocols, raft state machines, and concurrency bottlenecks."
          },
          {
            speaker: "Kaelen Voss (Contest Executive)",
            argumentType: "Rebuttal",
            text: "A candidate who cannot solve Problem C within 25 minutes will fail the live coding screen before the interviewer even glances at their GitHub."
          },
          {
            speaker: "Aria Chen (Project Executive)",
            argumentType: "Counter-Rebuttal",
            text: "And a candidate with only LeetCode skills gets downleveled to entry-level L3 without architectural design authority."
          },
          {
            speaker: "Council Synthesis & Resolution",
            argumentType: "Optimal Boundary Formulation",
            text: "Ratified dual-cadence scheduling: 60% dedicated to algorithmic problem-solving and weekly rated contests, 40% dedicated to building out the Raft Distributed KV Store capstone."
          }
        ],
        winnerAgent: "Synergistic Consensus (60% Contest / 40% Project)",
        justification: "Both dimensions are mathematically indispensable for Big Tech L4 placement. Algorithmic velocity clears initial rounds, while systems engineering secures top-band compensation.",
        opportunityCostAnalysis: "Over-indexing 100% on contests risks architectural down-leveling, while 100% project focus risks failing fast-paced OA filters.",
        expectedRoi: 94.0,
        resourceAllocation: {
          "Algorithmic Problem-Solving & Contests": "60% (12 hrs/week)",
          "Raft Distributed KV Store Engineering": "40% (8 hrs/week)"
        }
      };
    }

    const debateRecord: ExecutiveDebateRecord = {
      id: `debate-${uuidv4()}`,
      userId,
      topic: debateData.topic!,
      challengerAgent: debateData.challengerAgent!,
      defenderAgent: debateData.defenderAgent!,
      transcript: debateData.transcript!,
      winnerAgent: debateData.winnerAgent!,
      justification: debateData.justification!,
      opportunityCostAnalysis: debateData.opportunityCostAnalysis!,
      expectedRoi: debateData.expectedRoi!,
      resourceAllocation: debateData.resourceAllocation!,
      createdAt: new Date().toISOString()
    };

    await ExecutiveCouncilRepository.saveDebate(debateRecord);

    // Record into Executive Memory
    await ExecutiveMemoryService.recordMemory(
      userId,
      "debate_outcome",
      `Debate: ${debateRecord.topic}`,
      `Winner: ${debateRecord.winnerAgent}`,
      debateRecord.justification,
      debateRecord.expectedRoi,
      [debateRecord.challengerAgent, debateRecord.defenderAgent],
      { debateId: debateRecord.id, resourceAllocation: debateRecord.resourceAllocation }
    );

    return debateRecord;
  }

  public static async getDebates(userId: string): Promise<ExecutiveDebateRecord[]> {
    const debates = await ExecutiveCouncilRepository.getDebates(userId);
    if (debates.length === 0) {
      const seeded = await this.runDebate(userId);
      return [seeded];
    }
    return debates;
  }
}
