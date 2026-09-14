import React, { useState, useEffect } from "react";
import {
  Sparkles, Brain, Target, AlertTriangle, TrendingUp, CheckCircle2,
  Compass, ArrowRight, Zap, RefreshCw, BookOpen, Calendar, Clock,
  Award, Check, RotateCcw, AlertCircle, ChevronRight, Layers, UserCheck
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import {
  AdaptiveLearningApi, SkillProfileData, WeaknessData,
  DailyReviewData, LearningPathData, StudyPlanData
} from "../services/adaptiveLearningApi";

export default function AdaptiveRoadmapV2() {
  const [profile, setProfile] = useState<SkillProfileData | null>(null);
  const [weaknesses, setWeaknesses] = useState<WeaknessData[]>([]);
  const [dailyReviews, setDailyReviews] = useState<{ todaysReview: DailyReviewData[]; needsRevision: DailyReviewData[] }>({
    todaysReview: [],
    needsRevision: [],
  });
  const [path, setPath] = useState<LearningPathData | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlanData | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [targetGoal, setTargetGoal] = useState("Google");
  const [placementGoal, setPlacementGoal] = useState("FAANG Product Engineer");
  const [availableHours, setAvailableHours] = useState(12);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "path" | "reviews" | "planner" | "recommendations">("overview");

  useEffect(() => {
    loadAllAdaptiveData();
  }, [targetGoal]);

  const loadAllAdaptiveData = async () => {
    setLoading(true);
    try {
      const [profData, weakData, revData, pathData, recData] = await Promise.all([
        AdaptiveLearningApi.getSkillProfile(),
        AdaptiveLearningApi.getWeaknesses(),
        AdaptiveLearningApi.getDailyReviews(),
        AdaptiveLearningApi.getLearningPath(targetGoal),
        AdaptiveLearningApi.getRecommendations(),
      ]);

      setProfile(profData);
      setWeaknesses(weakData);
      setDailyReviews(revData);
      setPath(pathData);
      setRecommendations(recData);
    } catch (err) {
      console.error("[AdaptiveRoadmapV2] Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStudyPlan = async () => {
    setGeneratingPlan(true);
    try {
      const plan = await AdaptiveLearningApi.generateStudyPlan(placementGoal, availableHours);
      setStudyPlan(plan);
      setActiveTab("planner");
    } catch (err) {
      console.error("[AdaptiveRoadmapV2] Error generating plan:", err);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleReviewSubmit = async (reviewId: string, score: number) => {
    await AdaptiveLearningApi.submitDailyReview(reviewId, score);
    const updated = await AdaptiveLearningApi.getDailyReviews();
    setDailyReviews(updated);
  };

  const radarData = profile
    ? Object.entries(profile.topicMastery).map(([topic, score]) => ({
        subject: topic,
        Mastery: score,
        Benchmark: topic === "Arrays" ? 90 : topic === "Dynamic Programming" ? 80 : 85,
      }))
    : [];

  if (loading && !profile) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
        <RefreshCw className="animate-spin" style={{ margin: "0 auto 12px", width: 28, height: 28, color: "var(--violet)" }} />
        <p style={{ fontWeight: 600 }}>Loading V2-2 Adaptive AI Learning Engine...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
              Adaptive AI Learning Engine
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 999,
                background: "color-mix(in srgb, var(--violet) 15%, transparent)",
                color: "var(--violet)",
                border: "1px solid color-mix(in srgb, var(--violet) 30%, transparent)",
              }}
            >
              V2-2 Engine
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
            Personalized skill profile, weakness detection, spaced-repetition daily review, and dynamic study planner.
          </p>
        </div>

        {/* Goal Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Target Company Goal:</span>
          <select
            value={targetGoal}
            onChange={(e) => setTargetGoal(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <option value="Google">Google Target</option>
            <option value="Amazon">Amazon Target</option>
            <option value="Meta">Meta Target</option>
            <option value="Microsoft">Microsoft Target</option>
            <option value="TCS / Service">Service / TCS Track</option>
          </select>
          <button onClick={loadAllAdaptiveData} className="btn btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw style={{ width: 14, height: 14 }} /> Refresh Engine
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("overview")}
          className={`btn btn-sm ${activeTab === "overview" ? "btn-primary" : "btn-ghost"}`}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Brain style={{ width: 14, height: 14 }} /> Skill Profile & Weaknesses
        </button>
        <button
          onClick={() => setActiveTab("path")}
          className={`btn btn-sm ${activeTab === "path" ? "btn-primary" : "btn-ghost"}`}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Compass style={{ width: 14, height: 14 }} /> Personalized Learning Path
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`btn btn-sm ${activeTab === "reviews" ? "btn-primary" : "btn-ghost"}`}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <RotateCcw style={{ width: 14, height: 14 }} /> Daily Review (SRS)
        </button>
        <button
          onClick={() => setActiveTab("planner")}
          className={`btn btn-sm ${activeTab === "planner" ? "btn-primary" : "btn-ghost"}`}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Calendar style={{ width: 14, height: 14 }} /> AI Study Planner
        </button>
        <button
          onClick={() => setActiveTab("recommendations")}
          className={`btn btn-sm ${activeTab === "recommendations" ? "btn-primary" : "btn-ghost"}`}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Zap style={{ width: 14, height: 14 }} /> Adaptive Recommendations
        </button>
      </div>

      {/* Tab 1: Skill Profile & Weakness Detection */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Top Banner */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Overall Skill Level</span>
                <Brain style={{ width: 18, height: 18, color: "var(--violet)" }} />
              </div>
              <p style={{ fontSize: 24, fontWeight: 800, color: "var(--violet)", margin: "8px 0 0" }}>{profile?.overallSkillLevel}</p>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Target Goal: {targetGoal}</span>
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Top Strength</span>
                <CheckCircle2 style={{ width: 18, height: 18, color: "var(--green)" }} />
              </div>
              <p style={{ fontSize: 20, fontWeight: 800, color: "var(--green)", margin: "8px 0 0" }}>Arrays & Strings (88%)</p>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>High accuracy, quick solve time</span>
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Critical Gap</span>
                <AlertTriangle style={{ width: 18, height: 18, color: "var(--red)" }} />
              </div>
              <p style={{ fontSize: 20, fontWeight: 800, color: "var(--red)", margin: "8px 0 0" }}>Dynamic Programming (21%)</p>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Requires state transition review</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Topic Mastery Breakdown */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <TrendingUp style={{ width: 16, height: 16, color: "var(--violet)" }} /> Topic Mastery Breakdown
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {profile &&
                  Object.entries(profile.topicMastery).map(([topic, pct]) => {
                    const val = Number(pct) || 0;
                    return (
                      <div key={topic}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                          <span>{topic}</span>
                          <span style={{ color: val < 50 ? "var(--red)" : val < 75 ? "var(--amber)" : "var(--green)" }}>{val}%</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, background: "var(--bg-subtle)", overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${val}%`,
                              background: val < 50 ? "var(--red)" : val < 75 ? "var(--amber)" : "var(--green)",
                              borderRadius: 4,
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Radar Chart */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20, height: 320 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
                <Award style={{ width: 16, height: 16, color: "var(--violet)" }} /> Mastery vs Benchmark
              </h3>
              <ResponsiveContainer width="100%" height="85%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Student Mastery" dataKey="Mastery" stroke="var(--violet)" fill="var(--violet)" fillOpacity={0.4} />
                  <Radar name="Target Benchmark" dataKey="Benchmark" stroke="var(--amber)" fill="transparent" strokeDasharray="3 3" />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weakness Detection Section */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle style={{ width: 16, height: 16, color: "var(--amber)" }} /> Automated Weakness Detection Log
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {weaknesses.map((w) => (
                <div
                  key={w.id}
                  style={{
                    padding: 14,
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justify: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        padding: 8,
                        borderRadius: "var(--radius-md)",
                        background: w.severity === "High" ? "color-mix(in srgb, var(--red) 15%, transparent)" : "color-mix(in srgb, var(--amber) 15%, transparent)",
                        color: w.severity === "High" ? "var(--red)" : "var(--amber)",
                      }}
                    >
                      <AlertCircle style={{ width: 18, height: 18 }} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{w.topic}</span>
                        <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                          Type: {w.weaknessType}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>{w.details}</p>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: 999,
                      background: w.severity === "High" ? "color-mix(in srgb, var(--red) 15%, transparent)" : "color-mix(in srgb, var(--amber) 15%, transparent)",
                      color: w.severity === "High" ? "var(--red)" : "var(--amber)",
                    }}
                  >
                    {w.severity} Severity
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Personalized Learning Path */}
      {activeTab === "path" && path && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
                  Tailored Milestone Path for {path.targetGoal}
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
                  Adaptive sequence addressing weak topics first before advancing.
                </p>
              </div>
              <span className="badge badge-accent">Goal: {path.targetGoal}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {path.weeks.map((week) => (
                <div
                  key={week.weekNumber}
                  style={{
                    padding: 16,
                    borderRadius: "var(--radius-lg)",
                    background: "var(--bg-subtle)",
                    border: week.status === "in_progress" ? "1px solid var(--violet)" : "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: 12,
                          padding: "4px 8px",
                          borderRadius: 6,
                          background: week.status === "in_progress" ? "var(--violet)" : "var(--bg-card)",
                          color: week.status === "in_progress" ? "#fff" : "var(--text-muted)",
                        }}
                      >
                        Week {week.weekNumber}
                      </span>
                      <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{week.title}</h4>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--violet)" }}>{week.status}</span>
                  </div>

                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 12px", fontStyle: "italic" }}>
                    <strong>Adaptive Rationale:</strong> {week.reason}
                  </p>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    {week.topics.map((t) => (
                      <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        {t}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {week.problems.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "var(--radius-md)",
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          justify: "space-between",
                          alignItems: "center",
                          fontSize: 12,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <BookOpen style={{ width: 14, height: 14, color: "var(--violet)" }} />
                          <span style={{ fontWeight: 600 }}>{p.title}</span>
                          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>({p.topic})</span>
                        </div>
                        <span style={{ fontWeight: 700, color: p.difficulty === "Easy" ? "var(--green)" : p.difficulty === "Medium" ? "var(--amber)" : "var(--red)" }}>
                          {p.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Daily Review (SRS) */}
      {activeTab === "reviews" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Today's Review */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 style={{ width: 16, height: 16, color: "var(--green)" }} /> Today's Scheduled Review ({dailyReviews.todaysReview.length})
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {dailyReviews.todaysReview.map((item) => (
                <div key={item.id} style={{ padding: 14, borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{item.itemTitle}</span>
                    <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--bg-card)" }}>{item.topic}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--text-muted)" }}>
                    <span>Retention Score: {item.retentionScore}%</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleReviewSubmit(item.id, 90)} className="btn btn-xs btn-outline" style={{ color: "var(--green)" }}>
                        Easy (90%)
                      </button>
                      <button onClick={() => handleReviewSubmit(item.id, 50)} className="btn btn-xs btn-outline" style={{ color: "var(--amber)" }}>
                        Hard (50%)
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Needs Revision */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <RotateCcw style={{ width: 16, height: 16, color: "var(--red)" }} /> Needs Revision ({dailyReviews.needsRevision.length})
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {dailyReviews.needsRevision.map((item) => (
                <div key={item.id} style={{ padding: 14, borderRadius: "var(--radius-md)", background: "color-mix(in srgb, var(--red) 5%, transparent)", border: "1px solid color-mix(in srgb, var(--red) 20%, transparent)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{item.itemTitle}</span>
                    <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--bg-card)", color: "var(--red)" }}>Declining Retention</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--text-muted)" }}>
                    <span>Retention Score: {item.retentionScore}%</span>
                    <button onClick={() => handleReviewSubmit(item.id, 80)} className="btn btn-xs btn-primary">
                      Re-verify Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AI Study Planner */}
      {activeTab === "planner" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Planner Inputs */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar style={{ width: 16, height: 16, color: "var(--violet)" }} /> Generate Bespoke AI Study Schedule
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 180px", gap: 16, alignItems: "end" }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Placement Goal</label>
                <input
                  type="text"
                  value={placementGoal}
                  onChange={(e) => setPlacementGoal(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 13, marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Available Study Hours / Week</label>
                <input
                  type="number"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(Number(e.target.value))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 13, marginTop: 4 }}
                />
              </div>

              <button onClick={handleGenerateStudyPlan} disabled={generatingPlan} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                {generatingPlan ? <RefreshCw className="animate-spin" style={{ width: 14, height: 14 }} /> : <Sparkles style={{ width: 14, height: 14 }} />}
                Generate Plan
              </button>
            </div>
          </div>

          {/* Generated Schedule */}
          {studyPlan && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Daily Plan */}
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock style={{ width: 14, height: 14, color: "var(--violet)" }} /> Daily Routine Schedule
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {studyPlan.dailyPlan.map((d: any, idx: number) => (
                    <div key={idx} style={{ padding: 12, borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 12, marginBottom: 4 }}>
                        <span>{d.day}: {d.focus}</span>
                        <span style={{ color: "var(--violet)" }}>{d.durationHours} hrs</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: "var(--text-muted)" }}>
                        {d.tasks?.map((t: string, tidx: number) => (
                          <li key={tidx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly & Monthly Plan */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                    <Layers style={{ width: 14, height: 14, color: "var(--green)" }} /> Weekly Milestones
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {studyPlan.weeklyPlan.map((w: any, idx: number) => (
                      <div key={idx} style={{ padding: 12, borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                        <span style={{ fontWeight: 700, fontSize: 12 }}>{w.week}: {w.theme}</span>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                          {w.targetTopics?.map((top: string) => (
                            <span key={top} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                              {top}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                    <Award style={{ width: 14, height: 14, color: "var(--amber)" }} /> Monthly Career Target Outcome
                  </h4>
                  {studyPlan.monthlyPlan.map((m: any, idx: number) => (
                    <div key={idx} style={{ padding: 12, borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                      <span style={{ fontWeight: 700, fontSize: 12 }}>{m.month}: {m.milestone}</span>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0" }}>Outcome: {m.keyOutcome}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Adaptive Recommendations */}
      {activeTab === "recommendations" && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <Zap style={{ width: 16, height: 16, color: "var(--amber)" }} /> Recommended Problems Tailored for You
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                style={{
                  padding: 16,
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  justify: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{rec.problemTitle}</span>
                    <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--bg-card)", fontWeight: 700, color: rec.difficulty === "Easy" ? "var(--green)" : rec.difficulty === "Medium" ? "var(--amber)" : "var(--red)" }}>
                      {rec.difficulty}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Topic: {rec.topic}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
                    <strong>AI Rationale:</strong> {rec.reason}
                  </p>
                </div>
                <button className="btn btn-sm btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Solve Now <ArrowRight style={{ width: 12, height: 12 }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
