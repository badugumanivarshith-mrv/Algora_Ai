import { UniversityRepository, ImpactProfileRecord, ImpactEventRecord } from "../../repositories/universityRepository";
import { ReputationEngineService } from "./reputationEngineService";
import { logger } from "../../utils/logger";

export interface GlobalImpactSummary {
  profile: ImpactProfileRecord;
  events: ImpactEventRecord[];
  globalRankPercentile: number;
  impactScoreScaled1000: number;
  topImpactVector: string;
  upcomingForecasts: {
    year: number;
    projectedScore: number;
    projectedReach: number;
    milestone: string;
  }[];
}

export class GlobalImpactService {
  public static async getGlobalImpact(userId: string = 'usr_demo'): Promise<GlobalImpactSummary> {
    const [profile, events] = await Promise.all([
      UniversityRepository.getImpactProfile(userId),
      UniversityRepository.getImpactEvents(userId)
    ]);

    const impactScoreScaled1000 = Math.round(profile.overallImpactScore * 10);
    const globalRankPercentile = parseFloat((99.2 - (1000 - impactScoreScaled1000) * 0.05).toFixed(1));

    // Vector analysis
    const vectors = [
      { name: 'Open Source', val: profile.openSourceImpact },
      { name: 'Research', val: profile.researchImpact },
      { name: 'Education', val: profile.educationImpact },
      { name: 'Mentorship', val: profile.mentorshipImpact },
      { name: 'Community Building', val: profile.communityImpact },
      { name: 'Entrepreneurship', val: profile.entrepreneurshipImpact }
    ];
    vectors.sort((a, b) => b.val - a.val);
    const topImpactVector = vectors[0]?.name || 'Open Source';

    const upcomingForecasts = [
      { year: 2026, projectedScore: 920, projectedReach: 35000, milestone: 'Global adoption of open-source Raft & Agent frameworks' },
      { year: 2027, projectedScore: 955, projectedReach: 120000, milestone: 'High-impact NeurIPS foundation model breakthroughs & Seed launch' },
      { year: 2029, projectedScore: 988, projectedReach: 500000, milestone: 'Industry-standard infrastructure powering global AI developers' }
    ];

    return {
      profile,
      events,
      globalRankPercentile: Math.min(99.9, Math.max(80.0, globalRankPercentile)),
      impactScoreScaled1000,
      topImpactVector,
      upcomingForecasts
    };
  }

  public static async logImpactEvent(
    userId: string,
    impactArea: ImpactEventRecord['impactArea'],
    title: string,
    metrics: string,
    reachCount: number,
    verificationSource: string
  ): Promise<ImpactEventRecord> {
    const event: ImpactEventRecord = {
      id: `impe_${Date.now()}`,
      userId,
      impactArea,
      title,
      metrics,
      reachCount,
      verificationSource,
      eventDate: new Date().toISOString()
    };

    await UniversityRepository.addImpactEvent(event);
    
    // Update profile
    const profile = await UniversityRepository.getImpactProfile(userId);
    profile.totalPeopleImpacted += reachCount;
    profile.overallImpactScore = Math.min(99.9, profile.overallImpactScore + 0.3);
    await UniversityRepository.saveImpactProfile(profile);

    logger.info(`[GlobalImpactService] Logged impact event for user ${userId}: ${title} (${reachCount} reach)`);
    return event;
  }
}
