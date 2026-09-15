import { 
  SimulationRepository, 
  SimulationCompanyEntity 
} from "../../repositories/simulationRepository";
import { RedisManager } from "../../redis/redisClient";
import { logger } from "../../utils/logger";
import { v4 as uuidv4 } from "uuid";

export const ENTERPRISE_COMPANIES: SimulationCompanyEntity[] = [
  {
    id: "comp-google",
    companyName: "Google",
    slug: "google",
    tier: "Tier_1_Big_Tech",
    domain: "Distributed_Systems_Cloud_AI",
    engineeringCulture: "Strong emphasis on algorithmic optimality, massive scale (billions of QPS), peer-driven design docs, protobuf RPCs, monorepo tooling (Bazel), and rigorous blameless post-mortems.",
    teamStructure: [
      { role: "Staff Software Engineer / Tech Lead", name: "David K. (AI TL)", level: "L6" },
      { role: "Senior Software Engineer", name: "Priya M. (Core Infra)", level: "L5" },
      { role: "Software Engineer II (You)", name: "Participant", level: "L4" },
      { role: "Software Engineer I", name: "Alex R. (Search Edge)", level: "L3" },
      { role: "Engineering Manager", name: "Sarah Jenkins", level: "M1" },
      { role: "Product Manager", name: "Liam Vance", level: "L5 PM" }
    ],
    levels: [
      { level: "L3", title: "Software Engineer I", expRequired: "0-2 years", compRange: "$190k - $220k", expectations: "Executes well-defined tasks, writes clean unit-tested code." },
      { level: "L4", title: "Software Engineer II", expRequired: "2-5 years", compRange: "$260k - $320k", expectations: "Owns medium-to-large features, leads design docs, handles on-call pager." },
      { level: "L5", title: "Senior Software Engineer", expRequired: "5-8 years", compRange: "$370k - $460k", expectations: "Architects multi-service systems, mentors team, unblocks cross-team dependencies." },
      { level: "L6", title: "Staff Software Engineer", expRequired: "8+ years", compRange: "$520k - $680k", expectations: "Sets multi-quarter technical direction, defines domain architecture standards." }
    ],
    techStack: ["C++20", "Go", "Python", "Spanner", "Bigtable", "Protobuf/gRPC", "Borg/Kubernetes", "Colossus"],
    interviewBar: {
      codingDifficulty: "Hard",
      systemDesignExpectation: "Massive scale (10M+ RPS, multi-region active-active)",
      behavioralDimensions: ["Googliness", "Navigating Ambiguity", "Analytical Rigor"]
    },
    metadata: {
      sprintCadence: "Bi-Weekly",
      codeReviewSLA: "Within 4 business hours",
      onCallRotation: "1 week primary, 1 week secondary every 6 weeks"
    }
  },
  {
    id: "comp-amazon",
    companyName: "Amazon",
    slug: "amazon",
    tier: "Tier_1_Big_Tech",
    domain: "Cloud_ECommerce_HighThroughput",
    engineeringCulture: "High ownership, Two-Pizza teams, 6-page narrative docs (PR/FAQs), strict operational excellence (OE), Leadership Principles (Customer Obsession, Ownership, Bias for Action), strict metrics telemetry.",
    teamStructure: [
      { role: "Principal SDE", name: "Vikram N.", level: "L7" },
      { role: "Senior SDE (Tech Lead)", name: "Elena Rostova", level: "L6" },
      { role: "SDE II (You)", name: "Participant", level: "L5" },
      { role: "SDE I", name: "Jordan Lee", level: "L4" },
      { role: "Software Development Manager (SDM)", name: "Marcus Vance", level: "L6 SDM" },
      { role: "Technical Product Manager (TPM)", name: "Chloe Dupont", level: "L6 TPM" }
    ],
    levels: [
      { level: "L4", title: "SDE I", expRequired: "0-2 years", compRange: "$175k - $210k", expectations: "Delivers operational tasks, improves automated test coverage." },
      { level: "L5", title: "SDE II", expRequired: "2-5 years", compRange: "$240k - $310k", expectations: "Owns tier-1 microservices, writes PR/FAQs, drives deployment safety." },
      { level: "L6", title: "Senior SDE", expRequired: "5-8 years", compRange: "$350k - $450k", expectations: "Defines architecture for entire product line, conducts bar-raiser interviews." }
    ],
    techStack: ["Java 21", "Kotlin", "AWS DynamoDB", "AWS Lambda", "S3", "Step Functions", "CloudWatch", "CDK"],
    interviewBar: {
      codingDifficulty: "Medium-Hard",
      systemDesignExpectation: "High durability, single-digit millisecond latency SLAs",
      behavioralDimensions: ["16 Leadership Principles", "Customer Obsession", "Deliver Results"]
    },
    metadata: {
      sprintCadence: "Bi-Weekly",
      codeReviewSLA: "Within 6 business hours",
      onCallRotation: "24/7 on-call shift with automated paging"
    }
  },
  {
    id: "comp-meta",
    companyName: "Meta",
    slug: "meta",
    tier: "Tier_1_Big_Tech",
    domain: "Social_RealTime_Media_AI",
    engineeringCulture: "Move Fast, High individual initiative, bottom-up project selection, continuous deployment (pushing to prod multiple times daily), large codebase hackability, metrics-driven PSC review cycles.",
    teamStructure: [
      { role: "Staff Engineer / E6", name: "Andre Silva", level: "E6" },
      { role: "Senior Engineer / E5", name: "Jessica Wu", level: "E5" },
      { role: "Software Engineer / E4 (You)", name: "Participant", level: "E4" },
      { role: "Software Engineer / E3", name: "Sam Chen", level: "E3" },
      { role: "Engineering Manager", name: "Carlos Ramos", level: "M1" },
      { role: "Product Manager", name: "Ananya Iyer", level: "E5 PM" }
    ],
    levels: [
      { level: "E3", title: "Software Engineer", expRequired: "0-2 years", compRange: "$190k - $230k", expectations: "Builds product features, moves fast with quality safeguards." },
      { level: "E4", title: "Software Engineer II", expRequired: "2-5 years", compRange: "$270k - $340k", expectations: "Drives product impact, improves core user metrics, unblocks peers." },
      { level: "E5", title: "Senior Software Engineer", expRequired: "5-8 years", compRange: "$390k - $520k", expectations: "Autonomous direction, major multi-team technical impact." }
    ],
    techStack: ["Hack/PHP", "Rust", "Python", "React Native", "GraphQL", "TAO (Graph DB)", "Cassandra", "PyTorch"],
    interviewBar: {
      codingDifficulty: "Hard (Strict Speed & Accuracy)",
      systemDesignExpectation: "Live streaming, social graph feeds, real-time messaging",
      behavioralDimensions: ["Move Fast", "Focus on Long-Term Impact", "Be Open"]
    },
    metadata: {
      sprintCadence: "Weekly / Continuous",
      codeReviewSLA: "Within 2 business hours",
      onCallRotation: "Shared team rotations with live dashboard monitors"
    }
  },
  {
    id: "comp-netflix",
    companyName: "Netflix",
    slug: "netflix",
    tier: "Tier_1_Streaming_Scale",
    domain: "Edge_Streaming_Chaos_Engineering",
    engineeringCulture: "Freedom and Responsibility, High Talent Density, Context Not Control, highly autonomous senior engineers, Chaos Monkey testing directly in production.",
    teamStructure: [
      { role: "Lead Architect", name: "Mark B.", level: "L6" },
      { role: "Senior Software Engineer (You)", name: "Participant", level: "L5" },
      { role: "Senior Data Infrastructure Engineer", name: "Olga S.", level: "L5" },
      { role: "Director of Engineering", name: "Robert Hayes", level: "D1" }
    ],
    levels: [
      { level: "L5", title: "Senior Software Engineer", expRequired: "4+ years", compRange: "$400k - $520k (All Cash)", expectations: "Full end-to-end autonomy, high judgment, zero micro-management." },
      { level: "L6", title: "Staff / Principal Engineer", expRequired: "8+ years", compRange: "$600k - $800k", expectations: "Global streaming architecture and resilience." }
    ],
    techStack: ["Java/Spring Boot", "Node.js", "Cassandra", "Kafka", "AWS Global Mesh", "Titus Container Engine", "Envoy"],
    interviewBar: {
      codingDifficulty: "Hard",
      systemDesignExpectation: "Chaos resilient, 99.999% availability streaming pipelines",
      behavioralDimensions: ["Culture Memo Alignment", "High Judgment", "Stunning Colleagues"]
    },
    metadata: {
      sprintCadence: "Kanban / Continuous",
      codeReviewSLA: "Same day",
      onCallRotation: "You build it, you run it"
    }
  },
  {
    id: "comp-stripe",
    companyName: "Stripe",
    slug: "stripe",
    tier: "Tier_1_Fintech_Infrastructure",
    domain: "Payments_HighReliability_API",
    engineeringCulture: "Extreme craftsmanship, world-class API design consistency, written-first culture, idempotent distributed transactions, zero tolerance for money-movement failure.",
    teamStructure: [
      { role: "Staff Engineer (Tech Lead)", name: "Felix M.", level: "L4 Staff" },
      { role: "Senior Infrastructure Engineer", name: "Tanya K.", level: "L3 Senior" },
      { role: "Software Engineer (You)", name: "Participant", level: "L2 SDE" },
      { role: "Engineering Manager", name: "Daniel Craig", level: "EM" }
    ],
    levels: [
      { level: "L1", title: "Software Engineer I", expRequired: "0-2 years", compRange: "$180k - $220k", expectations: "Clean API code, comprehensive integration testing." },
      { level: "L2", title: "Software Engineer II", expRequired: "2-5 years", compRange: "$260k - $330k", expectations: "Owns payment flow primitives, handles critical financial integrations." },
      { level: "L3", title: "Senior Software Engineer", expRequired: "5-8 years", compRange: "$380k - $480k", expectations: "High-reliability distributed transaction engine design." }
    ],
    techStack: ["Ruby (Sorbet typed)", "Go", "Java", "PostgreSQL", "Kafka", "Redis", "Terraform", "AWS"],
    interviewBar: {
      codingDifficulty: "Hard (Practical Bug Fixing & Code Integration)",
      systemDesignExpectation: "Strict idempotency, consensus, double-entry ledgers",
      behavioralDimensions: ["User Empathy", "Written Rigor", "Macro Impact"]
    },
    metadata: {
      sprintCadence: "Bi-Weekly",
      codeReviewSLA: "Within 4 business hours",
      onCallRotation: "Tier-1 24/7 financial reliability escalation"
    }
  },
  {
    id: "comp-openai",
    companyName: "OpenAI",
    slug: "openai",
    tier: "Tier_1_Frontier_AI",
    domain: "LLM_Inference_Cluster_Training",
    engineeringCulture: "Frontier research velocity, massive multi-node GPU cluster orchestrations, high agency, low bureaucracy, mission-aligned AI safety & deployment.",
    teamStructure: [
      { role: "Member of Technical Staff / Lead", name: "Dr. Ilya K.", level: "MTS Lead" },
      { role: "Research Engineer / Systems", name: "Sophia Lin", level: "MTS Systems" },
      { role: "Software Engineer / Platform (You)", name: "Participant", level: "MTS" },
      { role: "Head of Infrastructure", name: "Greg B.", level: "VP" }
    ],
    levels: [
      { level: "MTS-1", title: "Member of Technical Staff (Early)", expRequired: "1-3 years", compRange: "$250k - $380k", expectations: "Inference optimization, dataset pipelines, training harness." },
      { level: "MTS-2", title: "Member of Technical Staff (Core)", expRequired: "3-7 years", compRange: "$450k - $750k", expectations: "Multi-datacenter GPU cluster scheduling, kernel optimizations (Triton/CUDA)." },
      { level: "MTS-3", title: "Staff Member of Technical Staff", expRequired: "7+ years", compRange: "$900k - $1.4M", expectations: "Next-gen foundation model architecture and infra." }
    ],
    techStack: ["Python", "Rust", "CUDA", "C++", "PyTorch", "Triton", "Ray", "Slurm", "Kubernetes", "Azure HPC"],
    interviewBar: {
      codingDifficulty: "Elite Algorithmic & Systems",
      systemDesignExpectation: "Distributed GPU training pipelines, low-latency KV-caching inference",
      behavioralDimensions: ["Frontier Agency", "Mission Alignment", "High Velocity"]
    },
    metadata: {
      sprintCadence: "Weekly Sprints",
      codeReviewSLA: "Within 2 business hours",
      onCallRotation: "Production cluster on-call rotation"
    }
  }
];

export class EnterpriseSimulationService {
  private static CACHE_TTL = 3600;

  public static async initializeCompanies(): Promise<void> {
    for (const comp of ENTERPRISE_COMPANIES) {
      await SimulationRepository.upsertCompany(comp);
    }
  }

  public static async getCompanies(): Promise<SimulationCompanyEntity[]> {
    const cached = await RedisManager.get("simulation:companies:all");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }

    let companies = await SimulationRepository.getCompanies();
    if (companies.length === 0) {
      await this.initializeCompanies();
      companies = ENTERPRISE_COMPANIES;
    }

    await RedisManager.set("simulation:companies:all", JSON.stringify(companies), this.CACHE_TTL);
    return companies;
  }

  public static async getCompany(slug: string): Promise<SimulationCompanyEntity | null> {
    const companies = await this.getCompanies();
    return companies.find(c => c.slug === slug || c.id === slug) || null;
  }
}
