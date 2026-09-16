# ALGORA PLATFORM — KNOWLEDGE TRANSFER GUIDE

**Milestone:** Phase P4 Knowledge Transfer & Onboarding Manual  
**Date:** September 16, 2026  
**Status:** COMPLETED  

---

## 1. PROJECT OVERVIEW & ARCHITECTURE
Algora V5.1.0 is a full-stack computer science education and hiring platform. 
*   **Frontend:** React 19, Vite 6, Tailwind CSS 4 (`/src`)
*   **Backend:** Node.js, Express, WebSockets (`/backend/src`)
*   **Database:** PostgreSQL managed via Drizzle ORM (`/backend/src/db`)
*   **Cache:** Redis v7 for sessions and prompt caching (`/backend/src/config/redis.ts`)

---

## 2. QUICK START & SETUP
1.  Clone repository and install dependencies: `npm install`
2.  Configure environment variables matching `.env.example`.
3.  Run development server: `npm run dev`
4.  Run production build: `npm run build`
