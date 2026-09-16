# Algora Quick Start Guide

This guide gets your local development environment for Algora running in under 5 minutes.

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
*   **Node.js** (v22.0.0 or higher is recommended)
*   **PostgreSQL** (v15.0 or higher)
*   **Redis Server** (v6.0 or higher)
*   **Git**

---

## 🛠️ Step-by-Step Setup

### 1. Clone the Codebase
```bash
git clone https://github.com/your-username/algora.git
cd algora
```

### 2. Configure Environment Variables
Copy the example environment file to create a local `.env`:
```bash
cp .env.example .env
```

Open the `.env` file and provide values for:
*   `DATABASE_URL` (e.g., `postgres://username:password@localhost:5432/algora`)
*   `REDIS_URL` (e.g., `redis://localhost:6379`)
*   `GEMINI_API_KEY` (Get your key from [Google AI Studio](https://aistudio.google.com/))

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Relational Database Migrations
Run the initial SQL schemas and index optimizations to populate your PostgreSQL database:
```bash
# Executing standard database initialization steps
npm run db:migrate
```

### 5. Start Development Servers
Start both the Express backend API router and Vite development server:
```bash
npm run dev
```

*   **Vite Frontend Dev URL:** [http://localhost:3000](http://localhost:3000) (Ingress matches port 3000)
*   **Express API Base Endpoint:** [http://localhost:3000/api](http://localhost:3000/api)

---

## 🧪 Running Verification Suites

Keep your local environment green by running standard audits before making any commits:

```bash
# Run unit and integration tests (Vitest)
npm run test

# Run end-to-end user journey tests (Playwright)
npm run test:e2e

# Run TypeScript compilation and Linter check
npm run lint
```
