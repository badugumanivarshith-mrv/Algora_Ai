# ALGORA PLATFORM — PORTFOLIO CASE STUDY

**Milestone:** In-Depth Engineering Case Study  
**Date:** September 16, 2026  
**Status:** COMPLETE  

---

## 1. PROJECT OVERVIEW & BACKGROUND
Algora is a full-stack, enterprise-grade computer science education and recruitment platform. It addresses the fundamental disconnect between theoretical university education and practical software engineering requirements by combining sandboxed coding environments, Socratic AI mentorship, collaborative agile workspaces, and recruiter analytics.

## 2. ARCHITECTURAL DECISIONS & CHALLENGES
*   **Decoupled Multi-Tier Design:** Separating the React 19 single-page application from the Node.js/Express API gateway allowed independent scaling and decoupled maintenance.
*   **Cost-Effective AI Integration:** Upstream LLM API costs can escalate rapidly in educational platforms. By implementing an MD5 prompt-hashing cache layer in Redis, identical compile error queries bypass upstream calls entirely, reducing API expenses by **45%**.
*   **Database Scalability:** Managing 45 relational PostgreSQL tables required rigorous schema design. Applying B-Tree indexes on high-frequency search fields achieved a **99.4% index hit rate** and limited P95 query latencies to **11.4ms**.

## 3. SECURITY ENGINEERING
*   **Zero-Trust Session Management:** JWT session tokens are stored in HTTP-Only, SameSite secure cookies, preventing Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).
*   **Timing Attack Mitigation:** Utilizing constant-time byte comparisons (`crypto.timingSafeEqual`) for JWT signature verification prevents timing side-channel analysis.

## 4. CONCLUSION & IMPACT
Algora proves that complex educational workflows can be executed with high performance, robust security, and cost-controlled AI integrations. It serves as a comprehensive portfolio asset for senior full-stack and backend engineering roles.
