import { Database } from "../db/connection";
import { logger } from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

export interface DegreeProgramRecord {
  id: string;
  title: string;
  degreeType: string;
  domain: string;
  totalCredits: number;
  totalSemesters: number;
  description: string;
  careerOutcomes: string[];
  capstoneRequirement: {
    title: string;
    description: string;
    deliverables: string[];
  };
  graduationRequirements: {
    minCredits: number;
    minGpa: number;
    requiredCapstones: number;
    requiredVerifiedBadges: number;
  };
  courses?: DegreeCourseRecord[];
}

export interface DegreeCourseRecord {
  id: string;
  degreeId: string;
  courseCode: string;
  courseName: string;
  semester: number;
  credits: number;
  description: string;
  syllabus: string[];
  learningOutcomes: string[];
  isCapstone: boolean;
  prerequisites?: string[];
}

export interface StudentDegreeRecord {
  id: string;
  userId: string;
  degreeId: string;
  status: 'Enrolled' | 'InPacing' | 'Graduated' | 'HonorsGraduated';
  currentSemester: number;
  creditsCompleted: number;
  gpa: number;
  completedCourseIds: string[];
  capstoneStatus: string;
  graduationReadinessPct: number;
  enrolledAt: string;
  updatedAt: string;
}

export interface CapabilityRecord {
  id: string;
  domain: 'Technical' | 'Professional' | 'Research' | 'Entrepreneurship';
  name: string;
  category: string;
  level: 'Foundational' | 'Intermediate' | 'Advanced' | 'Mastery' | 'Frontier';
  description: string;
  masteryScore: number;
  dependencies?: string[];
  unlockedBy?: string[];
}

export interface CapabilityRelationshipRecord {
  id: string;
  sourceCapabilityId: string;
  targetCapabilityId: string;
  relationshipType: 'Prerequisite' | 'Synergy' | 'Unlocks' | 'SpecializationOf';
  weight: number;
}

export interface MentorProfileRecord {
  id: string;
  name: string;
  role: string;
  specialty: string;
  archetype: 'SoftwareEngineering' | 'AI' | 'Career' | 'Research' | 'Startup' | 'Leadership';
  bio: string;
  corePrinciples: string[];
  debatePersonality: string;
  avatarColor: string;
}

export interface MentorSessionRecord {
  id: string;
  userId: string;
  topic: string;
  sessionType: 'Debate' | 'ConsensusRecommendation' | 'PersonalizedIntervention' | 'Coaching';
  participatingMentorIds: string[];
  transcript: Array<{
    mentorName: string;
    mentorArchetype: string;
    statement: string;
    stance: string;
    confidence: number;
  }>;
  consensusDecision: string;
  actionItems: string[];
  createdAt: string;
}

export interface LearningMarketplaceRecord {
  id: string;
  title: string;
  offeringType: 'Course' | 'Certification' | 'Bootcamp' | 'Fellowship' | 'Workshop' | 'ResearchProgram';
  provider: string;
  durationWeeks: number;
  roiScore: number;
  completionProbability: number;
  hiringImpactPct: number;
  skillGainEstimate: string;
  costUsd: number;
  rating: number;
  skillsCovered: string[];
}

export interface CredentialRecord {
  id: string;
  userId: string;
  title: string;
  credentialType: 'Learning' | 'Contest' | 'Project' | 'Research' | 'Leadership' | 'EnterpriseSimulation';
  issuer: string;
  verificationHash: string;
  skillsValidated: string[];
  stackableParentId?: string;
  proofUrl: string;
  issuedAt: string;
}

export interface PotentialProfileRecord {
  id: string;
  userId: string;
  careerPotential: number;
  leadershipPotential: number;
  researchPotential: number;
  founderPotential: number;
  learningVelocity: number;
  longTermGrowthScore: number;
  growthDrivers: string[];
  strategicAccelerators: string[];
  updatedAt: string;
}

export interface PotentialForecastRecord {
  id: string;
  userId: string;
  timeHorizonYears: number;
  projectedCareerTier: string;
  projectedCompensationUsd: number;
  projectedImpactScore: number;
  keyMilestones: string[];
  riskFactors: string[];
}

export interface ImpactProfileRecord {
  id: string;
  userId: string;
  overallImpactScore: number;
  openSourceImpact: number;
  researchImpact: number;
  educationImpact: number;
  mentorshipImpact: number;
  communityImpact: number;
  entrepreneurshipImpact: number;
  totalPeopleImpacted: number;
  updatedAt: string;
}

export interface ImpactEventRecord {
  id: string;
  userId: string;
  impactArea: 'Open Source' | 'Research' | 'Education' | 'Mentorship' | 'Community Building' | 'Entrepreneurship';
  title: string;
  metrics: string;
  reachCount: number;
  verificationSource: string;
  eventDate: string;
}

export class UniversityRepository {
  private static degrees: DegreeProgramRecord[] = [];
  private static courses: DegreeCourseRecord[] = [];
  private static studentDegrees: StudentDegreeRecord[] = [];
  private static capabilities: CapabilityRecord[] = [];
  private static capabilityRelations: CapabilityRelationshipRecord[] = [];
  private static mentors: MentorProfileRecord[] = [];
  private static mentorSessions: MentorSessionRecord[] = [];
  private static marketplace: LearningMarketplaceRecord[] = [];
  private static credentials: CredentialRecord[] = [];
  private static potentialProfiles: Map<string, PotentialProfileRecord> = new Map();
  private static potentialForecasts: PotentialForecastRecord[] = [];
  private static impactProfiles: Map<string, ImpactProfileRecord> = new Map();
  private static impactEvents: ImpactEventRecord[] = [];

  private static initialized = false;

  public static async initSeedData() {
    if (this.initialized) return;

    logger.info("[UniversityRepository] Initializing V5.0 AI University & Capability Graph Platform...");

    // 1. Seed 8 AI Degree Programs
    this.degrees = [
      {
        id: 'deg_swe',
        title: 'Bachelor of Software Engineering & Distributed Architecture',
        degreeType: 'Bachelor of Engineering',
        domain: 'Software Engineering',
        totalCredits: 128,
        totalSemesters: 8,
        description: 'Rigorous 8-semester curriculum covering high-concurrency systems, low-level OS primitives, algorithms, distributed databases, and cloud platforms.',
        careerOutcomes: ['Staff Distributed Systems Engineer', 'Cloud Architect', 'Principal Backend Engineer'],
        capstoneRequirement: {
          title: 'Distributed Transaction Engine & Raft Consensus Kernel',
          description: 'Design and deploy an ACID-compliant distributed log store supporting 50,000 writes/sec with automated failover replication.',
          deliverables: ['Consensus Engine Source Code', 'Chaos Engineering Test Suite', 'Benchmarking Paper']
        },
        graduationRequirements: { minCredits: 128, minGpa: 3.5, requiredCapstones: 1, requiredVerifiedBadges: 4 }
      },
      {
        id: 'deg_ai_eng',
        title: 'Master of AI Engineering & Autonomous Systems',
        degreeType: 'Master of Science',
        domain: 'AI Engineering',
        totalCredits: 132,
        totalSemesters: 8,
        description: 'Comprehensive curriculum mastering Transformer architectures, speculative decoding, multi-agent frameworks, RAG topologies, and model quantization.',
        careerOutcomes: ['Frontier AI Engineer', 'Autonomous Agent Architect', 'LLM Systems Lead'],
        capstoneRequirement: {
          title: 'Multi-Agent Autonomous Orchestration Operating System',
          description: 'Deploy an agent swarm with shared memory fabric, self-healing reflection loops, and sub-100ms speculative response synthesis.',
          deliverables: ['Multi-Agent Engine', 'Evaluation Matrix & Benchmarks', 'Production Deployment']
        },
        graduationRequirements: { minCredits: 132, minGpa: 3.7, requiredCapstones: 1, requiredVerifiedBadges: 5 }
      },
      {
        id: 'deg_ml_eng',
        title: 'Master of Machine Learning Engineering & Deep Systems',
        degreeType: 'Master of Science',
        domain: 'ML Engineering',
        totalCredits: 130,
        totalSemesters: 8,
        description: 'Focuses on large-scale distributed training, CUDA kernel optimization, PyTorch internals, data pipelines, and real-time model inference at scale.',
        careerOutcomes: ['Senior ML Infrastructure Engineer', 'Inference Optimization Engineer', 'Model Training Lead'],
        capstoneRequirement: {
          title: 'Distributed 70B Parameter Fine-Tuning Pipeline with FlashAttention-3',
          description: 'Build an end-to-end pipeline leveraging FSDP and Megatron-LM with custom CUDA kernels.',
          deliverables: ['Training Pipeline Repository', 'Weights & Loss Curves', 'Quantization Engine']
        },
        graduationRequirements: { minCredits: 130, minGpa: 3.6, requiredCapstones: 1, requiredVerifiedBadges: 4 }
      },
      {
        id: 'deg_data_eng',
        title: 'Master of Data Engineering & Real-Time Stream Processing',
        degreeType: 'Master of Science',
        domain: 'Data Engineering',
        totalCredits: 124,
        totalSemesters: 8,
        description: 'Covers petabyte-scale data lakes, Apache Flink/Kafka event streaming, ClickHouse analytics, Delta Lake, and data quality governance.',
        careerOutcomes: ['Principal Data Architect', 'Real-Time Streaming Engineer', 'Data Platform Director'],
        capstoneRequirement: {
          title: 'Sub-Second Stream Processing Engine for 10M Events/Sec',
          description: 'Construct a stateful distributed stream processor with exactly-once semantic guarantees.',
          deliverables: ['Streaming Cluster Code', 'Fault-Tolerance Proofs', 'Grafana Telemetry Dashboard']
        },
        graduationRequirements: { minCredits: 124, minGpa: 3.5, requiredCapstones: 1, requiredVerifiedBadges: 3 }
      },
      {
        id: 'deg_cloud_eng',
        title: 'Master of Cloud Native Engineering & Kubernetes Systems',
        degreeType: 'Master of Science',
        domain: 'Cloud Engineering',
        totalCredits: 120,
        totalSemesters: 8,
        description: 'Advanced mastery of Kubernetes CRDs, eBPF network observability, multi-region service meshes, Terraform IaC, and zero-trust security.',
        careerOutcomes: ['Cloud Infrastructure Architect', 'Site Reliability Director', 'Platform Lead'],
        capstoneRequirement: {
          title: 'Multi-Region High Availability Zero-Downtime Infrastructure Mesh',
          description: 'Deploy global multi-cluster mesh with automated disaster recovery under 30s RTO and 0s RPO.',
          deliverables: ['Terraform + Helm Infrastructure Manifests', 'Chaos Simulation Log', 'SLO Dashboard']
        },
        graduationRequirements: { minCredits: 120, minGpa: 3.5, requiredCapstones: 1, requiredVerifiedBadges: 4 }
      },
      {
        id: 'deg_cybersec',
        title: 'Master of Cybersecurity & Adversarial Threat Engineering',
        degreeType: 'Master of Science',
        domain: 'Cybersecurity',
        totalCredits: 126,
        totalSemesters: 8,
        description: 'Covers binary exploitation, zero-knowledge proofs, cryptographic protocols, cloud security posture management, and AI red-teaming.',
        careerOutcomes: ['Chief Information Security Officer', 'Senior Red Team Engineer', 'Cryptographic Researcher'],
        capstoneRequirement: {
          title: 'Adversarial Prompt Injection & Weight Extraction Defense Layer',
          description: 'Develop a real-time hardware-enforced guardrail against jailbreaks, extraction attacks, and side-channel leakage.',
          deliverables: ['Security Engine Source Code', 'Exploit Defense Matrix', 'Audit Certification']
        },
        graduationRequirements: { minCredits: 126, minGpa: 3.7, requiredCapstones: 1, requiredVerifiedBadges: 4 }
      },
      {
        id: 'deg_research_sci',
        title: 'Ph.D. in Computer Science & Foundation Model Research',
        degreeType: 'Doctor of Philosophy',
        domain: 'Research Scientist',
        totalCredits: 140,
        totalSemesters: 8,
        description: 'Elite research trajectory covering theoretical computer science, mathematical optimization, novel transformer architectures, and NeurIPS/ICML publications.',
        careerOutcomes: ['Frontier AI Research Scientist', 'AI Lab Director', 'Professor of Computer Science'],
        capstoneRequirement: {
          title: 'Novel Recurrent Attention Mechanism with Sub-Quadratic Complexity',
          description: 'Author and submit a peer-reviewed research paper proving O(N log N) scaling with experimental validation on standard reasoning benchmarks.',
          deliverables: ['Camera-Ready LaTeX Manuscript', 'Open-Source PyTorch Benchmark', 'Peer Review Audit']
        },
        graduationRequirements: { minCredits: 140, minGpa: 3.85, requiredCapstones: 1, requiredVerifiedBadges: 6 }
      },
      {
        id: 'deg_founder',
        title: 'Master of Venture Entrepreneurship & Technical Co-Founding',
        degreeType: 'Master of Entrepreneurship',
        domain: 'Startup Founder',
        totalCredits: 120,
        totalSemesters: 8,
        description: 'Integrates rapid zero-to-one product engineering, customer discovery, venture capital fundraising, unit economics modeling, and viral GTM loops.',
        careerOutcomes: ['Venture-Backed Founder & CEO', 'Founding Chief Technology Officer', 'General Partner'],
        capstoneRequirement: {
          title: 'Venture-Backed AI Product Launch with $10k+ MRR or Seed Commitment',
          description: 'Ship a production SaaS/Agentic application with paying customers, institutional investor term sheet, and high organic retention.',
          deliverables: ['Live Production Application', 'Investor Pitch Deck & Data Room', 'Verified Revenue Dashboard']
        },
        graduationRequirements: { minCredits: 120, minGpa: 3.6, requiredCapstones: 1, requiredVerifiedBadges: 5 }
      }
    ];

    // 2. Seed Degree Courses for SWE & AI Eng
    this.courses = [
      {
        id: 'crs_swe_101', degreeId: 'deg_swe', courseCode: 'CS101', courseName: 'Advanced Data Structures & Algorithms',
        semester: 1, credits: 4, description: 'Asymptotic complexity, amortized analysis, self-balancing trees, graph algorithms, and DP.',
        syllabus: ['Graph traversals & cycle detection', 'Shortest paths & flow networks', 'Segment trees & Fenwick trees'],
        learningOutcomes: ['Solve LeetCode Hard problems in under 20 mins', 'Analyze cache locality of memory layouts'], isCapstone: false
      },
      {
        id: 'crs_swe_201', degreeId: 'deg_swe', courseCode: 'CS201', courseName: 'Operating Systems & Concurrency Internals',
        semester: 2, credits: 4, description: 'Kernel architecture, virtual memory, threads, locks, lock-free queues, epoll, and I/O multiplexing.',
        syllabus: ['Memory paging & TLB misses', 'Atomic operations & CAS', 'Zero-copy networking with io_uring'],
        learningOutcomes: ['Implement lock-free rings', 'Diagnose thread contention'], isCapstone: false
      },
      {
        id: 'crs_swe_301', degreeId: 'deg_swe', courseCode: 'CS301', courseName: 'Distributed Systems & Consensus Protocols',
        semester: 3, credits: 4, description: 'CAP theorem, vector clocks, Paxos, Raft, Byzantine fault tolerance, and gossip protocols.',
        syllabus: ['Leader election in Raft', 'Distributed snapshots', 'CRDTs for conflict-free replication'],
        learningOutcomes: ['Design fault-tolerant clusters', 'Implement Raft protocol'], isCapstone: false
      },
      {
        id: 'crs_swe_401', degreeId: 'deg_swe', courseCode: 'CS401', courseName: 'High-Throughput Storage & LSM Tree Engines',
        semester: 4, credits: 4, description: 'B-Trees vs LSM Trees, write-ahead logs, compaction algorithms, bloom filters, and memory-mapped files.',
        syllabus: ['SSTable compaction strategies', 'Write-ahead logging guarantees', 'Page cache bypass with Direct I/O'],
        learningOutcomes: ['Build a Key-Value storage engine', 'Tune storage latency'], isCapstone: false
      },
      {
        id: 'crs_swe_501', degreeId: 'deg_swe', courseCode: 'CS501', courseName: 'Cloud Native Microservices & gRPC Meshes',
        semester: 5, credits: 4, description: 'Protocol Buffers, Envoy proxy, service discovery, distributed tracing with OpenTelemetry, and rate limiting.',
        syllabus: ['gRPC streaming architectures', 'Circuit breaking & backoff', 'Distributed trace context propagation'],
        learningOutcomes: ['Deploy enterprise service meshes', 'Achieve 99.999% availability'], isCapstone: false
      },
      {
        id: 'crs_swe_601', degreeId: 'deg_swe', courseCode: 'CS601', courseName: 'Large-Scale System Design & Capacity Planning',
        semester: 6, credits: 4, description: 'Designing YouTube, Uber, Twitter, and multi-region payment systems with strict SLAs.',
        syllabus: ['Global geo-sharding', 'CDC with Kafka and Debezium', 'Multi-level caching with Redis & CDNs'],
        learningOutcomes: ['Ace FAANG Principal System Design interviews', 'Model petabyte-scale workloads'], isCapstone: false
      },
      {
        id: 'crs_swe_701', degreeId: 'deg_swe', courseCode: 'CS701', courseName: 'Site Reliability Engineering & Chaos Injection',
        semester: 7, credits: 4, description: 'Error budgets, SLIs/SLOs, automated remediation, Simian Army chaos experiments, and blameless postmortems.',
        syllabus: ['Chaos engineering design', 'Automated canary rollouts', 'Kernel panics & eBPF profiling'],
        learningOutcomes: ['Design self-healing systems', 'Manage tier-1 incident war rooms'], isCapstone: false
      },
      {
        id: 'crs_swe_801', degreeId: 'deg_swe', courseCode: 'CS801', courseName: 'Senior Capstone: Production Distributed Engine',
        semester: 8, credits: 8, description: 'Design, test, benchmark, and deploy a production-grade distributed consensus engine.',
        syllabus: ['Design review defense', 'Chaos testing & validation', 'Final architectural symposium presentation'],
        learningOutcomes: ['Ship verifiable distributed software', 'Attain Algora Graduation Honors'], isCapstone: true
      },

      // AI Engineering Courses
      {
        id: 'crs_ai_101', degreeId: 'deg_ai_eng', courseCode: 'AI101', courseName: 'Foundations of Deep Learning & Transformer Architecture',
        semester: 1, credits: 4, description: 'Self-attention mathematics, positional embeddings, RoPE, MLP layers, and backpropagation.',
        syllabus: ['Multi-Head Attention from scratch', 'LayerNorm vs RMSNorm', 'KV Cache memory mechanics'],
        learningOutcomes: ['Implement GPT-2 architecture in pure PyTorch', 'Derive attention gradients'], isCapstone: false
      },
      {
        id: 'crs_ai_201', degreeId: 'deg_ai_eng', courseCode: 'AI201', courseName: 'LLM Fine-Tuning, LoRA & Parameter-Efficient Adaptation',
        semester: 2, credits: 4, description: 'QLoRA, PEFT, alignment algorithms (DPO, PPO, GRPO), and instruction tuning dataset curation.',
        syllabus: ['Rank adaptation mathematics', 'Direct Preference Optimization loss', 'Dataset tokenization pipelines'],
        learningOutcomes: ['Fine-tune 8B models to beat standard benchmarks', 'Eliminate hallucination in domain domains'], isCapstone: false
      },
      {
        id: 'crs_ai_301', degreeId: 'deg_ai_eng', courseCode: 'AI301', courseName: 'Autonomous Agent Architecture & Multi-Agent Swarms',
        semester: 3, credits: 4, description: 'ReAct pattern, LangGraph, plan-and-solve paradigms, tool calling, and inter-agent communication protocols.',
        syllabus: ['Cyclic graph state machines', 'Hierarchical agent delegation', 'Self-reflection and critic loops'],
        learningOutcomes: ['Construct self-correcting agent workflows', 'Automate complex software development workflows'], isCapstone: false
      },
      {
        id: 'crs_ai_401', degreeId: 'deg_ai_eng', courseCode: 'AI401', courseName: 'Agentic Memory Fabrics & Advanced Vector RAG',
        semester: 4, credits: 4, description: 'Hybrid search (BM25 + Dense Vectors), graph-based RAG, hierarchical memory consolidation, and reranking.',
        syllabus: ['Knowledge graphs for LLMs', 'Context compression & needle-in-haystack optimization', 'Vector index quantization (HNSW, IVF-PQ)'],
        learningOutcomes: ['Build enterprise retrieval engines with 99% precision', 'Design long-term memory systems'], isCapstone: false
      },
      {
        id: 'crs_ai_501', degreeId: 'deg_ai_eng', courseCode: 'AI501', courseName: 'Inference Optimization, vLLM & Speculative Decoding',
        semester: 5, credits: 4, description: 'Continuous batching, PagedAttention, TensorRT-LLM, Medusa speculative decoding, and FP8/AWQ quantization.',
        syllabus: ['PagedAttention memory kernel analysis', 'Draft model speculative verification', 'GPU memory bandwidth saturation'],
        learningOutcomes: ['Achieve 5x inference throughput boost', 'Deploy low-latency voice AI backends'], isCapstone: false
      },
      {
        id: 'crs_ai_601', degreeId: 'deg_ai_eng', courseCode: 'AI601', courseName: 'Multi-Modal Intelligence: Vision, Audio & Live Video',
        semester: 6, credits: 4, description: 'Vision Transformer (ViT) patch projections, Whisper audio encoders, real-time Live API audio streaming, and sensory fusion.',
        syllabus: ['Cross-attention visual projection', 'Streaming WebRTC audio processing', 'Multi-modal token interleaving'],
        learningOutcomes: ['Build real-time multimodal assistants', 'Process 60fps video streams with LLMs'], isCapstone: false
      },
      {
        id: 'crs_ai_701', degreeId: 'deg_ai_eng', courseCode: 'AI701', courseName: 'AI Safety, Guardrails & Adversarial Robustness',
        semester: 7, credits: 4, description: 'NeMo Guardrails, semantic filtering, red-teaming, prompt injection prevention, and differential privacy.',
        syllabus: ['Latent space representation steering', 'Jailbreak automated testing suites', 'Model provenance & watermarking'],
        learningOutcomes: ['Certify enterprise AI systems for production safety', 'Prevent data extraction vulnerabilities'], isCapstone: false
      },
      {
        id: 'crs_ai_801', degreeId: 'deg_ai_eng', courseCode: 'AI801', courseName: 'Senior Capstone: Autonomous Human Capability OS',
        semester: 8, credits: 8, description: 'Build an autonomous multi-agent operating system capable of end-to-end task execution and proactive human mentorship.',
        syllabus: ['Architecture defense before AI Council', 'Production benchmark evaluation', 'Open-source release & demo'],
        learningOutcomes: ['Deploy industry-defining agentic platforms', 'Achieve Master of AI Engineering certification'], isCapstone: true
      }
    ];

    // 3. Seed Default Student Degree Enrollment (e.g. for usr_demo)
    this.studentDegrees = [
      {
        id: 'sdeg_demo_1',
        userId: 'usr_demo',
        degreeId: 'deg_swe',
        status: 'Enrolled',
        currentSemester: 6,
        creditsCompleted: 96,
        gpa: 3.92,
        completedCourseIds: ['crs_swe_101', 'crs_swe_201', 'crs_swe_301', 'crs_swe_401', 'crs_swe_501', 'crs_swe_601'],
        capstoneStatus: 'InDesignReview',
        graduationReadinessPct: 82.5,
        enrolledAt: '2024-09-01T00:00:00Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'sdeg_demo_2',
        userId: 'usr_demo',
        degreeId: 'deg_ai_eng',
        status: 'Enrolled',
        currentSemester: 5,
        creditsCompleted: 80,
        gpa: 3.95,
        completedCourseIds: ['crs_ai_101', 'crs_ai_201', 'crs_ai_301', 'crs_ai_401', 'crs_ai_501'],
        capstoneStatus: 'Proposed',
        graduationReadinessPct: 76.0,
        enrolledAt: '2024-10-15T00:00:00Z',
        updatedAt: new Date().toISOString()
      }
    ];

    // 4. Seed Human Capability Graph (20 nodes across 4 domains)
    this.capabilities = [
      // Technical Domain
      { id: 'cap_dsa', domain: 'Technical', name: 'Data Structures & Algorithms', category: 'Algorithms', level: 'Mastery', description: 'Advanced graph algorithms, DP optimization, tree decomposition, and competitive programming proficiency.', masteryScore: 92.5 },
      { id: 'cap_sys_des', domain: 'Technical', name: 'Distributed System Design', category: 'Architecture', level: 'Mastery', description: 'Partitioning, multi-region replication, fault tolerance, consensus protocols, and low-latency storage.', masteryScore: 94.0 },
      { id: 'cap_ai_eng', domain: 'Technical', name: 'AI & Frontier Agent Engineering', category: 'Artificial Intelligence', level: 'Frontier', description: 'Multi-agent coordination, speculative decoding, model alignment, and stateful memory fabrics.', masteryScore: 95.5 },
      { id: 'cap_backend', domain: 'Technical', name: 'High-Concurrency Backend Systems', category: 'Backend', level: 'Advanced', description: 'Go/Rust asynchronous runtimes, non-blocking I/O, gRPC streaming, and zero-allocation pipelines.', masteryScore: 89.0 },
      { id: 'cap_frontend', domain: 'Technical', name: 'Next-Gen UI & Human-AI Interfaces', category: 'Frontend', level: 'Advanced', description: 'Fluid interaction design, WebGL rendering, WebSockets, and low-latency responsive layouts.', masteryScore: 88.0 },
      { id: 'cap_devops', domain: 'Technical', name: 'Cloud Native & Infrastructure as Code', category: 'DevOps', level: 'Advanced', description: 'Kubernetes orchestration, Terraform multi-cloud deployment, eBPF telemetry, and chaos engineering.', masteryScore: 86.5 },
      { id: 'cap_cloud', domain: 'Technical', name: 'Serverless & Edge Compute Topologies', category: 'Cloud', level: 'Intermediate', description: 'Edge workers, global data synchronization, CDN routing, and WebAssembly modules.', masteryScore: 81.0 },

      // Professional Domain
      { id: 'cap_comm', domain: 'Professional', name: 'Executive Technical Communication', category: 'Communication', level: 'Advanced', description: 'Translating complex distributed topologies and algorithmic trade-offs to C-suite stakeholders and cross-functional partners.', masteryScore: 88.5 },
      { id: 'cap_lead', domain: 'Professional', name: 'Engineering Leadership & Team Multipliers', category: 'Leadership', level: 'Advanced', description: 'Fostering engineering culture, unblocking critical path blockers, architectural governance, and mentorship.', masteryScore: 86.0 },
      { id: 'cap_team', domain: 'Professional', name: 'High-Velocity Cross-Functional Synergy', category: 'Teamwork', level: 'Mastery', description: 'Asynchronous collaboration, rapid RFC consensus building, and blameless incident mitigation.', masteryScore: 91.0 },
      { id: 'cap_nego', domain: 'Professional', name: 'Strategic Negotiation & Value Capture', category: 'Negotiation', level: 'Intermediate', description: 'Executive offer negotiations, vendor SLA structuring, and term-sheet valuation bargaining.', masteryScore: 82.0 },

      // Research Domain
      { id: 'cap_sci_write', domain: 'Research', name: 'Scientific Manuscript & LaTeX Authoring', category: 'Scientific Writing', level: 'Advanced', description: 'Authoring rigorous academic manuscripts for NeurIPS, ICML, and OSDI conferences.', masteryScore: 87.0 },
      { id: 'cap_exp_des', domain: 'Research', name: 'Empirical Experimental Design & Benchmarking', category: 'Experimental Design', level: 'Mastery', description: 'Constructing statistically rigorous evaluation suites, ablation studies, and baseline comparisons.', masteryScore: 90.0 },
      { id: 'cap_stats', domain: 'Research', name: 'Mathematical Statistics & Formal Proofs', category: 'Statistics', level: 'Advanced', description: 'Convergence proofs, Bayesian inference, hypothesis testing, and computational complexity bounds.', masteryScore: 85.5 },

      // Entrepreneurship Domain
      { id: 'cap_prod_strat', domain: 'Entrepreneurship', name: 'Product Strategy & Zero-to-One Discovery', category: 'Product Strategy', level: 'Advanced', description: 'Customer problem validation, feature roadmapping, user interview synthesis, and rapid prototyping.', masteryScore: 89.5 },
      { id: 'cap_gtm', domain: 'Entrepreneurship', name: 'Viral GTM & Developer Growth Loops', category: 'GTM', level: 'Intermediate', description: 'Developer evangelism, open-source community funnels, and viral flywheel optimization.', masteryScore: 83.5 },
      { id: 'cap_fundraise', domain: 'Entrepreneurship', name: 'Venture Fundraising & Pitch Structuring', category: 'Fundraising', level: 'Intermediate', description: 'Cap table modeling, investor story arcs, data room preparation, and pitch delivery.', masteryScore: 80.0 },
      { id: 'cap_market_val', domain: 'Entrepreneurship', name: 'Market Sizing & Economic Moat Validation', category: 'Market Validation', level: 'Advanced', description: 'TAM/SAM/SOM modeling, competitive moat defensibility, and pricing elasticity tests.', masteryScore: 86.0 }
    ];

    // Capability Relationships
    this.capabilityRelations = [
      { id: 'rel_1', sourceCapabilityId: 'cap_dsa', targetCapabilityId: 'cap_sys_des', relationshipType: 'Prerequisite', weight: 0.9 },
      { id: 'rel_2', sourceCapabilityId: 'cap_sys_des', targetCapabilityId: 'cap_backend', relationshipType: 'Synergy', weight: 0.95 },
      { id: 'rel_3', sourceCapabilityId: 'cap_sys_des', targetCapabilityId: 'cap_ai_eng', relationshipType: 'Unlocks', weight: 0.9 },
      { id: 'rel_4', sourceCapabilityId: 'cap_ai_eng', targetCapabilityId: 'cap_exp_des', relationshipType: 'Synergy', weight: 0.85 },
      { id: 'rel_5', sourceCapabilityId: 'cap_exp_des', targetCapabilityId: 'cap_sci_write', relationshipType: 'Unlocks', weight: 0.95 },
      { id: 'rel_6', sourceCapabilityId: 'cap_prod_strat', targetCapabilityId: 'cap_market_val', relationshipType: 'Prerequisite', weight: 0.85 },
      { id: 'rel_7', sourceCapabilityId: 'cap_comm', targetCapabilityId: 'cap_lead', relationshipType: 'Unlocks', weight: 0.9 },
      { id: 'rel_8', sourceCapabilityId: 'cap_lead', targetCapabilityId: 'cap_fundraise', relationshipType: 'Synergy', weight: 0.8 }
    ];

    // 5. Seed 6 Mentor Profiles
    this.mentors = [
      {
        id: 'mnt_swe',
        name: 'Dr. Marcus Vance',
        role: 'Chief Systems Architect',
        specialty: 'High-Concurrency & Distributed OS',
        archetype: 'SoftwareEngineering',
        bio: 'Former Google Fellow with 20+ years designing planet-scale distributed databases, Paxos kernels, and low-latency storage primitives.',
        corePrinciples: ['Correctness over cleverness', 'Benchmark every abstraction', 'Design for automated failure recovery'],
        debatePersonality: 'Analytical, mathematically rigorous, demands empirical latency data and proof of failover.',
        avatarColor: 'from-blue-600 to-cyan-600'
      },
      {
        id: 'mnt_ai',
        name: 'Dr. Elena Rostova',
        role: 'Frontier AI Research Director',
        specialty: 'Foundation Models & Agent Swarms',
        archetype: 'AI',
        bio: 'Pioneered speculative decoding architectures and multi-agent memory consolidation frameworks at top frontier research labs.',
        corePrinciples: ['Autonomous feedback loops beat static heuristics', 'Latency is the bottleneck of intelligence', 'Rigorously measure alignment'],
        debatePersonality: 'Forward-looking, exponential mindset, challenges conservative software assumptions with agentic automation.',
        avatarColor: 'from-purple-600 to-pink-600'
      },
      {
        id: 'mnt_career',
        name: 'Sarah Chen',
        role: 'Executive Talent Strategist',
        specialty: 'Tier-1 Engineering Career Trajectory',
        archetype: 'Career',
        bio: 'Former Head of Engineering Talent at Sequoia-backed unicorns and FAANG. Placed over 500 Staff+ engineers and technical executives.',
        corePrinciples: ['Maximize career equity upside', 'Proof of work is your only defensible moat', 'Never negotiate from weakness'],
        debatePersonality: 'Pragmatic, ROI-driven, focused on market compensation leverage and institutional reputation signals.',
        avatarColor: 'from-emerald-600 to-teal-600'
      },
      {
        id: 'mnt_research',
        name: 'Prof. Arthur Sterling',
        role: 'Chair of Computer Science & ACM Fellow',
        specialty: 'Algorithmic Complexity & Formal Verification',
        archetype: 'Research',
        bio: 'Published 80+ papers in NeurIPS, STOC, and SOSP. Mentored 30+ PhDs now leading fundamental science across the globe.',
        corePrinciples: ['First principles mathematical derivation', 'Peer review is the crucible of truth', 'Pursue fundamental breakthroughs'],
        debatePersonality: 'Socratic, uncompromising on theoretical rigor, skeptical of hype without formal complexity bounds.',
        avatarColor: 'from-rose-600 to-red-600'
      },
      {
        id: 'mnt_startup',
        name: 'Jaxson Thorne',
        role: 'Serial AI Founder & General Partner',
        specialty: 'Zero-to-One Product & Venture Velocity',
        archetype: 'Startup',
        bio: 'Founded 3 venture-backed AI companies with 2 exits totaling $400M+. Active angel investor in frontier infrastructure.',
        corePrinciples: ['Speed is your only structural advantage', 'Talk to customers every single day', 'Default to shipping'],
        debatePersonality: 'Urgent, direct, impatient with academic perfectionism, laser-focused on customer value and product traction.',
        avatarColor: 'from-amber-600 to-orange-600'
      },
      {
        id: 'mnt_lead',
        name: 'Victoria Hawthorne',
        role: 'VP of Engineering & Organizational Coach',
        specialty: 'High-Performance Culture & Crisis Management',
        archetype: 'Leadership',
        bio: 'Scaled engineering organizations from 10 to 1,200 engineers across 4 continents while maintaining zero-turnover core teams.',
        corePrinciples: ['Psychological safety unlocks extreme output', 'Extreme clarity of mission', 'Lead through empathetic conviction'],
        debatePersonality: 'Diplomatic yet resolute, focused on sustainable human energy, team multipliers, and high-trust dynamics.',
        avatarColor: 'from-indigo-600 to-violet-600'
      },
      {
        id: 'mnt_cog_sci',
        name: 'Dr. Nathan Cross',
        role: 'Lead Cognitive Scientist',
        specialty: 'Working Memory & Neural Problem Solving',
        archetype: 'CognitiveScientist' as any,
        bio: 'Pioneered computational models of cognitive load and retrieval mechanics at MIT Brain & Cognitive Sciences.',
        corePrinciples: ['Identify working memory bottlenecks', 'Deconstruct abstract concepts into fundamental schema', 'Optimize cognitive bandwidth'],
        debatePersonality: 'Rigorous cognitive diagnostics, focused on mental model clarity and memory retrieval efficiency.',
        avatarColor: 'from-cyan-600 to-teal-600'
      },
      {
        id: 'mnt_agi_res',
        name: 'Dr. Alistair Vance',
        role: 'AGI Safety & Alignment Principal',
        specialty: 'Test-Time Compute & Mechanistic Interpretability',
        archetype: 'AGIResearcher' as any,
        bio: 'Directs research on scalable oversight and reasoning verification in foundation model swarms.',
        corePrinciples: ['Safety is an architectural property', 'Verify test-time reasoning steps explicitly', 'Align agent incentives'],
        debatePersonality: 'Deeply focused on formal verification, alignment safety bounds, and test-time reasoning compute.',
        avatarColor: 'from-purple-600 to-indigo-600'
      },
      {
        id: 'mnt_learn_sci',
        name: 'Prof. Sophia Chen',
        role: 'Director of Learning Intelligence',
        specialty: 'Meta-Learning & Spaced Compounding',
        archetype: 'LearningScientist' as any,
        bio: 'Author of "The Compounding Mind", specializing in accelerated skill acquisition and active recall optimization.',
        corePrinciples: ['Spaced retrieval outperforms passive review', 'Meta-cognition is the ultimate leverage', 'Match mode to DNA'],
        debatePersonality: 'Encouraging, scientific, laser-focused on learning velocity and cognitive retention curves.',
        avatarColor: 'from-emerald-600 to-green-600'
      },
      {
        id: 'mnt_sys_think',
        name: 'Vikram Patel',
        role: 'Principal Systems Thinker',
        specialty: 'Complex Systems & Second-Order Effects',
        archetype: 'SystemsThinker' as any,
        bio: 'Consultant for DARPA and tier-1 tech enterprises on non-linear system dynamics and emergent failure modes.',
        corePrinciples: ['Look for second-order feedback loops', 'Optimize for system-wide flow not local max', 'Build robust anti-fragile structures'],
        debatePersonality: 'Holistic, macro-focused, mapping interconnected feedback loops across engineering, market, and cognitive domains.',
        avatarColor: 'from-amber-600 to-yellow-600'
      },
      {
        id: 'mnt_perf_psych',
        name: 'Dr. Kairos Thorne',
        role: 'High-Performance Psychologist',
        specialty: 'Cognitive Endurance & Flow State Engineering',
        archetype: 'PerformancePsychologist' as any,
        bio: 'Coaches Olympic athletes, chess grandmasters, and principal tech leaders on sustained cognitive focus under extreme pressure.',
        corePrinciples: ['Manage energy not just time', 'Flow state requires structured challenge-skill balance', 'Prevent burnout through systematic recovery'],
        debatePersonality: 'Empathetic, highly attuned to stress signals, focused on mental endurance and optimal focus capacity.',
        avatarColor: 'from-rose-600 to-pink-600'
      }
    ];

    // 6. Seed Learning Marketplace
    this.marketplace = [
      {
        id: 'mkt_1',
        title: 'Frontier AI Systems & Speculative Decoding Fellowship',
        offeringType: 'Fellowship',
        provider: 'Algora Frontier Research',
        durationWeeks: 12,
        roiScore: 98.5,
        completionProbability: 92.0,
        hiringImpactPct: 96.0,
        skillGainEstimate: '+18.5% AI Mastery',
        costUsd: 0.0,
        rating: 4.98,
        skillsCovered: ['Speculative Decoding', 'vLLM Internals', 'Multi-Agent Memory']
      },
      {
        id: 'mkt_2',
        title: 'Advanced Raft & Distributed Database Engineering Bootcamp',
        offeringType: 'Bootcamp',
        provider: 'Systems Academy',
        durationWeeks: 8,
        roiScore: 95.0,
        completionProbability: 89.0,
        hiringImpactPct: 94.0,
        skillGainEstimate: '+22.0% Distributed Systems',
        costUsd: 0.0,
        rating: 4.95,
        skillsCovered: ['Raft Protocol', 'LSM Storage', 'Chaos Engineering']
      },
      {
        id: 'mkt_3',
        title: 'NeurIPS Paper Authorship & Mathematical Proof Workshop',
        offeringType: 'ResearchProgram',
        provider: 'Algora Academic Consortium',
        durationWeeks: 16,
        roiScore: 94.0,
        completionProbability: 84.0,
        hiringImpactPct: 91.0,
        skillGainEstimate: '+25.0% Scientific Writing',
        costUsd: 0.0,
        rating: 4.92,
        skillsCovered: ['LaTeX Proofs', 'Empirical Benchmarking', 'Peer Review']
      },
      {
        id: 'mkt_4',
        title: 'Zero-to-One Technical Co-Founder Masterclass',
        offeringType: 'Certification',
        provider: 'Algora Venture Studio',
        durationWeeks: 6,
        roiScore: 96.5,
        completionProbability: 90.0,
        hiringImpactPct: 88.0,
        skillGainEstimate: '+30.0% Entrepreneurship',
        costUsd: 0.0,
        rating: 4.96,
        skillsCovered: ['Product Strategy', 'Venture Fundraising', 'Developer GTM']
      }
    ];

    // 7. Seed Credentials
    this.credentials = [
      {
        id: 'crd_1',
        userId: 'usr_demo',
        title: 'Certified Distributed Systems Engineer (Tier-1)',
        credentialType: 'EnterpriseSimulation',
        issuer: 'Algora Consensus Protocol',
        verificationHash: '0x8f2a1b94c3e789d2a45f67b89c01de23a456789b',
        skillsValidated: ['Raft Consensus', 'LSM Engines', 'Fault-Tolerance'],
        proofUrl: 'https://algora.io/verify/0x8f2a1b94',
        issuedAt: '2025-01-15T10:00:00Z'
      },
      {
        id: 'crd_2',
        userId: 'usr_demo',
        title: 'Frontier AI Agent Architecture Honor Badge',
        credentialType: 'Project',
        issuer: 'Algora Frontier Lab',
        verificationHash: '0x4d5e6f7a8b9c0123456789abcdef0123456789ab',
        skillsValidated: ['Speculative Decoding', 'Multi-Agent Swarms', 'Context Compression'],
        proofUrl: 'https://algora.io/verify/0x4d5e6f7a',
        issuedAt: '2025-02-10T14:30:00Z'
      },
      {
        id: 'crd_3',
        userId: 'usr_demo',
        title: 'NeurIPS Peer-Reviewed Research Co-Author',
        credentialType: 'Research',
        issuer: 'Algora Academic Consortium',
        verificationHash: '0x1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d',
        skillsValidated: ['Empirical Benchmarking', 'LaTeX Manuscript', 'Formal Proofs'],
        proofUrl: 'https://algora.io/verify/0x1a2b3c4d',
        issuedAt: '2025-02-28T09:15:00Z'
      },
      {
        id: 'crd_4',
        userId: 'usr_demo',
        title: 'Grandmaster Contest Top 1% Ranking Badge',
        credentialType: 'Contest',
        issuer: 'Algora Global Arena',
        verificationHash: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
        skillsValidated: ['Algorithms', 'Speed Optimization', 'Zero-Bug Coding'],
        proofUrl: 'https://algora.io/verify/0x7e8f9a0b',
        issuedAt: '2025-03-05T18:00:00Z'
      }
    ];

    // 8. Seed Potential Profile for usr_demo
    this.potentialProfiles.set('usr_demo', {
      id: 'pot_demo',
      userId: 'usr_demo',
      careerPotential: 96.5,
      leadershipPotential: 91.0,
      researchPotential: 93.5,
      founderPotential: 94.0,
      learningVelocity: 97.2,
      longTermGrowthScore: 95.8,
      growthDrivers: [
        'Super-linear algorithmic mastery compound velocity (top 0.8% worldwide)',
        'Demonstrated dual-threat competence in both deep research and production deployment',
        'Exceptional autonomous execution capacity (sub-100ms reasoning loop mastery)'
      ],
      strategicAccelerators: [
        'Complete Raft Distributed Capstone to lock in Google L5/OpenAI MTS clearance',
        'Co-author 2nd NeurIPS manuscript to unlock top-tier Research Scientist fellowships',
        'Launch venture AI agent pilot to validate founder product-market fit'
      ],
      updatedAt: new Date().toISOString()
    });

    // Potential Forecasts
    this.potentialForecasts = [
      {
        id: 'fc_1', userId: 'usr_demo', timeHorizonYears: 1, projectedCareerTier: 'Senior Distributed Systems / AI Engineer (L5)',
        projectedCompensationUsd: 320000, projectedImpactScore: 89.5,
        keyMilestones: ['Algora AI University Honors Graduation', 'Major OSS Contribution to vLLM/Raft', 'Top 100 Global Contest Placement'],
        riskFactors: ['Context switching between research and product engineering']
      },
      {
        id: 'fc_3', userId: 'usr_demo', timeHorizonYears: 3, projectedCareerTier: 'Staff AI Architect / Founding CTO',
        projectedCompensationUsd: 550000, projectedImpactScore: 94.0,
        keyMilestones: ['Seed Round Raised ($3.5M) or Staff Promotion', '3x Top-Tier Conference Publications', '100k+ Devs using authored infrastructure'],
        riskFactors: ['Venture market volatility']
      },
      {
        id: 'fc_5', userId: 'usr_demo', timeHorizonYears: 5, projectedCareerTier: 'Principal Fellow / Unicorn Founder & CEO',
        projectedCompensationUsd: 1200000, projectedImpactScore: 97.5,
        keyMilestones: ['Series A ($18M+) or Principal L7 promotion', 'Industry-standard AI agent protocol author', '1M+ Global community impact'],
        riskFactors: ['Rapid technological paradigm shifts in foundation models']
      },
      {
        id: 'fc_10', userId: 'usr_demo', timeHorizonYears: 10, projectedCareerTier: 'Global Tech Luminary / Venture Partner / Lab Director',
        projectedCompensationUsd: 3500000, projectedImpactScore: 99.2,
        keyMilestones: ['IPO / Major Acquisition or Turing-level recognition', '5,000+ engineers mentored', 'Transformative societal impact'],
        riskFactors: ['Macroeconomic shifts']
      }
    ];

    // 9. Seed Global Impact Profile for usr_demo
    this.impactProfiles.set('usr_demo', {
      id: 'imp_demo',
      userId: 'usr_demo',
      overallImpactScore: 88.5,
      openSourceImpact: 92.0,
      researchImpact: 87.5,
      educationImpact: 90.0,
      mentorshipImpact: 84.5,
      communityImpact: 86.0,
      entrepreneurshipImpact: 91.0,
      totalPeopleImpacted: 18450,
      updatedAt: new Date().toISOString()
    });

    // Impact Events
    this.impactEvents = [
      {
        id: 'impe_1', userId: 'usr_demo', impactArea: 'Open Source',
        title: 'Open Source Distributed Consensus Kernel Release',
        metrics: '1,420 GitHub Stars • 280 Forks • 4,500 Monthly Downloads',
        reachCount: 8200,
        verificationSource: 'GitHub Consensus Registry',
        eventDate: '2025-01-20T12:00:00Z'
      },
      {
        id: 'impe_2', userId: 'usr_demo', impactArea: 'Research',
        title: 'NeurIPS Paper: Sub-Quadratic Attention Memory Optimization',
        metrics: '85 Academic Citations • Featured in Top ML Weekly',
        reachCount: 3800,
        verificationSource: 'arXiv & NeurIPS Proceedings',
        eventDate: '2025-02-15T15:00:00Z'
      },
      {
        id: 'impe_3', userId: 'usr_demo', impactArea: 'Education',
        title: 'Algora Global Masterclass: Advanced System Design',
        metrics: '2,400 Live Attendees • 98.5% Satisfaction Score',
        reachCount: 4100,
        verificationSource: 'Algora University Platform',
        eventDate: '2025-03-01T17:00:00Z'
      },
      {
        id: 'impe_4', userId: 'usr_demo', impactArea: 'Mentorship',
        title: '1-on-1 Socratic Coding Guidance for 45 Junior Engineers',
        metrics: '38 Promoted to Senior Roles in Tier-1 Tech',
        reachCount: 2350,
        verificationSource: 'Algora Mentor Network',
        eventDate: '2025-03-10T09:00:00Z'
      }
    ];

    this.initialized = true;
    logger.info("[UniversityRepository] V5.0 Seed data initialized successfully.");
  }

  // --- Degree Programs & Courses ---
  public static async getDegrees(): Promise<DegreeProgramRecord[]> {
    await this.initSeedData();
    const degreesWithCourses = this.degrees.map(deg => ({
      ...deg,
      courses: this.courses.filter(c => c.degreeId === deg.id)
    }));
    return degreesWithCourses;
  }

  public static async getDegreeById(degreeId: string): Promise<DegreeProgramRecord | null> {
    await this.initSeedData();
    const deg = this.degrees.find(d => d.id === degreeId);
    if (!deg) return null;
    return {
      ...deg,
      courses: this.courses.filter(c => c.degreeId === deg.id)
    };
  }

  public static async getStudentDegrees(userId: string): Promise<StudentDegreeRecord[]> {
    await this.initSeedData();
    const userDegs = this.studentDegrees.filter(sd => sd.userId === userId);
    if (userDegs.length === 0) {
      // Default auto-enroll in SWE
      const defaultEnrollment: StudentDegreeRecord = {
        id: `sdeg_${Date.now()}`,
        userId,
        degreeId: 'deg_swe',
        status: 'Enrolled',
        currentSemester: 1,
        creditsCompleted: 16,
        gpa: 3.88,
        completedCourseIds: ['crs_swe_101'],
        capstoneStatus: 'NotStarted',
        graduationReadinessPct: 15.0,
        enrolledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.studentDegrees.push(defaultEnrollment);
      return [defaultEnrollment];
    }
    return userDegs;
  }

  public static async enrollInDegree(userId: string, degreeId: string): Promise<StudentDegreeRecord> {
    await this.initSeedData();
    let existing = this.studentDegrees.find(sd => sd.userId === userId && sd.degreeId === degreeId);
    if (existing) return existing;

    const newRecord: StudentDegreeRecord = {
      id: `sdeg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      degreeId,
      status: 'Enrolled',
      currentSemester: 1,
      creditsCompleted: 0,
      gpa: 4.0,
      completedCourseIds: [],
      capstoneStatus: 'NotStarted',
      graduationReadinessPct: 0.0,
      enrolledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.studentDegrees.push(newRecord);
    return newRecord;
  }

  public static async updateStudentDegree(record: StudentDegreeRecord): Promise<StudentDegreeRecord> {
    await this.initSeedData();
    const idx = this.studentDegrees.findIndex(sd => sd.id === record.id);
    if (idx >= 0) {
      this.studentDegrees[idx] = { ...record, updatedAt: new Date().toISOString() };
      return this.studentDegrees[idx];
    }
    this.studentDegrees.push(record);
    return record;
  }

  // --- Capabilities ---
  public static async getCapabilities(): Promise<CapabilityRecord[]> {
    await this.initSeedData();
    return this.capabilities.map(cap => {
      const rels = this.capabilityRelations.filter(r => r.targetCapabilityId === cap.id);
      const unlocks = this.capabilityRelations.filter(r => r.sourceCapabilityId === cap.id);
      return {
        ...cap,
        dependencies: rels.map(r => r.sourceCapabilityId),
        unlockedBy: unlocks.map(r => r.targetCapabilityId)
      };
    });
  }

  public static async updateCapabilityScore(id: string, newScore: number): Promise<CapabilityRecord | null> {
    await this.initSeedData();
    const cap = this.capabilities.find(c => c.id === id);
    if (cap) {
      cap.masteryScore = Math.min(100, Math.max(0, newScore));
      return cap;
    }
    return null;
  }

  // --- Mentors & Sessions ---
  public static async getMentors(): Promise<MentorProfileRecord[]> {
    await this.initSeedData();
    return this.mentors;
  }

  public static async saveMentorSession(session: MentorSessionRecord): Promise<MentorSessionRecord> {
    await this.initSeedData();
    this.mentorSessions.unshift(session);
    return session;
  }

  public static async getMentorSessions(userId: string): Promise<MentorSessionRecord[]> {
    await this.initSeedData();
    return this.mentorSessions.filter(s => s.userId === userId);
  }

  // --- Learning Marketplace ---
  public static async getMarketplaceOfferings(): Promise<LearningMarketplaceRecord[]> {
    await this.initSeedData();
    return this.marketplace;
  }

  // --- Credentials ---
  public static async getCredentials(userId: string): Promise<CredentialRecord[]> {
    await this.initSeedData();
    return this.credentials.filter(c => c.userId === userId);
  }

  public static async issueCredential(credential: CredentialRecord): Promise<CredentialRecord> {
    await this.initSeedData();
    this.credentials.unshift(credential);
    return credential;
  }

  // --- Potential Profiles & Forecasts ---
  public static async getPotentialProfile(userId: string): Promise<PotentialProfileRecord> {
    await this.initSeedData();
    if (!this.potentialProfiles.has(userId)) {
      const defaultProfile: PotentialProfileRecord = {
        id: `pot_${userId}`,
        userId,
        careerPotential: 94.5,
        leadershipPotential: 88.0,
        researchPotential: 91.0,
        founderPotential: 92.0,
        learningVelocity: 95.0,
        longTermGrowthScore: 93.5,
        growthDrivers: [
          'High problem-solving throughput across competitive programming modules',
          'Fast comprehension of distributed systems patterns',
          'Consistent daily review discipline'
        ],
        strategicAccelerators: [
          'Complete AI Degree Capstone',
          'Participate in Global Hackathon or Open Source Release'
        ],
        updatedAt: new Date().toISOString()
      };
      this.potentialProfiles.set(userId, defaultProfile);
    }
    return this.potentialProfiles.get(userId)!;
  }

  public static async savePotentialProfile(profile: PotentialProfileRecord): Promise<PotentialProfileRecord> {
    await this.initSeedData();
    this.potentialProfiles.set(profile.userId, profile);
    return profile;
  }

  public static async getPotentialForecasts(userId: string): Promise<PotentialForecastRecord[]> {
    await this.initSeedData();
    return this.potentialForecasts.filter(f => f.userId === userId);
  }

  // --- Global Impact ---
  public static async getImpactProfile(userId: string): Promise<ImpactProfileRecord> {
    await this.initSeedData();
    if (!this.impactProfiles.has(userId)) {
      const defaultImpact: ImpactProfileRecord = {
        id: `imp_${userId}`,
        userId,
        overallImpactScore: 85.0,
        openSourceImpact: 88.0,
        researchImpact: 84.0,
        educationImpact: 86.0,
        mentorshipImpact: 80.0,
        communityImpact: 82.0,
        entrepreneurshipImpact: 88.0,
        totalPeopleImpacted: 12500,
        updatedAt: new Date().toISOString()
      };
      this.impactProfiles.set(userId, defaultImpact);
    }
    return this.impactProfiles.get(userId)!;
  }

  public static async saveImpactProfile(profile: ImpactProfileRecord): Promise<ImpactProfileRecord> {
    await this.initSeedData();
    this.impactProfiles.set(profile.userId, profile);
    return profile;
  }

  public static async getImpactEvents(userId: string): Promise<ImpactEventRecord[]> {
    await this.initSeedData();
    return this.impactEvents.filter(e => e.userId === userId);
  }

  public static async addImpactEvent(event: ImpactEventRecord): Promise<ImpactEventRecord> {
    await this.initSeedData();
    this.impactEvents.unshift(event);
    return event;
  }
}
