# ALGORA PLATFORM — DISASTER RECOVERY & SYSTEM RESTORATION PROCEDURE

**Version:** V5.1 Production Baseline  
**Classification:** Operational Runbook  

---

## 1. POSTGRESQL DATABASE RECOVERY PROCEDURE

### 1.1 Complete Database Disruption / Host Loss
1. **Provision Replacement Database Node:** Provision clean PostgreSQL instance matching production version (v16+).
2. **Retrieve Latest Full Backup:** Fetch latest `pgBackRest` full backup snapshot from primary S3 backup repository.
3. **Reapply Incremental WAL Archives:** Execute point-in-time recovery (PITR) up to the target timestamp before incident.
4. **Run Verification Suite:**
   ```bash
   npm run db:status
   npm run db:migrate
   ```
   Verify that database schema matches version `039_performance_indexes_and_optimizations.sql`.

### 1.2 Data Corruption / Accidental Deletion Recovery
1. Calculate target transaction timestamp prior to corruption event.
2. Perform PITR recovery to an isolated staging database node.
3. Extract missing/corrupted rows (`submissions`, `user_achievements`, `cognitive_profiles`) and merge into primary database using idempotent upserts.

---

## 2. REDIS CACHE & IN-MEMORY RECOVERY

### 2.1 Redis Node Failure / Partition
1. **Automated Memory Fallback:** `RedisManager` in `backend/src/redis/redisClient.ts` immediately catches connection failures and redirects key-value storage to `memoryFallback` Map without crashing backend workers.
2. **Node Re-Provisioning:** Launch fresh Redis container/cluster node.
3. **Restoration:** Load latest RDB snapshot from cloud storage if recovering persistent session data, or allow automatic cold-start warm-up from PostgreSQL.

---

## 3. AI OPERATING SYSTEM, AGENT & KNOWLEDGE FABRIC RECOVERY

### 3.1 AI OS State & Memory Recovery
1. **Executive Council & Digital Twin:** Executive council memories and digital twin profiles auto-hydrate from `executive_memories` and `cognitive_profiles` PostgreSQL tables on startup.
2. **Gemini Service Degradation / Fallback:**
   * If `gemini-3.6-flash` is unavailable or experiencing elevated 503/429 errors, `GeminiAIProvider` automatically falls back sequentially to `gemini-3.7-flash` -> `gemini-3.8-flash` -> `gemini-flash-latest`.
   * If Gemini API is completely degraded, non-AI features continue operating normally; AI endpoints return structured `503 Service Unavailable` with friendly user message.

---

## 4. MIGRATION ROLLBACK & RECOVERY VERIFICATION

### 4.1 Migration Rollback Protocol
1. To roll back schema version `039`:
   ```ts
   import { migrator } from "./backend/src/db/migrator";
   await migrator.rollback();
   ```
2. Verify application connectivity and database table integrity.

---

## 5. INCIDENT TRIAGE & RECOVERY CHECKLIST

- [ ] Step 1: Isolate impacted service (Database, Redis, AI Provider, API Server).
- [ ] Step 2: Redirect traffic via load balancer to healthy Cloud Run container targets.
- [ ] Step 3: Trigger appropriate restoration procedure (Database PITR / Redis RDB reload / AI fallback).
- [ ] Step 4: Execute health check `/api/health` and verify all checks pass.
- [ ] Step 5: Conduct post-incident verification & root cause review.
