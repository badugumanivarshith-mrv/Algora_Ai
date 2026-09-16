# ALGORA PLATFORM — VIVA PREPARATION GUIDE (75+ Q&As)

**Milestone:** Comprehensive Technical Viva & Project Defense Q&A Manual  
**Date:** September 16, 2026  
**Status:** COMPLETE (75 Verified Questions & Answers)  

---

## SECTION 1: FRONTEND ARCHITECTURE (Q1 - Q12)

### Q1: Why did you choose React 19 over older versions or alternative frameworks?
**A:** React 19 introduces advanced Concurrent Mode capabilities, allowing non-blocking UI rendering and improved state transitions. This keeps our code editor and real-time collaboration canvas responsive even under heavy computational load.

### Q2: What are the advantages of Vite 6 over traditional bundlers like Webpack?
**A:** Vite 6 leverages native ES Modules during development to provide instant Hot Module Replacement (HMR). For production, it uses Rollup to generate optimized, tree-shaken static bundles, significantly speeding up build times.

### Q3: How is responsive layout handled across different screen sizes?
**A:** We use Tailwind CSS 4 utility classes with mobile-first breakpoints (`sm:`, `md:`, `lg:`, `xl:`), ensuring seamless adaptation from mobile devices to widescreen desktop monitors.

### Q4: Why is styling handled via Tailwind CSS rather than inline styles or CSS-in-JS?
**A:** Tailwind extracts utility classes into a highly compressed static CSS file at build-time. This eliminates runtime JavaScript style injection overhead and improves browser rendering performance.

### Q5: Explain the purpose of code-splitting via React lazy loading.
**A:** Route-specific components are loaded on demand using `React.lazy()` and `Suspense`. This reduces initial bundle size, keeping initial page load times under 1 second.

### Q6: How do you prevent memory leaks in useEffect hooks with asynchronous tasks?
**A:** We use cleanup functions or AbortController instances within `useEffect` hooks to cancel pending network requests or clear active timers when components unmount.

### Q7: What is the role of React Refs (`useRef`) in the coding workspace?
**A:** Refs provide direct access to underlying DOM elements—such as scrolling terminal output to the latest line or measuring canvas dimensions—without triggering unnecessary component re-renders.

### Q8: How does Algora ensure sufficient contrast for accessibility (WCAG AA)?
**A:** All text and background color pairs are audited to meet or exceed the WCAG AA contrast ratio of 4.5:1, ensuring legibility for visually impaired users across light and dark themes.

### Q9: How is client-side routing managed?
**A:** We use a custom, lightweight routing module (`/src/routes.tsx`) that maps URL paths to page views while managing role-based access control (RBAC).

### Q10: What is the advantage of using Lucide React for iconography?
**A:** Lucide React provides tree-shakable, lightweight SVG icon components that integrate seamlessly with Tailwind CSS styling and color inheritance.

### Q11: How do you handle global state across disparate component trees?
**A:** We use React Context providers (such as `ThemeContext` and Auth contexts) for lightweight global states, avoiding prop drilling while keeping state transparent.

### Q12: How are syntax errors caught in the frontend code before user submission?
**A:** TypeScript static type checking and ESLint rules catch type mismatches and syntax errors at compile-time during development and CI/CD builds.

---

## SECTION 2: BACKEND ARCHITECTURE (Q13 - Q25)

### Q13: Explain Node.js's event loop and how it handles asynchronous I/O.
**A:** Node.js executes JavaScript on a single thread while offloading heavy I/O operations (file system, network sockets) to libuv system threads, enabling non-blocking concurrent request handling.

### Q14: What is the purpose of the backend build command: `esbuild server.ts --bundle --platform=node`?
**A:** It bundles the entire TypeScript backend into a single CommonJS file (`dist/server.cjs`), resolving relative paths at build-time and reducing container startup times.

### Q15: How does the Express gateway handle unhandled routing exceptions?
**A:** A centralized error-handling middleware catches unhandled exceptions, logs structured error traces, and returns standardized JSON error responses without crashing the server process.

### Q16: What is the difference between stateless REST endpoints and stateful WebSockets?
**A:** REST endpoints handle request-response operations like authentication and fetching problem details. WebSockets maintain persistent, bi-directional channels for real-time collaboration and contest leaderboards.

### Q17: How are API routes protected against Distributed Denial of Service (DDoS) attacks?
**A:** We implement Redis-backed rate-limiting middleware that tracks IP request frequencies and blocks traffic exceeding configured rate thresholds.

### Q18: Why is the server configured to listen on port 3000?
**A:** Our container infrastructure and Nginx reverse proxy layer are configured to route external ingress traffic exclusively to port 3000.

### Q19: What is the advantage of end-to-end TypeScript across both client and server?
**A:** It enforces shared data contracts and type safety across API requests and database models, eliminating runtime property undefined errors.

### Q20: How are environment secrets managed securely?
**A:** Secrets like database connection strings and AI keys are stored in environment variables (`.env`) and accessed via `process.env`, keeping them out of source control.

### Q21: What is middleware in Express, and how is it structured?
**A:** Middleware functions have access to `req`, `res`, and `next()`, allowing them to execute authentication checks, logging, and request body parsing before reaching route controllers.

### Q22: How does the backend handle graceful shutdowns on container termination?
**A:** Process signal listeners (`SIGTERM`, `SIGINT`) intercept shutdown signals, close active database connection pools gracefully, and stop accepting new requests before exiting.

### Q23: How are HTTP request bodies parsed and validated?
**A:** Express body-parser middleware parses JSON payloads, which are then validated against expected DTO schemas before database insertion.

### Q24: What is request logging, and why is it important for observability?
**A:** Request logging records incoming HTTP methods, endpoints, response statuses, and latencies, enabling system monitoring and performance bottleneck diagnosis.

### Q25: How does the backend delegate heavy CPU tasks without blocking the event loop?
**A:** Heavy execution tasks—such as running user code snippets—are offloaded to isolated worker processes or sandboxed execution engines.

---

## SECTION 3: DATABASE DESIGN & ORM (Q26 - Q38)

### Q26: Why was PostgreSQL chosen as the primary relational database?
**A:** PostgreSQL provides strict ACID compliance, robust relational integrity, foreign key constraints, and advanced indexing, making it ideal for interconnected academic and recruitment data.

### Q27: How many tables are modeled in the Algora database schema?
**A:** The database schema consists of **45 relational tables**, covering users, authentication sessions, problem catalogs, submissions, adaptive learning nodes, and recruiter telemetry.

### Q28: What is Drizzle ORM, and what are its benefits?
**A:** Drizzle ORM is a lightweight, type-safe TypeScript SQL toolkit. It translates TypeScript queries into optimized SQL at compile-time, combining raw SQL performance with type safety.

### Q29: What is connection pooling, and why is it critical?
**A:** Connection pooling maintains a pool of reusable database connections, avoiding the overhead of establishing new TCP connections for every incoming API request.

### Q30: What is a B-Tree index, and how does it optimize queries?
**A:** A B-Tree index is a balanced tree data structure that allows PostgreSQL to locate rows in logarithmic time ($O(\log N)$) rather than performing sequential table scans ($O(N)$).

### Q31: How was a 99.4% database query index hit rate achieved?
**A:** By analyzing query execution plans and applying selective B-Tree indexes on high-frequency search fields (`email`, `session_token`, `submission_id`).

### Q32: What is a database migration?
**A:** A migration is a version-controlled SQL script that modifies database schemas incrementally, ensuring schema consistency across development and production environments.

### Q33: How do foreign key constraints maintain relational integrity?
**A:** Foreign keys ensure that child records (e.g., code submissions) cannot reference non-existent parent records (e.g., deleted users or problems), maintaining data consistency.

### Q34: What is cascading deletion (`ON DELETE CASCADE`)?
**A:** Cascading deletion automatically deletes dependent child records when their parent record is deleted, preventing orphaned rows in relational tables.

### Q35: How are database transactions managed during complex multi-table writes?
**A:** We wrap multi-step write operations in database transaction blocks (`BEGIN`, `COMMIT`, `ROLLBACK`), ensuring atomicity so partial writes are rolled back on failure.

### Q36: What is SQL injection, and how does Algora prevent it?
**A:** SQL injection occurs when malicious input alters query logic. Drizzle ORM and parameterized queries automatically escape user inputs, neutralizing SQL injection vectors.

### Q37: How do you monitor slow database queries in production?
**A:** We track query execution times using database performance logs and Drizzle telemetry wrappers, flagging queries with P95 latencies exceeding thresholds.

### Q38: Why are database timestamps stored in UTC?
**A:** Storing timestamps in Coordinated Universal Time (UTC) prevents timezone discrepancies across distributed servers and user sessions.

---

## SECTION 4: CACHING & REDIS (Q39 - Q48)

### Q39: What is the primary role of Redis in Algora?
**A:** Redis serves as an in-memory key-value data store used for sub-millisecond session validation, API rate limiting, and Socratic AI prompt response caching.

### Q40: How does the AI prompt caching mechanism reduce LLM costs?
**A:** Incoming prompt contexts are serialized and hashed using MD5. The server checks this hash in Redis; on a cache hit, the stored response returns instantly, reducing upstream AI API calls by **45%**.

### Q41: What is Time-to-Live (TTL), and how is it applied in Redis?
**A:** TTL is an expiration timer attached to Redis keys. It ensures transient data—like rate-limiting counters and cached AI responses—automatically expires to free up memory.

### Q42: What cache eviction policy does Redis use when memory is full?
**A:** Redis uses a Least Recently Used (LRU) eviction policy to remove older, infrequently accessed cache keys when memory limits are reached.

### Q43: How does the backend handle Redis connection failures?
**A:** The backend implements an automated in-memory fallback cache. If Redis becomes unreachable, the server falls back to local memory stores to maintain uptime.

### Q44: What is rolling-window rate limiting in Redis?
**A:** It tracks client request counts using atomic increments against keys patterned as `rate:<ip>` with a 60-second TTL, blocking requests exceeding limits.

### Q45: Why is in-memory caching faster than database queries?
**A:** Redis stores data entirely in system RAM, eliminating disk I/O latency and query parsing overhead associated with relational databases.

### Q46: How are session tokens synchronized between Redis and PostgreSQL?
**A:** Validated sessions are cached in Redis for fast validation lookups, while the source of truth is securely persisted in PostgreSQL.

### Q47: What is cache stampede, and how is it mitigated?
**A:** Cache stampede occurs when heavy concurrent requests hit an expired cache key. We mitigate this using request locking and staggered TTLs.

### Q48: How do you inspect Redis cache keys during debugging?
**A:** We use Redis CLI commands (`KEYS`, `GET`, `TTL`) or monitoring tools to inspect active cache keys and memory utilization.

---

## SECTION 5: ARTIFICIAL INTELLIGENCE & GEMINI SDK (Q49 - Q58)

### Q49: Which AI SDK is used in Algora?
**A:** We use the official `@google/genai` TypeScript SDK to integrate Google's Gemini models.

### Q50: Which Gemini model is used as the primary AI engine?
**A:** `gemini-3.6-flash` is used as our primary model due to its high inference speed, large context window, and instruction-following capability.

### Q51: How does the multi-model fallback chain ensure high availability?
**A:** If `gemini-3.6-flash` encounters rate limits or errors, the backend automatically retries requests using `gemini-3.7-flash` and `gemini-flash-latest`.

### Q52: What is Socratic tutoring, and how is it enforced?
**A:** Socratic tutoring guides students through conceptual questions rather than giving direct answers. We enforce this through system prompt instructions that forbid copy-paste code outputs.

### Q53: How is prompt injection prevented in AI interactions?
**A:** User inputs are sanitized, escaped, and structured within JSON control blocks before being passed to the AI model, neutralizing prompt override attempts.

### Q54: Why must the Gemini API key remain strictly server-side?
**A:** Exposing API keys in client-side code allows malicious users to extract and abuse keys, leading to billing theft and service quotas exhaustion.

### Q55: How does the AI advisor handle programming language context?
**A:** The student's selected programming language (Python, C++, JavaScript, TypeScript) and active error logs are injected into the prompt context for language-specific guidance.

### Q56: What is token optimization in LLM applications?
**A:** Token optimization involves stripping unnecessary whitespace, summarizing prior conversation turns, and caching responses to minimize token usage and cost.

### Q57: How do you measure AI response latency?
**A:** We record timestamps immediately before and after invoking the Gemini SDK, logging generation durations to monitor performance.

### Q58: Can the AI advisor generate entire coding assignments?
**A:** Yes, administrative modules use specialized AI prompts to generate comprehensive coding problems with test cases and rubrics.

---

## SECTION 6: SECURITY & AUTHENTICATION (Q59 - Q68)

### Q59: How are user passwords stored securely?
**A:** Passwords are hashed using bcrypt with a high salt rounds factor, protecting them against rainbow table and dictionary attacks.

### Q60: What is Google OAuth with PKCE?
**A:** Proof Key for Code Exchange (PKCE) secures OAuth authorization code flows by using dynamically generated cryptographic verifiers, preventing interception attacks.

### Q61: What are HTTP-Only, SameSite cookies, and why are they used?
**A:** HTTP-Only cookies prevent client-side JavaScript from accessing session tokens (mitigating XSS), while SameSite attributes protect against Cross-Site Request Forgery.

### Q62: What is a timing side-channel attack during token verification?
**A:** An attacker measures response time differences during string comparison to guess secret tokens. Standard `===` exits early on the first mismatched byte.

### Q63: How does Algora prevent timing side-channel attacks?
**A:** We use constant-time cryptographic comparisons (`crypto.timingSafeEqual`) for all signature and token validations, forcing uniform execution time.

### Q64: What is role-based access control (RBAC)?
**A:** RBAC restricts system access based on user roles (Student, Recruiter, Admin), ensuring users only access authorized endpoints and data.

### Q65: What are JWT claims?
**A:** Claims are encoded key-value pairs inside a JWT payload—such as `userId`, `role`, and `exp`—allowing stateless authorization checks at the API gateway.

### Q66: How are CORS (Cross-Origin Resource Sharing) policies configured?
**A:** CORS middleware restricts API access to authorized frontend domains, preventing unauthorized third-party websites from making cross-origin requests.

### Q67: How do you handle session expiration and token refresh?
**A:** Access tokens have short expiration times, and expired sessions prompt users to re-authenticate or use secure refresh tokens.

### Q68: What is input sanitization, and why is it necessary?
**A:** Input sanitization strips malicious HTML/SQL scripts from user-submitted text, protecting against Cross-Site Scripting (XSS) and injection vulnerabilities.

---

## SECTION 7: SYSTEM DESIGN & DEPLOYMENT (Q69 - Q75)

### Q69: What is a multi-stage Docker build?
**A:** A multi-stage build separates the build environment (compilers and dev dependencies) from the runtime environment, copying only production artifacts into a slim container image.

### Q70: Why is Google Cloud Run ideal for deploying Algora?
**A:** Cloud Run is a fully managed serverless container platform that automatically scales instances horizontally based on traffic and scales down to zero when idle.

### Q71: What is the difference between Liveness and Readiness probes?
**A:** Liveness probes check if the container process is running (restarting if dead). Readiness probes check if dependencies (database, Redis) are ready before routing traffic.

### Q72: How do you ensure zero-downtide deployments?
**A:** Using blue-green deployments, where new container instances are booted and health-checked before traffic routes are switched from old instances.

### Q73: How does the application scale to support high user concurrency?
**A:** The stateless Express gateway scales horizontally via container orchestration, while PostgreSQL and Redis can be clustered with read replicas.

### Q74: What is container containerization security best practice?
**A:** Running containers under non-root user accounts, minimizing base image layers, and scanning images for vulnerabilities.

### Q75: How are production logs and errors monitored?
**A:** Errors and performance traces are routed to observability platforms like Sentry, providing real-time alerts and stack trace diagnostics.
