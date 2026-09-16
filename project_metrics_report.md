# Algora — Professional Codebase Metrics Report

This report presents empirical, verified quantitative metrics extracted directly from the Algora V5.1.0 codebase.

---

## 🖥️ 1. Frontend Architecture Metrics

### A. Pages
*   **Root Pages (`/src/pages/*`):** 32 files
*   **Admin Console Pages (`/src/pages/admin/*`):** 1 file (`AdminDashboard.tsx`)
*   **AI Generation Hub Pages (`/src/pages/ai/*`):** 5 files (`AIAssignmentGenerator.tsx`, `AIContestGenerator.tsx`, `AIInterviewGenerator.tsx`, `AIProblemGenerator.tsx`, `AIQuizGenerator.tsx`)
*   **Total Active Pages:** **38**

### B. Components
*   **Layout & Common Components (`/src/components/*`):** 6 files
*   **Admin Control Panels (`/src/components/admin/*`):** 14 files
*   **AIOS Core Interface Panels (`/src/components/aios/*`):** 16 files
*   **Authentication Components (`/src/components/auth/*`):** 2 files
*   **Collaboration Modules (`/src/components/collaboration/*`):** 7 files
*   **Learning Navigation Elements (`/src/components/learning/*`):** 3 files
*   **Personalization & Study Modals (`/src/components/personalization/*`):** 2 files
*   **Profile Integrity Mappings (`/src/components/profile/*`):** 1 file
*   **Code Sandbox & IDE Workspace Components (`/src/components/workspace/*`):** 6 files
*   **Total Active React Components:** **57**

---

## ⚙️ 2. Backend Services & Logic Metrics

### A. Modular API Controllers
*   **Active Route Modules (`/backend/src/routes/*`):** 40 files (including `index.ts`)
*   **Active Express Controllers (`/backend/src/controllers/*`):** 42 files
*   **Total Documented Endpoints:** Approximately **84** REST and WebSockets API endpoints

### B. Business Logic Services
*   **Utility & Core Services (`/backend/src/services/*`):** 16 files
*   **AI, Agent & Simulation Services (`/backend/src/services/ai/*`):** 137 files
*   **Sandbox & Execution Services (`/backend/src/services/execution/*`):** 4 files
*   **Total Active Services:** **157**

---

## 🗄️ 3. Persistence & Cache Metrics

### A. Database Repositories
*   **Data Access Layer Repositories (`/backend/src/repositories/*`):** 67 files (66 active repository classes + 1 router exporter `index.ts`)
*   **Total Active Repository Classes:** **66**

### B. Schema & Migration Files
*   **Relational Database Tables:** **45** active tables
*   **Active Migration Files (`/backend/src/db/migrations/*`):** **12** sequential migration SQL scripts mapping the system schemas from `001_initial_schema.sql` to `039_performance_indexes_and_optimizations.sql`.
