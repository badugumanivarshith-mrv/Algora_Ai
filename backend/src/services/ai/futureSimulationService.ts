import {
  AutonomousExecutionRepository,
  FutureSimulationRecord,
  SimulationResultRecord
} from "../../repositories/autonomousExecutionRepository";
import { DigitalTwinService } from "./digitalTwinService";
import { RedisManager } from "../../redis/redisClient";
import { defaultAIProvider } from "./geminiProvider";
import { logger } from "../../utils/logger";
import { v4 as uuidv4 } from "uuid";

export interface SimulationRequest {
  timeframe: "30_days" | "90_days" | "6_months" | "1_year" | "3_years";
  dailyStudyHours?: number;
  focusArea?: string;
  targetCompany?: string;
  customAssumptions?: Record<string, any>;
}

export class FutureSimulationService {
  private static CACHE_TTL = 3600;

  public static async runSimulation(userId: string, req: SimulationRequest): Promise<{ simulation: FutureSimulationRecord; results: SimulationResultRecord[] }> {
    logger.info(`[FutureSimulation] Running ${req.timeframe} simulation for user ${userId}...`);

    const twin = await DigitalTwinService.getDigitalTwin(userId);
    const simulationId = `sim-${uuidv4()}`;
    const hours = req.dailyStudyHours || 2.5;
    const focus = req.focusArea || "DSA & Distributed Systems";
    const target = req.targetCompany || twin.readinessForecast?.targetCompany || "Google";

    // Base Multipliers based on timeframe
    const monthsMap: Record<string, number> = {
      "30_days": 1,
      "90_days": 3,
      "6_months": 6,
      "1_year": 12,
      "3_years": 36
    };
    const months = monthsMap[req.timeframe] || 6;
    const currRating = twin.contestRatings?.rating || 1650;
    const currMastery = twin.masteryScores?.overall || 78.5;
    const currHiringProb = twin.hiringReadiness?.probability || 74.0;

    // Computational Simulation Models for 3 Scenarios
    // 1. Expected Case
    const expRatingGain = Math.min(600, Math.round(months * 28 * (hours / 2.0)));
    const expMasteryGain = Math.min(20, Math.round(months * 2.2 * (hours / 2.0)));
    const expHiringProbGain = Math.min(24, Math.round(months * 3.5 * (hours / 2.0)));

    const expectedCase: SimulationResultRecord = {
      id: `res-exp-${uuidv4()}`,
      simulationId,
      userId,
      scenarioType: "Expected_Case",
      learningGrowth: {
        timeframe: req.timeframe,
        masteryProjected: Math.min(98, currMastery + expMasteryGain),
        topicsMastered: ["Dynamic Programming", "Graph Algorithms", "Distributed Consensus", "Cache Invalidation"],
        problemsSolvedProjected: 142 + Math.round(months * 30 * (hours / 2.0)),
        velocityScore: 84.0
      },
      contestRatings: {
        startingRating: currRating,
        projectedRating: Math.min(2400, currRating + expRatingGain),
        rankProjected: currRating + expRatingGain >= 1900 ? "Master" : "Candidate Master",
        percentileProjected: 94.2
      },
      hiringProbability: {
        company: target,
        startingProbability: currHiringProb,
        projectedProbability: Math.min(96.0, currHiringProb + expHiringProbGain),
        interviewPassConfidence: 86.5,
        targetRole: "Software Engineer III (L4)"
      },
      researchImpact: {
        papersPublished: months >= 12 ? 2 : (months >= 6 ? 1 : 0),
        citationForecast: months >= 12 ? 18 : 4
      },
      careerOutcomes: {
        primaryOutcome: `${target} L4 Full-Time Offer`,
        expectedCompensationTier: "$180k - $220k Total Comp",
        marketCompetitivenessPercentile: 92.0
      },
      startupPotential: {
        founderTechnicalScore: 88.0,
        mvpShipVelocity: "14 days to production"
      },
      keyMilestones: [
        { month: Math.max(1, Math.round(months * 0.3)), milestone: "Break 1850 Contest Rating barrier" },
        { month: Math.max(2, Math.round(months * 0.6)), milestone: "Complete Distributed KV Store portfolio capstone" },
        { month: months, milestone: `Pass ${target} onsite technical screening` }
      ],
      riskAnalysis: [
        { risk: "Burnout under high hours", probability: "Medium", mitigation: "Enforce rest cycles on weekends" }
      ],
      createdAt: new Date().toISOString()
    };

    // 2. Best Case (High Consistency & Top Tier Growth)
    const bestRatingGain = Math.min(800, Math.round(expRatingGain * 1.35));
    const bestMasteryGain = Math.min(22, Math.round(expMasteryGain * 1.3));
    const bestHiringProbGain = Math.min(25, Math.round(expHiringProbGain * 1.3));

    const bestCase: SimulationResultRecord = {
      id: `res-best-${uuidv4()}`,
      simulationId,
      userId,
      scenarioType: "Best_Case",
      learningGrowth: {
        timeframe: req.timeframe,
        masteryProjected: Math.min(99.5, currMastery + bestMasteryGain),
        topicsMastered: ["Advanced DP", "Network Protocols", "Distributed Raft", "System Scalability"],
        problemsSolvedProjected: 142 + Math.round(months * 45 * (hours / 2.0)),
        velocityScore: 96.0
      },
      contestRatings: {
        startingRating: currRating,
        projectedRating: Math.min(2600, currRating + bestRatingGain),
        rankProjected: "Grandmaster",
        percentileProjected: 98.8
      },
      hiringProbability: {
        company: target,
        startingProbability: currHiringProb,
        projectedProbability: Math.min(98.5, currHiringProb + bestHiringProbGain),
        interviewPassConfidence: 94.0,
        targetRole: "Senior Software Engineer (L5 / Fast-Track)"
      },
      researchImpact: {
        papersPublished: months >= 6 ? 2 : 1,
        citationForecast: months >= 12 ? 45 : 12
      },
      careerOutcomes: {
        primaryOutcome: `Top-Tier ${target} Offer + Multiple Competing Offers`,
        expectedCompensationTier: "$230k - $280k Total Comp",
        marketCompetitivenessPercentile: 98.5
      },
      startupPotential: {
        founderTechnicalScore: 96.0,
        mvpShipVelocity: "7 days to production"
      },
      keyMilestones: [
        { month: Math.max(1, Math.round(months * 0.25)), milestone: "Achieve Top 2% in Global Contests" },
        { month: Math.max(2, Math.round(months * 0.5)), milestone: "Publish Open Source High-Throughput Engine" },
        { month: months, milestone: `Secure Top-Band Offer from ${target}` }
      ],
      riskAnalysis: [
        { risk: "Over-specialization", probability: "Low", mitigation: "Maintain system design breadth" }
      ],
      createdAt: new Date().toISOString()
    };

    // 3. Worst Case (Stagnation & Low Focus)
    const worstRatingGain = Math.round(expRatingGain * 0.3);
    const worstMasteryGain = Math.round(expMasteryGain * 0.3);

    const worstCase: SimulationResultRecord = {
      id: `res-worst-${uuidv4()}`,
      simulationId,
      userId,
      scenarioType: "Worst_Case",
      learningGrowth: {
        timeframe: req.timeframe,
        masteryProjected: Math.min(84, currMastery + worstMasteryGain),
        topicsMastered: ["Basic DP"],
        problemsSolvedProjected: 142 + Math.round(months * 10),
        velocityScore: 54.0
      },
      contestRatings: {
        startingRating: currRating,
        projectedRating: currRating + worstRatingGain,
        rankProjected: "Expert",
        percentileProjected: 86.0
      },
      hiringProbability: {
        company: target,
        startingProbability: currHiringProb,
        projectedProbability: Math.min(80.0, currHiringProb + 4.0),
        interviewPassConfidence: 62.0,
        targetRole: "SWE Intern / Junior SWE"
      },
      researchImpact: {
        papersPublished: 0,
        citationForecast: 0
      },
      careerOutcomes: {
        primaryOutcome: "Delayed Screening or Lateral Entry",
        expectedCompensationTier: "Baseline Tier",
        marketCompetitivenessPercentile: 74.0
      },
      startupPotential: {
        founderTechnicalScore: 72.0,
        mvpShipVelocity: "45 days to production"
      },
      keyMilestones: [
        { month: Math.max(1, Math.round(months * 0.5)), milestone: "Resolve basic Dynamic Programming gaps" },
        { month: months, milestone: "Reach minimum contest benchmark" }
      ],
      riskAnalysis: [
        { risk: "Severe skill decay and goal drift", probability: "High", mitigation: "Trigger automated AI executive intervention" }
      ],
      createdAt: new Date().toISOString()
    };

    const simulationRecord: FutureSimulationRecord = {
      id: simulationId,
      userId,
      timeframe: req.timeframe,
      assumptions: {
        dailyStudyHours: hours,
        focusArea: focus,
        targetCompany: target,
        ...req.customAssumptions
      },
      status: "Completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const results = [expectedCase, bestCase, worstCase];
    await AutonomousExecutionRepository.createSimulation(simulationRecord, results);
    await RedisManager.set(`future:simulation:${userId}`, JSON.stringify({ simulation: simulationRecord, results }), this.CACHE_TTL);

    return { simulation: simulationRecord, results };
  }

  public static async getLatestSimulations(userId: string) {
    const cacheKey = `future:simulation:${userId}`;
    const cached = await RedisManager.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }

    const sims = await AutonomousExecutionRepository.getSimulations(userId);
    if (sims.length > 0) {
      return sims[0];
    }

    // Default 6-month simulation if none exists
    return this.runSimulation(userId, { timeframe: "6_months", dailyStudyHours: 2.5 });
  }

  public static async answerWhatIfQuestion(userId: string, question: string): Promise<string> {
    const twin = await DigitalTwinService.getDigitalTwin(userId);
    const qLower = question.toLowerCase();

    const hoursMatch = question.match(/(\d+)\s*(?:hours|hrs)/i);
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 2;

    const prompt = `
User asked What-If question: "${question}"
User Digital Twin Context:
- Current Contest Rating: ${twin.contestRatings?.rating || 1650}
- Current Mastery: ${twin.masteryScores?.overall || 78}%
- Current Hiring Readiness: ${twin.hiringReadiness?.probability || 74}%
- Target: ${twin.readinessForecast?.targetCompany || 'Google'}

Provide an authoritative, highly quantitative simulation prediction (2-3 sentences max) explaining expected vs best case trajectory changes.
`;
    try {
      return await defaultAIProvider.generateRawText(prompt, "You are Algora's Digital Twin Simulation Engine. Be analytical, precise, and inspiring.");
    } catch {
      return `If you maintain ${hours} hours daily focused on high-yield DSA and distributed systems, your projected contest rating will increase by +180 points to ${((twin.contestRatings?.rating || 1650) + 180)} in 90 days, increasing your ${twin.readinessForecast?.targetCompany || 'Google'} win probability from 74% to 88%.`;
    }
  }
}
