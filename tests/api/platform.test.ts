import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createExpressApp } from "@/backend/src/server";
import { initializeDatabase } from "@/backend/src/db";

describe("Platform Core Feature API Integration Tests", () => {
  let app: any;

  beforeAll(async () => {
    await initializeDatabase();
    app = createExpressApp();
  });

  // ==========================================
  // 1. Contests Endpoints
  // ==========================================
  describe("Contests API", () => {
    it("should list available hackathons and contests", async () => {
      const res = await request(app).get("/api/contests");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should fetch specific contest by ID", async () => {
      const res = await request(app).get("/api/contests/contest-1");
      expect([200, 404]).toContain(res.status);
    });

    it("should fetch specific contest leaderboard details", async () => {
      const res = await request(app).get("/api/contests/contest-1/leaderboard");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 2. Community & Discussions API
  // ==========================================
  describe("Community & Discussions API", () => {
    it("should list forum discussions with correct parameters", async () => {
      const res = await request(app).get("/api/community/discussions");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it("should list study groups", async () => {
      const res = await request(app).get("/api/community/study-groups");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.groups)).toBe(true);
    });

    it("should list available student mentors", async () => {
      const res = await request(app).get("/api/community/mentors");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should list public user profile for verified handles", async () => {
      const res = await request(app).get("/api/community/profile/admin");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 3. Faculty LMS API
  // ==========================================
  describe("Faculty LMS Classroom & Assignment API", () => {
    it("should list academic classrooms", async () => {
      const res = await request(app).get("/api/institutions/classrooms");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.classrooms)).toBe(true);
    });

    it("should create a new classroom with valid data", async () => {
      const res = await request(app)
        .post("/api/institutions/classrooms")
        .send({
          name: "Computer Science 101",
          code: "CS101",
          department: "CSE",
          semester: "Semester 1",
          section: "A",
          facultyName: "Dr. Alan Turing"
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.classroom).toBeDefined();
    });

    it("should reject classroom creations with missing names or codes", async () => {
      const res = await request(app)
        .post("/api/institutions/classrooms")
        .send({
          name: "",
          code: ""
        });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should create assignments for a specific classroom", async () => {
      const res = await request(app)
        .post("/api/institutions/assignments")
        .send({
          classroomId: "class-1",
          title: "Introduction to Arrays",
          description: "Solve basic indexing problems.",
          problemTitles: ["Two Sum", "Reverse Array"],
          maxScore: 100
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.assignment).toBeDefined();
    });
  });

  // ==========================================
  // 4. Placements & Drives API
  // ==========================================
  describe("Placements & Drive Tracking API", () => {
    it("should return correct drive listings", async () => {
      const res = await request(app).get("/api/placements/drives");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.drives)).toBe(true);
    });

    it("should handle job applications cleanly", async () => {
      const res = await request(app)
        .post("/api/placements/drives/drv-01/apply")
        .send({
          name: "Candidate Turing",
          email: "candidate@turing.org"
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should fetch placement office aggregations", async () => {
      const res = await request(app).get("/api/placements/analytics");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.analytics).toBeDefined();
    });
  });

  // ==========================================
  // 5. System Health & OAuth Audits API
  // ==========================================
  describe("Telemetry, Health & System Auditing API", () => {
    it("should return detailed platform API durations", async () => {
      const res = await request(app).get("/api/monitoring/metrics");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should fetch Redis caching and connection statuses", async () => {
      const res = await request(app).get("/api/monitoring/redis");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it("should fetch critical system errors list", async () => {
      const res = await request(app).get("/api/monitoring/errors");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should fetch deep backend service dependency checks", async () => {
      const res = await request(app).get("/api/monitoring/health-deep");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should compile OAuth configuration audit logs", async () => {
      const res = await request(app).get("/api/monitoring/oauth");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});
