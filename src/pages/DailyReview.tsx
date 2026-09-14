import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Flame, Clock, Target, TrendingUp, CheckCircle2,
  AlertCircle, ChevronRight, Zap, Code2, Brain, Calendar,
  Sparkles, Check, BookOpen, Layers, RefreshCw, HelpCircle, Award
} from "lucide-react";
import {
  LearningMemoryApi, MemoryRecord, RetentionRecord, ReviewItem,
  Flashcard, RevisionNotes, LearningStreak, DailyReport
} from "../services/learningMemoryApi";

export default function DailyReview() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const [activeTab, setActiveTab] = useState<"today" | "retention" | "flashcards" | "notes" | "report">("today");

  const [report, setReport] = useState<DailyReport | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [memory, setMemory] = useState<{ records: MemoryRecord[]; topicMastery: Record<string, number>; overallConfidence: number } | null>(null);
  const [retention, setRetention] = useState<{ retentionRecords: RetentionRecord[]; overallRetention: number; revisionCompletionPercentage: number } | null>(null);
  const [streak, setStreak] = useState<LearningStreak | null>(null);

  // Flashcards state
  const [flashcardTopic, setFlashcardTopic] = useState("Graphs");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [generatingCards, setGeneratingCards] = useState(false);

  // Notes state
  const [notesTopic, setNotesTopic] = useState("Graphs & BFS/DFS");
  const [notes, setNotes] = useState<RevisionNotes[]>([]);
  const [generatingNotes, setGeneratingNotes] = useState(false);

  // Loading indicator
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initData() {
      setLoading(true);
      try {
        const [rep, revs, mem, ret, strk] = await Promise.all([
          LearningMemoryApi.getDailyReport(),
          LearningMemoryApi.getDailyReviews(),
          LearningMemoryApi.getMemoryOverview(),
          LearningMemoryApi.getRetentionOverview(),
          LearningMemoryApi.getStreak(),
        ]);
        setReport(rep);
        setReviews(revs);
        setMemory(mem);
        setRetention(ret);
        setStreak(strk);
      } catch (err) {
        console.error("Failed loading memory data", err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  const handleCompleteReview = async (reviewId: string) => {
    try {
      const res = await LearningMemoryApi.markReviewComplete(reviewId);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: "completed", completedAt: new Date().toISOString() } : r))
      );
      if (res.streak) {
        setStreak(res.streak);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateFlashcards = async () => {
    setGeneratingCards(true);
    try {
      const cards = await LearningMemoryApi.generateFlashcards(flashcardTopic, 4, "Medium");
      setFlashcards(cards);
      setActiveCardIndex(0);
      setShowAnswer(false);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingCards(false);
    }
  };

  const handleGenerateNotes = async () => {
    setGeneratingNotes(true);
    try {
      const newNotes = await LearningMemoryApi.generateRevisionNotes(notesTopic, "Medium", "Intermediate");
      setNotes((prev) => [newNotes, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingNotes(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Banner & Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--radius-lg, 12px)",
              background: "linear-gradient(135deg, #f59e0b, #ef4444)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(239,68,68,0.25)",
            }}
          >
            <Brain size={24} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, fontWeight: 500 }}>{today}</p>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
              AI Daily Review & Learning Memory
            </h1>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              padding: "6px 14px",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 700,
              color: "#f59e0b",
            }}
          >
            <Flame size={16} fill="#f59e0b" />
            <span>{streak?.currentStreak || 7} Day Streak ({streak?.totalXp || 1850} XP)</span>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/workspace")} style={{ gap: 6 }}>
            <Code2 size={14} /> Code Workspace
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 12, overflowX: "auto" }}>
        {[
          { id: "today", label: "Today's Review Queue", icon: Clock },
          { id: "retention", label: "Retention Analytics", icon: Target },
          { id: "flashcards", label: "AI Flashcards", icon: Layers },
          { id: "notes", label: "Revision Cheat Sheets", icon: BookOpen },
          { id: "report", label: "AI Daily Report", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`btn btn-sm ${isActive ? "btn-primary" : "btn-secondary"}`}
              style={{ gap: 6, borderRadius: 20 }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
          <RefreshCw className="animate-spin" size={28} style={{ margin: "0 auto 12px" }} />
          <p style={{ margin: 0 }}>Syncing learning memory & retention scores...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: TODAY'S REVIEW QUEUE */}
          {activeTab === "today" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Scheduled Spaced Repetitions</h3>
                  <span className="badge badge-amber" style={{ fontSize: 12 }}>
                    {reviews.filter((r) => r.status === "pending").length} Pending Today
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {reviews.map((item) => (
                    <div
                      key={item.id}
                      className="surface-card"
                      style={{
                        padding: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        opacity: item.status === "completed" ? 0.6 : 1,
                        borderLeft: item.status === "completed" ? "4px solid var(--green)" : "4px solid #f59e0b",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            className="badge"
                            style={{
                              background: "rgba(99,102,241,0.12)",
                              color: "var(--primary)",
                              fontSize: 11,
                            }}
                          >
                            {item.topic}
                          </span>
                          <span className="badge badge-secondary" style={{ fontSize: 11 }}>
                            {item.itemType}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            Priority Score: {item.priorityScore}/100
                          </span>
                        </div>
                        <h4 style={{ fontSize: 15, fontWeight: 600, margin: "4px 0 2px" }}>{item.itemTitle}</h4>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                          <span style={{ fontWeight: 600, color: "var(--amber)" }}>Reason:</span> {item.reason}
                        </p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 16 }}>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "right" }}>
                          <Clock size={12} style={{ display: "inline", marginRight: 4 }} />
                          {item.estimatedMinutes} mins
                        </div>
                        {item.status === "completed" ? (
                          <span style={{ color: "var(--green)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                            <CheckCircle2 size={16} /> Completed (+50 XP)
                          </span>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleCompleteReview(item.id)}
                            style={{ gap: 4 }}
                          >
                            <Check size={14} /> Review Done
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Sidebar: Streak & Spaced Schedule */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="surface-card" style={{ padding: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar size={16} color="var(--primary)" /> Spaced Repetition Schedule
                  </h4>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                    Automatic intervals based on Ebbinghaus forgetting curve memory decay.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { interval: "Day 1", desc: "Immediate 24h review post-solve", status: "Completed" },
                      { interval: "Day 3", desc: "First consolidation checkpoint", status: "Active Today" },
                      { interval: "Day 7", desc: "Weekly retention validation", status: "Upcoming" },
                      { interval: "Day 14", desc: "Fortnightly long-term memory", status: "Scheduled" },
                      { interval: "Day 30", desc: "Permanent mastery threshold", status: "Scheduled" },
                    ].map((step, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          borderRadius: "var(--radius-sm, 6px)",
                          background: step.status === "Active Today" ? "rgba(245,158,11,0.1)" : "var(--bg-subtle, rgba(255,255,255,0.03))",
                          border: step.status === "Active Today" ? "1px solid rgba(245,158,11,0.3)" : "1px solid transparent",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{step.interval}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{step.desc}</div>
                        </div>
                        <span
                          className={`badge ${
                            step.status === "Completed"
                              ? "badge-green"
                              : step.status === "Active Today"
                              ? "badge-amber"
                              : "badge-secondary"
                          }`}
                          style={{ fontSize: 10 }}
                        >
                          {step.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="surface-card" style={{ padding: 20, background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))" }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}>
                    <Zap size={16} color="var(--primary)" /> Streak & Gamification
                  </h4>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 12px" }}>
                    Complete daily reviews to maintain your streak and earn double XP bonuses.
                  </p>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b", display: "flex", alignItems: "center", gap: 8 }}>
                    <Flame size={28} /> {streak?.currentStreak || 7} Days Active
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                    Longest Record: <strong>{streak?.longestStreak || 14} Days</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RETENTION ANALYTICS */}
          {activeTab === "retention" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <div className="surface-card" style={{ padding: 20 }}>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 4px" }}>Overall Retention %</p>
                  <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--green)", margin: 0 }}>
                    {retention?.overallRetention || 78}%
                  </h2>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "6px 0 0" }}>Measured via 30-day Ebbinghaus curve</p>
                </div>

                <div className="surface-card" style={{ padding: 20 }}>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 4px" }}>Revision Completion</p>
                  <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)", margin: 0 }}>
                    {retention?.revisionCompletionPercentage || 85}%
                  </h2>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "6px 0 0" }}>Daily Spaced Repetitions completed</p>
                </div>

                <div className="surface-card" style={{ padding: 20 }}>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 4px" }}>Overall Memory Confidence</p>
                  <h2 style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b", margin: 0 }}>
                    {memory?.overallConfidence || 75}/100
                  </h2>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "6px 0 0" }}>Aggregated across 5 core DSA modules</p>
                </div>
              </div>

              {/* Topic Mastery Breakdown */}
              <div className="surface-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>Topic Memory & Mastery Breakdown</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { topic: "Arrays & Strings", mastery: 88, status: "High Retention" },
                    { topic: "Trees & BST", mastery: 74, status: "Good Retention" },
                    { topic: "Graphs & BFS/DFS", mastery: 61, status: "Review Scheduled" },
                    { topic: "Dynamic Programming", mastery: 28, status: "Critical Decay" },
                  ].map((item) => (
                    <div key={item.topic} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }}>
                        <span>{item.topic}</span>
                        <span>{item.mastery}% Mastery</span>
                      </div>
                      <div style={{ height: 8, background: "var(--bg-subtle, rgba(255,255,255,0.06))", borderRadius: 4, overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${item.mastery}%`,
                            background:
                              item.mastery >= 80
                                ? "var(--green)"
                                : item.mastery >= 60
                                ? "#f59e0b"
                                : "var(--red)",
                            borderRadius: 4,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI FLASHCARDS */}
          {activeTab === "flashcards" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  type="text"
                  className="input"
                  value={flashcardTopic}
                  onChange={(e) => setFlashcardTopic(e.target.value)}
                  placeholder="Topic (e.g. Graphs, Dynamic Programming)"
                  style={{ maxWidth: 300 }}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleGenerateFlashcards}
                  disabled={generatingCards}
                  style={{ gap: 6 }}
                >
                  {generatingCards ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                  Generate AI Flashcards
                </button>
              </div>

              {flashcards.length > 0 ? (
                <div className="surface-card" style={{ padding: 32, textAlign: "center", maxWidth: 640, margin: "0 auto", width: "100%" }}>
                  <span className="badge badge-amber" style={{ marginBottom: 12 }}>
                    Card {activeCardIndex + 1} of {flashcards.length} • {flashcards[activeCardIndex].difficulty}
                  </span>

                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: "16px 0 24px" }}>
                    {flashcards[activeCardIndex].question}
                  </h3>

                  {showAnswer ? (
                    <div style={{ padding: 16, background: "rgba(99,102,241,0.1)", borderRadius: 8, marginBottom: 24, textAlign: "left" }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)", margin: "0 0 6px" }}>Answer:</p>
                      <p style={{ fontSize: 13, margin: 0, color: "var(--text-primary)" }}>{flashcards[activeCardIndex].answer}</p>
                      {flashcards[activeCardIndex].hint && (
                        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
                          💡 <em>Hint: {flashcards[activeCardIndex].hint}</em>
                        </p>
                      )}
                    </div>
                  ) : (
                    <button className="btn btn-secondary" onClick={() => setShowAnswer(true)} style={{ marginBottom: 24 }}>
                      Reveal Answer
                    </button>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={activeCardIndex === 0}
                      onClick={() => {
                        setActiveCardIndex((i) => i - 1);
                        setShowAnswer(false);
                      }}
                    >
                      Previous
                    </button>

                    <button
                      className="btn btn-primary btn-sm"
                      disabled={activeCardIndex === flashcards.length - 1}
                      onClick={() => {
                        setActiveCardIndex((i) => i + 1);
                        setShowAnswer(false);
                      }}
                    >
                      Next Card
                    </button>
                  </div>
                </div>
              ) : (
                <div className="surface-card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                  <Layers size={32} style={{ margin: "0 auto 12px" }} />
                  <p style={{ margin: 0 }}>Click "Generate AI Flashcards" to create custom spaced repetition cards for {flashcardTopic}.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REVISION NOTES */}
          {activeTab === "notes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  type="text"
                  className="input"
                  value={notesTopic}
                  onChange={(e) => setNotesTopic(e.target.value)}
                  placeholder="Topic (e.g. Graphs & BFS/DFS)"
                  style={{ maxWidth: 300 }}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleGenerateNotes}
                  disabled={generatingNotes}
                  style={{ gap: 6 }}
                >
                  {generatingNotes ? <RefreshCw className="animate-spin" size={14} /> : <BookOpen size={14} />}
                  Generate Concept Cheat Sheet
                </button>
              </div>

              {notes.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {notes.map((n) => (
                    <div key={n.id} className="surface-card" style={{ padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{n.topic}</h3>
                        <span className="badge badge-amber">{n.difficulty} • {n.learningLevel}</span>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>{n.summary}</p>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", margin: "0 0 8px" }}>Concept Cheat Sheet:</h4>
                      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: 6 }}>
                        {n.cheatSheet.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="surface-card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                  <BookOpen size={32} style={{ margin: "0 auto 12px" }} />
                  <p style={{ margin: 0 }}>No revision notes generated yet. Click generate above to create an AI cheat sheet.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AI DAILY REPORT */}
          {activeTab === "report" && (
            <div className="surface-card" style={{ padding: 24, maxWidth: 800, margin: "0 auto", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <Sparkles size={24} color="#f59e0b" />
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{report?.greeting || "Good Morning Arjun!"}</h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ padding: 16, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 6px", color: "#f59e0b" }}>AI Coach Advice</h4>
                  <p style={{ fontSize: 13, margin: 0, color: "var(--text-primary)" }}>{report?.aiAdvice}</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ padding: 16, background: "var(--bg-subtle, rgba(255,255,255,0.03))", borderRadius: 8 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px" }}>Yesterday's Accomplishments</h4>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text-muted)" }}>
                      <li>Problems Solved: {report?.yesterdaySummary.problemsSolved || 4}</li>
                      <li>XP Earned: +{report?.yesterdaySummary.xpEarned || 250} XP</li>
                      <li>Topics Covered: {report?.yesterdaySummary.topicsStudied.join(", ")}</li>
                    </ul>
                  </div>

                  <div style={{ padding: 16, background: "var(--bg-subtle, rgba(255,255,255,0.03))", borderRadius: 8 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px" }}>Weak Areas to Reinforce</h4>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--red)" }}>
                      {report?.weakAreas.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
