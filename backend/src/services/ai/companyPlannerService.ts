import { defaultAIProvider } from "./geminiProvider";
import { CompanyPrepRepository, CompanyPrepPlan } from "../../repositories/companyPrepRepository";
import { RedisManager } from "../../redis/redisClient";

export interface MockInterviewQuestion {
  id: string;
  roundName: string;
  questionTitle: string;
  problemDescription: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  expectedOutputFormat: string;
  starterCode: string;
  hints: string[];
  evaluationCriteria: string[];
}

export class CompanyPlannerService {
  public static async generatePreparationPlan(
    userId: string,
    companyId: string,
    targetDate: string,
    availableHoursPerWeek: number
  ): Promise<CompanyPrepPlan> {
    const redisKey = `company:plan:${userId}:${companyId.toLowerCase()}:${targetDate}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fall through
      }
    }

    const track = await CompanyPrepRepository.getCompanyTrack(companyId);

    const systemInstruction = `You are an executive Tech Recruiting Director at ${track?.name || companyId}. Generate a tailored 30-day interview preparation plan.
Return ONLY valid JSON strictly matching this schema:
{
  "dailyPlan": [
    { "day": "Day 1", "task": "Solve Two Sum & Sliding Window High Freq", "type": "DSA Problem", "estMinutes": 60 },
    { "day": "Day 2", "task": "Review BFS Invariants Flashcards", "type": "Daily Review", "estMinutes": 30 }
  ],
  "weeklyPlan": [
    { "week": 1, "focus": "Arrays, Strings & Two Pointers", "milestones": ["Solve 10 Amazon High Freq Easy/Med", "Complete Week 1 Quiz"] }
  ],
  "monthlyPlan": [
    { "month": 1, "goal": "Achieve 85%+ Amazon Readiness & Complete 2 Mock Bar Raiser Interviews" }
  ]
}`;

    const prompt = `Target Company: ${track?.name || companyId}. Target Date: ${targetDate}. Available Hours/Week: ${availableHoursPerWeek}. Recommended Topics: ${JSON.stringify(track?.recommendedTopics || [])}.`;

    let generated: { dailyPlan: any[]; weeklyPlan: any[]; monthlyPlan: any[] };
    try {
      const rawText = await defaultAIProvider.generateRawText(prompt, systemInstruction);
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      generated = JSON.parse(cleanJson);
    } catch {
      generated = {
        dailyPlan: [
          { day: "Day 1", task: `Solve 2 High Frequency ${track?.name || companyId} Array Problems`, type: "DSA Coding", estMinutes: 60 },
          { day: "Day 2", task: `Review BFS / DFS Graph Invariants`, type: "Revision", estMinutes: 45 },
          { day: "Day 3", task: `Take 30-min Timed ${track?.name || companyId} OA Practice Quiz`, type: "Mock Quiz", estMinutes: 30 },
        ],
        weeklyPlan: [
          { week: 1, focus: "Data Structures & Core High-Frequency Patterns", milestones: ["15 High-Freq Solved", "90% Review Completion"] },
          { week: 2, focus: "System Architecture & Low Level Object Design", milestones: ["Design Parking Lot LLD", "Review Concurrency"] },
        ],
        monthlyPlan: [
          { month: 1, goal: `Reach 80%+ ${track?.name || companyId} Readiness Score` },
        ],
      };
    }

    const planEntity: CompanyPrepPlan = {
      id: `plan-${Date.now()}`,
      userId,
      companyId,
      targetDate,
      availableHoursPerWeek,
      dailyPlan: generated.dailyPlan || [],
      weeklyPlan: generated.weeklyPlan || [],
      monthlyPlan: generated.monthlyPlan || [],
      createdAt: new Date().toISOString(),
    };

    await CompanyPrepRepository.savePrepPlan(planEntity);
    await RedisManager.set(redisKey, JSON.stringify(planEntity), 3600);

    return planEntity;
  }

  public static async generateMockInterview(
    companyId: string,
    roundType: string = "Coding",
    difficulty: string = "Medium"
  ): Promise<MockInterviewQuestion[]> {
    const redisKey = `company:mock:${companyId.toLowerCase()}:${roundType.toLowerCase()}:${difficulty.toLowerCase()}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fall through
      }
    }

    const track = await CompanyPrepRepository.getCompanyTrack(companyId);

    const systemInstruction = `You are a Senior Principal Interviewer at ${track?.name || companyId}. Generate 2 company-specific mock interview questions.
Return ONLY valid JSON strictly matching this array schema:
[
  {
    "id": "mock-q1",
    "roundName": "${roundType} Round",
    "questionTitle": "Optimal Fulfillment Center Inventory Router",
    "problemDescription": "Given a grid of warehouses and fulfillment requests, calculate the minimum cost graph path...",
    "difficulty": "${difficulty}",
    "topics": ["Graphs", "Dijkstra"],
    "expectedOutputFormat": "Integer representing minimum total path transport cost",
    "starterCode": "function solve(grid, requests) {\\n  // Write your code here\\n}",
    "hints": ["Consider Dijkstra min-heap optimization.", "Watch for negative edge weights."],
    "evaluationCriteria": ["Correct time complexity O(E log V)", "Clean handling of unreachable warehouses"]
  }
]`;

    const prompt = `Company: ${track?.name || companyId}. Round Type: ${roundType}. Difficulty: ${difficulty}.`;

    let questions: MockInterviewQuestion[] = [];
    try {
      const rawText = await defaultAIProvider.generateRawText(prompt, systemInstruction);
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      questions = JSON.parse(cleanJson);
    } catch {
      questions = [
        {
          id: `mock-${Date.now()}-1`,
          roundName: `${roundType} Round`,
          questionTitle: `${track?.name || companyId} High Frequency Stream Aggregator`,
          problemDescription: `Design a data structure that accepts a stream of integers and retrieves the top K most frequent elements in O(1) time complexity.`,
          difficulty: difficulty as any,
          topics: ["Hash Map", "Min Heap", "Design"],
          expectedOutputFormat: "Array of top K integers sorted by frequency",
          starterCode: `class StreamAggregator {\n  constructor(k) {\n    this.k = k;\n  }\n  add(val) {}\n  getTopK() {}\n}`,
          hints: ["Use a combination of Hash Map for frequency and Min-Heap for k elements.", "Consider bucket sort if frequency range is bounded."],
          evaluationCriteria: ["Space complexity bound O(N)", "Optimal stream update time"],
        },
      ];
    }

    await RedisManager.set(redisKey, JSON.stringify(questions), 3600);
    return questions;
  }
}
