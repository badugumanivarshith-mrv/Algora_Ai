import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import {
  Brain, TrendingUp, TrendingDown, ArrowUpRight, ChevronRight,
  AlertTriangle, Award, CheckCircle2, Code2, Target, Sparkles,
  Zap, Clock, Compass, Trophy, Briefcase, FileText, Download,
  Layers, Check, Flame, ArrowRight,
} from "lucide-react";
import { AIService } from "../services/aiService";
import { AdaptiveApi } from "../services/adaptiveApi";
import { AnalystReport, ReadinessScoreEntity, SkillAssessmentEntity } from "../types";

type TimeRange = "7d" | "30d" | "all";
type AnalystTab = "overview" | "timeline" | "goals" | "readiness" | "reports";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    name?: string;
    value: number;
    stroke?: string;
    fill?: string;
  }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "8px 12px",
        boxShadow: "var(--shadow-md)",
        fontSize: "11px",
      }}
    >
      <p style={{ fontWeight: 600, color: "var(--text-primary)", margin: "0 0 5px" }}>{label}</p>
      {payload.map((p) => (
        <div
          key={p.dataKey}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            color: "var(--text-muted)",
          }}
        >
          <span>{p.name || p.dataKey}</span>
          <span style={{ color: p.stroke || p.fill || "var(--text-primary)", fontWeight: 600 }}>
            {p.value}
            {p.dataKey.toLowerCase().includes("accuracy") || p.dataKey.toLowerCase().includes("score") || p.dataKey.toLowerCase().includes("pct") ? "%" : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AIAnalyst() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [report, setReport] = useState<AnalystReport>(() => AIService.getAnalystReport("30d"));
  const [activeTab, setActiveTab] = useState<AnalystTab>("overview");
  const [masteryTimeline, setMasteryTimeline] = useState<any[]>([]);
  const [skillGap, setSkillGap] = useState<any[]>([]);
  const [contestReadiness, setContestReadiness] = useState<ReadinessScoreEntity | null>(null);
  const [interviewReadiness, setInterviewReadiness] = useState<ReadinessScoreEntity | null>(null);
  const [weakTopics, setWeakTopics] = useState<SkillAssessmentEntity[]>([]);

  useEffect(() => {
    const updated = AIService.getAnalystReport(timeRange);
    setReport(updated);
  }, [timeRange]);

  useEffect(() => {
    async function loadExtraAnalytics() {
      try {
        const [timelineData, gapData, contestData, interviewData, weakData] = await Promise.all([
          AdaptiveApi.getMasteryTimeline(),
          AdaptiveApi.getSkillGapAnalysis(),
          AdaptiveApi.getContestReadiness(),
          AdaptiveApi.getInterviewReadiness(),
          AdaptiveApi.getWeakTopics(),
        ]);
        setMasteryTimeline(timelineData);
        setSkillGap(gapData);
        setContestReadiness(contestData);
        setInterviewReadiness(interviewData);
        setWeakTopics(weakData);
      } catch (err) {
        console.error("Failed loading analytics", err);
      }
    }
    loadExtraAnalytics();
  }, []);

  // Formatted data for Radar Chart
  const radarChartData = report.topicMastery.map((t) => ({
    topic: t.topic.split(" ")[0],
    you: t.score,
    avg: t.benchmark,
  }));

  return (
    <div
      id="ai-analyst-dashboard"
      style={{
        padding: "24px 32px",
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* HEADER BAR */}
      <header
        id="analyst-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-md)",
                background: "rgba(0, 212, 255, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--brand-primary)",
              }}
            >
              <Brain size={18} />
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
              AI Algorithmic Diagnostic Analyst
            </h1>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: "4px 0 0" }}>
            Continuous algorithmic intelligence tracking topic mastery curves, velocity pacing, and FAANG interview readiness.
          </p>
        </div>

        {/* TIME RANGE SELECTOR */}
        <div
          id="analyst-time-selector"
          style={{
            display: "flex",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "3px",
            gap: "2px",
          }}
        >
          {(["7d", "30d", "all"] as TimeRange[]).map((range) => {
            const isSelected = timeRange === range;
            const labels: Record<TimeRange, string> = { "7d": "Last 7 Days", "30d": "Last 30 Days", "all": "All Time" };
            return (
              <button
                key={range}
                id={`time-filter-${range}`}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: isSelected ? "var(--brand-primary)" : "transparent",
                  color: isSelected ? "var(--bg-canvas)" : "var(--text-secondary)",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {labels[range]}
              </button>
            );
          })}
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border)",
          gap: "8px",
          overflowX: "auto",
        }}
      >
        {[
          { id: "overview", label: "Executive Overview", icon: Layers },
          { id: "timeline", label: "Mastery Timeline & Growth", icon: TrendingUp },
          { id: "goals", label: "Goals & Pacing", icon: Flame },
          { id: "readiness", label: "Contest & Interview Readiness", icon: Trophy },
          { id: "reports", label: "Diagnostic Reports", icon: FileText },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AnalystTab)}
              style={{
                padding: "10px 16px",
                background: "transparent",
                border: "none",
                borderBottom: isSelected ? "2px solid var(--brand-primary)" : "2px solid transparent",
                color: isSelected ? "var(--brand-primary)" : "var(--text-muted)",
                fontSize: "13px",
                fontWeight: isSelected ? 700 : 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: EXECUTIVE OVERVIEW ── */}
      {activeTab === "overview" && (
        <>
          {/* TOP KPI CARDS */}
          <section
            id="analyst-kpi-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Readiness Score */}
            <div className="surface-card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                  Composite Readiness
                </span>
                <Target size={16} color="var(--brand-primary)" />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {report.readinessScore}
                </span>
                <span style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>/ 100</span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--green)", fontWeight: 600 }}>
                {report.readinessTier}
              </span>
            </div>

            {/* Problems Solved */}
            <div className="surface-card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                  Problems Solved
                </span>
                <CheckCircle2 size={16} color="var(--green)" />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {report.totalSolved}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                  ({report.totalSubmissions} attempts)
                </span>
              </div>
              <div style={{ display: "flex", gap: "6px", fontSize: "11px" }}>
                <span style={{ color: "var(--green)" }}>{report.difficultyStats.easy} Easy</span>
                <span style={{ color: "var(--text-tertiary)" }}>·</span>
                <span style={{ color: "var(--amber)" }}>{report.difficultyStats.medium} Med</span>
                <span style={{ color: "var(--text-tertiary)" }}>·</span>
                <span style={{ color: "var(--red)" }}>{report.difficultyStats.hard} Hard</span>
              </div>
            </div>

            {/* Overall Accuracy */}
            <div className="surface-card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                  Submission Accuracy
                </span>
                <TrendingUp size={16} color="var(--blue)" />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {report.overallAccuracy}%
                </span>
                <span style={{ fontSize: "12px", color: "var(--green)", fontWeight: 600 }}>
                  +4.8% vs benchmark
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                First-pass clean run: 61%
              </span>
            </div>

            {/* Primary Stack */}
            <div className="surface-card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                  Primary Language
                </span>
                <Code2 size={16} color="var(--violet)" />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Python 3
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>61% usage</span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Secondary: C++ (26%), Java (10%)
              </span>
            </div>
          </section>

          {/* CHARTS GRID: Radar + Accuracy Trend */}
          <section
            id="analyst-charts-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Topic Mastery Radar */}
            <div className="surface-card" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>
                    Topic Mastery vs Target Benchmark
                  </h2>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)", margin: "2px 0 0" }}>
                    Compares your algorithmic skill retention against target interview benchmarks
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--brand-primary)" }} />
                    Your Skill
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--border)" }} />
                    Target Benchmark
                  </span>
                </div>
              </div>

              <div style={{ height: "260px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarChartData} outerRadius="75%">
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="topic" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
                    <Radar name="Your Skill" dataKey="you" stroke="var(--brand-primary)" fill="var(--brand-primary)" fillOpacity={0.25} />
                    <Radar name="Benchmark" dataKey="avg" stroke="var(--border)" fill="var(--border)" fillOpacity={0.1} />
                    <Tooltip content={<ChartTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Accuracy & Velocity Trend */}
            <div className="surface-card" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>
                    Accuracy & Velocity Progression
                  </h2>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)", margin: "2px 0 0" }}>
                    Weekly submission accuracy percentage across active solving cycles
                  </p>
                </div>
                <span style={{ fontSize: "12px", color: "var(--green)", fontWeight: 600 }}>
                  Recent: 84%
                </span>
              </div>

              <div style={{ height: "260px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report.accuracyTrends}>
                    <defs>
                      <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="period" stroke="var(--text-tertiary)" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
                    <YAxis stroke="var(--text-tertiary)" domain={[40, 100]} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      name="Accuracy"
                      stroke="var(--brand-primary)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#accuracyGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* HIGH PRIORITY WEAK AREAS & REMEDIATION */}
          <section className="surface-card" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={16} color="var(--amber)" />
                <h2 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>
                  Algorithmic Weakness Diagnostic Matrix
                </h2>
              </div>
              <Link to="/ai-mentor" style={{ fontSize: "12px", color: "var(--brand-primary)", textDecoration: "none", fontWeight: 600 }}>
                Open AI Mentor Consult →
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "12px" }}>
              {report.weakAreas.map((weak, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "14px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-raised)",
                    border: weak.severity === "Critical" ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{weak.topic}</span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: weak.severity === "Critical" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                        color: weak.severity === "Critical" ? "var(--red)" : "var(--amber)",
                      }}
                    >
                      {weak.severity}
                    </span>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)", margin: 0 }}>
                    {weak.gap} · Accuracy: {weak.accuracy}%
                  </p>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      background: "var(--bg-surface)",
                      padding: "8px 10px",
                      borderRadius: "var(--radius-sm)",
                      borderLeft: `3px solid ${weak.severity === "Critical" ? "var(--red)" : "var(--amber)"}`,
                    }}
                  >
                    💡 <strong>Action:</strong> {weak.suggestedAction}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── TAB 2: MASTERY TIMELINE & TOPIC GROWTH ── */}
      {activeTab === "timeline" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="surface-card" style={{ padding: "22px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  Multi-Topic Mastery Evolution (8-Week Trajectory)
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                  Longitudinal mastery growth across foundational to advanced data structures
                </p>
              </div>
            </div>

            <div style={{ height: "320px", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={masteryTimeline.length ? masteryTimeline : [
                  { week: "W1", arrays: 50, dp: 20, graphs: 30, trees: 40 },
                  { week: "W2", arrays: 62, dp: 28, graphs: 45, trees: 48 },
                  { week: "W3", arrays: 70, dp: 35, graphs: 58, trees: 55 },
                  { week: "W4", arrays: 78, dp: 42, graphs: 68, trees: 62 },
                  { week: "W5", arrays: 82, dp: 48, graphs: 76, trees: 66 },
                  { week: "W6", arrays: 85, dp: 54, graphs: 84, trees: 70 },
                  { week: "W7", arrays: 88, dp: 56, graphs: 88, trees: 72 },
                  { week: "W8", arrays: 92, dp: 62, graphs: 91, trees: 75 },
                ]}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="week" stroke="var(--text-tertiary)" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="var(--text-tertiary)" tick={{ fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="arrays" name="Arrays & Hashing" stroke="var(--green)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="graphs" name="Graph Algorithms" stroke="var(--brand-primary)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="trees" name="Trees & BST" stroke="var(--violet)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="dp" name="Dynamic Programming" stroke="var(--amber)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Topic Velocity Deltas */}
          <div className="surface-card" style={{ padding: "20px 24px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 14px", color: "var(--text-primary)" }}>
              Weekly Learning Velocity & Topic Delta
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              {[
                { topic: "Arrays & Sliding Window", delta: "+8%", current: "92%", color: "var(--green)" },
                { topic: "Graph Algorithms", delta: "+12%", current: "91%", color: "var(--green)" },
                { topic: "Trees & BST", delta: "+5%", current: "75%", color: "var(--blue)" },
                { topic: "Dynamic Programming", delta: "+14%", current: "62%", color: "var(--amber)" },
                { topic: "Backtracking", delta: "+4%", current: "48%", color: "var(--red)" },
              ].map((item) => (
                <div
                  key={item.topic}
                  style={{
                    padding: "12px 14px",
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", display: "block" }}>
                    {item.topic}
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "6px" }}>
                    <span style={{ fontSize: "20px", fontWeight: 800, color: item.color }}>{item.current}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--green)" }}>{item.delta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: GOALS & PACING ── */}
      {activeTab === "goals" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div className="surface-card" style={{ padding: "22px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 12px", color: "var(--text-primary)" }}>
              Goal Completion & Pacing Velocity
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 16px" }}>
              Weekly consistency vs planned milestones
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Daily Problem Goal", hitRate: "93%", streak: "28 Days", status: "Optimal" },
                { label: "Weekly XP Pacing", hitRate: "88%", streak: "6 Weeks", status: "On Track" },
                { label: "Topic Milestones Met", hitRate: "75%", streak: "4 Topics", status: "Accelerating" },
                { label: "Weekly Contest Participation", hitRate: "100%", streak: "8 Contests", status: "Flawless" },
              ].map((g) => (
                <div
                  key={g.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    background: "var(--bg-raised)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", display: "block" }}>
                      {g.label}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Current Streak: {g.streak}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--brand-primary)" }}>{g.hitRate}</span>
                    <span style={{ fontSize: "10px", display: "block", color: "var(--green)", fontWeight: 700 }}>{g.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card" style={{ padding: "22px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 12px", color: "var(--text-primary)" }}>
              Daily Study Pacing Distribution (Minutes / Day)
            </h3>
            <div style={{ height: "220px", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { day: "Mon", minutes: 45 },
                  { day: "Tue", minutes: 60 },
                  { day: "Wed", minutes: 35 },
                  { day: "Thu", minutes: 80 },
                  { day: "Fri", minutes: 50 },
                  { day: "Sat", minutes: 95 },
                  { day: "Sun", minutes: 40 },
                ]}>
                  <XAxis dataKey="day" stroke="var(--text-tertiary)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--text-tertiary)" tick={{ fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="minutes" name="Study Minutes" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: CONTEST & INTERVIEW READINESS ── */}
      {activeTab === "readiness" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Contest Breakdown */}
          <div className="surface-card" style={{ padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Trophy size={18} color="var(--amber)" />
              <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Contest Readiness Diagnostic (78 / 100)
              </h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 16px" }}>
              Evaluates speed, penalty rate, penalty avoidance, and contest difficulty handling.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { metric: "Problem 1 (Easy) Execution Speed", score: "92%", note: "Avg 4.2 mins" },
                { metric: "Problem 2 (Medium) Pattern Detection", score: "84%", note: "Avg 14.8 mins" },
                { metric: "Problem 3 (Medium/Hard) Algorithm Selection", score: "68%", note: "Avg 26.5 mins" },
                { metric: "Submission Penalty Avoidance", score: "88%", note: "1.1 WA per contest" },
                { metric: "Time Complexity Verification", score: "82%", note: "Low TLE frequency" },
              ].map((item) => (
                <div
                  key={item.metric}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "var(--bg-raised)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{item.metric}</span>
                    <span style={{ fontSize: "10.5px", color: "var(--text-muted)", display: "block" }}>{item.note}</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--amber)" }}>{item.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Breakdown */}
          <div className="surface-card" style={{ padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Briefcase size={18} color="var(--green)" />
              <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Tech Interview Readiness (84 / 100)
              </h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 16px" }}>
              Company-level readiness benchmarks for high-frequency technical interview loops.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { company: "Top Tier Product Companies (Stripe, Uber, Airbnb)", ready: "88%", status: "Interview Ready" },
                { company: "FAANG / Tier 1 (Google, Meta, Amazon)", ready: "82%", status: "Needs DP Grid polish" },
                { company: "High-Growth Startups", ready: "92%", status: "Highly Competitive" },
                { company: "Quantitative & FinTech DSA", ready: "74%", status: "Strengthen Graph Flow" },
              ].map((c) => (
                <div
                  key={c.company}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "var(--bg-raised)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{c.company}</span>
                    <span style={{ fontSize: "10.5px", color: "var(--text-muted)", display: "block" }}>{c.status}</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--green)" }}>{c.ready}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: DIAGNOSTIC REPORTS ── */}
      {activeTab === "reports" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="surface-card" style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}>
              <div>
                <span className="badge badge-green" style={{ marginBottom: "6px" }}>GENERATED REPORT</span>
                <h2 style={{ fontSize: "18px", fontWeight: 800, margin: "4px 0 0", color: "var(--text-primary)" }}>
                  Algora Weekly Personalization & Skill Gap Audit
                </h2>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                  Assessment Period: Current Week · Candidate: Arjun Patel (Rank #1,204)
                </p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => window.print()}
                style={{ fontSize: "12px", padding: "6px 12px", gap: "6px" }}
              >
                <Download size={14} /> Export Report
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "13px", lineHeight: 1.6, color: "var(--text-secondary)" }}>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>
                  1. Executive Summary & Growth Velocity
                </h4>
                <p style={{ margin: 0 }}>
                  Candidate demonstrated consistent daily solving velocity, completing <strong>12 DSA problems</strong> and accumulating <strong>1,420 XP</strong> over the observed cycle. First-pass acceptance rate rose by <strong>+4.8%</strong>, propelled by exceptional mastery in <strong>Graph BFS/DFS (90%)</strong> and <strong>Array Sliding Windows (88%)</strong>.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>
                  2. Identified Skill Gaps & Risk Areas
                </h4>
                <ul style={{ margin: 0, paddingLeft: "18px" }}>
                  <li><strong>Dynamic Programming (2D Grids)</strong>: 58% accuracy. Failure signature indicates edge case boundary slips on (0,0) / (N-1, M-1) initialization.</li>
                  <li><strong>Backtracking & Pruning</strong>: 48% accuracy. Candidate recurses too deeply before verifying constraints.</li>
                  <li><strong>Monotonic Stack / Span Lookups</strong>: 52% accuracy. Runtime penalties occur on multi-pass scans.</li>
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>
                  3. Prescribed 7-Day Action Directives
                </h4>
                <ol style={{ margin: 0, paddingLeft: "18px" }}>
                  <li>Complete 3 curated 1D/2D DP problems focusing strictly on state recurrence formulas before coding.</li>
                  <li>Perform 2 timed contest simulations (max 25 min/problem) in the Algora Contest Arena.</li>
                  <li>Consult Socratic AI Mentor for state pruning templates in Backtracking.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
