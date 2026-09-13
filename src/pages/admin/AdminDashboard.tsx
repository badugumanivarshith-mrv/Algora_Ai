import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Code2,
  BookOpen,
  Compass,
  Trophy,
  Award,
  Settings,
  BarChart3,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Activity,
  Zap,
  Users,
  Bot,
  DollarSign,
  Radio,
  HeartPulse,
  ShieldAlert,
} from "lucide-react";
import {
  ProblemCMSEntity,
  TopicCMSEntity,
  CurriculumPathEntity,
  ContestEntity,
  AchievementCMSEntity,
  PlatformAnalyticsSummary,
  AdminEntity,
} from "../../types";
import { AdminApi, AdminProfileResponse } from "../../services/adminApi";
import ProblemEditorModal from "../../components/admin/ProblemEditorModal";
import TopicEditorModal from "../../components/admin/TopicEditorModal";
import CurriculumEditorModal from "../../components/admin/CurriculumEditorModal";
import ContestEditorModal from "../../components/admin/ContestEditorModal";
import AchievementEditorModal from "../../components/admin/AchievementEditorModal";
import AuditLogViewer from "../../components/admin/AuditLogViewer";
import SettingsEditor from "../../components/admin/SettingsEditor";
import AIConfigPanel from "../../components/admin/AIConfigPanel";
import AIUsagePanel from "../../components/admin/AIUsagePanel";
import BroadcastPanel from "../../components/admin/BroadcastPanel";
import SystemHealthPanel from "../../components/admin/SystemHealthPanel";
import CommunityModerationPanel from "../../components/admin/CommunityModerationPanel";
import PlatformAnalyticsPanel from "../../components/admin/PlatformAnalyticsPanel";

type AdminTab =
  | "analytics"
  | "problems"
  | "topics"
  | "curriculum"
  | "contests"
  | "achievements"
  | "moderation"
  | "platform_analytics"
  | "ai_config"
  | "ai_usage"
  | "broadcasts"
  | "health"
  | "settings"
  | "audit"
  | "users";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminProfile, setAdminProfile] = useState<AdminProfileResponse | null>(null);

  // Entities state
  const [analytics, setAnalytics] = useState<PlatformAnalyticsSummary | null>(null);
  const [problems, setProblems] = useState<ProblemCMSEntity[]>([]);
  const [topics, setTopics] = useState<TopicCMSEntity[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumPathEntity[]>([]);
  const [contests, setContests] = useState<ContestEntity[]>([]);
  const [achievements, setAchievements] = useState<AchievementCMSEntity[]>([]);
  const [adminsList, setAdminsList] = useState<AdminEntity[]>([]);

  // Modal open states
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<ProblemCMSEntity | null>(null);

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicCMSEntity | null>(null);

  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState<CurriculumPathEntity | null>(null);

  const [isContestModalOpen, setIsContestModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<ContestEntity | null>(null);

  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<AchievementCMSEntity | null>(null);

  // Load Admin Profile & Analytics on mount
  useEffect(() => {
    loadAdminSession();
    loadAllData();
  }, []);

  const loadAdminSession = async () => {
    const res = await AdminApi.getProfile();
    if (res.success && res.data) {
      setAdminProfile(res.data);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        analyticsRes,
        problemsRes,
        topicsRes,
        curriculumRes,
        contestsRes,
        achievementsRes,
        adminsRes,
      ] = await Promise.all([
        AdminApi.getAnalyticsSummary(),
        AdminApi.getProblems(),
        AdminApi.getTopics(),
        AdminApi.getCurriculumPaths(),
        AdminApi.getContests(),
        AdminApi.getAchievements(),
        AdminApi.getAllAdmins(),
      ]);

      if (analyticsRes.success && analyticsRes.data) setAnalytics(analyticsRes.data);
      if (problemsRes.success && problemsRes.data) setProblems(problemsRes.data);
      if (topicsRes.success && topicsRes.data) setTopics(topicsRes.data);
      if (curriculumRes.success && curriculumRes.data) setCurriculum(curriculumRes.data);
      if (contestsRes.success && contestsRes.data) setContests(contestsRes.data);
      if (achievementsRes.success && achievementsRes.data) setAchievements(achievementsRes.data);
      if (adminsRes.success && adminsRes.data) setAdminsList(adminsRes.data);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Problem Operations
  const handleTogglePublishProblem = async (problem: ProblemCMSEntity) => {
    const res = await AdminApi.togglePublishProblem(problem.id);
    if (res.success && res.data) {
      setProblems(problems.map((p) => (p.id === problem.id ? res.data! : p)));
    }
  };

  const handleDeleteProblem = async (problemId: number) => {
    if (window.confirm("Are you sure you want to delete this problem?")) {
      const res = await AdminApi.deleteProblem(problemId);
      if (res.success) {
        setProblems(problems.filter((p) => p.id !== problemId));
      }
    }
  };

  // Handlers for Topic Operations
  const handleTogglePublishTopic = async (topic: TopicCMSEntity) => {
    const res = await AdminApi.togglePublishTopic(topic.id);
    if (res.success && res.data) {
      setTopics(topics.map((t) => (t.id === topic.id ? res.data! : t)));
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (window.confirm("Delete this topic track? Associated problems will remain intact.")) {
      const res = await AdminApi.deleteTopic(topicId);
      if (res.success) {
        setTopics(topics.filter((t) => t.id !== topicId));
      }
    }
  };

  const handleReorderTopic = async (topicId: string, direction: "up" | "down") => {
    const index = topics.findIndex((t) => t.id === topicId);
    if (index < 0) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= topics.length) return;

    const newTopics = [...topics];
    const [moved] = newTopics.splice(index, 1);
    newTopics.splice(targetIndex, 0, moved);

    const orderedIds = newTopics.map((t) => t.id);
    setTopics(newTopics);
    await AdminApi.reorderTopics(orderedIds);
  };

  // Handlers for Curriculum Operations
  const handleDeleteCurriculum = async (pathId: string) => {
    if (window.confirm("Delete this curriculum track?")) {
      const res = await AdminApi.deleteCurriculumPath(pathId);
      if (res.success) {
        setCurriculum(curriculum.filter((c) => c.id !== pathId));
      }
    }
  };

  // Handlers for Contest Operations
  const handleDeleteContest = async (contestId: string) => {
    if (window.confirm("Delete this scheduled contest?")) {
      const res = await AdminApi.deleteContest(contestId);
      if (res.success) {
        setContests(contests.filter((c) => c.id !== contestId));
      }
    }
  };

  // Handlers for Achievement Operations
  const handleDeleteAchievement = async (id: string) => {
    if (window.confirm("Delete this achievement badge?")) {
      const res = await AdminApi.deleteAchievement(id);
      if (res.success) {
        setAchievements(achievements.filter((a) => a.id !== id));
      }
    }
  };

  // Filtered lists
  const filteredProblems = problems.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTopics = topics.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCurriculum = curriculum.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContests = contests.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAchievements = achievements.filter(
    (a) =>
      a.badgeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.badgeCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      {/* Top Banner & Title Bar */}
      <div
        style={{
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--brand), #7c3aed)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px color-mix(in srgb, var(--brand) 30%, transparent)",
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Algora Admin CMS
              </h1>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full, 9999px)",
                  background: "color-mix(in srgb, var(--brand) 15%, transparent)",
                  color: "var(--brand)",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {adminProfile?.user?.role || "SUPER_ADMIN"}
              </span>
            </div>
            <p style={{ fontSize: 12, margin: "2px 0 0", color: "var(--text-muted)" }}>
              Content Management System, Evaluation Engine Limits & Platform Controls
            </p>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "6px 12px",
              width: 240,
            }}
          >
            <Search size={14} style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search content..."
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: 12,
                color: "var(--text-primary)",
                width: "100%",
              }}
            />
          </div>

          <button
            onClick={loadAllData}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              fontSize: 12,
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          paddingInline: 24,
          display: "flex",
          gap: 24,
          overflowX: "auto",
        }}
      >
        {[
          { key: "analytics", label: "Overview & Metrics", icon: BarChart3 },
          { key: "problems", label: `Problems (${problems.length})`, icon: Code2 },
          { key: "topics", label: `Topics (${topics.length})`, icon: BookOpen },
          { key: "curriculum", label: `Curriculum (${curriculum.length})`, icon: Compass },
          { key: "contests", label: `Contests (${contests.length})`, icon: Trophy },
          { key: "achievements", label: `Badges (${achievements.length})`, icon: Award },
          { key: "moderation", label: "Moderation Queue", icon: ShieldAlert },
          { key: "platform_analytics", label: "Platform Telemetry", icon: Activity },
          { key: "ai_config", label: "AI Engine & Prompts", icon: Bot },
          { key: "ai_usage", label: "AI Cost & Telemetry", icon: DollarSign },
          { key: "broadcasts", label: "Broadcast Alerts", icon: Radio },
          { key: "health", label: "System Health", icon: HeartPulse },
          { key: "settings", label: "Platform Config", icon: Settings },
          { key: "audit", label: "Audit Logs", icon: Activity },
          { key: "users", label: `Staff & Roles (${adminsList.length})`, icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as AdminTab)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 2px",
              border: "none",
              background: "transparent",
              borderBottom: activeTab === key ? "2px solid var(--brand)" : "2px solid transparent",
              color: activeTab === key ? "var(--brand)" : "var(--text-secondary)",
              fontWeight: activeTab === key ? 600 : 500,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Main Content Container */}
      <div style={{ flex: 1, padding: 24 }}>
        {/* 1. ANALYTICS & PLATFORM METRICS */}
        {activeTab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {[
                {
                  label: "Total Registered Users",
                  val: analytics?.totalUsers?.toLocaleString() || "12,480",
                  sub: `Active Today: ${analytics?.activeUsersToday || 430}`,
                  icon: Users,
                  color: "var(--brand)",
                },
                {
                  label: "Published Problems",
                  val: analytics?.publishedProblems || problems.length,
                  sub: `${problems.filter((p) => p.difficulty === "Hard").length} Hard, ${problems.filter((p) => p.difficulty === "Medium").length} Medium`,
                  icon: Code2,
                  color: "var(--green, #10b981)",
                },
                {
                  label: "Code Submissions",
                  val: analytics?.totalSubmissions?.toLocaleString() || "84,320",
                  sub: `Overall Pass Rate: ${analytics?.overallAcceptanceRate || "71.4%"}`,
                  icon: Zap,
                  color: "var(--amber, #f59e0b)",
                },
                {
                  label: "Active Contests",
                  val: contests.filter((c) => c.status === "active" || c.status === "upcoming").length,
                  sub: `${contests.length} Total in schedule`,
                  icon: Trophy,
                  color: "#8b5cf6",
                },
              ].map(({ label, val, sub, icon: Icon, color }) => (
                <div
                  key={label}
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg, 12px)",
                    padding: 18,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{label}</span>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "var(--radius-md)",
                        background: `color-mix(in srgb, ${color} 15%, transparent)`,
                        color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={16} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                      {val}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>
                      {sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Breakdown Charts & Tables */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Language Distribution */}
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg, 12px)",
                  padding: 20,
                }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px 0", color: "var(--text-primary)" }}>
                  Execution Language Breakdown
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {analytics?.languageDistribution && analytics.languageDistribution.length > 0
                    ? analytics.languageDistribution.map((item) => (
                        <div key={item.language}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.language}</span>
                            <span style={{ color: "var(--text-muted)" }}>
                              {item.count.toLocaleString()} runs ({item.percentage}%)
                            </span>
                          </div>
                          <div style={{ height: 6, background: "var(--bg-subtle)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${item.percentage}%`, height: "100%", background: "var(--brand)", borderRadius: 3 }} />
                          </div>
                        </div>
                      ))
                    : [
                        { language: "Python", count: 42100, percentage: 50 },
                        { language: "C++", count: 25300, percentage: 30 },
                        { language: "Java", count: 12600, percentage: 15 },
                        { language: "C", count: 4320, percentage: 5 },
                      ].map(({ language, count, percentage }) => (
                        <div key={language}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{language}</span>
                            <span style={{ color: "var(--text-muted)" }}>{count.toLocaleString()} ({percentage}%)</span>
                          </div>
                          <div style={{ height: 6, background: "var(--bg-subtle)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${percentage}%`, height: "100%", background: "var(--brand)", borderRadius: 3 }} />
                          </div>
                        </div>
                      ))}
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg, 12px)",
                  padding: 20,
                }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px 0", color: "var(--text-primary)" }}>
                  Problem Difficulty & Pass Rate Metrics
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { diff: "Easy", count: problems.filter((p) => p.difficulty === "Easy").length, rate: "84.2%", color: "var(--green, #10b981)" },
                    { diff: "Medium", count: problems.filter((p) => p.difficulty === "Medium").length, rate: "58.6%", color: "var(--amber, #f59e0b)" },
                    { diff: "Hard", count: problems.filter((p) => p.difficulty === "Hard").length, rate: "31.9%", color: "var(--red, #ef4444)" },
                  ].map(({ diff, count, rate, color }) => (
                    <div
                      key={diff}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        background: "var(--bg-subtle)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{diff}</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>({count} problems)</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Pass rate:</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color }}>{rate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PROBLEMS MANAGEMENT */}
        {activeTab === "problems" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  Algorithmic Problem Repository
                </h2>
                <p style={{ fontSize: 12, margin: 0, color: "var(--text-muted)" }}>
                  Create and manage coding challenges, test suite evaluations, and language boilerplate
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProblem(null);
                  setIsProblemModalOpen(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--brand)",
                  color: "#fff",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus size={15} />
                <span>Create Problem</span>
              </button>
            </div>

            {/* Problem Table */}
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg, 12px)",
                background: "var(--bg-surface)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 2fr 120px 140px 100px 100px 120px",
                  padding: "10px 16px",
                  background: "var(--bg-subtle)",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <span>ID</span>
                <span>Title & Slug</span>
                <span>Difficulty</span>
                <span>Topic Track</span>
                <span>Test Cases</span>
                <span>Status</span>
                <span style={{ textAlign: "right" }}>Actions</span>
              </div>

              {filteredProblems.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                  No problems found matching query.
                </div>
              ) : (
                filteredProblems.map((prob, idx) => (
                  <div
                    key={prob.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 2fr 120px 140px 100px 100px 120px",
                      padding: "12px 16px",
                      borderBottom: idx === filteredProblems.length - 1 ? "none" : "1px solid var(--border)",
                      alignItems: "center",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)" }}>
                      #{prob.id}
                    </span>

                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{prob.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)" }}>
                        /{prob.slug}
                      </div>
                    </div>

                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-sm)",
                          fontSize: 11,
                          fontWeight: 700,
                          background:
                            prob.difficulty === "Easy"
                              ? "color-mix(in srgb, var(--green, #10b981) 15%, transparent)"
                              : prob.difficulty === "Medium"
                              ? "color-mix(in srgb, var(--amber, #f59e0b) 15%, transparent)"
                              : "color-mix(in srgb, var(--red, #ef4444) 15%, transparent)",
                          color:
                            prob.difficulty === "Easy"
                              ? "var(--green, #10b981)"
                              : prob.difficulty === "Medium"
                              ? "var(--amber, #f59e0b)"
                              : "var(--red, #ef4444)",
                        }}
                      >
                        {prob.difficulty}
                      </span>
                    </div>

                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{prob.topic}</span>

                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {(prob.testCases?.length || 0) + (prob.hiddenTestCases?.length || 0)} tests
                    </span>

                    <div>
                      <button
                        onClick={() => handleTogglePublishProblem(prob)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "3px 8px",
                          borderRadius: "var(--radius-sm)",
                          border: "none",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          background:
                            prob.status === "published"
                              ? "color-mix(in srgb, var(--green, #10b981) 15%, transparent)"
                              : "var(--bg-subtle)",
                          color: prob.status === "published" ? "var(--green, #10b981)" : "var(--text-muted)",
                        }}
                      >
                        {prob.status === "published" ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        <span>{prob.status === "published" ? "Live" : "Draft"}</span>
                      </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                      <button
                        onClick={() => {
                          setEditingProblem(prob);
                          setIsProblemModalOpen(true);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--brand)",
                          cursor: "pointer",
                          padding: 4,
                        }}
                        title="Edit Problem"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteProblem(prob.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--red, #ef4444)",
                          cursor: "pointer",
                          padding: 4,
                        }}
                        title="Delete Problem"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 3. TOPICS MANAGEMENT */}
        {activeTab === "topics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  Topic Taxonomy & Learning Tracks
                </h2>
                <p style={{ fontSize: 12, margin: 0, color: "var(--text-muted)" }}>
                  Manage algorithmic concepts, sequence ordering, prerequisites, and learning objectives
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingTopic(null);
                  setIsTopicModalOpen(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--brand)",
                  color: "#fff",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus size={15} />
                <span>Create Topic</span>
              </button>
            </div>

            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg, 12px)",
                background: "var(--bg-surface)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 2fr 120px 140px 120px 120px",
                  padding: "10px 16px",
                  background: "var(--bg-subtle)",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <span>Order #</span>
                <span>Topic Title & Slug</span>
                <span>Language</span>
                <span>Prerequisites</span>
                <span>Status</span>
                <span style={{ textAlign: "right" }}>Actions</span>
              </div>

              {filteredTopics.map((topic, idx) => (
                <div
                  key={topic.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 2fr 120px 140px 120px 120px",
                    padding: "12px 16px",
                    borderBottom: idx === filteredTopics.length - 1 ? "none" : "1px solid var(--border)",
                    alignItems: "center",
                    fontSize: 13,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button
                      onClick={() => handleReorderTopic(topic.id, "up")}
                      disabled={idx === 0}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: idx === 0 ? "not-allowed" : "pointer",
                        opacity: idx === 0 ? 0.3 : 1,
                        fontSize: 11,
                        padding: 2,
                      }}
                    >
                      ▲
                    </button>
                    <span style={{ fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
                      {topic.orderIndex || idx + 1}
                    </span>
                    <button
                      onClick={() => handleReorderTopic(topic.id, "down")}
                      disabled={idx === filteredTopics.length - 1}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: idx === filteredTopics.length - 1 ? "not-allowed" : "pointer",
                        opacity: idx === filteredTopics.length - 1 ? 0.3 : 1,
                        fontSize: 11,
                        padding: 2,
                      }}
                    >
                      ▼
                    </button>
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{topic.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)" }}>
                      /{topic.slug}
                    </div>
                  </div>

                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{topic.language || "Python"}</span>

                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {topic.prerequisites?.length ? topic.prerequisites.join(", ") : "None"}
                  </span>

                  <div>
                    <button
                      onClick={() => handleTogglePublishTopic(topic)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 8px",
                        borderRadius: "var(--radius-sm)",
                        border: "none",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        background: topic.isPublished
                          ? "color-mix(in srgb, var(--green, #10b981) 15%, transparent)"
                          : "var(--bg-subtle)",
                        color: topic.isPublished ? "var(--green, #10b981)" : "var(--text-muted)",
                      }}
                    >
                      {topic.isPublished ? "Published" : "Draft"}
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                    <button
                      onClick={() => {
                        setEditingTopic(topic);
                        setIsTopicModalOpen(true);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--brand)",
                        cursor: "pointer",
                        padding: 4,
                      }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteTopic(topic.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--red, #ef4444)",
                        cursor: "pointer",
                        padding: 4,
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. CURRICULUM MANAGEMENT */}
        {activeTab === "curriculum" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  Structured Curriculum Learning Paths
                </h2>
                <p style={{ fontSize: 12, margin: 0, color: "var(--text-muted)" }}>
                  Build career-oriented trajectories with step-by-step modular progression
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCurriculum(null);
                  setIsCurriculumModalOpen(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--brand)",
                  color: "#fff",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus size={15} />
                <span>Create Path</span>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
              {filteredCurriculum.map((path) => (
                <div
                  key={path.id}
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg, 12px)",
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "var(--radius-sm)",
                          background: "color-mix(in srgb, var(--brand) 15%, transparent)",
                          color: "var(--brand)",
                        }}
                      >
                        {path.language} · {path.estimatedHours}h
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: path.isPublished ? "var(--green, #10b981)" : "var(--text-muted)",
                        }}
                      >
                        {path.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)" }}>
                      {path.title}
                    </h3>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 12px 0", lineHeight: 1.5 }}>
                      {path.description}
                    </p>

                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 16 }}>
                      <span>Modules: {path.modules?.length || 0}</span> ·{" "}
                      <span>Role: {path.targetRole || "General"}</span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 8,
                      borderTop: "1px solid var(--border)",
                      paddingTop: 12,
                    }}
                  >
                    <button
                      onClick={() => {
                        setEditingCurriculum(path);
                        setIsCurriculumModalOpen(true);
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border)",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Edit2 size={13} />
                      <span>Edit Modules</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCurriculum(path.id)}
                      style={{
                        padding: "6px 8px",
                        borderRadius: "var(--radius-md)",
                        background: "transparent",
                        border: "1px solid var(--border)",
                        color: "var(--red, #ef4444)",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. CONTESTS MANAGEMENT */}
        {activeTab === "contests" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  Competitive Contests & Tournaments
                </h2>
                <p style={{ fontSize: 12, margin: 0, color: "var(--text-muted)" }}>
                  Schedule timed competition windows, configure point scoring, and inspect participants
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingContest(null);
                  setIsContestModalOpen(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--brand)",
                  color: "#fff",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus size={15} />
                <span>Schedule Contest</span>
              </button>
            </div>

            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg, 12px)",
                background: "var(--bg-surface)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 120px 140px 120px 100px 120px",
                  padding: "10px 16px",
                  background: "var(--bg-subtle)",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <span>Contest Name</span>
                <span>Type</span>
                <span>Time Window</span>
                <span>Problems</span>
                <span>Status</span>
                <span style={{ textAlign: "right" }}>Actions</span>
              </div>

              {filteredContests.map((contest, idx) => (
                <div
                  key={contest.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 120px 140px 120px 100px 120px",
                    padding: "12px 16px",
                    borderBottom: idx === filteredContests.length - 1 ? "none" : "1px solid var(--border)",
                    alignItems: "center",
                    fontSize: 13,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{contest.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {contest.description}
                    </div>
                  </div>

                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{contest.contestType}</span>

                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    <div>{new Date(contest.startTime).toLocaleDateString()}</div>
                    <div>{contest.durationMinutes} mins</div>
                  </div>

                  <span style={{ fontSize: 12, color: "var(--text-primary)" }}>
                    {contest.problems?.length || 0} Problems
                  </span>

                  <div>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: 11,
                        fontWeight: 700,
                        background:
                          contest.status === "active"
                            ? "color-mix(in srgb, var(--green, #10b981) 15%, transparent)"
                            : contest.status === "upcoming"
                            ? "color-mix(in srgb, var(--brand) 15%, transparent)"
                            : "var(--bg-subtle)",
                        color:
                          contest.status === "active"
                            ? "var(--green, #10b981)"
                            : contest.status === "upcoming"
                            ? "var(--brand)"
                            : "var(--text-muted)",
                      }}
                    >
                      {contest.status}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                    <button
                      onClick={() => {
                        setEditingContest(contest);
                        setIsContestModalOpen(true);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--brand)",
                        cursor: "pointer",
                        padding: 4,
                      }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteContest(contest.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--red, #ef4444)",
                        cursor: "pointer",
                        padding: 4,
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. ACHIEVEMENTS & BADGES */}
        {activeTab === "achievements" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  Gamification Badges & Achievement Triggers
                </h2>
                <p style={{ fontSize: 12, margin: 0, color: "var(--text-muted)" }}>
                  Configure automated reward triggers, unlock criteria, and XP distributions
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingAchievement(null);
                  setIsAchievementModalOpen(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--brand)",
                  color: "#fff",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus size={15} />
                <span>Create Badge</span>
              </button>
            </div>

            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg, 12px)",
                background: "var(--bg-surface)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1.5fr 140px 2fr 80px 100px 100px",
                  padding: "10px 16px",
                  background: "var(--bg-subtle)",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <span>Icon</span>
                <span>Badge Name & Code</span>
                <span>Category</span>
                <span>Unlock Condition</span>
                <span>XP</span>
                <span>Status</span>
                <span style={{ textAlign: "right" }}>Actions</span>
              </div>

              {filteredAchievements.map((ach, idx) => (
                <div
                  key={ach.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1.5fr 140px 2fr 80px 100px 100px",
                    padding: "12px 16px",
                    borderBottom: idx === filteredAchievements.length - 1 ? "none" : "1px solid var(--border)",
                    alignItems: "center",
                    fontSize: 13,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "var(--radius-md)",
                      background: "color-mix(in srgb, var(--amber, #f59e0b) 15%, transparent)",
                      color: "var(--amber, #f59e0b)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Award size={16} />
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{ach.badgeName}</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)" }}>
                      {ach.badgeCode}
                    </div>
                  </div>

                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{ach.category}</span>

                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{ach.unlockCondition}</span>

                  <span style={{ fontWeight: 700, color: "var(--amber, #f59e0b)", fontSize: 12 }}>
                    +{ach.xpReward}
                  </span>

                  <div>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: 11,
                        fontWeight: 600,
                        background: ach.isPublished
                          ? "color-mix(in srgb, var(--green, #10b981) 15%, transparent)"
                          : "var(--bg-subtle)",
                        color: ach.isPublished ? "var(--green, #10b981)" : "var(--text-muted)",
                      }}
                    >
                      {ach.isPublished ? "Active" : "Hidden"}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                    <button
                      onClick={() => {
                        setEditingAchievement(ach);
                        setIsAchievementModalOpen(true);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--brand)",
                        cursor: "pointer",
                        padding: 4,
                      }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteAchievement(ach.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--red, #ef4444)",
                        cursor: "pointer",
                        padding: 4,
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. SYSTEM SETTINGS & ENGINE LIMITS */}
        {activeTab === "settings" && <SettingsEditor />}

        {/* 8. AUDIT LOG VIEWER */}
        {activeTab === "audit" && <AuditLogViewer />}

        {/* 9. STAFF & ROLES */}
        {activeTab === "users" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  Administrator Role & Permission Access
                </h2>
                <p style={{ fontSize: 12, margin: 0, color: "var(--text-muted)" }}>
                  Role-based access matrix granting granular CRUD permissions across modules
                </p>
              </div>
            </div>

            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg, 12px)",
                background: "var(--bg-surface)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 120px 2fr 140px 100px",
                  padding: "10px 16px",
                  background: "var(--bg-subtle)",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <span>Admin User</span>
                <span>Role</span>
                <span>Permissions Matrix</span>
                <span>Created At</span>
                <span>Status</span>
              </div>

              {adminsList.map((adm, idx) => (
                <div
                  key={adm.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 120px 2fr 140px 100px",
                    padding: "12px 16px",
                    borderBottom: idx === adminsList.length - 1 ? "none" : "1px solid var(--border)",
                    alignItems: "center",
                    fontSize: 13,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{adm.fullName || "Admin User"}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{adm.email || `User #${adm.userId}`}</div>
                  </div>

                  <div>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: 11,
                        fontWeight: 700,
                        background: "color-mix(in srgb, var(--brand) 15%, transparent)",
                        color: "var(--brand)",
                      }}
                    >
                      {adm.isSuperAdmin ? "SUPER_ADMIN" : "ADMIN"}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "1px 5px",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--bg-subtle)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      ALL_PERMISSIONS (*)
                    </span>
                  </div>

                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString() : "Active"}
                  </span>

                  <div>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: 11,
                        fontWeight: 600,
                        background:
                          adm.status === "active"
                            ? "color-mix(in srgb, var(--green, #10b981) 15%, transparent)"
                            : "var(--bg-subtle)",
                        color: adm.status === "active" ? "var(--green, #10b981)" : "var(--text-muted)",
                      }}
                    >
                      {adm.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODERATION QUEUE */}
        {activeTab === "moderation" && <CommunityModerationPanel />}

        {/* PLATFORM TELEMETRY & ANALYTICS */}
        {activeTab === "platform_analytics" && <PlatformAnalyticsPanel />}

        {/* 10. AI CONFIGURATION & PROMPT STUDIO */}
        {activeTab === "ai_config" && <AIConfigPanel />}

        {/* 11. AI USAGE, TELEMETRY & COST ANALYTICS */}
        {activeTab === "ai_usage" && <AIUsagePanel />}

        {/* 12. NOTIFICATIONS & BROADCAST ANNOUNCEMENTS */}
        {activeTab === "broadcasts" && <BroadcastPanel />}

        {/* 13. SYSTEM HEALTH & OBSERVABILITY */}
        {activeTab === "health" && <SystemHealthPanel />}
      </div>

      {/* MODALS */}
      <ProblemEditorModal
        problem={editingProblem}
        isOpen={isProblemModalOpen}
        onClose={() => setIsProblemModalOpen(false)}
        onSave={(saved) => {
          if (editingProblem) {
            setProblems(problems.map((p) => (p.id === saved.id ? saved : p)));
          } else {
            setProblems([saved, ...problems]);
          }
        }}
      />

      <TopicEditorModal
        topic={editingTopic}
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onSave={(saved) => {
          if (editingTopic) {
            setTopics(topics.map((t) => (t.id === saved.id ? saved : t)));
          } else {
            setTopics([...topics, saved]);
          }
        }}
      />

      <CurriculumEditorModal
        path={editingCurriculum}
        isOpen={isCurriculumModalOpen}
        onClose={() => setIsCurriculumModalOpen(false)}
        onSave={(saved) => {
          if (editingCurriculum) {
            setCurriculum(curriculum.map((c) => (c.id === saved.id ? saved : c)));
          } else {
            setCurriculum([...curriculum, saved]);
          }
        }}
      />

      <ContestEditorModal
        contest={editingContest}
        isOpen={isContestModalOpen}
        onClose={() => setIsContestModalOpen(false)}
        onSave={(saved) => {
          if (editingContest) {
            setContests(contests.map((c) => (c.id === saved.id ? saved : c)));
          } else {
            setContests([...contests, saved]);
          }
        }}
      />

      <AchievementEditorModal
        achievement={editingAchievement}
        isOpen={isAchievementModalOpen}
        onClose={() => setIsAchievementModalOpen(false)}
        onSave={(saved) => {
          if (editingAchievement) {
            setAchievements(achievements.map((a) => (a.id === saved.id ? saved : a)));
          } else {
            setAchievements([...achievements, saved]);
          }
        }}
      />
    </div>
  );
}
