import {
  TalentMarketplaceRepository,
  OpportunityEntity,
  OpportunityMatchEntity,
  TalentProfileEntity,
  MarketplaceAnalyticsEntity
} from "../../repositories/talentMarketplaceRepository";
import { ReputationEngineService } from "./reputationEngineService";
import { SkillEconomyService } from "./skillEconomyService";
import { KnowledgeFabricService } from "./knowledgeFabricService";
import { RedisManager } from "../../redis/redisClient";
import { logger } from "../../utils/logger";
import { v4 as uuidv4 } from "uuid";

export class TalentMarketplaceService {
  private static CACHE_TTL = 1800;

  /**
   * Initializes or returns the global talent marketplace opportunities
   */
  public static async getMarketplaceOpportunities(type?: string): Promise<OpportunityEntity[]> {
    let opps = await TalentMarketplaceRepository.getOpportunities(type);
    if (opps.length === 0) {
      opps = [
        {
          id: "opp-fulltime-google",
          title: "Staff Systems Engineer (Spanner & Borg Concurrency)",
          opportunityType: "Full-Time Jobs",
          organization: "Google Cloud Infrastructure",
          location: "Mountain View, CA / Remote",
          compensationRange: "$260,000 – $340,000 Base + Equity",
          equityRange: "0.08% - 0.15%",
          description: "Architect the next generation of lock-free transaction coordinators and high-throughput replication topologies.",
          requiredSkills: ["System Design", "Distributed Systems", "DSA", "Backend"],
          minimumReputation: 820,
          urgency: "High Priority",
          applicationUrl: "/career",
          createdAt: new Date().toISOString()
        },
        {
          id: "opp-fulltime-openai",
          title: "Member of Technical Staff (Inference Scaling & Speculative Decoding)",
          opportunityType: "Full-Time Jobs",
          organization: "OpenAI Systems",
          location: "San Francisco, CA",
          compensationRange: "$300,000 – $450,000 Total Comp",
          equityRange: "Significant PPU Units",
          description: "Optimize frontier model inference pipelines with custom Triton kernels and speculative multi-token draft verification.",
          requiredSkills: ["AI Engineering", "ML Engineering", "Triton / PyTorch", "System Design"],
          minimumReputation: 850,
          urgency: "Immediate",
          applicationUrl: "/career",
          createdAt: new Date().toISOString()
        },
        {
          id: "opp-intern-deepmind",
          title: "Autonomous Agents & Robotics Research Fellow",
          opportunityType: "Internships",
          organization: "Google DeepMind",
          location: "London, UK / Hybrid",
          compensationRange: "$10,500 / month + Housing",
          equityRange: "Pre-Placement Conversion Fast-Track",
          description: "Design autonomous execution loops for embodied agents with continuous state-space verification.",
          requiredSkills: ["AI Engineering", "Research", "Python", "Algorithms"],
          minimumReputation: 780,
          urgency: "High Priority",
          applicationUrl: "/research",
          createdAt: new Date().toISOString()
        },
        {
          id: "opp-startup-cofounder",
          title: "Technical Co-Founder / Founding Systems Architect",
          opportunityType: "Startup Teams",
          organization: "Krypton Systems (YC W26 Backed)",
          location: "San Francisco, CA / Remote",
          compensationRange: "$140,000 + $2.4M Seed Runway",
          equityRange: "18% – 25% Equity",
          description: "Lead the core engineering architecture for real-time autonomous data infrastructure.",
          requiredSkills: ["System Design", "Backend", "AI Engineering", "Leadership"],
          minimumReputation: 800,
          urgency: "Active Co-Founder Search",
          applicationUrl: "/projects",
          createdAt: new Date().toISOString()
        },
        {
          id: "opp-research-neurips",
          title: "Lead Co-Author on Multi-Agent Consensus Paper",
          opportunityType: "Research Collaborations",
          organization: "Stanford AI Lab / Algora Lab",
          location: "Remote / Worldwide",
          compensationRange: "Funded Conference Travel + NeurIPS Spotlight",
          equityRange: "Primary Co-Author Byline",
          description: "Formulate empirical proofs and run distributed ablation experiments on multi-agent consensus protocols.",
          requiredSkills: ["Research", "AI Engineering", "Mathematical Formalism"],
          minimumReputation: 750,
          urgency: "Paper Deadline in 30 Days",
          applicationUrl: "/research",
          createdAt: new Date().toISOString()
        },
        {
          id: "opp-oss-cncf",
          title: "Linux Foundation Mentorship (LFX / CNCF Storage Engine)",
          opportunityType: "Open Source Programs",
          organization: "Cloud Native Computing Foundation",
          location: "Global Remote",
          compensationRange: "$6,500 Stipend + Foundation Grant",
          equityRange: "CNCF Maintainer Rights",
          description: "Implement high-performance zero-copy network serialization and ring buffers in distributed storage systems.",
          requiredSkills: ["Backend", "DevOps", "Open Source", "C++ / Go"],
          minimumReputation: 720,
          urgency: "Rolling Applications",
          applicationUrl: "/projects",
          createdAt: new Date().toISOString()
        },
        {
          id: "opp-freelance-fintech",
          title: "Ultra-Low Latency Order Matching Engine Consultant",
          opportunityType: "Freelance Projects",
          organization: "Aegis Capital Technologies",
          location: "Remote",
          compensationRange: "$180 – $240 / hr ($45,000 Milestone)",
          equityRange: "N/A",
          description: "Build an event-driven lock-free matching engine with p99.9 latency under 45 microseconds.",
          requiredSkills: ["DSA", "Backend", "System Design"],
          minimumReputation: 840,
          urgency: "2-Week Sprint",
          applicationUrl: "/career",
          createdAt: new Date().toISOString()
        }
      ];

      await TalentMarketplaceRepository.saveOpportunities(opps);
    }
    return opps;
  }

  /**
   * Generates AI Matching between User and Opportunities
   */
  public static async getOpportunityMatches(userId: string): Promise<OpportunityMatchEntity[]> {
    const opps = await this.getMarketplaceOpportunities();
    const repProfile = await ReputationEngineService.getReputation(userId);
    const skillAssets = await SkillEconomyService.getUserSkillAssets(userId);

    const matches: OpportunityMatchEntity[] = opps.map((o) => {
      // Calculate match percentage based on reputation and skill overlap
      const repRatio = Math.min(1.0, repProfile.reputationScore / o.minimumReputation);
      const matchedSkills = o.requiredSkills.filter((req) =>
        skillAssets.some((s) => s.skillCategory === req || s.skillName.toLowerCase().includes(req.toLowerCase()))
      );
      const skillOverlapRatio = matchedSkills.length / (o.requiredSkills.length || 1);

      const matchPercentage = parseFloat(Math.min(99.5, Math.max(68.0, (repRatio * 45) + (skillOverlapRatio * 50) + 5)).toFixed(1));
      const roiScore = parseFloat((matchPercentage * 0.95 + 4.5).toFixed(1));
      const successProbability = parseFloat((matchPercentage * 0.88 + 8.0).toFixed(1));

      return {
        id: `match-${o.id}-${userId}`,
        opportunityId: o.id,
        userId,
        matchPercentage,
        roiScore,
        successProbability,
        skillOverlap: matchedSkills,
        missingPrerequisites: o.requiredSkills.filter((r) => !matchedSkills.includes(r)),
        strategicRationale: `Your verified ${matchedSkills.join(" and ")} credentials and ${repProfile.reputationScore} reputation place you in the top candidate bracket.`,
        status: matchPercentage >= 85 ? "Strongly Recommended" : "Eligible",
        matchedAt: new Date().toISOString()
      };
    });

    await TalentMarketplaceRepository.saveOpportunityMatches(userId, matches);
    return matches;
  }

  /**
   * Returns or updates user's verified Talent Profile
   */
  public static async getTalentProfile(userId: string): Promise<TalentProfileEntity> {
    let profile = await TalentMarketplaceRepository.getTalentProfile(userId);
    if (!profile) {
      const rep = await ReputationEngineService.getReputation(userId);
      profile = {
        id: `tal-${uuidv4()}`,
        userId,
        headline: "Staff Systems Engineer & Autonomous Agent Architect | Top 1% Algora Verified",
        preferredRoles: ["Staff Systems Engineer", "AI Systems MTS", "Founding Engineer / CTO"],
        availabilityStatus: "Actively_Exploring",
        targetCompensation: 240000.0,
        preferredLocations: ["San Francisco, CA", "Seattle, WA", "Remote (US/Global)"],
        reputationBadge: `Top ${Math.max(1, 100 - rep.percentileRank)}% Algora Consensus Verified (${rep.reputationScore} pts)`,
        verifiedSkills: [
          { skill: "Distributed Systems & Raft", badge: "Gold Consensus Proof" },
          { skill: "Speculative Decoding Inference", badge: "NeurIPS Spotlight" },
          { skill: "Competitive Algorithms", badge: "Division 1 Master" }
        ],
        profileSummary: "Proven track record in high-concurrency distributed systems, autonomous multi-agent kernels, and production incident response under strict SLAs.",
        visibility: "Public",
        updatedAt: new Date().toISOString()
      };

      await TalentMarketplaceRepository.saveTalentProfile(profile);
    }
    return profile;
  }

  public static async getMarketplaceAnalytics(): Promise<MarketplaceAnalyticsEntity> {
    let analytics = await TalentMarketplaceRepository.getMarketplaceAnalytics();
    if (!analytics) {
      analytics = {
        id: `mkt-analytics-global`,
        totalOpportunitiesActive: 482,
        totalMatchesGenerated: 3410,
        averageTalentReputation: 785.4,
        topDemandedSkills: [
          { skill: "AI Engineering & Multi-Agent Workflows", growth: "+42%", demandScore: 99 },
          { skill: "Distributed Consensus & Storage Engines", growth: "+28%", demandScore: 98 },
          { skill: "GPU Optimization & Triton Kernels", growth: "+36%", demandScore: 97 },
          { skill: "Advanced Algorithms & Concurrency", growth: "+14%", demandScore: 94 }
        ],
        highestPayingVerticals: [
          { vertical: "Frontier AI Systems", avgComp: "$320,000", delta: "+18%" },
          { vertical: "Distributed Infrastructure & Cloud", avgComp: "$280,000", delta: "+12%" },
          { vertical: "Autonomous Robotics & Agents", avgComp: "$265,000", delta: "+24%" }
        ],
        talentLiquidityIndex: 94.2,
        recordedAt: new Date().toISOString()
      };
      await TalentMarketplaceRepository.saveMarketplaceAnalytics(analytics);
    }
    return analytics;
  }
}
