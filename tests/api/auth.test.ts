import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createExpressApp } from "@/backend/src/server";
import { initializeDatabase } from "@/backend/src/db";

describe("Auth & OAuth API Integration Tests", () => {
  let app: any;

  beforeAll(async () => {
    await initializeDatabase();
    app = createExpressApp();
  });

  describe("POST /api/auth/register", () => {
    it("should validate missing inputs with 400 status", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should successfully register a new user", async () => {
      const uniqueUsername = `testuser_${Math.random().toString(36).substring(2, 8)}`;
      const uniqueEmail = `test_user_${Math.random().toString(36).substring(2, 8)}@example.com`;
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: uniqueEmail,
          username: uniqueUsername,
          password: "password123"
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should reject invalid login validation", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          emailOrUsername: "",
          password: ""
        });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return correct authentication failure for wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          emailOrUsername: "testuser_new",
          password: "wrong_password"
        });

      expect([400, 401, 404]).toContain(res.status);
    });
  });

  describe("GET /api/auth/oauth/config", () => {
    it("should return the configured OAuth parameters", async () => {
      const res = await request(app).get("/api/auth/oauth/config");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe("GET /api/auth/oauth/:provider/url", () => {
    it("should generate a secure Google OAuth flow URL", async () => {
      const res = await request(app).get("/api/auth/oauth/google/url");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it("should generate a secure GitHub OAuth flow URL", async () => {
      const res = await request(app).get("/api/auth/oauth/github/url");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe("GET /api/auth/oauth/:provider/sandbox", () => {
    it("should handle sandbox flow parameter settings", async () => {
      const res = await request(app)
        .get("/api/auth/oauth/google/sandbox")
        .query({ state: "test-state", code: "test-code" });
      
      expect(res.status).toBe(200);
      expect(res.text).toContain("Google OAuth Sign In");
    });
  });
});
