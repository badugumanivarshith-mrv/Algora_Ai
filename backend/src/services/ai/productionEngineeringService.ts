import { 
  SimulationRepository, 
  IncidentScenarioRecord,
  DesignReviewRecord
} from "../../repositories/simulationRepository";
import { RedisManager } from "../../redis/redisClient";
import { logger } from "../../utils/logger";
import { v4 as uuidv4 } from "uuid";

export const PRODUCTION_INCIDENTS: IncidentScenarioRecord[] = [
  {
    id: "inc-redis-oom",
    title: "Sev-1: Primary Redis Cluster OOM & Connection Pool Starvation",
    scenarioType: "Database & Cache Outage",
    severity: "P1",
    companySlug: "google",
    architectureDiagram: `
      [Client Traffic: 85k QPS] ──> [Envoy Edge Gateway]
                                          │
                                          ├──> [Auth Service (Healthy)]
                                          └──> [Session Ingestion Worker]
                                                    │
                                                    ▼
                                          [Redis Cluster Node-03] ❌ (OOM 99.8% RAM)
                                                    │ (Connection timeout >5000ms)
                                                    ▼
                                          [Cascading 504 Gateway Timeouts]
    `,
    initialLogs: `
      [2026-09-15T03:10:04Z] [FATAL] redis-cluster-node-03: out of memory allocating 4096 bytes
      [2026-09-15T03:10:05Z] [WARN] api-gateway: connection pool exhausted to upstream redis-cluster (max_active: 500)
      [2026-09-15T03:10:07Z] [ERROR] checkout-service: downstream timeout calling GetUserSessionKey() after 5000ms
      [2026-09-15T03:10:08Z] [ALERT] PagerDuty: P99 latency degraded from 24ms -> 4200ms in us-east-1
    `,
    rootCause: "A background batch sync script emitted un-expiring cache keys without TTL, exhausting the 64GB maxmemory policy on Node-03.",
    mitigationSteps: [
      { step: 1, action: "Enable volatile-lru eviction policy immediately via redis-cli CONFIG SET maxmemory-policy volatile-lru", urgency: "Immediate" },
      { step: 2, action: "Isolate traffic and spin up read replica to absorb session read queries", urgency: "High" },
      { step: 3, action: "Apply hotfix patch enforcing default 3600s TTL on all batch session write paths", urgency: "Permanent" }
    ],
    expectedSlaMinutes: 20
  },
  {
    id: "inc-db-deadlock",
    title: "Sev-2: PostgreSQL Row-Lock Contention on Distributed Ledger Payments",
    scenarioType: "Lock Contention & Deadlock",
    severity: "P2",
    companySlug: "stripe",
    architectureDiagram: `
      [Webhook Events (12k/s)] ──> [Kafka Ingestion] ──> [Payment Ledger Consumer]
                                                                  │
                                                          (Concurrent UPDATEs)
                                                                  ▼
                                                      [PostgreSQL Ledger Table]
                                                        Row: account_id = 'acc_982'
                                                        ❌ Lock Contention (120 workers waiting)
    `,
    initialLogs: `
      [2026-09-15T03:14:22Z] [ERROR] postgres-primary: process 42899 detected deadlock while waiting for ShareLock on transaction 98402
      [2026-09-15T03:14:23Z] [WARN] payment-worker: transaction aborted due to serialization failure (SQLSTATE 40P01)
      [2026-09-15T03:14:25Z] [ALERT] CloudWatch: Ledger transaction queue backlog > 45,000 items
    `,
    rootCause: "Non-deterministic sorting order when acquiring multi-account locks across parallel double-entry bookkeeping transactions.",
    mitigationSteps: [
      { step: 1, action: "Enforce consistent deterministic account_id lock sorting before BEGIN TRANSACTION", urgency: "Immediate" },
      { step: 2, action: "Implement optimistic locking with token versioning for high-velocity enterprise merchant accounts", urgency: "Permanent" }
    ],
    expectedSlaMinutes: 30
  },
  {
    id: "inc-gpu-leak",
    title: "Sev-1: Multi-Node Triton Inference Cluster GPU Memory Leak",
    scenarioType: "AI / ML Infrastructure Crash",
    severity: "P1",
    companySlug: "openai",
    architectureDiagram: `
      [User Inference Prompt] ──> [Ray LLM Router]
                                         │
                                         ▼
                            [Triton GPU Worker Pods (H100 x8)]
                                         │
                                (KV Cache Tensor Alloc)
                                         ▼
                            [CUDA Out of Memory: cudaErrorMemoryAllocation]
    `,
    initialLogs: `
      [2026-09-15T03:22:11Z] [FATAL] triton_server: CUDA out of memory. Tried to allocate 2.40 GiB on device 0 (80.00 GiB total capacity)
      [2026-09-15T03:22:12Z] [ERROR] ray-cluster: Worker 10.244.3.12 terminated unexpectedly with SIGKILL
      [2026-09-15T03:22:15Z] [ALERT] P99 Time to First Token (TTFT) exceeded 6500ms
    `,
    rootCause: "Long-context streaming sessions did not unpin deactivated KV cache blocks from VRAM during early client disconnects.",
    mitigationSteps: [
      { step: 1, action: "Enable PagedAttention vLLM block recycling on client socket EOF event", urgency: "Immediate" },
      { step: 2, action: "Restart failing Ray worker pool with graceful drain", urgency: "Immediate" }
    ],
    expectedSlaMinutes: 15
  }
];

export const SYSTEM_DESIGN_REVIEWS: DesignReviewRecord[] = [
  {
    id: "design-global-feed",
    sessionId: "sim-default",
    title: "Global Distributed Activity Feed with Sub-50ms P99 Latency",
    problemStatement: "Design a horizontally scalable activity feed system supporting 100M Daily Active Users, 500k writes/second, and sub-50ms fanout reads for high-follower celebrity accounts.",
    constraints: [
      "100M DAU with 500k QPS peak write burst",
      "Sub-50ms P99 read latency across NA, EU, and APAC",
      "Eventual consistency SLA: updates visible within 2.5 seconds globally",
      "High availability: 99.99% multi-region active-active deployment"
    ],
    proposedArchitecture: `
      1. Hybrid Fanout Architecture:
         - Fanout-on-Write for normal users (followers < 25,000) using Redis Sorted Sets / RocksDB caches.
         - Fanout-on-Read for verified celebrity/high-follower accounts with dynamic timeline merging.
      2. Ingestion Tier:
         - Envoy Proxy + Rust/Go Ingestion Gateways pushing to partitioned Kafka topics by user_id shard.
      3. Storage Tier:
         - Primary Posts: Distributed Cassandra/ScyllaDB with multi-datacenter replication.
         - Timeline Indexes: In-memory cache clusters with memory-mapped SSD backing.
      4. Edge CDN:
         - Pre-rendered media chunks cached at Cloudflare/Fastly edge nodes.
    `,
    tradeOffs: [
      "Fanout-on-Write increases storage footprint by 4x but reduces read computational overhead to O(1) cache lookup.",
      "Celebrity Fanout-on-Read prevents write amplification storms but adds a 15ms timeline merge step at query time.",
      "Cassandra tunable consistency (LOCAL_QUORUM) balances cross-region write throughput with read freshness."
    ],
    scalingLimits: {
      maxThroughputQPS: "1,200,000 writes/sec",
      p99ReadLatency: "38ms",
      monthlyCloudStorageCost: "$42,500 / month"
    },
    costEstimate: {
      computeInstances: "$24,000 (Kubernetes Nodes)",
      managedStorage: "$18,500 (Cassandra + Redis Clusters)",
      networkEgress: "$12,000 (Cross-Region Traffic)",
      totalEstimatedCost: "$54,500 / month"
    },
    reviewerEvaluations: [
      {
        reviewer: "David K. (Staff Engineer)",
        score: 95,
        verdict: "Approved with Commendation",
        feedback: "Exceptional hybrid fanout strategy. Handling celebrity write amplification via dynamic read-time merging is textbook Big Tech architecture."
      }
    ],
    status: "Approved",
    createdAt: new Date().toISOString()
  }
];

export class ProductionEngineeringService {
  public static async getIncidents(): Promise<IncidentScenarioRecord[]> {
    return PRODUCTION_INCIDENTS;
  }

  public static async getIncident(id: string): Promise<IncidentScenarioRecord | null> {
    return PRODUCTION_INCIDENTS.find(i => i.id === id) || null;
  }

  public static async getDesignReviews(): Promise<DesignReviewRecord[]> {
    return SYSTEM_DESIGN_REVIEWS;
  }

  public static async evaluateIncidentMitigation(
    userId: string,
    incidentId: string,
    userMitigation: string
  ): Promise<{
    score: number;
    passed: boolean;
    analysis: string;
    strengths: string[];
    missedMitigations: string[];
  }> {
    const incident = await this.getIncident(incidentId) || PRODUCTION_INCIDENTS[0];
    const text = userMitigation.toLowerCase();

    let score = 75;
    const strengths: string[] = [];
    const missed: string[] = [];

    if (text.includes("eviction") || text.includes("lru") || text.includes("ttl") || text.includes("deadlock") || text.includes("vllm") || text.includes("pagedattention")) {
      score += 15;
      strengths.push("Identified accurate root-cause mechanics and memory/locking policies.");
    }
    if (text.includes("rollback") || text.includes("drain") || text.includes("replica") || text.includes("isolate")) {
      score += 8;
      strengths.push("Applied immediate containment to stop blast radius propagation.");
    }
    if (text.includes("post-mortem") || text.includes("alert") || text.includes("monitoring") || text.includes("test")) {
      score += 5;
      strengths.push("Included preventive operational rigor and automated regression guards.");
    }

    if (!text.includes("sla") && !text.includes("p99")) {
      missed.push("Did not specify exact SLA verification metrics before closing the incident.");
    }
    if (!text.includes("canary") && !text.includes("gradual")) {
      missed.push("Hotfix deployment should utilize canary staging rather than an immediate full-fleet rollout.");
    }

    const finalScore = Math.min(98, score);
    return {
      score: finalScore,
      passed: finalScore >= 80,
      analysis: `Evaluated against ${incident.title}. Demonstrates senior incident command proficiency with score ${finalScore}/100.`,
      strengths,
      missedMitigations: missed
    };
  }
}
