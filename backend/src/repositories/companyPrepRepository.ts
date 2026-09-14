import { Database } from "../db/connection";
import { logger } from "../utils/logger";

export interface CompanyTrack {
  id: string;
  companyId: string;
  name: string;
  category: "MAANG" | "Tier 1 Product" | "IT Services";
  overview: string;
  hiringProcess: string[];
  interviewPattern: string[];
  recommendedTopics: string[];
  baseDifficulty: string;
  logoUrl?: string;
}

export interface CompanyRoadmapWeek {
  id: string;
  companyId: string;
  weekNumber: number;
  title: string;
  topics: string[];
  estimatedHours: number;
}

export interface CompanyProblemMapping {
  id: string;
  problemId: string;
  title: string;
  companyId: string;
  frequency: number; // 0-100
  importance: "High" | "Critical" | "Medium";
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
}

export interface CompanyInterviewPatternRound {
  id: string;
  companyId: string;
  roundNumber: number;
  roundName: string;
  roundType: "OA" | "Coding" | "LLD" | "HLD" | "HR" | "Bar Raiser";
  description: string;
  durationMinutes: number;
  keyFocus: string[];
}

export interface CompanyUserReadiness {
  id: string;
  userId: string;
  companyId: string;
  readinessScore: number;
  strengths: string[];
  weaknesses: string[];
  improvementAreas: string[];
  updatedAt: string;
}

export interface CompanyPrepPlan {
  id: string;
  userId: string;
  companyId: string;
  targetDate: string;
  availableHoursPerWeek: number;
  dailyPlan: Array<{ day: string; task: string; type: string; estMinutes: number }>;
  weeklyPlan: Array<{ week: number; focus: string; milestones: string[] }>;
  monthlyPlan: Array<{ month: number; goal: string }>;
  createdAt: string;
}

export class CompanyPrepRepository {
  private static tracksStore: Map<string, CompanyTrack> = new Map();
  private static roadmapsStore: Map<string, CompanyRoadmapWeek[]> = new Map();
  private static problemMappingsStore: CompanyProblemMapping[] = [];
  private static patternsStore: Map<string, CompanyInterviewPatternRound[]> = new Map();
  private static readinessStore: Map<string, CompanyUserReadiness> = new Map();
  private static plansStore: Map<string, CompanyPrepPlan> = new Map();

  private static initialized = false;

  private static initDefaultData() {
    if (this.initialized) return;

    const companies = [
      { id: "amazon", name: "Amazon", cat: "MAANG", diff: "Hard", topics: ["Arrays", "Strings", "Trees", "Graphs", "Dynamic Programming", "LLD/Leadership Principles"] },
      { id: "google", name: "Google", cat: "MAANG", diff: "Hard", topics: ["Graphs", "Dynamic Programming", "Trees", "Trie", "Advanced Algorithms", "System Design"] },
      { id: "microsoft", name: "Microsoft", cat: "MAANG", diff: "Medium", topics: ["Arrays", "LinkedList", "Trees", "Strings", "Design Patterns"] },
      { id: "meta", name: "Meta", cat: "MAANG", diff: "Hard", topics: ["Binary Search", "Trees", "Graphs", "Recursion", "System Design"] },
      { id: "netflix", name: "Netflix", cat: "MAANG", diff: "Hard", topics: ["Concurrency", "System Architecture", "Distributed Systems", "Graphs"] },
      { id: "adobe", name: "Adobe", cat: "Tier 1 Product", diff: "Medium", topics: ["Arrays", "Strings", "Math", "Stack & Queue", "Trees"] },
      { id: "uber", name: "Uber", cat: "Tier 1 Product", diff: "Hard", topics: ["Graphs", "Shortest Path", "Heaps", "System Design", "Dynamic Programming"] },
      { id: "atlassian", name: "Atlassian", cat: "Tier 1 Product", diff: "Medium", topics: ["Data Structures", "OOP Design", "Graphs", "Concurrence"] },
      { id: "tcs", name: "TCS", cat: "IT Services", diff: "Easy", topics: ["Aptitude", "Basic Arrays", "Strings", "C/C++ Fundamentals", "SQL"] },
      { id: "infosys", name: "Infosys", cat: "IT Services", diff: "Easy", topics: ["Logical Reasoning", "Arrays", "String Manipulation", "DBMS"] },
      { id: "wipro", name: "Wipro", cat: "IT Services", diff: "Easy", topics: ["Aptitude", "Basic Coding", "Verbal", "Pseudocode"] },
      { id: "accenture", name: "Accenture", cat: "IT Services", diff: "Easy", topics: ["Cognitive Assessment", "Basic Coding", "Networking", "MS Office"] },
      { id: "cognizant", name: "Cognizant", cat: "IT Services", diff: "Easy", topics: ["GenC Coding", "Automata", "Basic Data Structures", "SQL"] },
    ];

    companies.forEach((c) => {
      const track: CompanyTrack = {
        id: `track-${c.id}`,
        companyId: c.id,
        name: c.name,
        category: c.cat as any,
        overview: `${c.name} end-to-end interview preparation track targeting SDE 1, SDE 2, and specialized software roles.`,
        hiringProcess: [
          "Online Assessment (OA)",
          "Technical Round 1 (DSA & Core CS)",
          "Technical Round 2 (System Design / LLD)",
          "Bar Raiser / HR Cultural Fit",
        ],
        interviewPattern: ["2 Coding Questions on HackerRank/Amcat", "60 min Live Coding", "45 min System Architecture"],
        recommendedTopics: c.topics,
        baseDifficulty: c.diff,
      };
      this.tracksStore.set(c.id, track);

      // Default Roadmaps
      this.roadmapsStore.set(c.id, [
        { id: `rm-${c.id}-1`, companyId: c.id, weekNumber: 1, title: "Arrays, Strings & Searching", topics: ["Two Pointers", "Sliding Window", "Binary Search"], estimatedHours: 12 },
        { id: `rm-${c.id}-2`, companyId: c.id, weekNumber: 2, title: "Linear & Non-Linear Structures", topics: ["Linked List", "Stack & Queue", "Trees"], estimatedHours: 14 },
        { id: `rm-${c.id}-3`, companyId: c.id, weekNumber: 3, title: "Graphs & Shortest Path", topics: ["BFS/DFS", "Topological Sort", "Dijkstra"], estimatedHours: 16 },
        { id: `rm-${c.id}-4`, companyId: c.id, weekNumber: 4, title: "Dynamic Programming & LLD", topics: ["1D/2D DP", "Object-Oriented Design", "Mock Interview"], estimatedHours: 18 },
      ]);

      // Default Patterns
      this.patternsStore.set(c.id, [
        { id: `pat-${c.id}-1`, companyId: c.id, roundNumber: 1, roundName: "Online Assessment (OA)", roundType: "OA", description: "Automated test on HackerRank platform consisting of 2 DSA problems and speed debugging.", durationMinutes: 90, keyFocus: ["Time Complexity", "Passing Test Cases", "Edge Case Safety"] },
        { id: `pat-${c.id}-2`, companyId: c.id, roundNumber: 2, roundName: "Technical Round - DSA", roundType: "Coding", description: "1-on-1 interview focused on problem solving, dry running code, and verbal explanation.", durationMinutes: 60, keyFocus: ["Optimal Space/Time", "Code Cleanliness", "Communication"] },
        { id: `pat-${c.id}-3`, companyId: c.id, roundNumber: 3, roundName: "System / LLD Design", roundType: "LLD", description: "Object-oriented class diagram design or high-level architecture walkthrough.", durationMinutes: 60, keyFocus: ["Design Patterns", "Extensibility", "Clean API Interfaces"] },
        { id: `pat-${c.id}-4`, companyId: c.id, roundNumber: 4, roundName: "Bar Raiser & Leadership", roundType: "Bar Raiser", description: "Behavioral questions based on company core values and past project achievements.", durationMinutes: 45, keyFocus: ["STAR Method", "Leadership Principles", "Cultural Fit"] },
      ]);
    });

    // Default Problem Mappings
    this.problemMappingsStore = [
      { id: "cpm-1", problemId: "prob-101", title: "Two Sum", companyId: "amazon", frequency: 95, importance: "Critical", difficulty: "Easy", topics: ["Arrays", "Hashing"] },
      { id: "cpm-2", problemId: "prob-101", title: "Two Sum", companyId: "google", frequency: 88, importance: "High", difficulty: "Easy", topics: ["Arrays", "Hashing"] },
      { id: "cpm-3", problemId: "prob-102", title: "Number of Islands", companyId: "amazon", frequency: 98, importance: "Critical", difficulty: "Medium", topics: ["Graphs", "BFS", "DFS"] },
      { id: "cpm-4", problemId: "prob-102", title: "Number of Islands", companyId: "meta", frequency: 92, importance: "Critical", difficulty: "Medium", topics: ["Graphs", "BFS", "DFS"] },
      { id: "cpm-5", problemId: "prob-103", title: "Trapping Rain Water", companyId: "google", frequency: 90, importance: "Critical", difficulty: "Hard", topics: ["Two Pointers", "Stack"] },
      { id: "cpm-6", problemId: "prob-104", title: "Word Break", companyId: "microsoft", frequency: 85, importance: "High", difficulty: "Medium", topics: ["Dynamic Programming", "Trie"] },
      { id: "cpm-7", problemId: "prob-105", title: "Course Schedule", companyId: "uber", frequency: 91, importance: "Critical", difficulty: "Medium", topics: ["Graphs", "Topological Sort"] },
    ];

    this.initialized = true;
  }

  public static async getCompanyTracks(): Promise<CompanyTrack[]> {
    this.initDefaultData();
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(`SELECT * FROM company_tracks ORDER BY name ASC;`);
        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            companyId: r.company_id,
            name: r.name,
            category: r.category,
            overview: r.overview,
            hiringProcess: typeof r.hiring_process === "string" ? JSON.parse(r.hiring_process) : r.hiring_process,
            interviewPattern: typeof r.interview_pattern === "string" ? JSON.parse(r.interview_pattern) : r.interview_pattern,
            recommendedTopics: typeof r.recommended_topics === "string" ? JSON.parse(r.recommended_topics) : r.recommended_topics,
            baseDifficulty: r.base_difficulty,
          }));
        }
      } catch (err: any) {
        logger.error(`[CompanyPrepRepository] getCompanyTracks DB error: ${err.message}`);
      }
    }
    return Array.from(this.tracksStore.values());
  }

  public static async getCompanyTrack(companyId: string): Promise<CompanyTrack | null> {
    const tracks = await this.getCompanyTracks();
    return tracks.find((t) => t.companyId.toLowerCase() === companyId.toLowerCase()) || null;
  }

  public static async getRoadmap(companyId: string): Promise<CompanyRoadmapWeek[]> {
    this.initDefaultData();
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT * FROM company_roadmaps WHERE company_id = $1 ORDER BY week_number ASC;`,
          [companyId]
        );
        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            companyId: r.company_id,
            weekNumber: r.week_number,
            title: r.title,
            topics: typeof r.topics === "string" ? JSON.parse(r.topics) : r.topics,
            estimatedHours: r.estimated_hours,
          }));
        }
      } catch (err: any) {
        logger.error(`[CompanyPrepRepository] getRoadmap DB error: ${err.message}`);
      }
    }
    return this.roadmapsStore.get(companyId.toLowerCase()) || [];
  }

  public static async getProblemMappings(companyId?: string, topic?: string, difficulty?: string): Promise<CompanyProblemMapping[]> {
    this.initDefaultData();
    const pool = Database.getPool();
    if (pool) {
      try {
        let query = `SELECT * FROM company_problem_mappings WHERE 1=1`;
        const params: any[] = [];
        if (companyId) {
          params.push(companyId);
          query += ` AND company_id = $${params.length}`;
        }
        if (difficulty) {
          params.push(difficulty);
          query += ` AND difficulty = $${params.length}`;
        }
        query += ` ORDER BY frequency DESC;`;

        const { rows } = await Database.query<any>(query, params);
        if (rows.length > 0) {
          let results = rows.map((r) => ({
            id: r.id,
            problemId: r.problem_id,
            title: r.title,
            companyId: r.company_id,
            frequency: r.frequency,
            importance: r.importance,
            difficulty: r.difficulty,
            topics: typeof r.topics === "string" ? JSON.parse(r.topics) : r.topics,
          }));
          if (topic) {
            results = results.filter((p) => p.topics.some((t: string) => t.toLowerCase() === topic.toLowerCase()));
          }
          return results;
        }
      } catch (err: any) {
        logger.error(`[CompanyPrepRepository] getProblemMappings DB error: ${err.message}`);
      }
    }

    let items = [...this.problemMappingsStore];
    if (companyId) {
      items = items.filter((i) => i.companyId.toLowerCase() === companyId.toLowerCase());
    }
    if (difficulty) {
      items = items.filter((i) => i.difficulty.toLowerCase() === difficulty.toLowerCase());
    }
    if (topic) {
      items = items.filter((i) => i.topics.some((t) => t.toLowerCase() === topic.toLowerCase()));
    }
    return items;
  }

  public static async getInterviewPattern(companyId: string): Promise<CompanyInterviewPatternRound[]> {
    this.initDefaultData();
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT * FROM company_interview_patterns WHERE company_id = $1 ORDER BY round_number ASC;`,
          [companyId]
        );
        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            companyId: r.company_id,
            roundNumber: r.round_number,
            roundName: r.round_name,
            roundType: r.round_type,
            description: r.description,
            durationMinutes: r.duration_minutes,
            keyFocus: typeof r.key_focus === "string" ? JSON.parse(r.key_focus) : r.key_focus,
          }));
        }
      } catch (err: any) {
        logger.error(`[CompanyPrepRepository] getInterviewPattern DB error: ${err.message}`);
      }
    }
    return this.patternsStore.get(companyId.toLowerCase()) || [];
  }

  public static async getUserReadiness(userId: string, companyId: string): Promise<CompanyUserReadiness> {
    const key = `${userId}:${companyId.toLowerCase()}`;
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT * FROM company_user_readiness WHERE user_id = $1 AND company_id = $2 LIMIT 1;`,
          [userId, companyId]
        );
        if (rows.length > 0) {
          return {
            id: rows[0].id,
            userId: rows[0].user_id,
            companyId: rows[0].company_id,
            readinessScore: rows[0].readiness_score,
            strengths: typeof rows[0].strengths === "string" ? JSON.parse(rows[0].strengths) : rows[0].strengths,
            weaknesses: typeof rows[0].weaknesses === "string" ? JSON.parse(rows[0].weaknesses) : rows[0].weaknesses,
            improvementAreas: typeof rows[0].improvement_areas === "string" ? JSON.parse(rows[0].improvement_areas) : rows[0].improvement_areas,
            updatedAt: rows[0].updated_at,
          };
        }
      } catch (err: any) {
        logger.error(`[CompanyPrepRepository] getUserReadiness DB error: ${err.message}`);
      }
    }

    if (!this.readinessStore.has(key)) {
      const defaultReadiness: CompanyUserReadiness = {
        id: `readiness-${key}`,
        userId,
        companyId,
        readinessScore: companyId.toLowerCase() === "amazon" ? 78 : companyId.toLowerCase() === "google" ? 61 : 72,
        strengths: ["Arrays & Sliding Window", "Graph BFS Invariants", "Two Pointers Strategy"],
        weaknesses: ["2D Dynamic Programming State Transitions", "LLD Concurrency Locks"],
        improvementAreas: ["Practice 3 Amazon High-Freq Hard Problems", "Complete 1 Mock OA Session under 90 minutes"],
        updatedAt: new Date().toISOString(),
      };
      this.readinessStore.set(key, defaultReadiness);
    }
    return this.readinessStore.get(key)!;
  }

  public static async savePrepPlan(plan: CompanyPrepPlan): Promise<CompanyPrepPlan> {
    const key = `${plan.userId}:${plan.companyId.toLowerCase()}`;
    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `INSERT INTO company_prep_plans (id, user_id, company_id, target_date, available_hours_per_week, daily_plan, weekly_plan, monthly_plan, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET target_date = $4, available_hours_per_week = $5, daily_plan = $6, weekly_plan = $7, monthly_plan = $8;`,
          [
            plan.id,
            plan.userId,
            plan.companyId,
            plan.targetDate,
            plan.availableHoursPerWeek,
            JSON.stringify(plan.dailyPlan),
            JSON.stringify(plan.weeklyPlan),
            JSON.stringify(plan.monthlyPlan),
            plan.createdAt,
          ]
        );
      } catch (err: any) {
        logger.error(`[CompanyPrepRepository] savePrepPlan DB error: ${err.message}`);
      }
    }
    this.plansStore.set(key, plan);
    return plan;
  }

  public static async getPrepPlan(userId: string, companyId: string): Promise<CompanyPrepPlan | null> {
    const key = `${userId}:${companyId.toLowerCase()}`;
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT * FROM company_prep_plans WHERE user_id = $1 AND company_id = $2 ORDER BY created_at DESC LIMIT 1;`,
          [userId, companyId]
        );
        if (rows.length > 0) {
          return {
            id: rows[0].id,
            userId: rows[0].user_id,
            companyId: rows[0].company_id,
            targetDate: rows[0].target_date,
            availableHoursPerWeek: rows[0].available_hours_per_week,
            dailyPlan: typeof rows[0].daily_plan === "string" ? JSON.parse(rows[0].daily_plan) : rows[0].daily_plan,
            weeklyPlan: typeof rows[0].weekly_plan === "string" ? JSON.parse(rows[0].weekly_plan) : rows[0].weekly_plan,
            monthlyPlan: typeof rows[0].monthly_plan === "string" ? JSON.parse(rows[0].monthly_plan) : rows[0].monthly_plan,
            createdAt: rows[0].created_at,
          };
        }
      } catch (err: any) {
        logger.error(`[CompanyPrepRepository] getPrepPlan DB error: ${err.message}`);
      }
    }
    return this.plansStore.get(key) || null;
  }
}
