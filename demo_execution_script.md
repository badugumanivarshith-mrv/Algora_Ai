# ALGORA PLATFORM — DEMO EXECUTION SCRIPT

**Milestone:** Step-by-Step Live Presentation Script  
**Date:** September 16, 2026  
**Status:** COMPLETE  

---

## 1. TIMED DEMO RUNBOOK (10 MINUTES)

### Minute 0:00 - 1:30 | Introduction & Secure Authentication
*   **Action:** Display the Algora landing page. Click the "Login" button and authenticate via Google OAuth.
*   **Spoken Narrative:** "Welcome to Algora. To begin, I will authenticate securely into our platform using Google OAuth with PKCE. Notice how the token is securely contained within an HTTP-Only cookie, protecting against XSS attacks."
*   **Expected Result:** Instant redirection to the Student Dashboard.

### Minute 1:30 - 4:00 | Adaptive Learning & Coding Workspace
*   **Action:** Navigate to the Learning Track, open a data structures module, and launch the Coding Workspace IDE.
*   **Spoken Narrative:** "Here is our interactive learning workspace. We are viewing an algorithm problem. I will write a deliberate syntax error in our TypeScript editor and click 'Run Code'."
*   **Expected Result:** The sandboxed compiler flags the error and displays terminal failure logs.

### Minute 4:00 - 6:30 | Socratic AI Advisor & Redis Caching
*   **Action:** Click the "Ask AI Mentor" sidebar panel. Show the Socratic response. Highlight the Redis MD5 cache hit telemetry.
*   **Spoken Narrative:** "Instead of writing the code for the student, our Socratic AI Advisor guides them with conceptual prompts. Furthermore, to control API costs and latency, identical prompt queries are cached in Redis via MD5 hashing, returning responses in under 18ms."
*   **Expected Result:** A progressive hint appears without giving away the direct solution.

### Minute 6:30 - 8:30 | Real-Time Collaboration Hub
*   **Action:** Open the Enterprise Collaboration module and demonstrate WebSocket-backed room synchronization.
*   **Spoken Narrative:** "Algora also simulates modern engineering team environments. Using persistent WebSockets, multiple developers can code together in real-time, review pull requests, and collaborate on shared whiteboards."
*   **Expected Result:** Active WebSocket channel status indicators showing synchronized state.

### Minute 8:30 - 10:00 | Recruiter Talent Marketplace & Digital Twin
*   **Action:** Log out, log in as a recruiter, and view the Talent Marketplace candidate profile.
*   **Spoken Narrative:** "Finally, all student coding telemetry feeds into our Talent Marketplace. Recruiters can inspect candidate Digital Twins—comprehensive cognitive profiles showing verified debugging speed and problem-solving metrics. Thank you, and I am ready for questions."
*   **Expected Result:** Candidate profile dashboard displaying verified execution telemetry.
