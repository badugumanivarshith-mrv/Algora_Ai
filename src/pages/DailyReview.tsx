import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Flame, Clock, Target, TrendingUp, TrendingDown, CheckCircle2,
  XCircle, AlertCircle, ChevronRight, Zap, Code2, Brain, Calendar,
  Sparkles, Check, HelpCircle, ArrowRight, RotateCcw, Award
} from "lucide-react";
import { DailyReviewQueue, DailyReviewQuestion } from "../types";
import { GamificationApi } from "../services/gamificationApi";

const timeline = [
  { t: "9AM", p: 1 }, { t: "10AM", p: 0 }, { t: "11AM", p: 2 }, { t: "12PM", p: 0 },
  { t: "2PM", p: 3 }, { t: "4PM", p: 2 }, { t: "6PM", p: 1 }, { t: "8PM", p: 2 },
];

const pie = [
  { name: "Easy", value: 3, color: "var(--green)" },
  { name: "Medium", value: 6, color: "var(--amber)" },
  { name: "Hard", value: 2, color: "var(--red)" },
];

const recentSolved = [
  { title: "Two Sum", diff: "Easy", status: "Accepted", topics: ["Arrays", "Hash"], dur: "4m", time: "9:14 AM" },
  { title: "Valid Parentheses", diff: "Easy", status: "Accepted", topics: ["Stack"], dur: "3m", time: "9:28 AM" },
  { title: "Merge Intervals", diff: "Medium", status: "Accepted", topics: ["Arrays", "Sorting"], dur: "22m", time: "11:02 AM" },
  { title: "Search in Rotated Array", diff: "Medium", status: "Wrong Answer", topics: ["Binary Search"], dur: "18m", time: "11:35 AM" },
  { title: "Maximum Subarray", diff: "Medium", status: "Accepted", topics: ["DP", "Arrays"], dur: "9m", time: "2:10 PM" },
  { title: "Jump Game", diff: "Medium", status: "Accepted", topics: ["Greedy"], dur: "14m", time: "2:30 PM" },
  { title: "Clone Graph", diff: "Medium", status: "Accepted", topics: ["Graphs", "BFS"], dur: "20m", time: "2:55 PM" },
  { title: "Word Break", diff: "Medium", status: "TLE", topics: ["DP", "Strings"], dur: "35m", time: "4:20 PM" },
  { title: "Subsets", diff: "Medium", status: "Accepted", topics: ["Backtracking"], dur: "16m", time: "4:58 PM" },
  { title: "Trapping Rain Water", diff: "Hard", status: "Wrong Answer", topics: ["Two Pointers"], dur: "40m", time: "6:10 PM" },
  { title: "LRU Cache", diff: "Hard", status: "Accepted", topics: ["Design", "Hash"], dur: "28m", time: "8:20 PM" },
];

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "8px 12px", boxShadow: "var(--shadow-md)", fontSize: 11 }}>
      <p style={{ fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: "var(--text-muted)" }}>Problems: <span style={{ color: p.stroke, fontWeight: 600 }}>{p.value}</span></div>
      ))}
    </div>
  );
}

export default function DailyReview() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const [reviewQueueData, setReviewQueueData] = useState<DailyReviewQueue | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [completedReview, setCompletedReview] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [streakDays, setStreakDays] = useState(7);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadDailyQueue() {
      const data = await GamificationApi.getDailyReviewQueue();
      if (data) {
        setReviewQueueData(data);
        setStreakDays(data.streakDays || 7);
      }
    }
    loadDailyQueue();
  }, []);

  const queue = reviewQueueData?.queue || [];
  const currentQuestion: DailyReviewQuestion | undefined = queue[currentQuestionIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswerRevealed) return;
    setSelectedOption(idx);
    setIsAnswerRevealed(true);
    setUserAnswers((prev) => ({ ...prev, [currentQuestionIdx]: idx }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < queue.length - 1) {
      setCurrentQuestionIdx((i) => i + 1);
      setSelectedOption(userAnswers[currentQuestionIdx + 1] ?? null);
      setIsAnswerRevealed(userAnswers[currentQuestionIdx + 1] !== undefined);
    } else {
      handleFinishReview();
    }
  };

  const handleFinishReview = async () => {
    setSubmitting(true);
    let correctCount = 0;
    queue.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const result = await GamificationApi.completeDailyReview(correctCount, queue.length);
    if (result) {
      setEarnedXP(result.xpEarned || 150);
      setStreakDays(result.streakDays || streakDays + 1);
    } else {
      setEarnedXP(150);
      setStreakDays((s) => s + 1);
    }
    setCompletedReview(true);
    setSubmitting(false);
  };

  const restartReview = () => {
    setUserAnswers({});
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setCompletedReview(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg,#f59e0b,#ef4444)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <Flame size={20} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>{today}</p>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
              Daily Spaced Repetition Review
            </h2>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="badge badge-amber" style={{ fontSize: 12, padding: "5px 12px", display: "flex", alignItems: "center", gap: 5 }}>
            <Flame size={14} style={{ color: "var(--red)" }} /> {streakDays} Day Streak Active
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/workspace")} style={{ gap: 5 }}>
            <Code2 size={13} /> Code Workspace
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Today's Solved", value: "11", sub: "vs 6 yesterday", icon: Code2, color: "var(--blue)" },
          { label: "Retention Index", value: `${reviewQueueData?.overallRetentionScore || 72}%`, sub: "Spaced mastery metric", icon: Target, color: "var(--green)" },
          { label: "Spaced Queue", value: `${queue.length} Due`, sub: "5 flash checkpoints", icon: Brain, color: "var(--violet)" },
          { label: "Streak Bonus", value: "+150 XP", sub: `Flame reward on completion`, icon: Zap, color: "var(--amber)" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="surface-card" style={{ padding: 20 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "var(--radius-md)",
                background: `color-mix(in srgb, ${color} 12%, transparent)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <Icon size={16} style={{ color }} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>{value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", margin: "3px 0 0" }}>{label}</div>
            <div style={{ fontSize: 11, color: "var(--green)", marginTop: 4, fontWeight: 600 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Interactive Flashcard / Concept Checkpoint Card */}
      <div
        className="surface-card"
        style={{
          padding: 24,
          border: "2px solid color-mix(in srgb, var(--violet) 35%, transparent)",
          background: "linear-gradient(180deg, var(--bg-surface) 0%, color-mix(in srgb, var(--violet) 4%, transparent) 100%)",
        }}
      >
        {!completedReview && currentQuestion ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="badge badge-violet" style={{ fontWeight: 700 }}>
                  Question {currentQuestionIdx + 1} of {queue.length}
                </span>
                <span className="badge badge-neutral">{currentQuestion.topic}</span>
                <span
                  className={`badge ${
                    currentQuestion.difficulty === "Easy"
                      ? "diff-easy"
                      : currentQuestion.difficulty === "Medium"
                      ? "diff-medium"
                      : "diff-hard"
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
                <span>Retention: {currentQuestion.retentionScore}%</span>
                <span>·</span>
                <span>Practiced {currentQuestion.lastPracticedDaysAgo}d ago</span>
              </div>
            </div>

            <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px", lineHeight: 1.4 }}>
              {currentQuestion.prompt}
            </h3>

            {currentQuestion.codeSnippet && (
              <pre
                style={{
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 16px",
                  fontSize: 12.5,
                  fontFamily: "'JetBrains Mono',monospace",
                  color: "var(--text-primary)",
                  overflowX: "auto",
                  margin: "0 0 16px",
                }}
              >
                <code>{currentQuestion.codeSnippet}</code>
              </pre>
            )}

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "16px 0 20px" }}>
              {currentQuestion.options.map((opt, oIdx) => {
                const isSelected = selectedOption === oIdx;
                const isCorrect = oIdx === currentQuestion.correctIndex;
                let bg = "var(--bg-surface)";
                let borderColor = "var(--border)";

                if (isAnswerRevealed) {
                  if (isCorrect) {
                    bg = "color-mix(in srgb, var(--green) 12%, transparent)";
                    borderColor = "var(--green)";
                  } else if (isSelected && !isCorrect) {
                    bg = "color-mix(in srgb, var(--red) 12%, transparent)";
                    borderColor = "var(--red)";
                  }
                } else if (isSelected) {
                  bg = "var(--bg-subtle)";
                  borderColor = "var(--blue)";
                }

                return (
                  <button
                    key={oIdx}
                    id={`review-opt-${oIdx}`}
                    onClick={() => handleSelectOption(oIdx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 18px",
                      borderRadius: "var(--radius-md)",
                      border: `1px solid ${borderColor}`,
                      background: bg,
                      color: "var(--text-primary)",
                      textAlign: "left",
                      fontSize: 13.5,
                      fontWeight: 500,
                      cursor: isAnswerRevealed ? "default" : "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: "1px solid var(--border-strong)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        flexShrink: 0,
                      }}
                    >
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span style={{ flex: 1 }}>{opt}</span>
                    {isAnswerRevealed && isCorrect && <CheckCircle2 size={16} style={{ color: "var(--green)" }} />}
                    {isAnswerRevealed && isSelected && !isCorrect && <XCircle size={16} style={{ color: "var(--red)" }} />}
                  </button>
                );
              })}
            </div>

            {/* Explanation when answered */}
            {isAnswerRevealed && (
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontWeight: 700, fontSize: 13, color: "var(--blue)" }}>
                  <Brain size={14} /> Spaced Memory Insight
                </div>
                <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Footer Navigation */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              {isAnswerRevealed && (
                <button
                  id="next-review-btn"
                  className="btn btn-primary btn-sm"
                  onClick={handleNextQuestion}
                  disabled={submitting}
                  style={{ gap: 6 }}
                >
                  {currentQuestionIdx < queue.length - 1 ? (
                    <>
                      Next Question <ArrowRight size={14} />
                    </>
                  ) : (
                    <>
                      Complete Spaced Review <Check size={14} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "30px 20px" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "color-mix(in srgb, var(--green) 15%, transparent)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--green)",
                marginBottom: 14,
              }}
            >
              <Award size={28} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 6px" }}>
              Daily Review Complete!
            </h3>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 16px" }}>
              You earned <strong style={{ color: "var(--amber)" }}>+{earnedXP} XP</strong> and your streak extended to{" "}
              <strong style={{ color: "var(--red)" }}>{streakDays} days</strong>!
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              <button className="btn btn-secondary btn-sm" onClick={restartReview} style={{ gap: 5 }}>
                <RotateCcw size={13} /> Retake Queue
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/workspace")} style={{ gap: 5 }}>
                <Code2 size={13} /> Jump to Problem Explorer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Weak Topics & Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <div className="surface-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <TrendingUp size={14} style={{ color: "var(--green)" }} />
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Strong Concepts</h3>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Two Pointers", "Hash Maps", "Stacks", "Arrays"].map((t) => (
              <span
                key={t}
                style={{
                  padding: "5px 10px",
                  borderRadius: "var(--radius-full)",
                  fontSize: 11.5,
                  fontWeight: 500,
                  background: "var(--green-light)",
                  color: "var(--green)",
                  border: "1px solid color-mix(in srgb, var(--green) 25%, transparent)",
                }}
              >
                ✓ {t}
              </span>
            ))}
          </div>
        </div>

        <div className="surface-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <TrendingDown size={14} style={{ color: "var(--red)" }} />
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Targeted Weak Topics</h3>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(reviewQueueData?.weakTopics || [
              { topic: "Dynamic Programming", masteryScore: 54 },
              { topic: "Binary Search", masteryScore: 62 },
              { topic: "Intervals & Sorting", masteryScore: 68 },
            ]).map((t) => (
              <span
                key={t.topic}
                style={{
                  padding: "5px 10px",
                  borderRadius: "var(--radius-full)",
                  fontSize: 11.5,
                  fontWeight: 500,
                  background: "var(--red-light)",
                  color: "var(--red)",
                  border: "1px solid color-mix(in srgb, var(--red) 25%, transparent)",
                }}
              >
                ↓ {t.topic} ({t.masteryScore}%)
              </span>
            ))}
          </div>
        </div>

        <div className="surface-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <Brain size={14} style={{ color: "var(--blue)" }} />
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Suggested Focus</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { title: "Dynamic Programming memoization patterns", color: "var(--red)" },
              { title: "Binary search on rotated arrays boundary tests", color: "var(--amber)" },
              { title: "Interval sorting by start vs end heuristics", color: "var(--blue)" },
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: `color-mix(in srgb, ${item.color} 12%, transparent)`,
                    color: item.color,
                    fontSize: 10,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {idx + 1}
                </span>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline & Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <div className="surface-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>Coding Activity Timeline</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>Submissions and reviews by hour</p>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={timeline} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--blue)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--blue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="p" stroke="var(--blue)" strokeWidth={2} fill="url(#tg)" dot={false} activeDot={{ r: 4, fill: "var(--blue)" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card" style={{ padding: 22, display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>Difficulty Split</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 8px" }}>11 problems total</p>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={pie} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value">
                  {pie.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {pie.map(({ name, value, color }) => (
            <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--text-secondary)" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />{name}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Problems table */}
      <div className="surface-card" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Recent Practice History</h3>
          <span className="badge badge-blue">{recentSolved.length} attempted</span>
        </div>
        <div className="divide-theme">
          {recentSolved.map(({ title, diff, status, topics, dur, time }) => (
            <div key={title + time} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px" }}>
              <div style={{ flexShrink: 0 }}>
                {status === "Accepted" ? (
                  <CheckCircle2 size={14} style={{ color: "var(--green)" }} />
                ) : status === "Wrong Answer" ? (
                  <XCircle size={14} style={{ color: "var(--red)" }} />
                ) : (
                  <AlertCircle size={14} style={{ color: "var(--amber)" }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {title}
                </p>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {topics.map((t) => (
                    <span key={t} className="badge badge-neutral" style={{ fontSize: 10 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <span className={`badge ${diff === "Easy" ? "diff-easy" : diff === "Medium" ? "diff-medium" : "diff-hard"}`} style={{ flexShrink: 0 }}>
                {diff}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0, display: "flex", alignItems: "center", gap: 3 }}>
                <Clock size={10} /> {dur}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>{time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
