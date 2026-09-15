import {
  StrategicDecisionRepository,
  StrategicGoal,
  StrategicPlan,
  DecisionRecommendation,
  OpportunityScore,
  RiskAssessment
} from "../../repositories/strategicDecisionRepository";
import { KnowledgeFabricService } from "./knowledgeFabricService";
import { HiringPredictionService } from "./hiringPredictionService";
import { ContestAnalyticsService } from "./contestAnalyticsService";
import { MasteryTrackingService } from "./masteryTrackingService";
import { KnowledgeGapService } from "./knowledgeGapService";
import { ProjectAnalyticsService } from "./projectAnalyticsService";
import { ResearchRepository } from "../../repositories/researchRepository";
import { ProductivityRepository } from "../../repositories/productivityRepository";
import { DigitalTwinService } from "./digitalTwinService";
import { FutureSimulationService } from "./futureSimulationService";
import { OpportunityDiscoveryService } from "./opportunityDiscoveryService";
import { RedisManager } from "../../redis/redisClient";
import { defaultAIProvider } from "./geminiProvider";
import { logger } from "../../utils/logger";

export interface ExecutiveSummaryReport {
  profile: {
    userId: string;
    overallMastery: number;
    learningVelocity: number;
    hiringReadiness: number;
    researchImpact: number;
    projectVelocity: number;
    activeGoal?: any;
    probabilityOfSuccess: number;
  };
  insights: {
    executiveSummary: string;
    keyBottleneck: string;
    primaryFocusToday: string;
    strategicTradeoff: string;
    confidenceLevel: number;
  };
  goals: any[];
  recommendations: any[];
  opportunities: any[];
  risks: any[];
  strategies: {
    career?: any;
    learning?: any;
    project?: any;
  };
}

export class StrategicDecisionService {
  // Pre-configured Strategic Goal Archetypes
  public static readonly GOAL_ARCHETYPES: Record<string, {
    title: string;
    targetCompany: string;
    targetRole: string;
    targetState: string;
    benchmarkSkills: string[];
    minContestRating: number;
    minMastery: number;
  }> = {
    Google_SWE: {
      title: "Google L4 Software Engineer",
      targetCompany: "Google",
      targetRole: "Software Engineer III (L4)",
      targetState: "Advanced algorithmic fluency (LeetCode Hard / 2000+ rating), Distributed Systems architecture, pristine code craftsmanship, and proven production impact.",
      benchmarkSkills: ["Dynamic Programming", "Graph Algorithms", "Distributed Systems", "Concurrency", "System Design"],
      minContestRating: 1950,
      minMastery: 88
    },
    AI_Engineer: {
      title: "Autonomous AI & Systems Engineer",
      targetCompany: "Anthropic / OpenAI / DeepMind",
      targetRole: "Senior AI Engineer",
      targetState: "Production LLM agents, multi-modal pipelines, vector indexing architectures, fine-tuning, and robust operational observability.",
      benchmarkSkills: ["LLM Agents", "Vector Embeddings", "PyTorch", "Distributed Inference", "Agentic Workflows"],
      minContestRating: 1750,
      minMastery: 85
    },
    Research_Scientist: {
      title: "AI Research Scientist",
      targetCompany: "Google DeepMind / FAIR",
      targetRole: "Research Scientist",
      targetState: "Peer-reviewed publications, novel model architectures, rigorous mathematical proofs, high citation impact factor.",
      benchmarkSkills: ["Deep Learning Theory", "Reinforcement Learning", "Mathematical Optimization", "Research Methodology"],
      minContestRating: 1800,
      minMastery: 90
    },
    Startup_Founder: {
      title: "Technical Founder / CTO",
      targetCompany: "Y Combinator Backed Startup",
      targetRole: "Founder & CTO",
      targetState: "Full-stack rapid iteration, scalable cloud primitives, autonomous multi-agent operational workflows, high product velocity.",
      benchmarkSkills: ["Full-Stack Architecture", "Product Velocity", "Cloud Native", "Agent Orchestration"],
      minContestRating: 1650,
      minMastery: 80
    },
    Competitive_Programmer: {
      title: "Competitive Programming Master",
      targetCompany: "Codeforces / ICPC",
      targetRole: "Grandmaster / ICPC World Finalist",
      targetState: "2200+ rating on Codeforces, sub-15 minute Div1/Div2 problem solving speed, flawless implementation accuracy.",
      benchmarkSkills: ["Advanced Dynamic Programming", "Tree & Range Queries", "Number Theory", "Flows & Matchings"],
      minContestRating: 2200,
      minMastery: 95
    }
  };

  /**
   * Seed default strategic executive goals and opportunities if none exist
   */
  public static async initializeExecutiveEngine(userId: string) {
    const existingGoals = await StrategicDecisionRepository.getGoals(userId);
    if (existingGoals.length === 0) {
      logger.info(`[StrategicDecisionEngine] Initializing default strategic goals for ${userId}...`);
      
      // Default: Google SWE Goal
      const archetype = this.GOAL_ARCHETYPES.Google_SWE;
      const goal = await StrategicDecisionRepository.createGoal({
        userId,
        goalType: "Google_SWE",
        title: archetype.title,
        targetCompany: archetype.targetCompany,
        targetRole: archetype.targetRole,
        targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months
        currentPosition: "Mid-level algorithmic proficiency, baseline contest rating (1650), solid core CS foundation with gaps in advanced dynamic programming and distributed consensus.",
        targetState: archetype.targetState,
        gapAnalysis: [
          { skill: "Dynamic Programming", currentLevel: "Intermediate", targetLevel: "Expert", gapSeverity: "High" },
          { skill: "System Design", currentLevel: "Fundamentals", targetLevel: "Advanced", gapSeverity: "Medium" },
          { skill: "Contest Rating", currentLevel: 1650, targetLevel: 1950, gapSeverity: "High" }
        ],
        probabilityScore: 68.5,
        status: "Active"
      });

      // Default Strategic Plan
      await StrategicDecisionRepository.upsertPlan({
        goalId: goal.id,
        userId,
        title: "Google L4 Mastery & Interview Domination Roadmap",
        roadmapMilestones: [
          { phase: "Phase 1", title: "Advanced DP & Graph Mastery", targetWeeks: 4, status: "In_Progress", keyDeliverable: "Solve 45 Google tagged hard problems" },
          { phase: "Phase 2", title: "Distributed Systems Portfolio Project", targetWeeks: 6, status: "Pending", keyDeliverable: "Build Raft consensus engine with telemetry" },
          { phase: "Phase 3", title: "Mock Interview Gauntlet & OA Mastery", targetWeeks: 4, status: "Pending", keyDeliverable: "Pass 5 Google-level behavioral and technical mocks" }
        ],
        tradeOffs: [
          { decision: "Prioritize DP & Graphs over exploratory web frameworks", rationale: "Google interviews index heavily on algorithmic problem-solving accuracy" },
          { decision: "Commit 90 mins daily to focused contest problem sets", rationale: "Speed and edge-case resilience directly correlate with hiring bar success" }
        ],
        bottlenecks: [
          "Dynamic Programming optimization (space-time tradeoffs under time pressure)",
          "Large scale caching and rate-limiting system design scenarios"
        ],
        executionVelocity: 74.0,
        status: "In_Progress"
      });

      // Default Recommendations
      await StrategicDecisionRepository.createRecommendation({
        userId,
        category: "Learning",
        title: "Master 2D & Bitmask Dynamic Programming",
        description: "Focus on interval and bitmask DP patterns which account for 45% of Google Hard algorithmic evaluation criteria.",
        reasoning: "Eliminating your DP gap increases your calculated Google interview readiness probability from 68.5% to 84.0%.",
        impactScore: 9.4,
        urgency: "Immediate",
        actionUrl: "/learning/topics/dynamic-programming",
        status: "Pending"
      });

      await StrategicDecisionRepository.createRecommendation({
        userId,
        category: "Project",
        title: "Build High-Throughput Distributed Raft Engine",
        description: "Implement a fault-tolerant state-machine cluster with snapshotting and gRPC endpoints to showcase systems depth.",
        reasoning: "Fulfills the core distributed systems portfolio requirement expected for senior tier hiring reviews.",
        impactScore: 8.8,
        urgency: "High",
        actionUrl: "/projects",
        status: "Pending"
      });

      await StrategicDecisionRepository.createRecommendation({
        userId,
        category: "Contest",
        title: "Participate in Bi-Weekly Global Algorithm Contest",
        description: "Test speed and accuracy under timed pressure against 1800+ rated international competitors.",
        reasoning: "Directly improves your competitive rating and live problem decomposition under time constraints.",
        impactScore: 8.5,
        urgency: "High",
        actionUrl: "/contests",
        status: "Pending"
      });

      // Default Opportunities
      await StrategicDecisionRepository.upsertOpportunity({
        userId,
        opportunityType: "FullTime",
        title: "Google SWE L4 - Global Engineering",
        organization: "Google",
        description: "Core Systems and Infrastructure engineering role requiring strong DSA and systems fundamentals.",
        matchScore: 78.0,
        roiScore: 95.0,
        difficulty: "Hard",
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Available"
      });

      await StrategicDecisionRepository.upsertOpportunity({
        userId,
        opportunityType: "Research",
        title: "Autonomous Multi-Agent Systems Paper Collaboration",
        organization: "Algora Innovation Lab",
        description: "Co-author paper on memory fabric and self-healing agentic workflows for NeurIPS / ICLR submission.",
        matchScore: 86.0,
        roiScore: 92.0,
        difficulty: "Hard",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Available"
      });

      await StrategicDecisionRepository.upsertOpportunity({
        userId,
        opportunityType: "OpenSource",
        title: "Kernel Caching & Redis Protocol Integration",
        organization: "OpenSource High-Performance Group",
        description: "Contribute zero-copy memory buffers and client serialization optimizations.",
        matchScore: 82.0,
        roiScore: 88.0,
        difficulty: "Medium",
        status: "Available"
      });

      // Default Risks
      await StrategicDecisionRepository.upsertRisk({
        userId,
        riskType: "SkillGap",
        title: "Dynamic Programming Sub-optimal Complexity Vulnerability",
        description: "Recent assessments show recurrence relation formulation takes >18 minutes, increasing timeout risk during technical screens.",
        severity: "High",
        impactDomain: "Hiring",
        mitigationStrategy: "Complete 15 targeted LeetCode Hard DP problems with space-optimization refactoring exercises."
      });

      await StrategicDecisionRepository.upsertRisk({
        userId,
        riskType: "LearningStagnation",
        title: "System Design Practice Stagnation (14 Days Inactive)",
        description: "No distributed systems design exercises logged in the last 14 days, risking atrophy on back-of-the-envelope estimation.",
        severity: "Medium",
        impactDomain: "Career",
        mitigationStrategy: "Review and design an end-to-end distributed rate limiter with Redis cluster fallback this week."
      });

      // Default Executive Insights
      await StrategicDecisionRepository.saveExecutiveInsight({
        userId,
        executiveSummary: "Your trajectory toward Google SWE L4 is strong (68.5% win probability). Your primary barrier is not general knowledge, but algorithmic execution speed under timed constraint and distributed systems architectural proof.",
        keyBottleneck: "Algorithmic speed on multi-dimensional Dynamic Programming & Graph traversal edge cases.",
        primaryFocusToday: "Complete 2 Hard Dynamic Programming problems and review distributed consensus logs.",
        strategicTradeoff: "Postpone secondary frontend portfolio polishes to maximize dedicated algorithmic sprint time.",
        confidenceLevel: 89.0
      });
    }
  }

  /**
   * Get full executive profile report with Redis caching
   */
  public static async getExecutiveProfile(userId: string): Promise<ExecutiveSummaryReport> {
    const redisKey = `executive:profile:${userId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback
      }
    }

    // Ensure engine has initial data
    await this.initializeExecutiveEngine(userId);

    // Concurrently fetch all domain intelligence
    const [
      userIntel,
      hiringPreds,
      goals,
      recommendations,
      opportunities,
      risks,
      insight,
      careerStrat,
      learningStrat,
      projectStrat
    ] = await Promise.all([
      KnowledgeFabricService.getUserIntelligence(userId).catch(() => ({ profile: null })),
      HiringPredictionService.getPredictions(userId).catch(() => []),
      StrategicDecisionRepository.getGoals(userId),
      StrategicDecisionRepository.getRecommendations(userId),
      StrategicDecisionRepository.getOpportunities(userId),
      StrategicDecisionRepository.getRisks(userId, true),
      StrategicDecisionRepository.getLatestExecutiveInsight(userId),
      StrategicDecisionRepository.getCareerStrategy(userId),
      StrategicDecisionRepository.getLearningStrategy(userId),
      StrategicDecisionRepository.getProjectStrategy(userId)
    ]);

    const activeGoal = goals.find(g => g.status === 'Active') || goals[0];
    const topHiring = hiringPreds.find(h => h.company.toLowerCase() === (activeGoal?.target_company?.toLowerCase() || 'google'));
    const probabilityScore = topHiring ? Number(topHiring.probability_percentage) : (activeGoal?.probability_score || 72.0);

    const report: ExecutiveSummaryReport = {
      profile: {
        userId,
        overallMastery: userIntel.profile?.overall_mastery || 78.5,
        learningVelocity: userIntel.profile?.learning_velocity || 84.0,
        hiringReadiness: userIntel.profile?.hiring_readiness || 76.0,
        researchImpact: userIntel.profile?.research_impact || 70.0,
        projectVelocity: userIntel.profile?.project_completion_rate || 80.0,
        activeGoal,
        probabilityOfSuccess: probabilityScore
      },
      insights: insight ? {
        executiveSummary: insight.executive_summary,
        keyBottleneck: insight.key_bottleneck,
        primaryFocusToday: insight.primary_focus_today,
        strategicTradeoff: insight.strategic_tradeoff,
        confidenceLevel: Number(insight.confidence_level || 88.0)
      } : {
        executiveSummary: "Your path is aligned with high-impact engineering benchmarks. Maintain aggressive DSA velocity and distributed portfolio development.",
        keyBottleneck: "Multi-dimensional algorithmic optimization under timed screens.",
        primaryFocusToday: "Deep-dive Dynamic Programming and commit distributed systems telemetry milestone.",
        strategicTradeoff: "Prioritize core algorithms and backend concurrency over client-side UI experimentation.",
        confidenceLevel: 87.0
      },
      goals,
      recommendations,
      opportunities,
      risks,
      strategies: {
        career: careerStrat,
        learning: learningStrat,
        project: projectStrat
      }
    };

    await RedisManager.set(redisKey, JSON.stringify(report), 3600);
    return report;
  }

  /**
   * Run Gemini strategic planning to evaluate all cross-domain data and refresh recommendations
   */
  public static async evaluateStrategicDecisions(userId: string): Promise<ExecutiveSummaryReport> {
    logger.info(`[StrategicDecisionEngine] Running holistic Gemini executive evaluation for ${userId}...`);

    const [
      userIntel,
      hiringPreds,
      goals,
      currentRisks,
      contestAnalytics,
      projectSummary
    ] = await Promise.all([
      KnowledgeFabricService.getUserIntelligence(userId).catch(() => ({ profile: null })),
      HiringPredictionService.getPredictions(userId).catch(() => []),
      StrategicDecisionRepository.getGoals(userId),
      StrategicDecisionRepository.getRisks(userId, true),
      ContestAnalyticsService.getUserAnalytics(userId).catch(() => null),
      ProjectAnalyticsService.getUserProjectSummary(userId).catch(() => null)
    ]);

    const activeGoal = goals.find(g => g.status === 'Active') || goals[0];

    const contextData = {
      activeGoal: activeGoal ? {
        title: activeGoal.title,
        targetCompany: activeGoal.target_company,
        targetRole: activeGoal.target_role,
        currentPosition: activeGoal.current_position,
        targetState: activeGoal.target_state
      } : "Google SWE L4 Candidate",
      intelligenceProfile: userIntel.profile,
      hiringPredictions: hiringPreds.slice(0, 3),
      contestRating: contestAnalytics?.rating || 1650,
      projectSummary,
      activeRisks: currentRisks.map(r => ({ title: r.title, severity: r.severity, domain: r.impact_domain }))
    };

    const prompt = `
You are Algora's Principal AI Executive and Strategic Career Architect.
Evaluate the user's current position across all technical domains and formulate high-leverage strategic decisions.

Current Context:
${JSON.stringify(contextData, null, 2)}

Provide your executive synthesis in strictly valid JSON with this exact schema:
{
  "executiveSummary": "Concise high-level strategic appraisal of user's current trajectory (2-3 sentences)",
  "keyBottleneck": "The single highest-friction bottleneck preventing immediate achievement of the target goal",
  "primaryFocusToday": "Specific, non-trivial action to execute in the next 24 hours",
  "strategicTradeoff": "What specific lower-leverage activity the user should deliberately postpone or sacrifice",
  "probabilityScore": 75.5,
  "recommendations": [
    {
      "category": "Learning | Project | Career | Contest | Research",
      "title": "Clear action title",
      "description": "What to do concretely",
      "reasoning": "Why this specific action offers maximum return on invested time",
      "impactScore": 9.2,
      "urgency": "Immediate | High | Medium",
      "actionUrl": "/learning | /projects | /contests | /research"
    }
  ],
  "opportunities": [
    {
      "opportunityType": "Internship | FullTime | Project | Research | OpenSource | Contest",
      "title": "Opportunity Title",
      "organization": "Target Entity",
      "description": "Why pursue this",
      "matchScore": 85.0,
      "roiScore": 92.0,
      "difficulty": "Medium | Hard"
    }
  ],
  "risks": [
    {
      "riskType": "SkillGap | CareerRisk | LearningStagnation | InterviewWeakness | ProductivityDecline",
      "title": "Risk description",
      "description": "Specific vulnerability identified",
      "severity": "Critical | High | Medium | Low",
      "impactDomain": "Career | Learning | Projects | Research",
      "mitigationStrategy": "Prescriptive corrective step"
    }
  ]
}
`;

    try {
      const rawText = await defaultAIProvider.generateRawText(prompt, "You are a top Silicon Valley Tech Executive and Career Strategist. Output ONLY valid JSON.");
      const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      // Persist executive insights
      await StrategicDecisionRepository.saveExecutiveInsight({
        userId,
        executiveSummary: parsed.executiveSummary || "Strategic execution trajectory verified.",
        keyBottleneck: parsed.keyBottleneck || "Algorithmic speed under pressure.",
        primaryFocusToday: parsed.primaryFocusToday || "Solve 2 Hard Dynamic Programming problems.",
        strategicTradeoff: parsed.strategicTradeoff || "Limit passive consumption; maximize active problem synthesis.",
        confidenceLevel: 88.0
      });

      // Update goal probability if active
      if (activeGoal && parsed.probabilityScore) {
        await StrategicDecisionRepository.createGoal({
          ...activeGoal,
          userId,
          probabilityScore: parsed.probabilityScore
        });
      }

      // Persist new recommendations
      if (Array.isArray(parsed.recommendations)) {
        for (const rec of parsed.recommendations.slice(0, 4)) {
          await StrategicDecisionRepository.createRecommendation({
            userId,
            category: rec.category || "Learning",
            title: rec.title,
            description: rec.description,
            reasoning: rec.reasoning,
            impactScore: rec.impactScore || 8.5,
            urgency: rec.urgency || "High",
            actionUrl: rec.actionUrl || "/learning",
            status: "Pending"
          });
        }
      }

      // Persist opportunities
      if (Array.isArray(parsed.opportunities)) {
        for (const opp of parsed.opportunities.slice(0, 3)) {
          await StrategicDecisionRepository.upsertOpportunity({
            userId,
            opportunityType: opp.opportunityType || "FullTime",
            title: opp.title,
            organization: opp.organization || "Top Tech",
            description: opp.description,
            matchScore: opp.matchScore || 80.0,
            roiScore: opp.roiScore || 90.0,
            difficulty: opp.difficulty || "Hard",
            status: "Available"
          });
        }
      }

      // Persist risks
      if (Array.isArray(parsed.risks)) {
        for (const risk of parsed.risks.slice(0, 3)) {
          await StrategicDecisionRepository.upsertRisk({
            userId,
            riskType: risk.riskType || "SkillGap",
            title: risk.title,
            description: risk.description,
            severity: risk.severity || "High",
            impactDomain: risk.impactDomain || "Career",
            mitigationStrategy: risk.mitigationStrategy
          });
        }
      }
    } catch (err: any) {
      logger.warn(`[StrategicDecisionEngine] AI evaluation fallback used: ${err.message}`);
    }

    // Invalidate Redis caches
    await RedisManager.del(`executive:profile:${userId}`);
    await RedisManager.del(`executive:recommendations:${userId}`);
    await RedisManager.del(`executive:risks:${userId}`);

    return this.getExecutiveProfile(userId);
  }

  /**
   * Log user decision action (Accept, Dismiss, Override)
   */
  public static async executeDecisionAction(userId: string, recommendationId: string, action: string, feedback?: string) {
    let newStatus = "Accepted";
    if (action.toLowerCase() === "dismiss" || action.toLowerCase() === "rejected") newStatus = "Dismissed";
    else if (action.toLowerCase() === "completed") newStatus = "Completed";

    const updatedRec = await StrategicDecisionRepository.updateRecommendationStatus(recommendationId, newStatus);
    await StrategicDecisionRepository.logDecision({
      userId,
      decisionType: updatedRec?.category || "StrategicAction",
      context: { recommendationId, title: updatedRec?.title },
      recommendationId,
      userAction: action,
      outcomeMetric: { timestamp: new Date().toISOString() },
      feedback
    });

    // Invalidate caches
    await RedisManager.del(`executive:profile:${userId}`);
    await RedisManager.del(`executive:recommendations:${userId}`);

    return { success: true, recommendation: updatedRec };
  }

  /**
   * Define or switch user's strategic goal
   */
  public static async setStrategicGoal(userId: string, goalType: string, customDetails?: any) {
    const archetype = this.GOAL_ARCHETYPES[goalType];
    const goalTitle = customDetails?.title || archetype?.title || "Custom Engineering Goal";
    const targetCompany = customDetails?.targetCompany || archetype?.targetCompany || "Tier 1 Tech";
    const targetRole = customDetails?.targetRole || archetype?.targetRole || "Senior Engineer";
    const targetState = customDetails?.targetState || archetype?.targetState || "Production systems and advanced algorithmic fluency.";

    const goal = await StrategicDecisionRepository.createGoal({
      userId,
      goalType,
      title: goalTitle,
      targetCompany,
      targetRole,
      targetDate: customDetails?.targetDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      currentPosition: customDetails?.currentPosition || "Active technical practitioner building cross-domain mastery.",
      targetState,
      gapAnalysis: archetype?.benchmarkSkills.map(skill => ({
        skill,
        currentLevel: "Developing",
        targetLevel: "Expert",
        gapSeverity: "High"
      })) || [],
      probabilityScore: 68.0,
      status: "Active"
    });

    // Refresh recommendations for new goal
    await this.evaluateStrategicDecisions(userId);
    return goal;
  }

  /**
   * Voice Executive Core: Dedicated strategic answers for Voice AI Mentor
   */
  public static async handleVoiceExecutiveQuery(userId: string, question: string): Promise<string> {
    return this.answerExecutiveQuestion(userId, question);
  }

  public static async answerExecutiveQuestion(userId: string, question: string): Promise<string> {
    const profile = await this.getExecutiveProfile(userId);
    const qLower = question.toLowerCase();

    // 1. "What should I focus on today?"
    if (qLower.includes("focus") || qLower.includes("today") || qLower.includes("do today") || qLower.includes("work on")) {
      const primaryRec = profile.recommendations[0];
      return `Your primary strategic focus today is: ${profile.insights.primaryFocusToday}. Specifically, ${primaryRec ? primaryRec.title : 'master high-frequency Dynamic Programming patterns'}. The trade-off: ${profile.insights.strategicTradeoff}`;
    }

    // 2. "How close am I to Google?" (or target company)
    if (qLower.includes("google") || qLower.includes("how close") || qLower.includes("probability") || qLower.includes("readiness")) {
      const activeGoal = profile.profile.activeGoal;
      const targetCompany = activeGoal?.target_company || "Google";
      const prob = profile.profile.probabilityOfSuccess;
      return `You are currently at a ${prob.toFixed(1)}% estimated hiring probability for ${targetCompany}. Your primary bottleneck is ${profile.insights.keyBottleneck}. Resolving your active Dynamic Programming and Distributed Systems milestones will push your readiness above 85%.`;
    }

    // 3. "What is my biggest weakness?"
    if (qLower.includes("weakness") || qLower.includes("gap") || qLower.includes("bottleneck") || qLower.includes("risk")) {
      const topRisk = profile.risks[0];
      return `Your biggest strategic bottleneck is ${profile.insights.keyBottleneck}. Top active risk: ${topRisk ? topRisk.title : 'Sub-optimal algorithmic complexity'}. Prescribed mitigation: ${topRisk ? topRisk.mitigation_strategy : 'Targeted Hard problem sets'}.`;
    }

    // 4. "Which project should I build next?"
    if (qLower.includes("project") || qLower.includes("build") || qLower.includes("next project")) {
      const projectRec = profile.recommendations.find(r => r.category === "Project") || profile.opportunities.find(o => o.opportunity_type === "Project");
      if (projectRec) {
        return `You should build: ${projectRec.title}. Reason: ${projectRec.reasoning || projectRec.description}. This addresses ${projectRec.impactScore || 9.0}/10 of your portfolio credibility requirement for senior hiring bars.`;
      }
      return `You should build a high-throughput distributed state-machine with Raft consensus and gRPC telemetry. It demonstrates systems-level concurrency that directly satisfies Tier-1 backend expectations.`;
    }

    // 5. "What opportunity should I pursue?"
    if (qLower.includes("opportunity") || qLower.includes("pursue") || qLower.includes("internship") || qLower.includes("apply")) {
      const topOpp = profile.opportunities[0];
      if (topOpp) {
        return `Your highest-ROI opportunity is ${topOpp.title} at ${topOpp.organization}. Match score is ${topOpp.match_score}%, with an ROI of ${topOpp.roi_score}/100. It directly bridges your portfolio to your strategic career goal.`;
      }
      return `Focus on the upcoming global algorithm contest and the open-source distributed cache initiative to rapidly elevate your hiring visibility.`;
    }

    // Fallback: Gemini synthesis with full executive context
    const prompt = `
User asked: "${question}"
Executive Context:
- Active Goal: ${profile.profile.activeGoal?.title || 'Google SWE'}
- Probability of Success: ${profile.profile.probabilityOfSuccess}%
- Primary Bottleneck: ${profile.insights.keyBottleneck}
- Primary Focus Today: ${profile.insights.primaryFocusToday}
- Top Risk: ${profile.risks[0]?.title || 'None'}
- Top Opportunity: ${profile.opportunities[0]?.title || 'None'}

Provide an executive, highly authoritative, concise (2-3 sentences) spoken answer from the Personal AI Executive.
`;
    try {
      return await defaultAIProvider.generateRawText(prompt, "You are Algora's Personal AI Executive. Speak authoritatively, directly, with zero fluff.");
    } catch {
      return `Your primary strategic objective is mastering advanced algorithmic fluency for ${profile.profile.activeGoal?.target_company || 'Google'}. Focus on ${profile.insights.primaryFocusToday}.`;
    }
  }
}
