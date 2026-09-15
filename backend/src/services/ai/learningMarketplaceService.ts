import { UniversityRepository, LearningMarketplaceRecord } from "../../repositories/universityRepository";
import { CareerRepository } from "../../repositories/careerRepository";
import { logger } from "../../utils/logger";

export interface LearningMarketplaceSummary {
  offerings: LearningMarketplaceRecord[];
  recommendedOffering: LearningMarketplaceRecord;
  totalOfferings: number;
  averageRoiScore: number;
  topCategories: string[];
}

export class LearningMarketplaceService {
  public static async getMarketplaceOfferings(userId: string = 'usr_demo'): Promise<LearningMarketplaceSummary> {
    const offerings = await UniversityRepository.getMarketplaceOfferings();
    
    const avgRoi = offerings.reduce((acc, curr) => acc + curr.roiScore, 0) / (offerings.length || 1);
    const sorted = [...offerings].sort((a, b) => b.roiScore - a.roiScore);
    const recommendedOffering = sorted[0];

    return {
      offerings,
      recommendedOffering,
      totalOfferings: offerings.length,
      averageRoiScore: parseFloat(avgRoi.toFixed(1)),
      topCategories: ['Fellowships', 'Bootcamps', 'Research Programs', 'Certifications']
    };
  }

  public static async enrollInOffering(userId: string, offeringId: string) {
    logger.info(`[LearningMarketplaceService] Enrolling user ${userId} in offering ${offeringId}`);
    return {
      success: true,
      enrollmentId: `enr_${Date.now()}`,
      userId,
      offeringId,
      status: 'Active',
      enrolledAt: new Date().toISOString()
    };
  }
}
