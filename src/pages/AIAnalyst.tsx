import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ChevronRight,
  AlertTriangle,
  Award,
  CheckCircle2,
  Code2,
  Target,
  Sparkles,
  Zap,
  Clock,
  Compass,
} from "lucide-react";
import { AIService } from "../services/aiService";
import { AnalystReport, AnalystRecommendation } from "../types";

type TimeRange = "7d" | "30d" | "all";

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
            {p.dataKey === "accuracy" ? "%" : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AIAnalyst() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [report, setReport] = useState<AnalystReport>(() => AIService.getAnalystReport("30d"));
  const [activeTab, setActiveTab] = useState<"overview" | "topics" | "languages" | "recommendations">("overview");

  useEffect(() => {
    const updated = AIService.getAnalystReport(timeRange);
    setReport(updated);
  }, [timeRange]);

  // Formatted data for Radar Chart
  const radarChartData = report.topicMastery.map((t) => ({
    topic: t.topic.split(" ")[0],
    you: t.score,
    avg: t.benchmark,
  }));

  // Formatted data for Difficulty Breakdown
  const diffData = [
    { name: "Easy", count: report.difficultyStats.easy, color: "var(--green)" },
    { name: "Medium", count: report.difficultyStats.medium, color: "var(--amber)" },
    { name: "Hard", count: report.difficultyStats.hard, color: "var(--red)" },
  ];

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
              AI Algorithmic Analyst
            </h1>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: "4px 0 0" }}>
            Continuous diagnostic telemetry tracking problem accuracy, topic strengths, and interview readiness.
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
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
              Readiness Score
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
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
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
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
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
              +4.8% vs avg
            </span>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
            First-try pass rate: 61%
          </span>
        </div>

        {/* Primary Language */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
              Primary Stack
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
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>
                Topic Mastery vs Benchmark
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
                Target Avg
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
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
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

      {/* TOPIC MASTERY TABLE & WEAK AREAS */}
      <section
        id="analyst-diagnostics-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Detailed Topic Mastery Breakdown */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>
              Topic Strength Diagnostics
            </h2>
            <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
              {report.topicMastery.length} topics tracked
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {report.topicMastery.map((tm) => {
              const badgeColor =
                tm.level === "Strong"
                  ? "var(--green)"
                  : tm.level === "Proficient"
                  ? "var(--blue)"
                  : tm.level === "Needs Practice"
                  ? "var(--amber)"
                  : "var(--red)";

              return (
                <div
                  key={tm.topic}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "var(--bg-raised)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    gap: "12px",
                  }}
                >
                  <div style={{ minWidth: "140px", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600 }}>{tm.topic}</span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "4px",
                        background: "var(--border)",
                        borderRadius: "2px",
                        marginTop: "6px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${tm.score}%`,
                          height: "100%",
                          background: badgeColor,
                          borderRadius: "2px",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                      {tm.solvedCount}/{tm.totalCount} solved
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "2px 7px",
                        borderRadius: "4px",
                        background: `rgba(255, 255, 255, 0.05)`,
                        color: badgeColor,
                        fontWeight: 700,
                        border: `1px solid ${badgeColor}`,
                      }}
                    >
                      {tm.score}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Critical Weak Areas & Suggested Remediation */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertTriangle size={16} color="var(--amber)" />
              <h2 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>
                High-Priority Weak Areas
              </h2>
            </div>
            <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
              Remediation Action Plan
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {report.weakAreas.map((weak, idx) => (
              <div
                key={idx}
                style={{
                  padding: "14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-raised)",
                  border:
                    weak.severity === "Critical"
                      ? "1px solid rgba(239, 68, 68, 0.3)"
                      : "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {weak.topic}
                  </span>
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

          {/* Quick Trigger to Mentor */}
          <Link
            to="/mentor"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px",
              borderRadius: "var(--radius-md)",
              background: "rgba(0, 212, 255, 0.1)",
              border: "1px solid rgba(0, 212, 255, 0.25)",
              color: "var(--brand-primary)",
              fontSize: "12px",
              fontWeight: 600,
              textDecoration: "none",
              marginTop: "auto",
            }}
          >
            <Sparkles size={14} />
            <span>Consult AI Mentor on Weak Topics</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </section>

      {/* ACTIONABLE RECOMMENDATIONS SECTION */}
      <section
        id="analyst-recommendations"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "22px 26px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>
              Prescribed AI Remediation Recommendations
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: "3px 0 0" }}>
              Automated learning roadmap adjustments to bridge algorithmic gaps before mock interviews.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "14px",
          }}
        >
          {report.recommendations.map((rec) => {
            const badgeColor =
              rec.priority === "High"
                ? "var(--red)"
                : rec.priority === "Medium"
                ? "var(--amber)"
                : "var(--green)";

            return (
              <div
                key={rec.id}
                id={`recommendation-card-${rec.id}`}
                style={{
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {rec.topic}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: "4px",
                        background: `rgba(255, 255, 255, 0.06)`,
                        color: badgeColor,
                        border: `1px solid ${badgeColor}`,
                      }}
                    >
                      {rec.priority} Priority
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 8px", lineHeight: 1.5 }}>
                    {rec.insight}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)", margin: 0, fontWeight: 500 }}>
                    🎯 <strong>Suggested Step:</strong> {rec.actionableStep}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  {rec.suggestedProblemSlug && (
                    <Link
                      to={`/workspace?problem=${rec.suggestedProblemSlug}`}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                        padding: "7px 10px",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--brand-primary)",
                        color: "var(--bg-canvas)",
                        fontSize: "11px",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      <span>Practice Problem</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  )}
                  <Link
                    to="/learning?tab=topics"
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      padding: "7px 10px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                      fontSize: "11px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <span>Open Module</span>
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
