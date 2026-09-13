import React, { useState, useEffect } from "react";
import {
  Sparkles, Brain, Target, AlertTriangle, TrendingUp, CheckCircle2,
  Compass, ArrowRight, ShieldCheck, Zap, RefreshCw, BarChart2, BookOpen
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import {
  EnterpriseService, RecommendationEngineV2Result
} from "../services/enterpriseService";

export default function AdaptiveRoadmapV2() {
  const [data, setData] = useState<RecommendationEngineV2Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetCompany, setTargetCompany] = useState("Google");
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    loadRoadmap();
  }, [targetCompany]);

  const loadRoadmap = async () => {
    setLoading(true);
    try {
      const res = await EnterpriseService.getAdaptiveRecommendations("usr_current", targetCompany);
      setData(res.recommendation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    await loadRoadmap();
    setRegenerating(false);
  };

  const radarData = data?.skillGaps.map((g) => ({
    subject: g.topic,
    Current: g.currentMastery,
    Target: g.targetMastery,
  })) || [];

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
              Algora Adaptive AI Recommendation Engine V2
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
              Neural Tutor V2
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
            Real-time skill gap detection, Ebbinghaus retention decay forecasting, and dynamically synthesized practice paths.
          </p>
        </div>

        {/* Company Target Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Target Benchmark:</span>
          <select
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
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
            <option value="Google">Google (L4 / L5 Bar)</option>
            <option value="Meta">Meta (E4 Core)</option>
            <option value="Microsoft">Microsoft (SDE II)</option>
            <option value="Citadel">Citadel (Quant Dev)</option>
            <option value="Amazon">Amazon (SDE I/II)</option>
          </select>
          <button
            onClick={handleRegenerate}
            className="btn btn-secondary btn-sm"
            disabled={regenerating}
            style={{ gap: 4 }}
          >
            <RefreshCw size={13} className={regenerating ? "animate-spin" : ""} />
            Re-optimize
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
          Synthesizing personalized neural roadmap...
        </div>
      ) : data ? (
        <>
          {/* Top Metric Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            <div className="surface-card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Overall Skill Gap</span>
                <Target size={16} style={{ color: "var(--brand)" }} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{data.overallSkillGapScore}%</div>
              <div style={{ fontSize: 11, color: "var(--brand)", marginTop: 4, fontWeight: 600 }}>Distance to {targetCompany} Benchmark</div>
            </div>

            <div className="surface-card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Retention Decay Warning</span>
                <AlertTriangle size={16} style={{ color: "var(--amber)" }} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{data.retentionRiskTopics.length} Topics</div>
              <div style={{ fontSize: 11, color: "var(--amber)", marginTop: 4, fontWeight: 600 }}>Critical memory decay detected</div>
            </div>

            <div className="surface-card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Estimated Mastery Time</span>
                <TrendingUp size={16} style={{ color: "var(--green)" }} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>3.2 Weeks</div>
              <div style={{ fontSize: 11, color: "var(--green)", marginTop: 4, fontWeight: 600 }}>At 45 mins / day pace</div>
            </div>
          </div>

          {/* Section 1: Retention Risk Alert & Skill Gap Radar */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Retention Risk */}
            <div className="surface-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <AlertTriangle size={16} style={{ color: "var(--amber)" }} />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  Memory Decay & Retention Warnings
                </h3>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.5 }}>
                Based on your last practice dates, your algorithmic recall for these concepts is slipping below the safe interview threshold:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.retentionRiskTopics.map((risk, i) => (
                  <div key={i} style={{ background: "var(--bg-subtle)", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{risk.topic}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "color-mix(in srgb, var(--amber) 15%, transparent)", color: "var(--amber)" }}>
                        {risk.decayPercentage}% Recall Left
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Last practiced {risk.daysSinceLastPractice} days ago. Recommended {risk.recommendedAction}.
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar / Skill Gaps */}
            <div className="surface-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Brain size={16} style={{ color: "var(--brand)" }} />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  Current vs. Target Mastery Radar
                </h3>
              </div>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius={80} data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" stroke="var(--text-muted)" fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--border)" fontSize={9} />
                    <Radar name="Current" dataKey="Current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                    <Radar name="Target" dataKey="Target" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Section 2: Dynamically Synthesized Practice Roadmap */}
          <div className="surface-card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  Synthesized Mastery Path for {targetCompany}
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
                  Sequenced by prerequisite dependency, difficulty gradient, and retention reinforcement.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.personalizedRoadmap.map((item, idx) => (
                <div
                  key={item.problemId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        background: "var(--bg-canvas)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--brand)",
                      }}
                    >
                      {idx + 1}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{item.title}</span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: item.difficulty === "Easy" ? "color-mix(in srgb, var(--green) 15%, transparent)" : item.difficulty === "Medium" ? "color-mix(in srgb, var(--amber) 15%, transparent)" : "color-mix(in srgb, var(--red) 15%, transparent)",
                            color: item.difficulty === "Easy" ? "var(--green)" : item.difficulty === "Medium" ? "var(--amber)" : "var(--red)",
                          }}
                        >
                          {item.difficulty}
                        </span>
                        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Est: {item.estimatedTimeToSolveMin}m</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        Reason: <strong style={{ color: "var(--text-secondary)" }}>{item.reason}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Predicted Success Rate</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)" }}>{item.predictedSuccessRate}%</div>
                    </div>

                    <a
                      href={`/workspace/${item.problemId}`}
                      className="btn btn-primary btn-sm"
                      style={{ gap: 4 }}
                    >
                      Solve <ArrowRight size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
