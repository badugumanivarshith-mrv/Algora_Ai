import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createExpressApp } from "@/backend/src/server";
import { initializeDatabase } from "@/backend/src/db";
import { RedisManager } from "@/backend/src/redis/redisClient";

describe("Judge & Redis API Integration Tests", () => {
  let app: any;

  beforeAll(async () => {
    await initializeDatabase();
    await RedisManager.initialize();
    app = createExpressApp();
  });

  describe("POST /api/judge/run", () => {
    it("should process direct code runs in python successfully", async () => {
      const res = await request(app)
        .post("/api/judge/run")
        .send({
          language: "python",
          code: "print('Hello, Algora!')",
          input: ""
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it("should process direct code runs in javascript successfully", async () => {
      const res = await request(app)
        .post("/api/judge/run")
        .send({
          language: "javascript",
          code: "console.log('Hello, JS!')",
          input: ""
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe("POST /api/judge/submit", () => {
    it("should create an official scoring evaluation job", async () => {
      const res = await request(app)
        .post("/api/judge/submit")
        .send({
          problemId: "test-prob",
          language: "python",
          code: "def solve(): pass"
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.jobId).toBeDefined();
    });
  });

  describe("GET /api/judge/stats", () => {
    it("should return the overall online grading queue and runtime stats", async () => {
      const res = await request(app).get("/api/judge/stats");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe("RedisManager Telemetry & Resilient Fallback", () => {
    it("should allow get/set when offline using memory fallback cleanly", async () => {
      const testKey = "algora:test_key";
      const testValue = "vitest-resilient-value";
      
      const success = await RedisManager.set(testKey, testValue, 10);
      expect(success).toBe(true);

      const val = await RedisManager.get(testKey);
      expect(val).toBe(testValue);

      await RedisManager.del(testKey);
      const afterDel = await RedisManager.get(testKey);
      expect(afterDel).toBeNull();
    });

    it("should report non-blocking health metrics", async () => {
      const health = await RedisManager.getHealth();
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(typeof health.isHealthy).toBe("boolean");
    });
  });
});
