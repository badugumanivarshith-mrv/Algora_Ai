# Algora — Viva Voce Preparation Guide

This guide compiles common viva/thesis defense questions along with technical, evidence-backed answers for the Algora project.

---

## 🏛️ 1. Core Architecture & System Design

### Q1: Why did you separate the frontend and backend instead of building a monolithic application?
**A:** "A decoupled architecture ensures a clean separation of concerns, independent scaling, and faster client-side rendering. The React frontend is served as static, highly optimized bundles that render immediately in the browser. The Express backend focuses entirely on processing API queries, managing database connections, and coordinating Socratic AI completions. This separation allows us to scale backend compute resources independently of asset delivery."

### Q2: What is the purpose of bundling the Express server into `dist/server.cjs` via `esbuild`?
**A:** "In modern Node.js, resolving ES Module imports at runtime can introduce filesystem overhead and path-resolving issues in production containers. Compiling the entire TypeScript backend into a single, bundled CommonJS file (`dist/server.cjs`) resolves relative import paths at build-time, improves server start times, and reduces the final Docker image size."

---

## 🗄️ 2. Database & Cache Tier

### Q3: Why did you choose PostgreSQL over a NoSQL database like MongoDB?
**A:** "Algora's data schema is strictly relational. Student profiles, course progression paths, submission histories, and contest results are deeply interconnected. Relational databases with foreign-key constraints ensure transactional integrity (ACID). NoSQL databases lack structural safety for these scenarios, leading to data drift and inconsistent states."

### Q4: How did you achieve a 99.4% PostgreSQL query index hit rate?
**A:** "We analyzed our query log telemetry to identify high-frequency search parameters, such as `email` on login, `session_token` on API validation, and `submission_id` on compilation fetches. By applying selective B-Tree indexes to these fields, we ensured that nearly all queries are resolved via memory-cached indexes rather than slow, full-table sequential scans."

### Q5: What roles does Redis play in your architecture?
**A:** "Redis serves three main roles in our system:
1.  **Session Cache:** Stores user login states for sub-millisecond session validation.
2.  **Rate Limiter:** Implements rolling-window limits to protect sensitive API endpoints.
3.  **Prompt Caching:** Hashes incoming Socratic AI requests using MD5 to match cached results immediately, avoiding unnecessary upstream AI API fees."

---

## 🤖 3. Artificial Intelligence & Prompt Tuning

### Q6: How does your Socratic AI Mentor work, and how does it avoid giving students direct answers?
**A:** "The AI Mentor uses Google's `@google/genai` SDK and the `gemini-3.6-flash` model. We configure the model with strict system instructions to act as a supportive, Socratic tutor. When a student encounters a bug, the prompt includes the code context and compilation errors. The model is instructed to output sequential hints and conceptual debugging questions rather than copy-paste code blocks."

### Q7: What is your fallback mechanism if the primary Gemini model encounters an outage or rate limit?
**A:** "We implemented an automated fallback chain. If `gemini-3.6-flash` fails or returns a rate-limit error (HTTP 429), the API router automatically retries the request using `gemini-3.7-flash` and, as a last resort, `gemini-flash-latest`. This ensures continuous availability for active students."

---

## 🛡️ 4. Security & Hardening

### Q8: What are timing attacks, and how does `crypto.timingSafeEqual` prevent them?
**A:** "A timing attack is a side-channel attack where an adversary measures the exact time a server takes to validate a cryptographic token. Standard string comparisons (`===`) exit early on the first mismatched character. This allows attackers to guess a signature character-by-character by measuring small differences in processing times. `crypto.timingSafeEqual` performs a constant-time comparison across the entire byte length, ensuring that comparisons take the same time regardless of when a mismatch occurs, neutralizing timing analysis."

### Q9: How do you protect against Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF)?
**A:** "We contain session JWTs inside HTTP-Only, Secure, SameSite cookies. The `httpOnly` flag blocks client-side JavaScript from accessing the cookie, neutralizing XSS token theft. The `sameSite` flag ensures that the browser only attaches the cookie to requests originating from our verified domain, defending against CSRF exploits."

---

## ☁️ 5. Deployment & Cloud Topology

### Q10: Describe your Docker container optimization strategy.
**A:** "We utilize a multi-stage Docker build. The build phase pulls full development dependencies, compiles TypeScript, and builds Vite bundles. The final stage copies only the static `dist/` directories, compiled server scripts, and lightweight production-only modules into a slim Node.js base image. This keeps our production image under 200MB, minimizing cold-start latencies on Google Cloud Run."
