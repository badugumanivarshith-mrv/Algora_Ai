# ALGORA PLATFORM — LIVE DEMO GUIDE

**Milestone:** Live Practical Verification & Demo Runbook  
**Date:** September 16, 2026  
**Status:** READY FOR LIVE RUNS  

---

## 1. CORE DEMO FLOW SCRIPTS

This runbook guides you step-by-step through presenting Algora's complete user lifecycle.

```text
  [ START: LANDING PAGE ] ────> [ AUTHENTICATE: GOOGLE OAUTH ] ────> [ STUDENT DASHBOARD ]
                                                                             │
                                                                             ▼
  [ SOCRATIC AI MENTOR ] <──── [ TRIGGER COMPILE FAILURE ] <──── [ OPEN CODING WORKSPACE ]
            │
            ▼
  [ RECRUITER PORTAL ] ───> [ COGNITIVE DIGITAL TWIN ] ───> [ ADMIN OBSERVABILITY MONITORS ]
```

---

## 2. DETAILED STEP-BY-STEP RUNBOOK

### Step 1: Secure Authentication
*   **Action:** Navigate to the main Landing Page. Click the "Login" button and authenticate via the Google OAuth flow.
*   **Expected Outcome:** The page redirects instantly to the unified Student Dashboard. Explain how the frontend checks session tokens securely via HTTP-Only, SameSite cookies.

### Step 2: Adaptive Learning Track
*   **Action:** Click the "Learning Track" menu on the sidebar. Open a programming problem (e.g., "Implement Binary Search").
*   **Expected Outcome:** The custom Web IDE compiles and loads the problem description, standard test cases, and a terminal editor.

### Step 3: Trigger Sandboxed Compile Failure
*   **Action:** Inside the IDE editor, write a deliberate syntax error (e.g., omitting a closing bracket `}`). Click the "Run Code" button.
*   **Expected Outcome:** The sandboxed compiler flags the compile error and outputs the specific logs to the terminal pane.

### Step 4: Socratic AI Mentor Guidance
*   **Action:** Click the "Ask AI Mentor" sidebar panel.
*   **Expected Outcome:** The AI Mentor provides a Socratic hint pointing out the missing brace without writing the code for you. Highlight that this request is hashed via MD5 and cached in Redis, returning the answer in under 18ms. Correct the brace, click run, and show the passing test cases.

### Step 5: Recruiter Showcase & Digital Twin
*   **Action:** Log out, then log in as an Admin/Recruiter. Navigate to the Talent Marketplace. Search for the candidate.
*   **Expected Outcome:** The candidate's cognitive "Digital Twin" profile displays, highlighting their verified compilation speed, error recovery statistics, and conceptual mastery index.

---

## 3. FAILSAFE BACKUP PROCEDURES

*   **Scenario A: Upstream Google Gemini API Outage**
    *   *Backup Path:* The backend API router includes an automated fallback chain: `gemini-3.6-flash` -> `gemini-3.7-flash` -> `gemini-flash-latest`. If all external models fail, show the cached local responses in Redis.
*   **Scenario B: Local Redis Server Disconnect**
    *   *Backup Path:* Show the Express gateway's local in-memory fallback cache, which continues to validate active user sessions without crashing the server.
