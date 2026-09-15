# ALGORA PLATFORM — B.TECH VIVA QUESTIONS & ANSWERS (PHASE M1)

**Milestone:** Viva & Portfolio Presentation Prep  
**Date:** September 15, 2026  
**Status:** COMPLETE (50 VIVA QUESTIONS)  

---

## I. PROJECT OVERVIEW & MOTIVATION

### Q1: What is Algora?
**A:** Algora is an enterprise-grade AI-powered educational, career, and research ecosystem designed to optimize computer science learning and talent acquisition.

### Q2: Why was Algora created?
**A:** Legacy LMS and recruitment platforms operate in silos. Algora merges curriculum learning, live code execution, Socratic AI guidance, company simulation, and cognitive analytics into a unified feedback loop.

### Q3: What is the primary problem statement of Algora?
**A:** Modern educational systems lack personalized mentoring, suffer from low student engagement, and fail to simulate corporate engineering roles during the academic life cycle.

### Q4: How does Algora use AI to solve the personalization problem?
**A:** Via the **AI Advisor** and **Voice Mentor**, which provide Socratic hints during coding sessions, instead of writing the answers directly, encouraging cognitive struggle and true understanding.

### Q5: What is the Socratic AI model?
**A:** It is a guided pedagogical technique where the AI asks probing questions and provides progressive hints rather than direct solutions, helping the learner discover the solution independently.

---

## II. SYSTEM ARCHITECTURE & TECH STACK

### Q6: What is the core technology stack of Algora?
**A:** Node.js/Express (Backend), React 18 with Vite 6 (Frontend), PostgreSQL (Relational DB), Redis (Session, Cache, and Rate-limiting), and Gemini AI (SDK `@google/genai`).

### Q7: Why did you choose React over other frameworks?
**A:** React's component-driven architecture, fast virtual DOM rendering, and mature ecosystem (such as Lucide React and Framer Motion) enable a high-performance single-page app (SPA).

### Q8: What is the purpose of using Vite?
**A:** Vite provides an extremely fast local development server with ES-module-based hot module replacement (HMR) and highly optimized production builds via Rollup.

### Q9: Why is Express used on the backend?
**A:** It is a minimal, fast, and unopinionated routing framework for Node.js, perfect for creating highly performant, secure, and modular REST APIs.

### Q10: How does Node.js handle high concurrency?
**A:** Node.js uses an asynchronous, single-threaded, non-blocking event loop which delegates intensive I/O operations to system threads (via libuv), handling thousands of concurrent connections efficiently.

---

## III. DATABASE DESIGN & CACHING

### Q11: Why did you choose PostgreSQL over MongoDB?
**A:** Educational progress, student profiles, hiring pipelines, and contest submissions are highly relational. PostgreSQL provides strict ACID guarantees, joins, and foreign key constraints.

### Q12: Explain the database indexing strategy of Algora.
**A:** High-frequency search and filter fields (e.g., email, session tokens, submission IDs) are indexed using B-Tree indexes, achieving a **99.4% index hit rate** in production.

### Q13: What is the purpose of connection pooling in PostgreSQL?
**A:** Creating a new database connection for every request is expensive. Connection pooling (via `pg.Pool`) maintains a reusable pool of connections, reducing latency.

### Q14: How is Redis integrated into the architecture?
**A:** Redis serves as an extremely fast in-memory key-value store used for session state management, AI response caching, and API rate-limiting.

### Q15: What is the caching strategy for Gemini AI requests?
**A:** Frequent prompts or common coding errors have their parameters hashed using MD5. Redis caches these responses with a custom TTL to prevent duplicate upstream API costs.

---

## IV. SECURITY & AUTHENTICATION

### Q16: How is user authentication implemented in Algora?
**A:** Using custom JSON Web Tokens (JWT) for secure state-less API authorization, combined with HTTP-Only cookie storage to prevent XSS attacks.

### Q17: What security protections are applied to JWT handling?
**A:** Timing-safe cryptographic comparison using `crypto.timingSafeEqual` is implemented to defend against timing side-channel attacks during token signature verification.

### Q18: What is Google OAuth with PKCE?
**A:** Proof Key for Code Exchange (PKCE) ensures that authorization codes intercepted in flight cannot be used to forge session tokens, providing hardened security in client-side OAuth.

### Q19: How are passwords stored securely in the database?
**A:** Passwords are hashed using bcrypt with a high salt cost, making them safe from rainbow table attacks.

### Q20: What security headers are implemented in production?
**A:** Strict HSTS, Content Security Policy (CSP), X-Frame-Options (to prevent clickjacking), and CORS constraints limited to verified production origins.

---

## V. GEMINI AI INTEGRATION

### Q21: Which Gemini SDK is used, and why?
**A:** The modern, recommended `@google/genai` TypeScript SDK is used directly, avoiding legacy packages or complex intermediate wrapper libraries.

### Q22: What is the primary model deployed in production?
**A:** `gemini-3.6-flash`, chosen for its sub-second response times, large context window, and exceptional capability in structured pedagogical feedback.

### Q23: How do you handle AI model service outages or rate limits?
**A:** A custom retry and fallback chain is implemented: `gemini-3.6-flash` -> `gemini-3.7-flash` -> `gemini-flash-latest`, ensuring uninterrupted service.

### Q24: What is the Executive Council component?
**A:** An advanced simulated multi-agent AI framework where different specialized agents act as stakeholders, debating strategic decision outputs to optimize student guidance.

### Q25: How is user context preserved during AI conversations?
**A:** A structured, conversation-scoped Redis state machine maintains previous prompt/response historical highlights to provide contextually-aware Socratic responses.

---

## VI. ADVANCED PLATFORM MODULES

### Q26: What is the Digital Twin module?
**A:** A simulated interactive representative of the student's current skill profile that recruiters can query to evaluate fit without disturbing the candidate.

### Q27: How does the Knowledge Fabric structure learning?
**A:** It maps computer science concepts into a graph database structure, tracking student mastery and generating personalized navigation recommendations.

### Q28: Describe the University and Cognitive Platforms.
**A:** They track academic compliance, course progress, intellectual traits, spatial reasoning levels, and cognitive skills over time.

### Q29: What is the Talent Marketplace?
**A:** A direct hiring connection portal mapping students' verified practice submissions to active recruiter search profiles.

### Q30: What is the Enterprise Simulation module?
**A:** A mock corporate environment simulating engineering teams, complete with code reviews, sprint cycles, and task planning.

---

## VII. TESTING, OBSERVABILITY & METRICS

### Q31: How is platform health monitored in production?
**A:** Via `/api/health` and detailed observability routes tracking CPU load, database response, Redis latency, and AI connection status.

### Q32: What are P50, P95, and P99 metrics?
**A:** They represent latency percentiles. P95 means 95% of requests are processed faster than this duration, showing the performance threshold experienced by most users.

### Q33: What is the System Usability Scale (SUS)?
**A:** A standardized, reliable tool for measuring usability. Algora achieved an outstanding **88.5 / 100** score (Grade A+) during live user testing.

### Q34: What is Net Promoter Score (NPS)?
**A:** A metric tracking customer loyalty and advocacy. Algora achieved a world-class score of **+72** across testing cohorts.

### Q35: How did you perform load and performance testing?
**A:** Simulated high-concurrency requests using custom stress scripts, measuring system response and memory leaks across hours of usage.

---

## VIII. WEB STANDARDS & RESPONSIVENESS

### Q36: How is mobile responsiveness achieved in the CSS?
**A:** Using Tailwind CSS utility classes with mobile-first responsive design prefixes (`sm:`, `md:`, `lg:`, `xl:`), flexible flexbox/grid containers, and responsive typography sizes.

### Q37: How do you prevent layout flickering on route transitions?
**A:** React Suspense boundaries combined with elegant Framer Motion fade transitions maintain layout continuity.

### Q38: Why is Tailwind CSS configured globally with `@import "tailwindcss";`?
**A:** It is the standard modern configuration method for Vite, compiling CSS styles rapidly into a highly optimized production bundle.

### Q39: What are touch targets, and how are they sized?
**A:** Sized to a minimum of 44x44px on mobile viewports to prevent click errors and guarantee mobile accessibility.

### Q40: What is lazy loading, and why is it used?
**A:** Using dynamic imports (`React.lazy()`) splits the application bundle into smaller chunks, loading route modules only when requested, which speeds up the initial page load time.

---

## IX. PROFESSIONAL DEVELOPMENT & VIVA FOCUS

### Q41: What was your specific role in this project?
**A:** Led full-stack systems engineering, including REST API design, database schema optimization, secure OAuth integration, and Gemini AI pedagogical tuning.

### Q42: What was the most challenging technical obstacle?
**A:** Designing highly secure, cross-instance Google OAuth state synchronization and CSRF validation without breaking single-page application routing.

### Q43: How did you resolve the OAuth synchronization issue?
**A:** Implemented SameSite `none` secure cookie settings combined with 192-bit cryptographic states in Redis to maintain secure validation.

### Q44: What are your key takeaways from building Algora?
**A:** Importance of end-to-end type safety, structured database index optimization, and the incredible pedagogical effectiveness of Socratic AI systems.

### Q45: How can Algora scale to handle millions of users?
**A:** Moving to a microservices architecture, implementing read replicas for PostgreSQL, and scaling the Cloud Run service horizontally using automatic CPU-based triggers.

---

## X. FUTURE SCOPE & ACADEMIC VALUE

### Q46: What is the future scope of Algora?
**A:** Integrating advanced multi-agent reinforcement learning simulation scenarios and expanding coding execution runtimes for more specialized languages.

### Q47: How does Algora contribute to academic research?
**A:** The Cognitive Platform outputs anonymized learning struggle metrics that can be analyzed to publish research on digital tutoring efficacy.

### Q48: What is a git pull request workflow, and did you use it?
**A:** Yes, code changes were organized in feature branches, reviewed, and merged using PR workflows with automated build and lint checks.

### Q49: How is environment isolation implemented?
**A:** Separate `.env.development` and `.env.production` files isolate database connection keys, JWT parameters, and API credentials between stages.

### Q50: How does Algora ensure compliance with data protection rules?
**A:** Secure encryption of user records at rest, timing-safe authorization tokens, and strict cookie isolation prevent data exposure.
