/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA AI Analyst — Adaptive Intelligence & Memory Diagnostic Center
 */

import React from "react";
import { useNavigate } from "react-router";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell
} from "recharts";
import {
  Brain, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  ChevronRight, AlertTriangle, Sparkles, Target, Zap, Clock, ShieldAlert,
  Award, RefreshCw, CheckCircle2
} from "lucide-react";
import { INITIAL_LEARNING_MEMORY } from "../services/adaptiveEngine";

const radarData = INITIAL_LEARNING_MEMORY.topicMasteries.map((m) => ({
  topic: m.topicName.split(" ")[0],
  you: m.accuracyPercentage,
  avg: 70
}));

const accuracyData = [
  { w: "W1", a: 62 }, { w: "W2", a: 68 }, { w: "W3", a: 61 }, { w: "W4", a: 75 },
  { w: "W5", a: 70 }, { w: "W6", a: 79 }, { w: "W7", a: 73 }, { w: "W8", a: Math.round(INITIAL_LEARNING_MEMORY.overallAccuracy) }
];

const timeData = [
  { d: "Mon", m: 45 }, { d: "Tue", m: 90 }, { d: "Wed", m: 30 },
  { d: "Thu", m: 120 }, { d: "Fri", m: 75 }, { d: "Sat", m: 150 }, { d: "Sun", m: 60 }
];

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "8px 12px", boxShadow: "var(--shadow-md)", fontSize: 11 }}>
      <p style={{ fontWeight: 600, color: "var(--text-primary)", margin: "0 0 5px" }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "var(--text-muted)" }}>
          <span>{p.name || p.dataKey}</span>
          <span style={{ color: p.stroke || p.fill, fontWeight: 600 }}>{p.value}{p.dataKey === "a" ? "%" : ""}</span>
        </div>
      ))}
    </div>
  );
}

export default function AIAnalyst() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── ADAPTIVE LEARNING PATH HEADER BANNER ── */}
      <div style={{ padding: 22, borderRadius: "var(--radius-xl)", background: "linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(124, 58, 237, 0.12))", border: "1px solid rgba(37, 99, 235, 0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Brain size={20} style={{ color: "var(--blue)" }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Personalized Adaptive Path: {INITIAL_LEARNING_MEMORY.nextMilestoneGoal}
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              ALGORA's Learning Memory System detected low retention in <strong>Dynamic Programming</strong>. Your recommended next step is 1D Tabulation.
            </p>
          </div>

          <button
            onClick={() => navigate("/workspace?problem=longest-palindromic-substring")}
            style={{
              padding: "10px 18px",
              borderRadius: "var(--radius-md)",
              background: "var(--blue)",
              color: "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: 12.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            Start Adaptive Recommended Practice <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Overall Accuracy", value: `${INITIAL_LEARNING_MEMORY.overallAccuracy}%`, change: "+8%", up: true },
          { label: "Solving Velocity", value: `${INITIAL_LEARNING_MEMORY.solvingVelocityMins}m`, change: "-3.2m", up: true },
          { label: "Memory Retention Rate", value: `${INITIAL_LEARNING_MEMORY.retentionRate}%`, change: "SuperMemo-2", up: true },
          { label: "Weak Concepts Tracked", value: `${INITIAL_LEARNING_MEMORY.weakTopics.length}`, change: "Action Needed", up: false }
        ].map(({ label, value, change, up }) => (
          <div key={label} className="surface-card" style={{ padding: 20 }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 10px" }}>{label}</p>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>{value}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: up ? "var(--green)" : "var(--red)", display: "flex", alignItems: "center", gap: 2 }}>
                {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── IDENTIFIED LEARNING ERROR PATTERNS ── */}
      <div className="surface-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <AlertTriangle size={18} style={{ color: "var(--amber)" }} />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Learning Memory: Detected Student Code Patterns & Misconceptions
          </h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {INITIAL_LEARNING_MEMORY.identifiedErrorPatterns.map((err, idx) => (
            <div key={idx} style={{ padding: 14, borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)" }}>{err.patternName}</span>
                <span className="badge badge-amber" style={{ fontSize: 10 }}>{err.occurrences} Occurrences</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 10px", lineHeight: 1.5 }}>
                {err.description}
              </p>
              <div style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 600 }}>
                💡 Remediation: {err.recommendedRemediation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
        <div className="surface-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>Skill Radar</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 4px" }}>You vs peer average</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "Inter,sans-serif" }} />
              <Radar name="You" dataKey="you" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.15} strokeWidth={1.5} />
              <Radar name="Avg" dataKey="avg" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.07} strokeWidth={1.5} strokeDasharray="3 2" />
              <Tooltip content={<Tip />} />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, fontSize: 11, color: "var(--text-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 12, height: 2, background: "var(--blue)", display: "inline-block", borderRadius: 1 }} /> You
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 12, height: 2, background: "var(--cyan)", display: "inline-block", borderRadius: 1, opacity: 0.7 }} /> Avg
            </span>
          </div>
        </div>

        <div className="surface-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>Accuracy Trend</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>8-week rolling adaptive accuracy</p>
            </div>
            <span className="badge badge-green" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <TrendingUp size={10} /> +21% overall
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={accuracyData} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--blue)" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="var(--blue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="w" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="a" name="Accuracy %" stroke="var(--blue)" strokeWidth={2} fill="url(#ag)" dot={false} activeDot={{ r: 4, fill: "var(--blue)" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Adaptive Recommendations */}
      <div className="surface-card" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <Brain size={15} style={{ color: "var(--blue)" }} />
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            Adaptive Recommendations Engine
          </h3>
          <span className="badge badge-blue" style={{ marginLeft: "auto" }}>Powered by Learning Memory</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "none" }}>
          {INITIAL_LEARNING_MEMORY.adaptiveRecommendations.map((rec) => (
            <div
              key={rec.id}
              onClick={() => navigate(rec.actionUrl)}
              style={{
                padding: "20px 22px",
                borderRight: "1px solid var(--border)",
                cursor: "pointer"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span className="badge" style={{ background: "var(--bg-subtle)", color: rec.colorBadge, fontWeight: 700 }}>
                  {rec.priority}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
                  {rec.type.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                {rec.title}
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 12px" }}>
                {rec.reason}
              </p>
              <button style={{ fontSize: 11.5, color: rec.colorBadge, display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>
                Open Practice <ChevronRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
