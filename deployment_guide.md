# ALGORA PLATFORM — DEPLOYMENT GUIDE

**Version:** V5.1.0  
**Date:** September 15, 2026  

---

## 1. PRODUCTION DEPLOYMENT
1. Configure environment variables in `.env`.
2. Run `npm run build` to bundle backend (`dist/server.cjs`) and frontend (`dist/`).
3. Deploy container image to Google Cloud Run listening on port `3000`.
