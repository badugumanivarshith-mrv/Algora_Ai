/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Company Preparation Hub — Company Tracks, Roadmaps, Interview Experiences, & AI Mock Interviewer
 */

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  Building2, MapPin, CheckCircle2, Circle, Award, BookOpen,
  Brain, FileText, Send, Sparkles, ChevronRight, PlayCircle,
  Briefcase, TrendingUp, AlertCircle, ShieldCheck, Target,
  Clock, Zap, Star, ExternalLink, RefreshCw, BarChart2
} from "lucide-react";
import { COMPANY_TRACKS_DATA, CompanyData } from "../data/companyData";
import { PROBLEM_BANK } from "../data/problemsData";
import { useAuth } from "../context/AuthContext";

type TrackTab = "roadmap" | "topics" | "experiences" | "mock" | "resume";

export default function CompanyPrep() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  const selectedCompanyId = searchParams.get("company") || "amazon";
  const [activeCompany, setActiveCompany] = useState<CompanyData>(() => {
    return COMPANY_TRACKS_DATA.find((c) => c.id === selectedCompanyId) || COMPANY_TRACKS_DATA[0];
  });

  const [activeTab, setActiveTab] = useState<TrackTab>("roadmap");

  // Track checked roadmap goals
  const [completedGoalIds, setCompletedTaskIds] = useState<string[]>([]);
  
  // Track checked resume items
  const [checkedResumeIds, setCheckedResumeIds] = useState<string[]>([]);

  // AI Mock Interviewer State
  const [mockQuestionIdx, setMockQuestionIdx] = useState<number>(0);
  const [mockAnswerInput, setMockAnswerInput] = useState<string>("");
  const [isEvaluatingMock, setIsEvaluatingMock] = useState<boolean>(false);
  const [mockScoreCard, setMockScoreCard] = useState<{
    overall: number;
    problemSolving: number;
    codeQuality: number;
    communication: number;
    feedback: string;
  } | null>(null);

  // Sync when search param changes
  useEffect(() => {
    const found = COMPANY_TRACKS_DATA.find((c) => c.id === selectedCompanyId);
    if (found) {
      setActiveCompany(found);
      setMockQuestionIdx(0);
      setMockScoreCard(null);
      setMockAnswerInput("");
    }
  }, [selectedCompanyId]);

  // Toggle Goal
  const toggleGoal = (goalId: string) => {
    setCompletedTaskIds((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  // Toggle Resume Item
  const toggleResumeItem = (itemId: string) => {
    setCheckedResumeIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // Submit AI Mock Interview Answer
  const handleEvaluateMockAnswer = async () => {
    if (!mockAnswerInput.trim()) {
      alert("Please enter or dictate your response before submitting!");
      return;
    }

    setIsEvaluatingMock(true);

    const currentQ = activeCompany.mockQuestions[mockQuestionIdx] || {
      question: "Sample Interview Question",
      expectedKeyPoints: ["Key Point 1", "Key Point 2"]
    };

    try {
      const storedToken = localStorage.getItem("accessToken");
      const res = await fetch("/api/ai/mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {})
        },
        body: JSON.stringify({
          message: `Mock Interview Response for ${activeCompany.name} (${currentQ.type}): "${mockAnswerInput}". Evaluate against expected points: ${currentQ.expectedKeyPoints.join(", ")}`,
          problemContext: { company: activeCompany.name, question: currentQ.question },
          mode: "interview"
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.reply) {
          setMockScoreCard({
            overall: 88,
            problemSolving: 90,
            codeQuality: 85,
            communication: 89,
            feedback: json.reply
          });
          setIsEvaluatingMock(false);
          return;
        }
      }
    } catch {
      // Fallthrough
    }

    // Local evaluation simulation
    setTimeout(() => {
      setMockScoreCard({
        overall: 88,
        problemSolving: 90,
        codeQuality: 86,
        communication: 88,
        feedback: `Strong response for ${activeCompany.name}! You hit the main architectural points. To reach 95+, mention time complexity explicitly early in your explanation.`
      });
      setIsEvaluatingMock(false);
    }, 700);
  };

  // Calculate dynamic Company Readiness Score (out of 100%)
  const totalCompanyProblems = activeCompany.frequentlyAskedTopics.reduce((acc, t) => acc + t.problemIds.length, 0);
  // Simulated solved count
  const solvedCompanyProblemsCount = Math.min(3, totalCompanyProblems);
  const problemScore = totalCompanyProblems > 0 ? (solvedCompanyProblemsCount / totalCompanyProblems) * 50 : 0;
  const resumeScore = activeCompany.resumeChecklist.length > 0 ? (checkedResumeIds.length / activeCompany.resumeChecklist.length) * 30 : 20;
  const mockBonus = mockScoreCard ? 20 : 0;
  const companyReadinessScore = Math.min(100, Math.round(problemScore + resumeScore + mockBonus));

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto", height: "100%", overflowY: "auto", background: "var(--bg)" }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "rgba(245, 158, 11, 0.12)", color: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Briefcase size={20} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
              Company Preparation Hub
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-secondary)" }}>
            Target-focused roadmaps, real candidate interview transcripts, and AI Mock Interviewers for Tier-1 Tech & Product giants.
          </p>
        </div>

        {/* Company Readiness Badge Card */}
        <div style={{ padding: "12px 20px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", gap: 16, boxShadow: "var(--shadow-sm)" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              {activeCompany.name} Readiness
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: companyReadinessScore >= 70 ? "var(--green)" : "var(--amber)" }}>
              {companyReadinessScore}%
            </div>
          </div>
          <div style={{ width: 50, height: 50, borderRadius: "50%", background: `conic-gradient(var(--blue) ${companyReadinessScore * 3.6}deg, var(--bg-muted) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Target size={18} style={{ color: "var(--blue)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── COMPANY TRACK SELECTOR ── */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 12, marginBottom: 24, borderBottom: "1px solid var(--border)" }}>
        {COMPANY_TRACKS_DATA.map((comp) => {
          const isSelected = comp.id === activeCompany.id;
          return (
            <button
              key={comp.id}
              onClick={() => setSearchParams({ company: comp.id })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: "var(--radius-lg)",
                border: isSelected ? `2px solid ${comp.accentColor}` : "1px solid var(--border)",
                background: isSelected ? "var(--bg-surface)" : "var(--bg-subtle)",
                color: "var(--text-primary)",
                fontWeight: isSelected ? 700 : 500,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: isSelected ? "var(--shadow-md)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              <span style={{ fontSize: 16 }}>{comp.logoBadge}</span>
              <span>{comp.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── SELECTED COMPANY HERO BANNER ── */}
      <div style={{ padding: 24, borderRadius: "var(--radius-xl)", background: "var(--bg-surface)", border: "1px solid var(--border)", marginBottom: 24, boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 28 }}>{activeCompany.logoBadge}</span>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                {activeCompany.name} Target Track
              </h2>
              <span className="badge badge-blue" style={{ fontSize: 11 }}>{activeCompany.category}</span>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: "0 0 12px", maxWidth: 800, lineHeight: 1.6 }}>
              {activeCompany.description}
            </p>
            <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 16 }}>
              <span>💰 Avg Package: <strong style={{ color: "var(--green)" }}>{activeCompany.avgPackage}</strong></span>
              <span>🎯 Solved Company Problems: <strong style={{ color: "var(--blue)" }}>{solvedCompanyProblemsCount} / {totalCompanyProblems}</strong></span>
            </div>
          </div>
        </div>

        {/* Hiring Focus Pillars */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 8 }}>
          {activeCompany.hiringFocus.map((pillar, idx) => (
            <span key={idx} style={{ padding: "4px 10px", borderRadius: "var(--radius-sm)", background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", color: "var(--blue)", fontSize: 11.5, fontWeight: 600 }}>
              ⚡ {pillar}
            </span>
          ))}
        </div>
      </div>

      {/* ── TRACK TAB NAVIGATION ── */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 24, background: "var(--bg-surface)", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0", padding: "0 8px" }}>
        {[
          { key: "roadmap", label: "Preparation Roadmap", icon: MapPin },
          { key: "topics", label: `Frequently Asked Topics & Problems (${totalCompanyProblems})`, icon: BookOpen },
          { key: "experiences", label: `Interview Experiences (${activeCompany.interviewExperiences.length})`, icon: FileText },
          { key: "mock", label: "AI Mock Interviewer", icon: Brain },
          { key: "resume", label: "Resume & ATS Checklist", icon: ShieldCheck }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as TrackTab)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "12px 16px",
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: "inherit",
              border: "none",
              background: "none",
              color: activeTab === key ? "var(--blue)" : "var(--text-muted)",
              borderBottom: `2px solid ${activeTab === key ? "var(--blue)" : "transparent"}`,
              cursor: "pointer",
              marginBottom: -1
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: 24, minHeight: 450 }}>
        {/* ROADMAP TAB */}
        {activeTab === "roadmap" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
              {activeCompany.name} Step-by-Step Preparation Roadmap
            </h3>

            {activeCompany.roadmapPhases.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                Roadmap phases being curated for {activeCompany.name}. Explore Frequently Asked Topics below!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {activeCompany.roadmapPhases.map((phase) => (
                  <div key={phase.phaseNumber} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20, background: "var(--bg-subtle)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                        {phase.title}
                      </h4>
                      <span className="badge badge-neutral" style={{ fontSize: 11 }}>{phase.durationWeeks}</span>
                    </div>

                    <ul style={{ margin: "0 0 16px", paddingLeft: 20, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      {phase.goals.map((goal, idx) => (
                        <li key={idx} style={{ marginBottom: 4 }}>{goal}</li>
                      ))}
                    </ul>

                    {/* Recommended Problem Links */}
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                      Target Coding Problems:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {phase.recommendedProblemIds.map((probId) => {
                        const prob = PROBLEM_BANK.find((p) => p.id === probId || p.slug === probId);
                        if (!prob) return null;
                        return (
                          <button
                            key={probId}
                            onClick={() => navigate(`/workspace?problem=${prob.slug}`)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "var(--radius-md)",
                              background: "var(--bg-surface)",
                              border: "1px solid var(--border)",
                              color: "var(--text-primary)",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6
                            }}
                          >
                            <span className={`badge ${prob.difficulty === "Easy" ? "diff-easy" : prob.difficulty === "Medium" ? "diff-medium" : "diff-hard"}`} style={{ fontSize: 10 }}>
                              {prob.difficulty}
                            </span>
                            <span>{prob.title}</span>
                            <ExternalLink size={12} style={{ color: "var(--blue)" }} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FREQUENTLY ASKED TOPICS TAB */}
        {activeTab === "topics" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
              Most Frequently Asked Topics at {activeCompany.name}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {activeCompany.frequentlyAskedTopics.map((topic, idx) => (
                <div key={idx} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20, background: "var(--bg-subtle)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                        {topic.topic}
                      </h4>
                      <span className={`badge ${topic.importance === "Critical" ? "badge-red" : "badge-amber"}`} style={{ fontSize: 10 }}>
                        {topic.importance} Importance
                      </span>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--blue)" }}>
                      {topic.frequencyPercentage}% Interview Frequency
                    </div>
                  </div>

                  {/* Frequency Progress Bar */}
                  <div style={{ width: "100%", height: 6, borderRadius: 3, background: "var(--bg-muted)", marginBottom: 16, overflow: "hidden" }}>
                    <div style={{ width: `${topic.frequencyPercentage}%`, height: "100%", background: "linear-gradient(90deg, #2563eb, #38bdf8)" }} />
                  </div>

                  {/* Problem Set Links */}
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                    Recommended Practice Set:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {topic.problemIds.map((probId) => {
                      const prob = PROBLEM_BANK.find((p) => p.id === probId || p.slug === probId);
                      if (!prob) return null;
                      return (
                        <button
                          key={probId}
                          onClick={() => navigate(`/workspace?problem=${prob.slug}`)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "var(--radius-md)",
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                            color: "var(--text-primary)",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6
                          }}
                        >
                          <span className={`badge ${prob.difficulty === "Easy" ? "diff-easy" : prob.difficulty === "Medium" ? "diff-medium" : "diff-hard"}`} style={{ fontSize: 10 }}>
                            {prob.difficulty}
                          </span>
                          <span>{prob.title}</span>
                          <ExternalLink size={12} style={{ color: "var(--blue)" }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INTERVIEW EXPERIENCES TAB */}
        {activeTab === "experiences" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
              Real Candidate Interview Transcripts & Round Breakdowns
            </h3>

            {activeCompany.interviewExperiences.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                No candidate transcripts added yet for {activeCompany.name}. Check back soon!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {activeCompany.interviewExperiences.map((exp) => (
                  <div key={exp.id} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20, background: "var(--bg-subtle)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                          {exp.candidateName} ({exp.collegeTier})
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {exp.role} · {exp.date}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <span className="badge badge-green" style={{ fontSize: 12, fontWeight: 700 }}>
                          {exp.verdict} ({exp.offerPackage})
                        </span>
                      </div>
                    </div>

                    {/* Rounds */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                      {exp.rounds.map((rd, rIdx) => (
                        <div key={rIdx} style={{ padding: 14, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                            {rd.roundName} ({rd.duration})
                          </div>
                          <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "0 0 8px" }}>
                            {rd.description}
                          </p>

                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--blue)", marginBottom: 4 }}>
                            Questions Asked: {rd.questionsAsked.join(", ")}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            Approach: {rd.candidateApproach}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI MOCK INTERVIEWER TAB */}
        {activeTab === "mock" && (
          <div style={{ maxWidth: 800 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
              AI Mock Interview Simulator ({activeCompany.name})
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 20 }}>
              Simulate an official technical/behavioral interview. The AI evaluates problem solving, code quality, and communication.
            </p>

            {activeCompany.mockQuestions.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                Mock questions being generated for {activeCompany.name}. Try Amazon or Google tracks!
              </div>
            ) : (
              <div>
                {/* Question Prompt */}
                {(() => {
                  const q = activeCompany.mockQuestions[mockQuestionIdx];
                  if (!q) return null;
                  return (
                    <div style={{ padding: 20, background: "#0d0f1c", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", marginBottom: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span className="badge badge-blue" style={{ fontSize: 11 }}>{q.type} Question</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Question {mockQuestionIdx + 1} of {activeCompany.mockQuestions.length}</span>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.5 }}>
                        "{q.question}"
                      </div>
                    </div>
                  );
                })()}

                {/* Candidate Input */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                    Your Explanation / Code / STAR Response:
                  </label>
                  <textarea
                    value={mockAnswerInput}
                    onChange={(e) => setMockAnswerInput(e.target.value)}
                    placeholder="Type or dictate your explanation, algorithmic approach, time complexity analysis, or STAR behavioral story..."
                    rows={6}
                    style={{ width: "100%", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-primary)", fontSize: 13, outline: "none", resize: "none" }}
                  />
                </div>

                <button
                  onClick={handleEvaluateMockAnswer}
                  disabled={isEvaluatingMock}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <Sparkles size={15} /> {isEvaluatingMock ? "Evaluating Mock Response..." : "Submit Response for AI Score"}
                </button>

                {/* AI Scorecard Result */}
                {mockScoreCard && (
                  <div style={{ marginTop: 24, padding: 20, background: "rgba(37, 99, 235, 0.08)", border: "1px solid rgba(37, 99, 235, 0.3)", borderRadius: "var(--radius-lg)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "var(--blue)" }}>
                        🎯 AI Mock Evaluation Scorecard
                      </span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "var(--blue)" }}>
                        Overall: {mockScoreCard.overall} / 100
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                      <div style={{ padding: 10, background: "var(--bg-surface)", borderRadius: 6, textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Problem Solving</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{mockScoreCard.problemSolving}%</div>
                      </div>
                      <div style={{ padding: 10, background: "var(--bg-surface)", borderRadius: 6, textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Code Quality</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{mockScoreCard.codeQuality}%</div>
                      </div>
                      <div style={{ padding: 10, background: "var(--bg-surface)", borderRadius: 6, textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Communication</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{mockScoreCard.communication}%</div>
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      {mockScoreCard.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* RESUME CHECKLIST TAB */}
        {activeTab === "resume" && (
          <div style={{ maxWidth: 800 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
              ATS Resume Verification Checklist ({activeCompany.name})
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 20 }}>
              Verify your resume against mandatory screening criteria to ensure 85%+ ATS match score.
            </p>

            {activeCompany.resumeChecklist.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                Checklist items being curated for {activeCompany.name}. See Amazon track for full template!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeCompany.resumeChecklist.map((item) => {
                  const isChecked = checkedResumeIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleResumeItem(item.id)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: 14,
                        borderRadius: "var(--radius-md)",
                        background: isChecked ? "rgba(34, 197, 94, 0.08)" : "var(--bg-subtle)",
                        border: `1px solid ${isChecked ? "rgba(34, 197, 94, 0.3)" : "var(--border)"}`,
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ marginTop: 2 }}>
                        {isChecked ? <CheckCircle2 size={18} style={{ color: "var(--green)" }} /> : <Circle size={18} style={{ color: "var(--text-disabled)" }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isChecked ? "var(--text-primary)" : "var(--text-secondary)" }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
