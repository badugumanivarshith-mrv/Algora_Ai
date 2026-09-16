# ALGORA PLATFORM — LESSONS LEARNED REPORT

**Milestone:** Phase P5 Engineering Lessons Learned Archive  
**Date:** September 16, 2026  
**Status:** COMPLETED  

---

## 1. ARCHITECTURAL & ENGINEERING LESSONS

*   **Decoupled Multi-Tier Design:** Separating the React 19 single-page application from the Express API gateway simplified maintenance, enabled independent scalability, and clarified data contracts.
*   **Database Indexing Impact:** Early testing revealed potential bottlenecks in multi-table student telemetry queries. Implementing selective B-Tree indexes transformed sequential scans into logarithmic lookups, boosting query performance significantly.
*   **Cost-Conscious LLM Integration:** Uncached AI queries in educational environments lead to redundant API costs. Implementing Redis MD5 prompt caching proved essential for sustainable operation.
*   **Security Discipline:** Avoiding naive string comparisons (`===`) for token validation and adopting `crypto.timingSafeEqual` eliminated side-channel timing vulnerabilities.
