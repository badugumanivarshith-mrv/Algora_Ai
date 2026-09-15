import { CareerRepository, JobMatchEntity } from "../../repositories/careerRepository";
import { defaultAIProvider } from "./geminiProvider";

export class JobMatchService {
  public static async matchJobs(params: {
    userId: string;
    targetRole?: string;
    skills?: string[];
    problemsSolvedCount?: number;
    contestRating?: number;
  }): Promise<JobMatchEntity[]> {
    const targetRole = params.targetRole || "Backend Engineer";
    const userSkills = params.skills || ["TypeScript", "Node.js", "PostgreSQL", "Data Structures"];

    const prompt = `You are an AI Talent Matching Engine for top tech companies.
Match candidate with skills ${JSON.stringify(userSkills)}, Target Role: "${targetRole}", Problems Solved: ${params.problemsSolvedCount || 150}, Contest Rating: ${params.contestRating || 1650}.

Generate 4 realistic company job matches (e.g. Amazon, Google, Microsoft, Meta, TCS, Uber, Infosys).

Return JSON array matching schema:
[
  {
    "company": "Amazon",
    "role": "${targetRole}",
    "matchPercentage": 88,
    "skillGaps": ["Distributed Systems", "AWS DynamoDB"],
    "recommendedTopics": ["System Design", "Tree & Graph Traversals"],
    "recommendedProblems": ["LRU Cache", "Word Ladder", "Course Schedule"]
  }
]`;

    let matches: any[];
    try {
      const responseText = await defaultAIProvider.generateRawText(prompt);
      matches = JSON.parse(responseText.replace(/```json|```/g, "").trim());
    } catch (e) {
      matches = [
        {
          company: "Amazon",
          role: targetRole,
          matchPercentage: 90,
          skillGaps: ["AWS DynamoDB", "Leadership Principles"],
          recommendedTopics: ["Trees & Graphs", "Object-Oriented Design"],
          recommendedProblems: ["LRU Cache", "Course Schedule II"],
        },
        {
          company: "Google",
          role: targetRole,
          matchPercentage: 84,
          skillGaps: ["Advanced Dynamic Programming", "Trie"],
          recommendedTopics: ["Graph Algorithms", "Segment Trees"],
          recommendedProblems: ["Serialize and Deserialize Binary Tree", "Word Break II"],
        },
        {
          company: "Microsoft",
          role: targetRole,
          matchPercentage: 92,
          skillGaps: ["Azure Cloud", "SQL Tuning"],
          recommendedTopics: ["Linked Lists", "Concurrency"],
          recommendedProblems: ["Merge K Sorted Lists", "LRU Cache"],
        },
      ];
    }

    const savedMatches: JobMatchEntity[] = [];
    for (const match of matches) {
      const saved = await CareerRepository.saveJobMatch({
        userId: params.userId,
        company: match.company,
        role: match.role,
        matchPercentage: match.matchPercentage,
        skillGaps: match.skillGaps || [],
        recommendedTopics: match.recommendedTopics || [],
        recommendedProblems: match.recommendedProblems || [],
      });
      savedMatches.push(saved);
    }

    return savedMatches;
  }

  public static async getJobMatches(userId: string): Promise<JobMatchEntity[]> {
    return await CareerRepository.getJobMatches(userId);
  }
}
