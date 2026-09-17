# FRONTEND REALITY REPORT

**Milestone:** Independent Architecture Audit — Frontend Source Analysis  
**Date:** September 17, 2026  
**Status:** VERIFIED FROM SOURCE CODE  

---

## 1. FRONTEND INVENTORY SUMMARY

An empirical audit of `/src` reveals the following verified file counts:

| Category | Count | Directory / Source |
| :--- | :--- | :--- |
| **Total Frontend Files** | 134 | All files under `/src` |
| **React Pages** | 38 | `/src/pages/*` and subdirectories (`admin/`, `ai/`) |
| **React Components** | 57 | `/src/components/*` and subdirectories (`admin/`, `aios/`, `auth/`, `collaboration/`, `learning/`, `personalization/`, `profile/`, `workspace/`) |
| **API Services & Clients** | 25 | `/src/services/*` |
| **Static Data / Config** | 2 | `/src/data/` (`curriculum.ts`, `problems.ts`) |

---

## 2. DETAILED FILE PATHS & REASONS COUNTED

### A. React Pages (38 Files)
1. `src/pages/AdaptiveRoadmapV2.tsx` — Dynamic AI-driven study path renderer.
2. `src/pages/admin/AdminDashboard.tsx` — Administrative management and telemetry dashboard.
3. `src/pages/ai/AIAssignmentGenerator.tsx` — AI assignment builder interface.
4. `src/pages/ai/AIContestGenerator.tsx` — AI programming contest generation view.
5. `src/pages/ai/AIInterviewGenerator.tsx` — Mock AI interview session orchestrator.
6. `src/pages/ai/AIProblemGenerator.tsx` — AI coding problem generator interface.
7. `src/pages/ai/AIQuizGenerator.tsx` — AI-powered quiz assessment creator.
8. `src/pages/AIAnalyst.tsx` — Deep analytics and AI performance insights.
9. `src/pages/AIMentor.tsx` — Socratic AI mentor chat interface.
10. `src/pages/AIOSHub.tsx` — Advanced AI Operating System orchestration hub.
11. `src/pages/CareerHub.tsx` — Career tracking, resume building, and job matching.
12. `src/pages/Certifications.tsx` — Credential verification and certification display.
13. `src/pages/CognitiveHub.tsx` — Cognitive intelligence and learning DNA diagnostics.
14. `src/pages/CollaborationWorkspace.tsx` — Live multi-user collaboration space.
15. `src/pages/Community.tsx` — Student discussions and community forums.
16. `src/pages/CompanyPrep.tsx` — Company-specific technical interview preparation.
17. `src/pages/ContestHub.tsx` — Competitive programming contests list and leaderboard.
18. `src/pages/Contest.tsx` — Active contest problem-solving arena.
19. `src/pages/DailyReview.tsx` — Spaced repetition and daily skill review.
20. `src/pages/Dashboard.tsx` — Main user learning and progress dashboard.
21. `src/pages/EnterpriseHub.tsx` — Institutional and enterprise recruitment hub.
22. `src/pages/ExecutionCenter.tsx` — Code execution telemetry and benchmark viewer.
23. `src/pages/Faculty.tsx` — Educator and faculty management view.
24. `src/pages/HiringHub.tsx` — Recruiter candidate screening portal.
25. `src/pages/InterviewHub.tsx` — Technical interview practice suite.
26. `src/pages/Landing.tsx` — Public landing page for unauthenticated visitors.
27. `src/pages/Leaderboard.tsx` — Global and contest rankings.
28. `src/pages/LearningIntelligence.tsx` — Advanced learning analytics and metrics.
29. `src/pages/Learning.tsx` — Curriculum modules and problem exploration.
30. `src/pages/PlacementHub.tsx` — Campus placement and drive management.
31. `src/pages/Profile.tsx` — User profile, settings, and connected accounts.
32. `src/pages/ProjectWorkspaceHub.tsx` — Full-stack project building workspace.
33. `src/pages/ResearchLab.tsx` — AGI research lab and experimentation dashboard.
34. `src/pages/SimulationHub.tsx` — Enterprise and startup career simulations.
35. `src/pages/TalentMarketplaceHub.tsx` — Talent network and recruiter matching.
36. `src/pages/UniversityHub.tsx` — University curriculum and degree progress.
37. `src/pages/VoiceMentor.tsx` — Real-time voice AI coaching interface.
38. `src/pages/Workspace.tsx` — Primary code editor and problem-solving workspace.

### B. Route Definitions
*   `src/routes.tsx` — Centralized route mapping connecting URL paths to the 38 page components with React Router.
*   `src/App.tsx` — Root application wrapper incorporating layout providers, theme context, and route mounting.

### C. Frontend Services (25 Files)
Located under `src/services/`:
`adaptiveApi.ts`, `adaptiveLearningApi.ts`, `adminApi.ts`, `aiosApi.ts`, `aiService.ts`, `apiClient.ts`, `careerApi.ts`, `cognitiveApi.ts`, `collaborationApi.ts`, `communityService.ts`, `companyPrepApi.ts`, `contestApi.ts`, `enterpriseService.ts`, `gamificationApi.ts`, `hiringApi.ts`, `judgeService.ts`, `learningIntelligenceApi.ts`, `learningMemoryApi.ts`, `oauthApi.ts`, `projectWorkspaceApi.ts`, `realtimeClient.ts`, `researchApi.ts`, `talentMarketplaceApi.ts`, `universityApi.ts`, `voiceMentorApi.ts`.
