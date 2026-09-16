# ALGORA PLATFORM — PROJECT HANDOVER PACKAGE

**Milestone:** Phase P5 Official Project Handover  
**Date:** September 16, 2026  
**Status:** COMPLETED & HANDOVER READY  

---

## 1. PROJECT OVERVIEW & HANDOVER SUMMARY
Algora V5.1.0 is an enterprise-grade, full-stack computer science education and recruitment platform. This handover package provides the necessary documentation and architectural maps for incoming maintainers, academic evaluators, or engineering leads.

---

## 2. ARCHITECTURE & TECHNOLOGY SUMMARY
*   **Frontend Client:** React 19, Vite 6, Tailwind CSS 4 (`/src`)
*   **Backend Gateway:** Node.js, Express, WebSockets (`/backend/src`)
*   **Persistence Layer:** PostgreSQL managed via Drizzle ORM (`/backend/src/db`)
*   **Caching & Rate Limiting:** Redis v7 (`/backend/src/config/redis.ts`)
*   **AI Integration:** Official `@google/genai` Gemini SDK (`gemini-3.6-flash`)

---

## 3. REPOSITORY STRUCTURE & RESPONSIBILITIES
*   `/src/` — Client-side SPA views, components, and router definitions.
*   `/backend/src/` — REST controllers, WebSocket handlers, and service logic.
*   `/backend/src/db/` — Database schema models and sequential SQL migrations.
*   Root Markdown Guides — Comprehensive documentation covering architecture, deployment, viva preparation, and maintenance strategies.
