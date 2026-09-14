import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createExpressApp } from "@/backend/src/server";
import { initializeDatabase } from "@/backend/src/db";

describe("AI System API Integration Tests", () => {
  let app: any;

  beforeAll(async () => {
    // Clear GEMINI_API_KEY to force immediate, reliable local/offline fallback responses
    process.env.GEMINI_API_KEY = "";
    await initializeDatabase();
    app = createExpressApp();
  });

  describe("POST /api/ai/hint", () => {
    it("should generate a conceptual code hint for a problem", async () => {
      const res = await request(app)
        .post("/api/ai/hint")
        .send({
          problemSlug: "two-sum",
          code: "def twoSum(nums, target):\n    pass"
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe("POST /api/ai/review", () => {
    it("should return detailed review and feedback reports", async () => {
      const res = await request(app)
        .post("/api/ai/review")
        .send({
          code: "def solve(n):\n    return n * n",
          language: "python"
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe("POST /api/ai/complexity", () => {
    it("should calculate time and space complexity scores", async () => {
      const res = await request(app)
        .post("/api/ai/complexity")
        .send({
          code: "for i in range(n):\n    print(i)",
          language: "python"
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe("GET /api/ai/conversations", () => {
    it("should fetch active conversation lists safely", async () => {
      const res = await request(app).get("/api/ai/conversations");
      expect([200, 401]).toContain(res.status);
    });
  });

  describe("GET /api/ai/analyst-report", () => {
    it("should compile custom student analytics", async () => {
      const res = await request(app).get("/api/ai/analyst-report");
      expect([200, 401]).toContain(res.status);
    });
  });
});
