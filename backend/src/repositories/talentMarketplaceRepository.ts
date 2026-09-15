import { Database } from "../db/connection";
import { logger } from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

export interface ReputationProfileEntity {
  id: string;
  userId: string;
  reputationScore: number; // 0-1000
  trustScore: number;
  expertiseScore: number;
  influenceScore: number;
  growthScore: number;
  learningReputation: number;
  contestReputation: number;
  researchReputation: number;
  openSourceReputation: number;
  projectReputation: number;
  collaborationReputation: number;
  leadershipReputation: number;
  hiringReputation: number;
  percentileRank: number;
  breakdown: Record<string, any>;
  verifiedCredentials: any[];
  updatedAt: string;
}

export interface ReputationEventEntity {
  id: string;
  userId: string;
  eventType: string;
  category: string;
  title: string;
  delta: number;
  proofUrl?: string;
  verificationSource?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface SkillAssetEntity {
  id: string;
  userId: string;
  skillCategory: string; // DSA, Backend, Frontend, AI Engineering, ML Engineering, DevOps, Research, System Design
  skillName: string;
  proficiencyLevel: string;
  masteryScore: number;
  verifiedProofs: any[];
  marketDemandScore: number;
  scarcityIndex: number;
  industryRelevance: number;
  estimatedAssetValue: number;
  growthRatePct: number;
  updatedAt: string;
}

export interface SkillValuationEntity {
  id: string;
  skillName: string;
  category: string;
  marketDemandIndex: number;
  scarcityScore: number;
  averageCompPremium: number;
  trendDirection: string;
  topEmployers: string[];
  calculatedAt: string;
}

export interface TalentProfileEntity {
  id: string;
  userId: string;
  headline: string;
  preferredRoles: string[];
  availabilityStatus: string;
  targetCompensation: number;
  preferredLocations: string[];
  reputationBadge: string;
  verifiedSkills: any[];
  profileSummary: string;
  visibility: string;
  updatedAt: string;
}

export interface OpportunityEntity {
  id: string;
  title: string;
  opportunityType: string; // Job, Internship, Freelance, Research, Startup, Open_Source, Fellowship, Grant
  organization: string;
  location: string;
  compensationRange?: string;
  equityRange?: string;
  description: string;
  requiredSkills: string[];
  minimumReputation: number;
  urgency: string;
  applicationUrl?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface OpportunityMatchEntity {
  id: string;
  opportunityId: string;
  userId: string;
  matchPercentage: number;
  roiScore: number;
  successProbability: number;
  skillOverlap: string[];
  missingPrerequisites: string[];
  strategicRationale: string;
  status: string;
  matchedAt: string;
}

export interface CollaborationProfileEntity {
  id: string;
  userId: string;
  teamEffectivenessScore: number;
  communicationStyle: string;
  collaborationStrengths: string[];
  preferredCollabTypes: string[];
  leadershipGrowthScore: number;
  projectSuccessRate: number;
  pastCollaborationsCount: number;
  updatedAt: string;
}

export interface TeamRecommendationEntity {
  id: string;
  userId: string;
  candidateId: string;
  candidateName: string;
  candidateHeadline: string;
  candidateReputation: number;
  recommendationType: string; // Study_Partner, Project_Teammate, Research_Collaborator, Startup_CoFounder
  synergyScore: number;
  complementarySkills: string[];
  recommendedProjectTopic: string;
  whyMatched: string;
  createdAt: string;
}

export interface PortfolioSnapshotEntity {
  id: string;
  userId: string;
  portfolioTitle: string;
  careerNarrative: string;
  executiveSummary: string;
  aggregatedProjects: any[];
  aggregatedContests: any[];
  aggregatedResearch: any[];
  aggregatedSimulations: any[];
  aggregatedInternships: any[];
  achievementTimeline: any[];
  verifiedProofCount: number;
  shareableSlug: string;
  generatedAt: string;
}

export interface IndustryBenchmarkEntity {
  id: string;
  targetRole: string;
  overallReadinessPct: number;
  rankingPercentile: number;
  skillGapAnalysis: any[];
  strengths: string[];
  improvementPaths: string[];
  estimatedTimeToHireWeeks: number;
  benchmarkData: Record<string, any>;
  calculatedAt: string;
}

export interface MarketplaceAnalyticsEntity {
  id: string;
  totalOpportunitiesActive: number;
  totalMatchesGenerated: number;
  averageTalentReputation: number;
  topDemandedSkills: any[];
  highestPayingVerticals: any[];
  talentLiquidityIndex: number;
  recordedAt: string;
}

export class TalentMarketplaceRepository {
  private static memoryRepProfiles = new Map<string, ReputationProfileEntity>();
  private static memoryRepEvents: ReputationEventEntity[] = [];
  private static memorySkillAssets = new Map<string, SkillAssetEntity[]>();
  private static memorySkillValuations: SkillValuationEntity[] = [];
  private static memoryTalentProfiles = new Map<string, TalentProfileEntity>();
  private static memoryOpportunities: OpportunityEntity[] = [];
  private static memoryOpportunityMatches = new Map<string, OpportunityMatchEntity[]>();
  private static memoryCollaborationProfiles = new Map<string, CollaborationProfileEntity>();
  private static memoryTeamRecs = new Map<string, TeamRecommendationEntity[]>();
  private static memoryPortfolios = new Map<string, PortfolioSnapshotEntity>();
  private static memoryBenchmarks = new Map<string, IndustryBenchmarkEntity>();
  private static memoryAnalytics: MarketplaceAnalyticsEntity | null = null;

  // ================= REPUTATION PROFILES =================
  public static async getReputationProfile(userId: string): Promise<ReputationProfileEntity | null> {
    const pool = Database.getPool();
    if (!pool) {
      return this.memoryRepProfiles.get(userId) || null;
    }
    try {
      const { rows } = await pool.query(
        `SELECT * FROM reputation_profiles WHERE user_id = $1 LIMIT 1;`,
        [userId]
      );
      if (rows.length === 0) return null;
      return this.mapRepProfile(rows[0]);
    } catch (e: any) {
      logger.warn(`[TalentMarketplaceRepo] getReputationProfile fallback: ${e.message}`);
      return this.memoryRepProfiles.get(userId) || null;
    }
  }

  public static async saveReputationProfile(profile: ReputationProfileEntity): Promise<ReputationProfileEntity> {
    this.memoryRepProfiles.set(profile.userId, profile);
    const pool = Database.getPool();
    if (!pool) return profile;

    try {
      await pool.query(
        `INSERT INTO reputation_profiles (
          id, user_id, reputation_score, trust_score, expertise_score, influence_score,
          growth_score, learning_reputation, contest_reputation, research_reputation,
          open_source_reputation, project_reputation, collaboration_reputation,
          leadership_reputation, hiring_reputation, percentile_rank, breakdown,
          verified_credentials, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        ) ON CONFLICT (id) DO UPDATE SET
          reputation_score = EXCLUDED.reputation_score,
          trust_score = EXCLUDED.trust_score,
          expertise_score = EXCLUDED.expertise_score,
          influence_score = EXCLUDED.influence_score,
          growth_score = EXCLUDED.growth_score,
          learning_reputation = EXCLUDED.learning_reputation,
          contest_reputation = EXCLUDED.contest_reputation,
          research_reputation = EXCLUDED.research_reputation,
          open_source_reputation = EXCLUDED.open_source_reputation,
          project_reputation = EXCLUDED.project_reputation,
          collaboration_reputation = EXCLUDED.collaboration_reputation,
          leadership_reputation = EXCLUDED.leadership_reputation,
          hiring_reputation = EXCLUDED.hiring_reputation,
          percentile_rank = EXCLUDED.percentile_rank,
          breakdown = EXCLUDED.breakdown,
          verified_credentials = EXCLUDED.verified_credentials,
          updated_at = EXCLUDED.updated_at;`,
        [
          profile.id,
          profile.userId,
          profile.reputationScore,
          profile.trustScore,
          profile.expertiseScore,
          profile.influenceScore,
          profile.growthScore,
          profile.learningReputation,
          profile.contestReputation,
          profile.researchReputation,
          profile.openSourceReputation,
          profile.projectReputation,
          profile.collaborationReputation,
          profile.leadershipReputation,
          profile.hiringReputation,
          profile.percentileRank,
          JSON.stringify(profile.breakdown || {}),
          JSON.stringify(profile.verifiedCredentials || []),
          profile.updatedAt,
        ]
      );
      return profile;
    } catch (e: any) {
      logger.warn(`[TalentMarketplaceRepo] saveReputationProfile fallback: ${e.message}`);
      return profile;
    }
  }

  public static async logReputationEvent(event: ReputationEventEntity): Promise<void> {
    this.memoryRepEvents.unshift(event);
    const pool = Database.getPool();
    if (!pool) return;
    try {
      await pool.query(
        `INSERT INTO reputation_events (
          id, user_id, event_type, category, title, delta, proof_url, verification_source, metadata, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        [
          event.id,
          event.userId,
          event.eventType,
          event.category,
          event.title,
          event.delta,
          event.proofUrl || null,
          event.verificationSource || "AlgoraConsensus",
          JSON.stringify(event.metadata || {}),
          event.timestamp,
        ]
      );
    } catch (e: any) {
      logger.warn(`[TalentMarketplaceRepo] logReputationEvent error: ${e.message}`);
    }
  }

  public static async getReputationEvents(userId: string, limit: number = 20): Promise<ReputationEventEntity[]> {
    const pool = Database.getPool();
    if (!pool) {
      return this.memoryRepEvents.filter((e) => e.userId === userId).slice(0, limit);
    }
    try {
      const { rows } = await pool.query(
        `SELECT * FROM reputation_events WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2;`,
        [userId, limit]
      );
      return rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        eventType: r.event_type,
        category: r.category,
        title: r.title,
        delta: parseFloat(r.delta),
        proofUrl: r.proof_url,
        verificationSource: r.verification_source,
        metadata: r.metadata,
        timestamp: r.timestamp,
      }));
    } catch (e: any) {
      return this.memoryRepEvents.filter((e) => e.userId === userId).slice(0, limit);
    }
  }

  // ================= SKILL ASSETS & VALUATIONS =================
  public static async getSkillAssets(userId: string): Promise<SkillAssetEntity[]> {
    const pool = Database.getPool();
    if (!pool) {
      return this.memorySkillAssets.get(userId) || [];
    }
    try {
      const { rows } = await pool.query(
        `SELECT * FROM skill_assets WHERE user_id = $1 ORDER BY estimated_asset_value DESC;`,
        [userId]
      );
      return rows.map(this.mapSkillAsset);
    } catch (e: any) {
      return this.memorySkillAssets.get(userId) || [];
    }
  }

  public static async saveSkillAssets(userId: string, assets: SkillAssetEntity[]): Promise<void> {
    this.memorySkillAssets.set(userId, assets);
    const pool = Database.getPool();
    if (!pool) return;
    try {
      for (const asset of assets) {
        await pool.query(
          `INSERT INTO skill_assets (
            id, user_id, skill_category, skill_name, proficiency_level, mastery_score,
            verified_proofs, market_demand_score, scarcity_index, industry_relevance,
            estimated_asset_value, growth_rate_pct, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO UPDATE SET
            proficiency_level = EXCLUDED.proficiency_level,
            mastery_score = EXCLUDED.mastery_score,
            verified_proofs = EXCLUDED.verified_proofs,
            market_demand_score = EXCLUDED.market_demand_score,
            scarcity_index = EXCLUDED.scarcity_index,
            industry_relevance = EXCLUDED.industry_relevance,
            estimated_asset_value = EXCLUDED.estimated_asset_value,
            growth_rate_pct = EXCLUDED.growth_rate_pct,
            updated_at = EXCLUDED.updated_at;`,
          [
            asset.id,
            asset.userId,
            asset.skillCategory,
            asset.skillName,
            asset.proficiencyLevel,
            asset.masteryScore,
            JSON.stringify(asset.verifiedProofs || []),
            asset.marketDemandScore,
            asset.scarcityIndex,
            asset.industryRelevance,
            asset.estimatedAssetValue,
            asset.growthRatePct,
            asset.updatedAt,
          ]
        );
      }
    } catch (e: any) {
      logger.warn(`[TalentMarketplaceRepo] saveSkillAssets error: ${e.message}`);
    }
  }

  public static async getSkillValuations(): Promise<SkillValuationEntity[]> {
    const pool = Database.getPool();
    if (!pool) return this.memorySkillValuations;
    try {
      const { rows } = await pool.query(`SELECT * FROM skill_valuations ORDER BY market_demand_index DESC;`);
      return rows.map((r) => ({
        id: r.id,
        skillName: r.skill_name,
        category: r.category,
        marketDemandIndex: parseFloat(r.market_demand_index),
        scarcityScore: parseFloat(r.scarcity_score),
        averageCompPremium: parseFloat(r.average_comp_premium),
        trendDirection: r.trend_direction,
        topEmployers: r.top_employers,
        calculatedAt: r.calculated_at,
      }));
    } catch (e: any) {
      return this.memorySkillValuations;
    }
  }

  public static async saveSkillValuations(valuations: SkillValuationEntity[]): Promise<void> {
    this.memorySkillValuations = valuations;
    const pool = Database.getPool();
    if (!pool) return;
    try {
      for (const v of valuations) {
        await pool.query(
          `INSERT INTO skill_valuations (
            id, skill_name, category, market_demand_index, scarcity_score,
            average_comp_premium, trend_direction, top_employers, calculated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO UPDATE SET
            market_demand_index = EXCLUDED.market_demand_index,
            scarcity_score = EXCLUDED.scarcity_score,
            average_comp_premium = EXCLUDED.average_comp_premium,
            trend_direction = EXCLUDED.trend_direction,
            top_employers = EXCLUDED.top_employers,
            calculated_at = EXCLUDED.calculated_at;`,
          [
            v.id,
            v.skillName,
            v.category,
            v.marketDemandIndex,
            v.scarcityScore,
            v.averageCompPremium,
            v.trendDirection,
            JSON.stringify(v.topEmployers || []),
            v.calculatedAt,
          ]
        );
      }
    } catch (e: any) {
      logger.warn(`[TalentMarketplaceRepo] saveSkillValuations error: ${e.message}`);
    }
  }

  // ================= TALENT PROFILES & OPPORTUNITIES =================
  public static async getTalentProfile(userId: string): Promise<TalentProfileEntity | null> {
    const pool = Database.getPool();
    if (!pool) return this.memoryTalentProfiles.get(userId) || null;
    try {
      const { rows } = await pool.query(`SELECT * FROM talent_profiles WHERE user_id = $1 LIMIT 1;`, [userId]);
      if (rows.length === 0) return null;
      return this.mapTalentProfile(rows[0]);
    } catch (e: any) {
      return this.memoryTalentProfiles.get(userId) || null;
    }
  }

  public static async saveTalentProfile(profile: TalentProfileEntity): Promise<TalentProfileEntity> {
    this.memoryTalentProfiles.set(profile.userId, profile);
    const pool = Database.getPool();
    if (!pool) return profile;
    try {
      await pool.query(
        `INSERT INTO talent_profiles (
          id, user_id, headline, preferred_roles, availability_status, target_compensation,
          preferred_locations, reputation_badge, verified_skills, profile_summary, visibility, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          headline = EXCLUDED.headline,
          preferred_roles = EXCLUDED.preferred_roles,
          availability_status = EXCLUDED.availability_status,
          target_compensation = EXCLUDED.target_compensation,
          preferred_locations = EXCLUDED.preferred_locations,
          reputation_badge = EXCLUDED.reputation_badge,
          verified_skills = EXCLUDED.verified_skills,
          profile_summary = EXCLUDED.profile_summary,
          visibility = EXCLUDED.visibility,
          updated_at = EXCLUDED.updated_at;`,
        [
          profile.id,
          profile.userId,
          profile.headline,
          JSON.stringify(profile.preferredRoles || []),
          profile.availabilityStatus,
          profile.targetCompensation,
          JSON.stringify(profile.preferredLocations || []),
          profile.reputationBadge,
          JSON.stringify(profile.verifiedSkills || []),
          profile.profileSummary,
          profile.visibility,
          profile.updatedAt,
        ]
      );
      return profile;
    } catch (e: any) {
      logger.warn(`[TalentMarketplaceRepo] saveTalentProfile error: ${e.message}`);
      return profile;
    }
  }

  public static async getOpportunities(type?: string): Promise<OpportunityEntity[]> {
    const pool = Database.getPool();
    if (!pool) {
      return type ? this.memoryOpportunities.filter((o) => o.opportunityType === type) : this.memoryOpportunities;
    }
    try {
      const query = type
        ? `SELECT * FROM opportunities WHERE opportunity_type = $1 ORDER BY created_at DESC;`
        : `SELECT * FROM opportunities ORDER BY created_at DESC;`;
      const params = type ? [type] : [];
      const { rows } = await pool.query(query, params);
      return rows.map(this.mapOpportunity);
    } catch (e: any) {
      return type ? this.memoryOpportunities.filter((o) => o.opportunityType === type) : this.memoryOpportunities;
    }
  }

  public static async saveOpportunities(opportunities: OpportunityEntity[]): Promise<void> {
    this.memoryOpportunities = opportunities;
    const pool = Database.getPool();
    if (!pool) return;
    try {
      for (const o of opportunities) {
        await pool.query(
          `INSERT INTO opportunities (
            id, title, opportunity_type, organization, location, compensation_range,
            equity_range, description, required_skills, minimum_reputation, urgency,
            application_url, expires_at, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            organization = EXCLUDED.organization,
            compensation_range = EXCLUDED.compensation_range,
            description = EXCLUDED.description,
            required_skills = EXCLUDED.required_skills,
            minimum_reputation = EXCLUDED.minimum_reputation,
            urgency = EXCLUDED.urgency;`,
          [
            o.id,
            o.title,
            o.opportunityType,
            o.organization,
            o.location,
            o.compensationRange || null,
            o.equityRange || null,
            o.description,
            JSON.stringify(o.requiredSkills || []),
            o.minimumReputation,
            o.urgency,
            o.applicationUrl || null,
            o.expiresAt || null,
            o.createdAt,
          ]
        );
      }
    } catch (e: any) {
      logger.warn(`[TalentMarketplaceRepo] saveOpportunities error: ${e.message}`);
    }
  }

  public static async getOpportunityMatches(userId: string): Promise<OpportunityMatchEntity[]> {
    const pool = Database.getPool();
    if (!pool) return this.memoryOpportunityMatches.get(userId) || [];
    try {
      const { rows } = await pool.query(
        `SELECT * FROM opportunity_matches WHERE user_id = $1 ORDER BY match_percentage DESC;`,
        [userId]
      );
      return rows.map((r) => ({
        id: r.id,
        opportunityId: r.opportunity_id,
        userId: r.user_id,
        matchPercentage: parseFloat(r.match_percentage),
        roiScore: parseFloat(r.roi_score),
        successProbability: parseFloat(r.success_probability),
        skillOverlap: r.skill_overlap,
        missingPrerequisites: r.missing_prerequisites,
        strategicRationale: r.strategic_rationale,
        status: r.status,
        matchedAt: r.matched_at,
      }));
    } catch (e: any) {
      return this.memoryOpportunityMatches.get(userId) || [];
    }
  }

  public static async saveOpportunityMatches(userId: string, matches: OpportunityMatchEntity[]): Promise<void> {
    this.memoryOpportunityMatches.set(userId, matches);
    const pool = Database.getPool();
    if (!pool) return;
    try {
      for (const m of matches) {
        await pool.query(
          `INSERT INTO opportunity_matches (
            id, opportunity_id, user_id, match_percentage, roi_score,
            success_probability, skill_overlap, missing_prerequisites,
            strategic_rationale, status, matched_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            match_percentage = EXCLUDED.match_percentage,
            roi_score = EXCLUDED.roi_score,
            success_probability = EXCLUDED.success_probability,
            skill_overlap = EXCLUDED.skill_overlap,
            missing_prerequisites = EXCLUDED.missing_prerequisites,
            strategic_rationale = EXCLUDED.strategic_rationale,
            status = EXCLUDED.status;`,
          [
            m.id,
            m.opportunityId,
            m.userId,
            m.matchPercentage,
            m.roiScore,
            m.successProbability,
            JSON.stringify(m.skillOverlap || []),
            JSON.stringify(m.missingPrerequisites || []),
            m.strategicRationale,
            m.status,
            m.matchedAt,
          ]
        );
      }
    } catch (e: any) {
      logger.warn(`[TalentMarketplaceRepo] saveOpportunityMatches error: ${e.message}`);
    }
  }

  // ================= COLLABORATION & TEAM RECOMMENDATIONS =================
  public static async getCollaborationProfile(userId: string): Promise<CollaborationProfileEntity | null> {
    const pool = Database.getPool();
    if (!pool) return this.memoryCollaborationProfiles.get(userId) || null;
    try {
      const { rows } = await pool.query(`SELECT * FROM collaboration_profiles WHERE user_id = $1 LIMIT 1;`, [userId]);
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        userId: r.user_id,
        teamEffectivenessScore: parseFloat(r.team_effectiveness_score),
        communicationStyle: r.communication_style,
        collaborationStrengths: r.collaboration_strengths,
        preferredCollabTypes: r.preferred_collab_types,
        leadershipGrowthScore: parseFloat(r.leadership_growth_score),
        projectSuccessRate: parseFloat(r.project_success_rate),
        pastCollaborationsCount: r.past_collaborations_count,
        updatedAt: r.updated_at,
      };
    } catch (e: any) {
      return this.memoryCollaborationProfiles.get(userId) || null;
    }
  }

  public static async saveCollaborationProfile(profile: CollaborationProfileEntity): Promise<CollaborationProfileEntity> {
    this.memoryCollaborationProfiles.set(profile.userId, profile);
    const pool = Database.getPool();
    if (!pool) return profile;
    try {
      await pool.query(
        `INSERT INTO collaboration_profiles (
          id, user_id, team_effectiveness_score, communication_style,
          collaboration_strengths, preferred_collab_types, leadership_growth_score,
          project_success_rate, past_collaborations_count, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          team_effectiveness_score = EXCLUDED.team_effectiveness_score,
          communication_style = EXCLUDED.communication_style,
          collaboration_strengths = EXCLUDED.collaboration_strengths,
          preferred_collab_types = EXCLUDED.preferred_collab_types,
          leadership_growth_score = EXCLUDED.leadership_growth_score,
          project_success_rate = EXCLUDED.project_success_rate,
          past_collaborations_count = EXCLUDED.past_collaborations_count,
          updated_at = EXCLUDED.updated_at;`,
        [
          profile.id,
          profile.userId,
          profile.teamEffectivenessScore,
          profile.communicationStyle,
          JSON.stringify(profile.collaborationStrengths || []),
          JSON.stringify(profile.preferredCollabTypes || []),
          profile.leadershipGrowthScore,
          profile.projectSuccessRate,
          profile.pastCollaborationsCount,
          profile.updatedAt,
        ]
      );
      return profile;
    } catch (e: any) {
      logger.warn(`[TalentMarketplaceRepo] saveCollaborationProfile error: ${e.message}`);
      return profile;
    }
  }

  public static async getTeamRecommendations(userId: string): Promise<TeamRecommendationEntity[]> {
    const pool = Database.getPool();
    if (!pool) return this.memoryTeamRecs.get(userId) || [];
    try {
      const { rows } = await pool.query(
        `SELECT * FROM team_recommendations WHERE user_id = $1 ORDER BY synergy_score DESC;`,
        [userId]
      );
      return rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        candidateId: r.candidate_id,
        candidateName: r.candidate_name,
        candidateHeadline: r.candidate_headline,
        candidateReputation: r.candidate_reputation,
        recommendationType: r.recommendation_type,
        synergyScore: parseFloat(r.synergy_score),
        complementarySkills: r.complementary_skills,
        recommendedProjectTopic: r.recommended_project_topic,
        whyMatched: r.why_matched,
        createdAt: r.created_at,
      }));
    } catch (e: any) {
      return this.memoryTeamRecs.get(userId) || [];
    }
  }

  public static async saveTeamRecommendations(userId: string, recs: TeamRecommendationEntity[]): Promise<void> {
    this.memoryTeamRecs.set(userId, recs);
    const pool = Database.getPool();
    if (!pool) return;
    try {
      for (const r of recs) {
        await pool.query(
          `INSERT INTO team_recommendations (
            id, user_id, candidate_id, candidate_name, candidate_headline,
            candidate_reputation, recommendation_type, synergy_score,
            complementary_skills, recommended_project_topic, why_matched, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            synergy_score = EXCLUDED.synergy_score,
            complementary_skills = EXCLUDED.complementary_skills,
            recommended_project_topic = EXCLUDED.recommended_project_topic,
            why_matched = EXCLUDED.why_matched;`,
          [
            r.id,
            r.userId,
            r.candidateId,
            r.candidateName,
            r.candidateHeadline,
            r.candidateReputation,
            r.recommendationType,
            r.synergyScore,
            JSON.stringify(r.complementarySkills || []),
            r.recommendedProjectTopic,
            r.whyMatched,
            r.createdAt,
          ]
        );
      }
    } catch (e: any) {
      logger.warn(`[TalentMarketplaceRepo] saveTeamRecommendations error: ${e.message}`);
    }
  }

  // ================= PORTFOLIO & BENCHMARKS =================
  public static async getPortfolioSnapshot(userId: string): Promise<PortfolioSnapshotEntity | null> {
    const pool = Database.getPool();
    if (!pool) return this.memoryPortfolios.get(userId) || null;
    try {
      const { rows } = await pool.query(
        `SELECT * FROM portfolio_snapshots WHERE user_id = $1 ORDER BY generated_at DESC LIMIT 1;`,
        [userId]
      );
      if (rows.length === 0) return null;
      return this.mapPortfolio(rows[0]);
    } catch (e: any) {
      return this.memoryPortfolios.get(userId) || null;
    }
  }

  public static async savePortfolioSnapshot(portfolio: PortfolioSnapshotEntity): Promise<PortfolioSnapshotEntity> {
    this.memoryPortfolios.set(portfolio.userId, portfolio);
    const pool = Database.getPool();
    if (!pool) return portfolio;
    try {
      await pool.query(
        `INSERT INTO portfolio_snapshots (
          id, user_id, portfolio_title, career_narrative, executive_summary,
          aggregated_projects, aggregated_contests, aggregated_research,
          aggregated_simulations, aggregated_internships, achievement_timeline,
          verified_proof_count, shareable_slug, generated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          portfolio_title = EXCLUDED.portfolio_title,
          career_narrative = EXCLUDED.career_narrative,
          executive_summary = EXCLUDED.executive_summary,
          aggregated_projects = EXCLUDED.aggregated_projects,
          aggregated_contests = EXCLUDED.aggregated_contests,
          aggregated_research = EXCLUDED.aggregated_research,
          aggregated_simulations = EXCLUDED.aggregated_simulations,
          aggregated_internships = EXCLUDED.aggregated_internships,
          achievement_timeline = EXCLUDED.achievement_timeline,
          verified_proof_count = EXCLUDED.verified_proof_count,
          generated_at = EXCLUDED.generated_at;`,
        [
          portfolio.id,
          portfolio.userId,
          portfolio.portfolioTitle,
          portfolio.careerNarrative,
          portfolio.executiveSummary,
          JSON.stringify(portfolio.aggregatedProjects || []),
          JSON.stringify(portfolio.aggregatedContests || []),
          JSON.stringify(portfolio.aggregatedResearch || []),
          JSON.stringify(portfolio.aggregatedSimulations || []),
          JSON.stringify(portfolio.aggregatedInternships || []),
          JSON.stringify(portfolio.achievementTimeline || []),
          portfolio.verifiedProofCount,
          portfolio.shareableSlug,
          portfolio.generatedAt,
        ]
      );
      return portfolio;
    } catch (e: any) {
      logger.warn(`[TalentMarketplaceRepo] savePortfolioSnapshot error: ${e.message}`);
      return portfolio;
    }
  }

  public static async getIndustryBenchmarks(): Promise<IndustryBenchmarkEntity[]> {
    const pool = Database.getPool();
    if (!pool) return Array.from(this.memoryBenchmarks.values());
    try {
      const { rows } = await pool.query(`SELECT * FROM industry_benchmarks ORDER BY overall_readiness_pct DESC;`);
      return rows.map((r) => ({
        id: r.id,
        targetRole: r.target_role,
        overallReadinessPct: parseFloat(r.overall_readiness_pct),
        rankingPercentile: parseFloat(r.ranking_percentile),
        skillGapAnalysis: r.skill_gap_analysis,
        strengths: r.strengths,
        improvementPaths: r.improvement_paths,
        estimatedTimeToHireWeeks: r.estimated_time_to_hire_weeks,
        benchmarkData: r.benchmark_data,
        calculatedAt: r.calculated_at,
      }));
    } catch (e: any) {
      return Array.from(this.memoryBenchmarks.values());
    }
  }

  public static async saveIndustryBenchmarks(benchmarks: IndustryBenchmarkEntity[]): Promise<void> {
    for (const b of benchmarks) {
      this.memoryBenchmarks.set(b.targetRole, b);
    }
    const pool = Database.getPool();
    if (!pool) return;
    try {
      for (const b of benchmarks) {
        await pool.query(
          `INSERT INTO industry_benchmarks (
            id, target_role, overall_readiness_pct, ranking_percentile,
            skill_gap_analysis, strengths, improvement_paths,
            estimated_time_to_hire_weeks, benchmark_data, calculated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            overall_readiness_pct = EXCLUDED.overall_readiness_pct,
            ranking_percentile = EXCLUDED.ranking_percentile,
            skill_gap_analysis = EXCLUDED.skill_gap_analysis,
            strengths = EXCLUDED.strengths,
            improvement_paths = EXCLUDED.improvement_paths,
            estimated_time_to_hire_weeks = EXCLUDED.estimated_time_to_hire_weeks,
            benchmark_data = EXCLUDED.benchmark_data,
            calculated_at = EXCLUDED.calculated_at;`,
          [
            b.id,
            b.targetRole,
            b.overallReadinessPct,
            b.rankingPercentile,
            JSON.stringify(b.skillGapAnalysis || []),
            JSON.stringify(b.strengths || []),
            JSON.stringify(b.improvementPaths || []),
            b.estimatedTimeToHireWeeks,
            JSON.stringify(b.benchmarkData || {}),
            b.calculatedAt,
          ]
        );
      }
    } catch (e: any) {
      logger.warn(`[TalentMarketplaceRepo] saveIndustryBenchmarks error: ${e.message}`);
    }
  }

  public static async getMarketplaceAnalytics(): Promise<MarketplaceAnalyticsEntity | null> {
    const pool = Database.getPool();
    if (!pool) return this.memoryAnalytics;
    try {
      const { rows } = await pool.query(`SELECT * FROM marketplace_analytics ORDER BY recorded_at DESC LIMIT 1;`);
      if (rows.length === 0) return this.memoryAnalytics;
      const r = rows[0];
      return {
        id: r.id,
        totalOpportunitiesActive: r.total_opportunities_active,
        totalMatchesGenerated: r.total_matches_generated,
        averageTalentReputation: parseFloat(r.average_talent_reputation),
        topDemandedSkills: r.top_demanded_skills,
        highestPayingVerticals: r.highest_paying_verticals,
        talentLiquidityIndex: parseFloat(r.talent_liquidity_index),
        recordedAt: r.recorded_at,
      };
    } catch (e: any) {
      return this.memoryAnalytics;
    }
  }

  public static async saveMarketplaceAnalytics(analytics: MarketplaceAnalyticsEntity): Promise<void> {
    this.memoryAnalytics = analytics;
    const pool = Database.getPool();
    if (!pool) return;
    try {
      await pool.query(
        `INSERT INTO marketplace_analytics (
          id, total_opportunities_active, total_matches_generated, average_talent_reputation,
          top_demanded_skills, highest_paying_verticals, talent_liquidity_index, recorded_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
        [
          analytics.id,
          analytics.totalOpportunitiesActive,
          analytics.totalMatchesGenerated,
          analytics.averageTalentReputation,
          JSON.stringify(analytics.topDemandedSkills || []),
          JSON.stringify(analytics.highestPayingVerticals || []),
          analytics.talentLiquidityIndex,
          analytics.recordedAt,
        ]
      );
    } catch (e: any) {
      logger.warn(`[TalentMarketplaceRepo] saveMarketplaceAnalytics error: ${e.message}`);
    }
  }

  // Helpers
  private static mapRepProfile(r: any): ReputationProfileEntity {
    return {
      id: r.id,
      userId: r.user_id,
      reputationScore: parseFloat(r.reputation_score),
      trustScore: parseFloat(r.trust_score),
      expertiseScore: parseFloat(r.expertise_score),
      influenceScore: parseFloat(r.influence_score),
      growthScore: parseFloat(r.growth_score),
      learningReputation: parseFloat(r.learning_reputation),
      contestReputation: parseFloat(r.contest_reputation),
      researchReputation: parseFloat(r.research_reputation),
      openSourceReputation: parseFloat(r.open_source_reputation),
      projectReputation: parseFloat(r.project_reputation),
      collaborationReputation: parseFloat(r.collaboration_reputation),
      leadershipReputation: parseFloat(r.leadership_reputation),
      hiringReputation: parseFloat(r.hiring_reputation),
      percentileRank: parseFloat(r.percentile_rank),
      breakdown: r.breakdown,
      verifiedCredentials: r.verified_credentials,
      updatedAt: r.updated_at,
    };
  }

  private static mapSkillAsset(r: any): SkillAssetEntity {
    return {
      id: r.id,
      userId: r.user_id,
      skillCategory: r.skill_category,
      skillName: r.skill_name,
      proficiencyLevel: r.proficiency_level,
      masteryScore: parseFloat(r.mastery_score),
      verifiedProofs: r.verified_proofs,
      marketDemandScore: parseFloat(r.market_demand_score),
      scarcityIndex: parseFloat(r.scarcity_index),
      industryRelevance: parseFloat(r.industry_relevance),
      estimatedAssetValue: parseFloat(r.estimated_asset_value),
      growthRatePct: parseFloat(r.growth_rate_pct),
      updatedAt: r.updated_at,
    };
  }

  private static mapTalentProfile(r: any): TalentProfileEntity {
    return {
      id: r.id,
      userId: r.user_id,
      headline: r.headline,
      preferredRoles: r.preferred_roles,
      availabilityStatus: r.availability_status,
      targetCompensation: parseFloat(r.target_compensation),
      preferredLocations: r.preferred_locations,
      reputationBadge: r.reputation_badge,
      verifiedSkills: r.verified_skills,
      profileSummary: r.profile_summary,
      visibility: r.visibility,
      updatedAt: r.updated_at,
    };
  }

  private static mapOpportunity(r: any): OpportunityEntity {
    return {
      id: r.id,
      title: r.title,
      opportunityType: r.opportunity_type,
      organization: r.organization,
      location: r.location,
      compensationRange: r.compensation_range,
      equityRange: r.equity_range,
      description: r.description,
      requiredSkills: r.required_skills,
      minimumReputation: r.minimum_reputation,
      urgency: r.urgency,
      applicationUrl: r.application_url,
      expiresAt: r.expires_at,
      createdAt: r.created_at,
    };
  }

  private static mapPortfolio(r: any): PortfolioSnapshotEntity {
    return {
      id: r.id,
      userId: r.user_id,
      portfolioTitle: r.portfolio_title,
      careerNarrative: r.career_narrative,
      executiveSummary: r.executive_summary,
      aggregatedProjects: r.aggregated_projects,
      aggregatedContests: r.aggregated_contests,
      aggregatedResearch: r.aggregated_research,
      aggregatedSimulations: r.aggregated_simulations,
      aggregatedInternships: r.aggregated_internships,
      achievementTimeline: r.achievement_timeline,
      verifiedProofCount: r.verified_proof_count,
      shareableSlug: r.shareable_slug,
      generatedAt: r.generated_at,
    };
  }
}
