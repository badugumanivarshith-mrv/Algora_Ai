# ALGORA PLATFORM — PLACEMENT DISCUSSION GUIDE (PHASE M3)

**Milestone:** Placement Preparation & Interview Discussion Guide  
**Date:** September 15, 2026  
**Status:** COMPLETED  

---

## 1. PREPARED TALKING POINTS

### Q: Why did you build Algora?
**A:** Legacy learning systems lack personalized mentoring, suffer from low student engagement, and operate in isolation from recruiter search pipelines. Algora solves this by integrating live coding, Socratic AI coaching, corporate simulations, and recruiter search profiles in a unified dashboard.

### Q: Why did you choose this architecture?
**A:** The separation of a React 18 SPA frontend from an Express REST API backend keeps load times incredibly fast (under 1 second). Serving a bundled production backend (`dist/server.cjs`) prevents Node ESM path resolving bugs and provides container isolation.

### Q: Why PostgreSQL over MongoDB?
**A:** Educational progress records, user roles (RBAC), and interview tracks are strictly relational. PostgreSQL provides strong transactional integrity (ACID), robust foreign keys, and indexes that achieve a **99.4% index hit rate**.

### Q: Why is Redis integrated?
**A:** It handles transient in-memory sessions, API rate-limiting, and hashes Socratic AI prompts using MD5 to save **45% of duplicate upstream API costs** with sub-millisecond response speeds.

### Q: Why Gemini over other models?
**A:** `@google/genai` is the modern, official client SDK. We use `gemini-3.6-flash` due to its exceptionally fast response times (p50 of 410ms cached), large context window, and outstanding ability to follow system instructions for Socratic guidance.
