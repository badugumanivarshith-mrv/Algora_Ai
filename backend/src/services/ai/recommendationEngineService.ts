import {
  LearningIntelligenceRepository,
  LearningRecommendationEntity,
} from "../../repositories/learningIntelligenceRepository";
import { defaultAIProvider } from "./geminiProvider";

export class RecommendationEngineService {
  public static async getRecommendations(userId: string): Promise<LearningRecommendationEntity[]> {
    let recs = await LearningIntelligenceRepository.getRecommendations(userId);
    if (recs.length === 0) {
      recs = await this.generateAIRecommendations(userId);
    }
    return recs;
  }

  private static async generateAIRecommendations(userId: string): Promise<LearningRecommendationEntity[]> {
    const prompt = `Generate 4 personalized learning recommendations for a developer.
Types: "next_topic", "revision_schedule", "contest_suggestion", "company_prep".

Return JSON array:
[
  {
    "recommendationType": "next_topic",
    "title": "Master Priority Queue & Heap Operations",
    "description": "Prerequisite for Dijkstra and Top-K Frequent Elements.",
    "targetResource": "/workspace?topic=Heap",
    "priority": "High"
  }
]`;

    let recList: any[];
    try {
      const responseText = await defaultAIProvider.generateRawText(prompt);
      recList = JSON.parse(responseText.replace(/```json|```/g, "").trim());
    } catch (e) {
      recList = [
        {
          recommendationType: "next_topic",
          title: "Master Priority Queue & Heap Operations",
          description: "Prerequisite for Dijkstra and Top-K Frequent Elements.",
          targetResource: "/workspace?topic=Heap",
          priority: "High",
        },
        {
          recommendationType: "revision_schedule",
          title: "7-Day Spaced Repetition: Binary Search Trees",
          description: "Review BST Inorder Successor & Validation to prevent retention decay.",
          targetResource: "/daily-review",
          priority: "Medium",
        },
        {
          recommendationType: "contest_suggestion",
          title: "Participate in Weekly Algora Contest #42",
          description: "Test speed & accuracy under 90-minute competition pressure.",
          targetResource: "/contests",
          priority: "High",
        },
        {
          recommendationType: "company_prep",
          title: "Complete Amazon Leadership Principles STAR Audit",
          description: "Align past project experiences with Amazon's 'Customer Obsession' and 'Ownership'.",
          targetResource: "/company-prep",
          priority: "High",
        },
      ];
    }

    const savedRecs: LearningRecommendationEntity[] = [];
    for (const r of recList) {
      const saved = await LearningIntelligenceRepository.saveRecommendation({
        userId,
        recommendationType: r.recommendationType,
        title: r.title,
        description: r.description,
        targetResource: r.targetResource,
        priority: r.priority,
      });
      savedRecs.push(saved);
    }

    return savedRecs;
  }
}
