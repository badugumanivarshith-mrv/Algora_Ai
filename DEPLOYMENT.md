# Algora Production Deployment Playbook

This document outlines the deployment strategy, containerization configurations, and CI/CD parameters required to deploy Algora in cloud environments.

---

## 📦 Containerization with Docker

Algora utilizes a multi-stage `Dockerfile` to optimize output image sizes and compile static assets securely.

### Multi-Stage Build Strategy
1.  **Stage 1 (Dependencies Builder):** Installs development dependencies and executes TypeScript compiles.
2.  **Stage 2 (Vite Builder):** Compiles static React client assets and outputs them into the `dist/` directory.
3.  **Stage 3 (Express Builder):** Compiles TypeScript backend files into a highly compressed, bundled CommonJS `/dist/server.cjs` using `esbuild`.
4.  **Stage 4 (Slim Runner):** Copies only `/dist` folders and production `node_modules` into a slim Debian/Node runtime container, reducing the final image footprint to under **200MB**.

---

## 🚀 Deployment to Google Cloud Run

To deploy your containerized Algora service to Google Cloud Run, execute the following commands in your CLI:

### 1. Build and Tag Docker Image
```bash
docker build -t gcr.io/algora-platform/applet:v5.1.0 .
```

### 2. Push Image to Google Artifact Registry
```bash
docker push gcr.io/algora-platform/applet:v5.1.0
```

### 3. Deploy Service to Cloud Run
Configure the container to expose port 3000, as all reverse proxies direct traffic here. Pass the environment secrets securely:

```bash
gcloud run deploy algora-service \
  --image gcr.io/algora-platform/applet:v5.1.0 \
  --platform managed \
  --region asia-southeast1 \
  --port 3000 \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="DATABASE_URL=DATABASE_URL_SECRET:latest,REDIS_URL=REDIS_URL_SECRET:latest,GEMINI_API_KEY=GEMINI_API_KEY_SECRET:latest" \
  --allow-unauthenticated
```

---

## 🗄️ Database Provisioning

### A. PostgreSQL Database Migrations
Always run schema migrations prior to exposing new container revisions to avoid state inconsistency:
```bash
# Launch database migrator inside deployment environment
node dist/migrator.js
```

### B. Index Diagnostics
Verify that B-Tree query indexes are healthy inside the production instance:
```sql
SELECT relname, seq_scan, idx_scan 
FROM pg_stat_user_tables 
WHERE seq_scan > 0;
```
Ensure that the SQL index scans make up >95% of queries to match Algora's **99.4% index hit rate** benchmark.

---

## 📈 Monitoring & Health Controls

*   **Liveness Probe:** Expose a GET request to `/api/health` to confirm the container process is active.
*   **Readiness Probe:** Expose GET `/api/health/detailed` to verify PostgreSQL connection pools are active and Redis is reachable before routing user traffic.
