import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Zap, Flame, Code2, Trophy, TrendingUp, Brain, ArrowRight,
  ChevronRight, Clock, Target, Play, ArrowUpRight, Plus,
  CheckCircle2, Sparkles, AlertTriangle, Briefcase, RefreshCw,
  Check, X, BookOpen, Layers
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { AdaptiveApi } from "../services/adaptiveApi";
import {
  PersonalizationOverview,
  StudyPlanEntity,
  UserGoalEntity,
  RecommendationEntity,
  RecommendationCategory,
  ReadinessScoreEntity,
  SkillAssessmentEntity,
} from "../types";
import StudyPlanModal from "../components/personalization/StudyPlanModal";
import GoalModal from "../components/personalization/GoalModal";

const weeklyData = [
  { day: "Mon", problems: 4, accuracy: 75 },
  { day: "Tue", problems: 7, accuracy: 85 },
  { day: "Wed", problems: 3, accuracy: 66 },
  { day: "Thu", problems: 9, accuracy: 90 },
  { day: "Fri", problems: 6, accuracy: 80 },
  { day: "Sat", problems: 11, accuracy: 88 },
  { day: "Sun", problems: 5, accuracy: 72 },
];

const skillData = [
  { topic: "Arrays", value: 88 },
  { topic: "Trees", value: 72 },
  { topic: "DP", value: 58 },
  { topic: "Graphs", value: 90 },
  { topic: "Strings", value: 65 },
  { topic: "Math", value: 78 },
];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "8px 12px",
        boxShadow: "var(--shadow-md)",
        fontSize: 11,
      }}
    >
      <p style={{ fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 16, color: "var(--text-muted)" }}>
          <span>{p.name}</span>
          <span style={{ color: p.stroke, fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function DiffBadge({ diff }: { diff: string }) {
  const cn = diff === "Easy" ? "diff-easy" : diff === "Medium" ? "diff-medium" : "diff-hard";
  return <span className={`badge ${cn}`}>{diff}</span>;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [overview, setOverview] = useState<PersonalizationOverview | null>(null);
  const [selectedRecCategory, setSelectedRecCategory] = useState<string>("All");
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isRefreshingRecs, setIsRefreshingRecs] = useState(false);

  const fetchOverview = async () => {
    try {
      const data = await AdaptiveApi.getPersonalizationOverview();
      setOverview(data);
    } catch (err) {
      console.error("Failed to load personalization data", err);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleRefreshRecommendations = async () => {
    setIsRefreshingRecs(true);
    try {
      await AdaptiveApi.refreshRecommendations();
      await fetchOverview();
    } catch (err) {
      console.error("Failed to refresh recommendations", err);
    } finally {
      setIsRefreshingRecs(false);
    }
  };

  const handleGoalProgress = async (goalId: string) => {
    try {
      await AdaptiveApi.recordGoalProgress(goalId, 1);
      await fetchOverview();
    } catch (err) {
      console.error("Failed to increment goal progress", err);
    }
  };

  const handleCreateStudyPlan = async (params: any) => {
    await AdaptiveApi.createStudyPlan(params);
    await fetchOverview();
  };

  const handleCreateGoal = async (params: any) => {
    await AdaptiveApi.createGoal(params);
    await fetchOverview();
  };

  const handleRecStatus = async (recId: string, action: "solved" | "dismissed") => {
    await AdaptiveApi.updateRecommendationStatus(recId, action);
    await fetchOverview();
  };

  const filteredRecs = overview?.recommendations.filter((r) => {
    if (selectedRecCategory === "All") return true;
    return r.category === selectedRecCategory;
  }) || [];

  const statData = [
    { label: "Total XP", value: "4,820", sub: "+320 this week", icon: Zap, color: "var(--amber)", bg: "var(--amber-light)" },
    { label: "Streak", value: "28 days", sub: "Personal best!", icon: Flame, color: "var(--red)", bg: "var(--red-light)" },
    { label: "DSA Solved", value: "347", sub: "+12 this week", icon: Code2, color: "var(--blue)", bg: "var(--blue-light)" },
    { label: "Contest Rank", value: "#1,204", sub: "↑ 48 spots", icon: Trophy, color: "var(--violet)", bg: "rgba(124,58,237,.1)" },
  ];

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      
      {/* ── TOP STATS ROW ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {statData.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="surface-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "var(--radius-md)", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} style={{ color }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--green)", display: "flex", alignItems: "center", gap: 3 }}>
                <ArrowUpRight size={11} />{sub}
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              {value}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── TODAY'S FOCUS & ADAPTIVE STUDY PLAN ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: 16 }}>
        {/* Today's Focus Card */}
        <div
          className="surface-card"
          style={{
            padding: 22,
            background: "linear-gradient(145deg, var(--bg-raised), var(--bg-surface))",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -24,
              right: -24,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "var(--brand-primary)",
              opacity: 0.08,
              pointerEvents: "none",
            }}
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 26, height: 26, borderRadius: "var(--radius-sm)", background: "rgba(0,212,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={14} style={{ color: "var(--brand-primary)" }} />
              </div>
              <span className="text-label" style={{ color: "var(--text-secondary)", fontWeight: 700 }}>
                TODAY'S ADAPTIVE FOCUS
              </span>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>
              {overview?.todayFocus.primaryTopic || "Dynamic Programming"}
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 16px" }}>
              {overview?.todayFocus.subGoal || "Reinforce state recurrence relations & 2D grid memoization boundaries."}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 18 }}>
              <div style={{ padding: "10px", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>Target Tasks</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                  {overview?.todayFocus.recommendedProblemsCount || 3} Problems
                </span>
              </div>
              <div style={{ padding: "10px", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>Est. Time</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                  {overview?.todayFocus.estimatedTimeMinutes || 45} mins
                </span>
              </div>
              <div style={{ padding: "10px", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>Urgent Review</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--amber)" }}>
                  {overview?.todayFocus.reviewUrgentCount || 2} Due
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: "center", gap: 6 }}
              onClick={() => navigate("/workspace?problem=coin-change")}
            >
              <Play size={13} /> Start Daily Focus
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: "8px 12px" }}
              onClick={() => navigate("/daily-review")}
              title="Daily spaced review"
            >
              <Clock size={14} /> Review
            </button>
          </div>
        </div>

        {/* Active Study Plan Roadmap */}
        <div className="surface-card" style={{ padding: 22, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Target size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  {overview?.activePlan?.title || "DSA Mastery (FAANG Track)"}
                </h3>
              </div>
              <button
                onClick={() => setIsStudyModalOpen(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--brand-primary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>Change Plan</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>
                  Duration: {overview?.activePlan?.durationWeeks || 6} Weeks · {overview?.activePlan?.dailyMinutesTarget || 45}m/day
                </span>
                <span style={{ fontWeight: 700, color: "var(--brand-primary)" }}>
                  {overview?.activePlan?.progressPct || 42}% Completed
                </span>
              </div>
              <div style={{ width: "100%", height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${overview?.activePlan?.progressPct || 42}%`,
                    height: "100%",
                    background: "var(--brand-primary)",
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>

            {/* Milestones / Topics List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(overview?.activePlan?.topics || [
                { id: "1", topicName: "Arrays & Sliding Window", status: "completed", milestoneTitle: "Two Pointers Mastery", solvedCount: 15, problemsCount: 15 },
                { id: "2", topicName: "Tree Traversals & BST", status: "completed", milestoneTitle: "Tree Invariant Solver", solvedCount: 12, problemsCount: 12 },
                { id: "3", topicName: "Dynamic Programming (1D & 2D)", status: "in_progress", milestoneTitle: "Memoization & State Machine", solvedCount: 6, problemsCount: 15 },
                { id: "4", topicName: "Graph BFS/DFS & Shortest Path", status: "not_started", milestoneTitle: "Topological Sort & Dijkstra", solvedCount: 0, problemsCount: 10 },
              ]).slice(0, 4).map((top: any) => {
                const isDone = top.status === "completed";
                const isInProg = top.status === "in_progress";
                return (
                  <div
                    key={top.id || top.topicName}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      background: isInProg ? "rgba(0,212,255,0.06)" : "var(--bg-raised)",
                      border: isInProg ? "1px solid rgba(0,212,255,0.3)" : "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: isDone ? "var(--green)" : isInProg ? "var(--brand-primary)" : "var(--border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: 10,
                        }}
                      >
                        {isDone ? <Check size={12} /> : isInProg ? "●" : "○"}
                      </div>
                      <div>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>
                          {top.topicName}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>
                          Milestone: {top.milestoneTitle}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: isDone ? "var(--green)" : isInProg ? "var(--brand-primary)" : "var(--text-muted)" }}>
                      {top.solvedCount}/{top.problemsCount} Solved
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Target Role: <strong>{overview?.activePlan?.targetRoleCompany || "FAANG Product Engineer"}</strong>
            </span>
            <button
              className="btn btn-secondary"
              style={{ fontSize: "11px", padding: "4px 10px", gap: "4px" }}
              onClick={() => navigate("/learning?tab=roadmap")}
            >
              <span>Full Roadmap</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ── GOALS & READINESS ROW ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr", gap: 16 }}>
        {/* Learning Goals Tracker */}
        <div className="surface-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Flame size={16} color="var(--red)" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Active Learning Goals
              </h3>
            </div>
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="btn btn-secondary"
              style={{ padding: "5px 10px", fontSize: "11px", gap: "4px" }}
            >
              <Plus size={12} /> Add Goal
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(overview?.allGoals || [
              { id: "g1", title: "Daily DSA Target: 3 Problems", currentValue: 2, targetValue: 3, unit: "problems", goalType: "daily", streakCount: 5 },
              { id: "g2", title: "Weekly XP Pacing: 1,500 XP", currentValue: 920, targetValue: 1500, unit: "XP", goalType: "weekly", streakCount: 3 },
              { id: "g3", title: "Monthly Contest Goal: 4 Contests", currentValue: 3, targetValue: 4, unit: "contests", goalType: "monthly", streakCount: 2 },
            ]).map((g) => {
              const pct = Math.min(100, Math.round((g.currentValue / Math.max(1, g.targetValue)) * 100));
              const isCompleted = g.currentValue >= g.targetValue;
              return (
                <div
                  key={g.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="badge" style={{ textTransform: "capitalize", fontSize: "10px" }}>{g.goalType}</span>
                      <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)" }}>{g.title}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: isCompleted ? "var(--green)" : "var(--text-primary)" }}>
                        {g.currentValue} / {g.targetValue} {g.unit}
                      </span>
                      {!isCompleted && (
                        <button
                          onClick={() => handleGoalProgress(g.id)}
                          style={{
                            padding: "3px 8px",
                            borderRadius: "var(--radius-sm)",
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                            color: "var(--brand-primary)",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                          title="Log progress +1"
                        >
                          +1
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ width: "100%", height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: isCompleted ? "var(--green)" : "var(--brand-primary)",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contest & Interview Readiness Overview */}
        <div className="surface-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Trophy size={16} color="var(--amber)" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Diagnostic Readiness Analytics
              </h3>
            </div>
            <button
              onClick={() => navigate("/ai-analyst")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--blue)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <span>Full Analytics</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* Contest Score */}
            <div
              style={{
                padding: "14px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Contest Readiness
                </span>
                <Trophy size={14} color="var(--amber)" />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {overview?.contestReadiness?.overallScore || 78}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>/ 100</span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--amber)", fontWeight: 600 }}>
                Tier: Division 2 / Competitive
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: "var(--text-muted)", marginTop: "4px" }}>
                <span>Speed: {overview?.contestReadiness?.speedScore || 82}%</span>
                <span>Accuracy: {overview?.contestReadiness?.accuracyScore || 85}%</span>
              </div>
            </div>

            {/* Interview Score */}
            <div
              style={{
                padding: "14px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Interview Readiness
                </span>
                <Briefcase size={14} color="var(--green)" />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {overview?.interviewReadiness?.overallScore || 84}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>/ 100</span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--green)", fontWeight: 600 }}>
                DSA Coverage: {overview?.interviewReadiness?.dsaCoveragePct || 86}%
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: "var(--text-muted)", marginTop: "4px" }}>
                <span>Product: 88%</span>
                <span>FAANG: 82%</span>
              </div>
            </div>
          </div>

          {/* Weak topic alert strip */}
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={15} color="var(--red)" />
              <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>
                Weakest Topic: <strong>Dynamic Programming (2D Grids)</strong> (58% accuracy)
              </span>
            </div>
            <button
              onClick={() => navigate("/ai-mentor")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--red)",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Mentor Advice →
            </button>
          </div>
        </div>
      </div>

      {/* ── INTELLIGENT PROBLEM RECOMMENDATIONS ── */}
      <div className="surface-card" style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={16} color="var(--brand-primary)" />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Intelligent Adaptive Recommendations
              </h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>
              Tailored algorithm practice based on error frequency, recent contest speed, and target interview roadmaps
            </p>
          </div>

          {/* Category filter pills & refresh button */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {["All", "Practice Next", "Review Again", "Challenge Yourself", "Contest Preparation", "Interview Preparation"].map((cat) => {
              const isSelected = selectedRecCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedRecCategory(cat)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "var(--radius-sm)",
                    background: isSelected ? "var(--brand-primary)" : "var(--bg-raised)",
                    color: isSelected ? "var(--bg-canvas)" : "var(--text-secondary)",
                    border: "1px solid var(--border)",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {cat}
                </button>
              );
            })}
            <button
              onClick={handleRefreshRecommendations}
              disabled={isRefreshingRecs}
              className="btn btn-secondary"
              style={{ padding: "4px 8px", fontSize: "11px" }}
              title="Refresh AI recommendations"
            >
              <RefreshCw size={12} className={isRefreshingRecs ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
          {filteredRecs.map((rec) => (
            <div
              key={rec.id}
              style={{
                padding: 14,
                borderRadius: "var(--radius-md)",
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span className="badge badge-cyan" style={{ fontSize: "10px" }}>{rec.category}</span>
                  <DiffBadge diff={rec.difficulty} />
                </div>
                <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>
                  {rec.problemTitle}
                </h4>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                  {rec.reason}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Topic: {rec.topic}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => handleRecStatus(rec.id, "dismissed")}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                    title="Dismiss recommendation"
                  >
                    <X size={14} />
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ padding: "4px 10px", fontSize: "11px", gap: "4px" }}
                    onClick={() => navigate(`/workspace?problem=${rec.problemSlug}`)}
                  >
                    <Play size={11} /> Solve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHARTS: VELOCITY & TOPIC RADAR ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        {/* Weekly progress */}
        <div className="surface-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>Learning Velocity & Accuracy</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Daily solved problem volume and first-pass accuracy</p>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 12, height: 2, background: "var(--blue)", display: "inline-block", borderRadius: 1 }} /> Problems
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 12, height: 2, background: "var(--cyan)", display: "inline-block", borderRadius: 1 }} /> Accuracy %
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--blue)" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="var(--blue)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="problems" name="Problems" stroke="var(--blue)" strokeWidth={2} fill="url(#gP)" dot={false} activeDot={{ r: 4, fill: "var(--blue)" }} />
              <Area type="monotone" dataKey="accuracy" name="Accuracy" stroke="var(--cyan)" strokeWidth={2} fill="url(#gA)" dot={false} activeDot={{ r: 4, fill: "var(--cyan)" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Skill radar */}
        <div className="surface-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>Topic Mastery Radar</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 4px" }}>Multi-dimensional DSA competence</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={skillData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="topic"
                tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "Inter,sans-serif" }}
              />
              <Radar dataKey="value" stroke="var(--brand-primary)" fill="var(--brand-primary)" fillOpacity={0.15} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modals */}
      <StudyPlanModal
        isOpen={isStudyModalOpen}
        onClose={() => setIsStudyModalOpen(false)}
        onSubmit={handleCreateStudyPlan}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSubmit={handleCreateGoal}
      />
    </div>
  );
}
