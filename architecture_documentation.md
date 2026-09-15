# ALGORA PLATFORM — ARCHITECTURE DOCUMENTATION

**Version:** V5.1.0  
**Date:** September 15, 2026  

---

## 1. SYSTEM OVERVIEW
Algora is a full-stack, enterprise-grade AI-powered learning, coding, and career platform built with React 18, Vite, Tailwind CSS, Node.js, Express, PostgreSQL, and Redis.

## 2. COMPONENT TOPOLOGY
* **Client Tier:** Single-page React application served via Vite / Nginx reverse proxy.
* **API Tier:** Express.js REST server handling authentication, AI proxying, submissions, and analytics.
* **Persistence Tier:** PostgreSQL database for relational records and user state; Redis for session and caching layers.
