# ALGORA PLATFORM — BACKUP STRATEGY & DATA RETENTION SPECIFICATION

**Version:** V5.1 Production Baseline  
**Target RPO (Recovery Point Objective):** < 15 minutes for PostgreSQL, < 1 hour for Redis caches  
**Target RTO (Recovery Time Objective):** < 30 minutes full platform restoration  

---

## 1. POSTGRESQL DATABASE BACKUP STRATEGY

### 1.1 Automated Continuous Archiving (WAL Streaming)
* **Write-Ahead Logging (WAL):** Enabled with `wal_level = replica`. WAL segments are streamed continuously to S3 / Cloud Storage buckets using `pgBackRest` or `wal-g`.
* **RPO Guarantee:** Point-in-time recovery (PITR) with precision down to individual transactions (< 15 second data loss window).

### 1.2 Automated Full & Incremental Backups
* **Daily Full Physical Backup:** Executed every night at 01:00 UTC via `pg_basebackup` / `pgBackRest`.
* **Differential / Incremental Backups:** Executed every 4 hours.
* **Retention Policy:**
  * Daily backups retained for 30 days.
  * Weekly backups retained for 90 days.
  * Monthly backups retained for 365 days in Immutable S3 Glacier Object Lock storage (WORM protection against ransomware).

### 1.3 Logical Schema & Seed Exports
* **pg_dump Schema Snapshots:** Automated post-migration schema dump (`001_initial_schema.sql` through `039_performance_indexes_and_optimizations.sql`) stored in versioned deployment artifacts.

---

## 2. REDIS CACHE & IN-MEMORY STATE BACKUP STRATEGY

### 2.1 Persistence Configuration
* **RDB Snapshots:** Configured with `save 900 1` (after 900s if >= 1 key changed), `save 300 10`, and `save 60 10000`.
* **AOF (Append-Only File):** Enabled with `appendfsync everysec` for durable write-logging of active user sessions, rate-limit counters, and active contest leaderboards.

### 2.2 Backup Storage & Retention
* Daily RDB snapshot exports uploaded to multi-region cloud storage bucket.
* Retained for 14 days.

---

## 3. AI OPERATING SYSTEM, KNOWLEDGE FABRIC & STATE RECOVERY

### 3.1 AI OS State Backup
* **Knowledge Fabric Graph:** User cognitive profiles, knowledge compounding metrics, and strategic executive council memories are stored natively in PostgreSQL tables (`cognitive_profiles`, `executive_memories`, `knowledge_compounding`).
* **Vector Indexing & Embeddings:** Embeddings are deterministically re-indexable from canonical text sources stored in database text fields (`literature_reviews`, `agi_experiments`, `meta_learning_patterns`).

---

## 4. SECRETS, ENCRYPTION & COMPLIANCE

* **Encryption at Rest:** AES-256 KMS encryption for all S3 backup buckets and database disk volumes.
* **Encryption in Transit:** TLS 1.3 for streaming backups and replication channels.
* **Access Control:** Dedicated IAM roles with zero delete permissions for backup service accounts; deletion requires dual-authorization KMS key revocation.
