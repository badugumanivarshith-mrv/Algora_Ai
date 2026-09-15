# ALGORA PLATFORM — ARCHITECTURE DIAGRAMS

**Date:** September 15, 2026  

---

## 1. SYSTEM TOPOLOGY DIAGRAM
```text
[ Browser / Client ] ---> Nginx / Vite ---> Express API Server (/api/*)
                                                    |
                                       +------------+------------+
                                       |                         |
                                       v                         v
                               PostgreSQL (DB)          Redis (Cache/Session)
```
