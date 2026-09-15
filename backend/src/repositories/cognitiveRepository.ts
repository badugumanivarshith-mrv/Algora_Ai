import { Database } from "../db/connection";
import { logger } from "../utils/logger";

export interface CognitiveProfileRecord {
  id: string;
  userId: string;
  workingMemoryScore: number;
  longTermMemoryScore: number;
  retrievalAbilityScore: number;
  problemSolvingScore: number;
  reasoningScore: number;
  patternRecognitionScore: number;
  abstractionScore: number;
  learningVelocityScore: number;
  focusCapacityScore: number;
  knowledgeTransferScore: number;
  adaptabilityScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface LearningDNARecord {
  id: string;
  userId: string;
  archetype: string;
  preferredLearningMode: string;
  retentionRatePct: number;
  practiceEffectiveness: number;
  readingEffectiveness: number;
  videoEffectiveness: number;
  projectEffectiveness: number;
  dominantTraits: string[];
  learningSuperpowers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CognitiveBottleneckRecord {
  id: string;
  userId: string;
  bottleneckType: string;
  severity: string;
  title: string;
  description: string;
  impactArea: string;
  recoveryPlan: string[];
  status: string;
  detectedAt: string;
}

export interface KnowledgeCompoundingRecord {
  id: string;
  userId: string;
  sourceDomain: string;
  targetImpactArea: string;
  multiplier: number;
  synergyDescription: string;
  updatedAt: string;
}

export interface AGIResearchProjectRecord {
  id: string;
  userId: string;
  title: string;
  domain: string;
  objective: string;
  status: string;
  researchPlan: any;
  readingSequence: any;
  evaluationFramework: any;
  createdAt: string;
  updatedAt: string;
}

export interface SuperintelligenceSimulationRecord {
  id: string;
  userId: string;
  simulationName: string;
  timeHorizonYears: number;
  skillEvolution: any;
  researchImpact: any;
  careerOutcomes: any;
  startupProbability: number;
  leadershipGrowth: number;
  technicalDepth: number;
  aiSynthesis: string;
  createdAt: string;
}

export class CognitiveRepository {
  private static memoryCognitiveProfiles: Map<string, CognitiveProfileRecord> = new Map();
  private static memoryLearningDNA: Map<string, LearningDNARecord> = new Map();
  private static memoryBottlenecks: Map<string, CognitiveBottleneckRecord[]> = new Map();
  private static memoryCompounding: Map<string, KnowledgeCompoundingRecord[]> = new Map();
  private static memoryAGIProjects: Map<string, AGIResearchProjectRecord[]> = new Map();
  private static memorySimulations: Map<string, SuperintelligenceSimulationRecord[]> = new Map();

  public static async getCognitiveProfile(userId: string): Promise<CognitiveProfileRecord> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT * FROM cognitive_profiles WHERE user_id = $1 LIMIT 1`,
          [userId]
        );
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id,
            userId: r.user_id,
            workingMemoryScore: parseFloat(r.working_memory_score),
            longTermMemoryScore: parseFloat(r.long_term_memory_score),
            retrievalAbilityScore: parseFloat(r.retrieval_ability_score),
            problemSolvingScore: parseFloat(r.problem_solving_score),
            reasoningScore: parseFloat(r.reasoning_score),
            patternRecognitionScore: parseFloat(r.pattern_recognition_score),
            abstractionScore: parseFloat(r.abstraction_score),
            learningVelocityScore: parseFloat(r.learning_velocity_score),
            focusCapacityScore: parseFloat(r.focus_capacity_score),
            knowledgeTransferScore: parseFloat(r.knowledge_transfer_score),
            adaptabilityScore: parseFloat(r.adaptability_score),
            createdAt: r.created_at,
            updatedAt: r.updated_at
          };
        }
      } catch (e) {
        logger.warn(`[CognitiveRepository] Error fetching profile: ${e}`);
      }
    }

    if (!this.memoryCognitiveProfiles.has(userId)) {
      const defaultProfile: CognitiveProfileRecord = {
        id: `cog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        workingMemoryScore: 89.5,
        longTermMemoryScore: 93.0,
        retrievalAbilityScore: 88.0,
        problemSolvingScore: 95.5,
        reasoningScore: 94.2,
        patternRecognitionScore: 96.0,
        abstractionScore: 92.0,
        learningVelocityScore: 96.8,
        focusCapacityScore: 90.5,
        knowledgeTransferScore: 93.4,
        adaptabilityScore: 91.8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.memoryCognitiveProfiles.set(userId, defaultProfile);
    }
    return this.memoryCognitiveProfiles.get(userId)!;
  }

  public static async getLearningDNA(userId: string): Promise<LearningDNARecord> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT * FROM learning_dna_profiles WHERE user_id = $1 LIMIT 1`,
          [userId]
        );
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id,
            userId: r.user_id,
            archetype: r.archetype,
            preferredLearningMode: r.preferred_learning_mode,
            retentionRatePct: parseFloat(r.retention_rate_pct),
            practiceEffectiveness: parseFloat(r.practice_effectiveness),
            readingEffectiveness: parseFloat(r.reading_effectiveness),
            videoEffectiveness: parseFloat(r.video_effectiveness),
            projectEffectiveness: parseFloat(r.project_effectiveness),
            dominantTraits: typeof r.dominant_traits === 'string' ? JSON.parse(r.dominant_traits) : (r.dominant_traits || []),
            learningSuperpowers: typeof r.learning_superpowers === 'string' ? JSON.parse(r.learning_superpowers) : (r.learning_superpowers || []),
            createdAt: r.created_at,
            updatedAt: r.updated_at
          };
        }
      } catch (e) {
        logger.warn(`[CognitiveRepository] Error fetching learning DNA: ${e}`);
      }
    }

    if (!this.memoryLearningDNA.has(userId)) {
      const defaultDNA: LearningDNARecord = {
        id: `dna_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        archetype: 'Builder',
        preferredLearningMode: 'ProjectDriven & Socratic Synthesis',
        retentionRatePct: 92.4,
        practiceEffectiveness: 95.0,
        readingEffectiveness: 89.0,
        videoEffectiveness: 84.0,
        projectEffectiveness: 97.5,
        dominantTraits: ['Systems Thinking', 'Rapid Experimentation', 'First-Principles Deconstruction'],
        learningSuperpowers: ['Architecture Abstraction', 'Code-Pattern Recognition', 'High Velocity Feedback Loops'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.memoryLearningDNA.set(userId, defaultDNA);
    }
    return this.memoryLearningDNA.get(userId)!;
  }

  public static async getBottlenecks(userId: string): Promise<CognitiveBottleneckRecord[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT * FROM cognitive_bottlenecks WHERE user_id = $1 ORDER BY detected_at DESC`,
          [userId]
        );
        if (res.rows.length > 0) {
          return res.rows.map(r => ({
            id: r.id,
            userId: r.user_id,
            bottleneckType: r.bottleneck_type,
            severity: r.severity,
            title: r.title,
            description: r.description,
            impactArea: r.impact_area,
            recoveryPlan: typeof r.recovery_plan === 'string' ? JSON.parse(r.recovery_plan) : (r.recovery_plan || []),
            status: r.status,
            detectedAt: r.detected_at
          }));
        }
      } catch (e) {
        logger.warn(`[CognitiveRepository] Error fetching bottlenecks: ${e}`);
      }
    }

    if (!this.memoryBottlenecks.has(userId)) {
      const defaultBottlenecks: CognitiveBottleneckRecord[] = [
        {
          id: 'btn_1',
          userId,
          bottleneckType: 'RetrievalIssues',
          severity: 'Moderate',
          title: 'Distributed Consensus Edge Cases',
          description: 'Occasional latency in recall during rapid Raft/Paxos state machine edge case interviews.',
          impactArea: 'System Design & High-Stakes Tech Interviews',
          recoveryPlan: [
            'Implement spaced retrieval drills for log compaction & leader election split-brain recovery.',
            'Build 2 hands-on mini-simulations in Go/TypeScript within 7 days.'
          ],
          status: 'Active',
          detectedAt: new Date().toISOString()
        },
        {
          id: 'btn_2',
          userId,
          bottleneckType: 'AbstractionWeaknesses',
          severity: 'Low',
          title: 'Formal AI Alignment Verification Proofs',
          description: 'Mathematical formalism bottleneck when analyzing mechanized theorem provers for safety bounds.',
          impactArea: 'AGI Research & Frontier Safety Alignment',
          recoveryPlan: [
            'Complete 3 Socratic sessions with the AGI Researcher mentor on Z3 provers.',
            'Review Coq/Lean formal verification whitepapers.'
          ],
          status: 'Active',
          detectedAt: new Date().toISOString()
        }
      ];
      this.memoryBottlenecks.set(userId, defaultBottlenecks);
    }
    return this.memoryBottlenecks.get(userId)!;
  }

  public static async getCompoundingGraph(userId: string): Promise<KnowledgeCompoundingRecord[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT * FROM knowledge_compounding WHERE user_id = $1`,
          [userId]
        );
        if (res.rows.length > 0) {
          return res.rows.map(r => ({
            id: r.id,
            userId: r.user_id,
            sourceDomain: r.source_domain,
            targetImpactArea: r.target_impact_area,
            multiplier: parseFloat(r.multiplier),
            synergyDescription: r.synergy_description,
            updatedAt: r.updated_at
          }));
        }
      } catch (e) {
        logger.warn(`[CognitiveRepository] Error fetching compounding graph: ${e}`);
      }
    }

    if (!this.memoryCompounding.has(userId)) {
      const defaultCompounding: KnowledgeCompoundingRecord[] = [
        {
          id: 'cmp_1',
          userId,
          sourceDomain: 'Distributed Systems Architecture',
          targetImpactArea: 'Research Capability (Multi-Agent Swarms)',
          multiplier: 1.85,
          synergyDescription: 'Deep understanding of consensus protocol invariants directly accelerates multi-agent state synchronization design.',
          updatedAt: new Date().toISOString()
        },
        {
          id: 'cmp_2',
          userId,
          sourceDomain: 'Full-Stack TypeScript & Vite',
          targetImpactArea: 'Startup Capability & Rapid Prototyping',
          multiplier: 1.92,
          synergyDescription: 'Instant full-stack execution capability enables launching market-ready AI prototypes in under 48 hours.',
          updatedAt: new Date().toISOString()
        },
        {
          id: 'cmp_3',
          userId,
          sourceDomain: 'Cognitive Architecture & Memory RAG',
          targetImpactArea: 'Hiring Readiness (Principal/Staff AI Roles)',
          multiplier: 1.76,
          synergyDescription: 'Mastery of long-context retrieval dynamics positions candidate in top 0.1% for tier-1 AI labs.',
          updatedAt: new Date().toISOString()
        }
      ];
      this.memoryCompounding.set(userId, defaultCompounding);
    }
    return this.memoryCompounding.get(userId)!;
  }

  public static async getAGIResearchProjects(userId: string): Promise<AGIResearchProjectRecord[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT * FROM agi_research_projects WHERE user_id = $1 ORDER BY updated_at DESC`,
          [userId]
        );
        if (res.rows.length > 0) {
          return res.rows.map(r => ({
            id: r.id,
            userId: r.user_id,
            title: r.title,
            domain: r.domain,
            objective: r.objective,
            status: r.status,
            researchPlan: typeof r.research_plan === 'string' ? JSON.parse(r.research_plan) : r.research_plan,
            readingSequence: typeof r.reading_sequence === 'string' ? JSON.parse(r.reading_sequence) : r.reading_sequence,
            evaluationFramework: typeof r.evaluation_framework === 'string' ? JSON.parse(r.evaluation_framework) : r.evaluation_framework,
            createdAt: r.created_at,
            updatedAt: r.updated_at
          }));
        }
      } catch (e) {
        logger.warn(`[CognitiveRepository] Error fetching AGI research: ${e}`);
      }
    }

    if (!this.memoryAGIProjects.has(userId)) {
      const defaultProjects: AGIResearchProjectRecord[] = [
        {
          id: 'agi_prj_1',
          userId,
          title: 'Hierarchical Cognitive Memory in Autonomous Swarms',
          domain: 'Reasoning Systems',
          objective: 'Design a sub-linear latency episodic memory index for persistent multi-agent goal alignment.',
          status: 'InResearch',
          researchPlan: [
            'Phase 1: Literature review on dynamic key-value memory compression.',
            'Phase 2: Benchmark vector retrieval vs hierarchical graph indexing.',
            'Phase 3: Formalize memory retention decay function.'
          ],
          readingSequence: [
            'MemGPT: Towards LLMs as Operating Systems',
            'Tree of Thoughts: Deliberate Problem Solving with Large Language Models',
            'Generative Agents: Interactive Simulacra of Human Behavior'
          ],
          evaluationFramework: {
            retrievalPrecision: '98.5%',
            contextWindowEfficiency: '4.2x reduction in token overhead',
            reasoningAccuracy: '94.0%'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      this.memoryAGIProjects.set(userId, defaultProjects);
    }
    return this.memoryAGIProjects.get(userId)!;
  }

  public static async saveAGIResearchProject(project: AGIResearchProjectRecord): Promise<void> {
    const pool = Database.getPool();
    if (pool) {
      try {
        await pool.query(
          `INSERT INTO agi_research_projects (id, user_id, title, domain, objective, status, research_plan, reading_sequence, evaluation_framework, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            domain = EXCLUDED.domain,
            objective = EXCLUDED.objective,
            status = EXCLUDED.status,
            research_plan = EXCLUDED.research_plan,
            reading_sequence = EXCLUDED.reading_sequence,
            evaluation_framework = EXCLUDED.evaluation_framework,
            updated_at = NOW()`,
          [
            project.id,
            project.userId,
            project.title,
            project.domain,
            project.objective,
            project.status,
            JSON.stringify(project.researchPlan),
            JSON.stringify(project.readingSequence),
            JSON.stringify(project.evaluationFramework)
          ]
        );
      } catch (e) {
        logger.warn(`[CognitiveRepository] Error saving AGI project: ${e}`);
      }
    }

    const list = this.memoryAGIProjects.get(project.userId) || [];
    const idx = list.findIndex(p => p.id === project.id);
    if (idx >= 0) list[idx] = project;
    else list.unshift(project);
    this.memoryAGIProjects.set(project.userId, list);
  }

  public static async getSuperintelligenceSimulations(userId: string): Promise<SuperintelligenceSimulationRecord[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT * FROM superintelligence_simulations WHERE user_id = $1 ORDER BY created_at DESC`,
          [userId]
        );
        if (res.rows.length > 0) {
          return res.rows.map(r => ({
            id: r.id,
            userId: r.user_id,
            simulationName: r.simulation_name,
            timeHorizonYears: r.time_horizon_years,
            skillEvolution: typeof r.skill_evolution === 'string' ? JSON.parse(r.skill_evolution) : r.skill_evolution,
            researchImpact: typeof r.research_impact === 'string' ? JSON.parse(r.research_impact) : r.research_impact,
            careerOutcomes: typeof r.career_outcomes === 'string' ? JSON.parse(r.career_outcomes) : r.career_outcomes,
            startupProbability: parseFloat(r.startup_probability),
            leadershipGrowth: parseFloat(r.leadership_growth),
            technicalDepth: parseFloat(r.technical_depth),
            aiSynthesis: r.ai_synthesis,
            createdAt: r.created_at
          }));
        }
      } catch (e) {
        logger.warn(`[CognitiveRepository] Error fetching simulations: ${e}`);
      }
    }

    if (!this.memorySimulations.has(userId)) {
      const defaultSims: SuperintelligenceSimulationRecord[] = [
        {
          id: 'sim_5yr',
          userId,
          simulationName: '5-Year Personal Superintelligence Trajectory',
          timeHorizonYears: 5,
          skillEvolution: [
            { year: 1, focus: 'Principal AI Engineer Mastery', cognitiveIndex: 94.5 },
            { year: 3, focus: 'AGI Research Lab Founder / Lead', cognitiveIndex: 97.2 },
            { year: 5, focus: 'Global Technology Pioneer & Frontier Research Director', cognitiveIndex: 99.4 }
          ],
          researchImpact: {
            hIndexEstimate: 28,
            topPapersPublished: 14,
            keyBreakthroughArea: 'Autonomous Cognitive Reasoning Swarms'
          },
          careerOutcomes: {
            targetRole: 'VP of AI Research / Founder',
            compensationEstimateUsd: '$950,000+',
            industryInfluenceScore: 98.4
          },
          startupProbability: 88.5,
          leadershipGrowth: 96.0,
          technicalDepth: 99.2,
          aiSynthesis: 'High exponential trajectory driven by compound cognitive learning loops and rapid prototype execution velocity.',
          createdAt: new Date().toISOString()
        }
      ];
      this.memorySimulations.set(userId, defaultSims);
    }
    return this.memorySimulations.get(userId)!;
  }

  public static async saveSimulation(sim: SuperintelligenceSimulationRecord): Promise<void> {
    const pool = Database.getPool();
    if (pool) {
      try {
        await pool.query(
          `INSERT INTO superintelligence_simulations (id, user_id, simulation_name, time_horizon_years, skill_evolution, research_impact, career_outcomes, startup_probability, leadership_growth, technical_depth, ai_synthesis, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
          [
            sim.id,
            sim.userId,
            sim.simulationName,
            sim.timeHorizonYears,
            JSON.stringify(sim.skillEvolution),
            JSON.stringify(sim.researchImpact),
            JSON.stringify(sim.careerOutcomes),
            sim.startupProbability,
            sim.leadershipGrowth,
            sim.technicalDepth,
            sim.aiSynthesis
          ]
        );
      } catch (e) {
        logger.warn(`[CognitiveRepository] Error saving simulation: ${e}`);
      }
    }

    const list = this.memorySimulations.get(sim.userId) || [];
    list.unshift(sim);
    this.memorySimulations.set(sim.userId, list);
  }
}
