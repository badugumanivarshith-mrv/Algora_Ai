export class ContributionAnalyticsService {
  public static calculateImpactScore(contributions: any[]) {
    // Scoring logic for OSS contributions
    let totalScore = 0;
    let consistency = 0;
    
    if (contributions.length === 0) return { impactScore: 0, consistencyScore: 0 };

    contributions.forEach(c => {
      switch (c.contribution_type) {
        case 'PR':
          totalScore += 20 + (c.impact_score || 0);
          break;
        case 'Commit':
          totalScore += 5;
          break;
        case 'Review':
          totalScore += 10;
          break;
        case 'Issue':
          totalScore += 2;
          break;
      }
    });

    // Calculate consistency based on frequency of contributions (mock logic for now)
    consistency = Math.min(100, contributions.length * 5);

    return {
      impactScore: Math.round(totalScore),
      consistencyScore: consistency,
      totalContributions: contributions.length
    };
  }
}
