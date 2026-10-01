/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA AI Analyst — Adaptive Intelligence, Memory Diagnostic & AI Study Planner
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip
} from "recharts";
import {
  Brain, TrendingUp, ArrowUpRight, ArrowDownRight,
  ChevronRight, AlertTriangle, Sparkles, Clock, Target, Send, Zap
} from "lucide-react";
import { INITIAL_LEARNING_MEMORY } from "../services/adaptiveEngine";
import { useAuth } from "../context/AuthContext";
import confetti from "canvas-confetti";

const radarData = INITIAL_LEARNING_MEMORY.topicMasteries.map((m) => ({
  topic: m.topicName.split(" ")[0],
  you: m.accuracyPercentage,
  avg: 70
}));

const accuracyData = [
  { w: "W1", a: 62 }, { w: "W2", a: 68 }, { w: "W3", a: 61 }, { w: "W4", a: 75 },
  { w: "W5", a: 70 }, { w: "W6", a: 79 }, { w: "W7", a: 73 }, { w: "W8", a: Math.round(INITIAL_LEARNING_MEMORY.overallAccuracy) }
];

interface StudyPlan {
  title: string;
  durationWeeks: number;
  schedule: Array<{ week: number; focus: string; targetMinutes: number }>;
}

export default function AIAnalyst() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Study plan state
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [targetCompany, setTargetCompany] = useState("Google");
  const [timelineWeeks, setTimelineWeeks] = useState(4);
  const [isGenerating, setIsSubmitting] = useState(false);

  // Recommendations state
  const [recs, setRecs] = useState<any>(null);

  useEffect(() => {
    fetchStudyPlan();
    fetchRecommendations();
  }, []);

  const fetchStudyPlan = async () => {
    try {
      const res = await fetch("/api/ai/planner");
      const json = await res.json();
      if (json.success && json.data) {
        setStudyPlan(json.data);
      }
    } catch {}
  };

  const fetchRecommendations = async () => {
    try {
      const res = await fetch("/api/ai/recommendations");
      const json = await res.json();
      if (json.success && json.data) {
        setRecs(json.data);
      }
    } catch {}
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ai/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetCompany, timelineWeeks })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setStudyPlan(json.data);
        confetti({ particleCount: 50 });
      }
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header Banner */}
      <div style={{ padding: 22, borderRadius: "var(--radius-xl)", background: "linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(124, 58, 237, 0.12))", border: "1px solid rgba(37, 99, 235, 0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ flex: 1 }}>
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
            className="btn btn-primary"
            style={{ gap: 6 }}
          >
            Start Adaptive Recommended Practice <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
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
                {change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── AI STUDY PLANNER ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
        {/* Creator panel */}
        <div className="surface-card" style={{ padding: 22, height: "fit-content" }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <Zap size={16} style={{ color: "var(--amber)" }} />
            <span>AI Study Planner</span>
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 18px" }}>
            Generate a personalized, time-boxed algorithm and interview preparation roadmap optimized for your career targets.
          </p>

          <form onSubmit={handleGeneratePlan} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Target Tech Company</label>
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 12.5 }}
              >
                <option value="Google">Google (DSA Heavy)</option>
                <option value="Amazon">Amazon (Leadership & Trees)</option>
                <option value="Meta">Meta (System Design & Scaling)</option>
                <option value="Netflix">Netflix (High scale logic)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Timeline (Weeks)</label>
              <input
                type="number"
                min="2"
                max="12"
                value={timelineWeeks}
                onChange={(e) => setTimelineWeeks(parseInt(e.target.value, 10))}
                style={{ width: "100%", padding: "8px 10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 12.5 }}
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="btn btn-primary"
              style={{ width: "100%", padding: "10px", fontSize: 12.5 }}
            >
              {isGenerating ? "Generating Study Plan..." : "Regenerate Study Plan"}
            </button>
          </form>
        </div>

        {/* Display schedule */}
        <div className="surface-card" style={{ padding: 22 }}>
          {studyPlan ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  {studyPlan.title}
                </h3>
                <span className="badge badge-blue">Timeline: {studyPlan.durationWeeks} Weeks</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {studyPlan.schedule?.map((item) => (
                  <div key={item.week} style={{ padding: "12px 14px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ width: 42, height: 42, background: "var(--blue-light)", color: "var(--blue)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 }}>
                      W{item.week}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{item.focus}</span>
                      <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        <span>Target: <strong>{item.targetMinutes} Mins</strong></span>
                        <span>•</span>
                        <span>Adaptive Pace Matching</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", padding: 40 }}>
              <Clock size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
              <span>Load your personalized AI Study plan above.</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Patterns Breakdown */}
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

      {/* Recommendations & Radar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
        <div className="surface-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>Skill Radar</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 4px" }}>You vs peer average</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <Radar name="You" dataKey="you" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.15} strokeWidth={1.5} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>AI Recommendations Hub</h3>
          {recs ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ padding: 14, background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                <span className="badge badge-blue" style={{ fontSize: 9 }}>NEXT TOPIC</span>
                <h4 style={{ fontSize: 13, fontWeight: 800, margin: "6px 0 2px" }}>{recs.nextTopic.title}</h4>
                <p style={{ fontSize: 11.5, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>{recs.nextTopic.reason}</p>
              </div>

              <div style={{ padding: 14, background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                <span className="badge badge-violet" style={{ fontSize: 9 }}>RECOMMENDED PROBLEM</span>
                <h4 style={{ fontSize: 13, fontWeight: 800, margin: "6px 0 2px" }}>{recs.nextProblem.title}</h4>
                <p style={{ fontSize: 11.5, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>{recs.nextProblem.reason}</p>
              </div>

              <div style={{ padding: 14, background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                <span className="badge badge-green" style={{ fontSize: 9 }}>PORTFOLIO PROJECT</span>
                <h4 style={{ fontSize: 13, fontWeight: 800, margin: "6px 0 2px" }}>{recs.nextProject.title}</h4>
                <p style={{ fontSize: 11.5, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>{recs.nextProject.reason}</p>
              </div>

              <div style={{ padding: 14, background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                <span className="badge badge-amber" style={{ fontSize: 9 }}>REVIEW CARD PRIORITIZATION</span>
                <h4 style={{ fontSize: 13, fontWeight: 800, margin: "6px 0 2px" }}>{recs.reviewCardPriority.title}</h4>
                <p style={{ fontSize: 11.5, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>Scheduled for review on: {recs.reviewCardPriority.nextReviewDate}</p>
              </div>
            </div>
          ) : (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>Loading Recommendations...</div>
          )}
        </div>
      </div>
    </div>
  );
}
