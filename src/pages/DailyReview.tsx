import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Flame, Clock, Target, TrendingUp, TrendingDown, CheckCircle2,
  XCircle, AlertCircle, ChevronRight, Zap, Code2, Brain, Calendar,
  RotateCw, Eye, RefreshCw, BookOpenCheck, Sparkles, Award
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const timeline = [
  { t: "9AM", p: 1 },{ t: "10AM", p: 0 },{ t: "11AM", p: 2 },{ t: "12PM", p: 0 },
  { t: "2PM",  p: 3 },{ t: "4PM",  p: 2 },{ t: "6PM",  p: 1 },{ t: "8PM",  p: 2 },
];

const pie = [
  { name: "Easy",   value: 3, color: "var(--green)" },
  { name: "Medium", value: 6, color: "var(--amber)" },
  { name: "Hard",   value: 2, color: "var(--red)" },
];

const solved = [
  { title: "Two Sum",                diff: "Easy",   status: "Accepted",     topics: ["Arrays","Hash"],    dur: "4m",  time: "9:14 AM" },
  { title: "Valid Parentheses",       diff: "Easy",   status: "Accepted",     topics: ["Stack"],            dur: "3m",  time: "9:28 AM" },
  { title: "Merge Intervals",         diff: "Medium", status: "Accepted",     topics: ["Arrays","Sorting"], dur: "22m", time: "11:02 AM" },
  { title: "Search in Rotated Array", diff: "Medium", status: "Wrong Answer", topics: ["Binary Search"],   dur: "18m", time: "11:35 AM" },
  { title: "Maximum Subarray",        diff: "Medium", status: "Accepted",     topics: ["DP","Arrays"],     dur: "9m",  time: "2:10 PM" },
  { title: "Jump Game",               diff: "Medium", status: "Accepted",     topics: ["Greedy"],          dur: "14m", time: "2:30 PM" },
  { title: "Clone Graph",             diff: "Medium", status: "Accepted",     topics: ["Graphs","BFS"],    dur: "20m", time: "2:55 PM" },
  { title: "Word Break",              diff: "Medium", status: "TLE",          topics: ["DP","Strings"],    dur: "35m", time: "4:20 PM" },
  { title: "Subsets",                 diff: "Medium", status: "Accepted",     topics: ["Backtracking"],    dur: "16m", time: "4:58 PM" },
  { title: "Trapping Rain Water",     diff: "Hard",   status: "Wrong Answer", topics: ["Two Pointers"],    dur: "40m", time: "6:10 PM" },
  { title: "LRU Cache",               diff: "Hard",   status: "Accepted",     topics: ["Design","Hash"],   dur: "28m", time: "8:20 PM" },
];

const actions = [
  { n: 1, title: "Retry Search in Rotated Sorted Array", reason: "Wrong answer — you were close. Review binary search on rotated arrays.", icon: Code2, color: "var(--red)" },
  { n: 2, title: "Optimize Word Break solution",         reason: "TLE — add memoization to your recursive approach.", icon: Brain, color: "var(--amber)" },
  { n: 3, title: "Review DP patterns tomorrow",          reason: "DP accuracy was 60% today. Practice 2 DP mediums first thing.", icon: TrendingUp, color: "var(--blue)" },
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
  const { user } = useAuth();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // SM-2 Review Queue State
  const [queue, setQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchReviewQueue();
  }, [user]);

  const fetchReviewQueue = async () => {
    setLoading(true);
    try {
      const storedToken = localStorage.getItem("accessToken");
      const res = await fetch("/api/reviews/queue", {
        headers: {
          ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {})
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setQueue(data.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (quality: number) => {
    const card = queue[currentIndex];
    if (!card) return;

    try {
      const storedToken = localStorage.getItem("accessToken");
      const res = await fetch(`/api/reviews/${card.id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {})
        },
        body: JSON.stringify({ quality })
      });
      const json = await res.json();
      if (json.success) {
        setRatingMessage(`Rated ${quality}/5! Next review: ${json.data?.nextReviewDate || "scheduled"}`);
      }
    } catch {
      setRatingMessage(`Rated ${quality}/5 (offline simulated).`);
    }

    setTimeout(() => {
      setRatingMessage(null);
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }, 1200);
  };

  const currentCard = queue[currentIndex];
  const isDeckCompleted = queue.length > 0 && currentIndex >= queue.length;

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg,#f59e0b,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Flame size={18} color="white" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <RotateCw size={13} style={{ color: "var(--amber)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                SuperMemo-2 Spaced Repetition
              </span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: "2px 0 0", letterSpacing: "-0.02em" }}>Daily Memory Review</h2>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="surface-card" style={{ padding: "6px 14px", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
            <BookOpenCheck size={14} style={{ color: "var(--amber)" }} />
            <span>{queue.length} Cards in Queue</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchReviewQueue} style={{ gap: 5 }}>
            <RefreshCw size={12} /> Sync Queue
          </button>
        </div>
      </div>

      {/* SM-2 Interactive Spaced Repetition Card Deck */}
      <div className="surface-card" style={{ padding: 24, position: "relative", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 8px" }} />
            <p style={{ fontSize: 13, margin: 0 }}>Loading your personalized spaced review queue...</p>
          </div>
        ) : !isDeckCompleted && currentCard ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Progress Bar & EF Indicator */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)" }}>
              <span style={{ fontWeight: 600 }}>Card {currentIndex + 1} of {queue.length}</span>
              <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                Easiness Factor: {Number(currentCard.easinessFactor || currentCard.easiness_factor || 2.5).toFixed(2)}x
              </span>
            </div>
            <div className="progress" style={{ height: 4 }}>
              <div
                className="progress-fill"
                style={{
                  width: `${((currentIndex + 1) / queue.length) * 100}%`,
                  background: "linear-gradient(90deg, #f59e0b, #ef4444)"
                }}
              />
            </div>

            {/* Flashcard Body */}
            <div
              id="sm2-flashcard"
              onClick={() => setIsFlipped(!isFlipped)}
              style={{
                minHeight: 220,
                padding: "24px 28px",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-subtle)",
                border: "1px solid var(--border-strong)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.2s ease",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span className="badge badge-blue" style={{ fontSize: 10, textTransform: "uppercase" }}>
                    {currentCard.itemType || currentCard.item_type || "Recall"} • {currentCard.subtopic || "DSA"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Eye size={12} /> {isFlipped ? "Click to view question" : "Click to flip answer"}
                  </span>
                </div>

                {!isFlipped ? (
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      QUESTION / PATTERN INVARIANT
                    </span>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: "8px 0" }}>
                      {currentCard.title}
                    </h3>
                    <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "8px 0 0" }}>
                      {currentCard.frontContent || currentCard.front_content || "Explain the optimal time and space complexity."}
                    </p>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      RECALL ANSWER & MECHANICS
                    </span>
                    <p style={{ fontSize: 14.5, fontWeight: 600, color: "var(--green)", margin: "8px 0" }}>
                      {currentCard.backContent || currentCard.back_content || "Mastered with optimal complexity."}
                    </p>
                    <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                        💡 <strong>Key Takeaway:</strong> Invariant maintained across iterations. Interval advances exponentially upon recall.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 16 }}>
                {!isFlipped ? "Tap card to check mental recall" : "Rate how easily you recalled this card:"}
              </div>
            </div>

            {/* Rating Buttons */}
            {isFlipped && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                <button
                  id="sm2-rate-1"
                  onClick={(e) => { e.stopPropagation(); handleRate(1); }}
                  className="btn btn-secondary"
                  style={{ borderColor: "var(--red)", color: "var(--red)", flexDirection: "column", padding: "10px 8px" }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Again (1)</span>
                  <span style={{ fontSize: 10, opacity: 0.8 }}>&lt; 1 Day Review</span>
                </button>
                <button
                  id="sm2-rate-3"
                  onClick={(e) => { e.stopPropagation(); handleRate(3); }}
                  className="btn btn-secondary"
                  style={{ borderColor: "var(--amber)", color: "var(--amber)", flexDirection: "column", padding: "10px 8px" }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Hard (3)</span>
                  <span style={{ fontSize: 10, opacity: 0.8 }}>2 Days Review</span>
                </button>
                <button
                  id="sm2-rate-4"
                  onClick={(e) => { e.stopPropagation(); handleRate(4); }}
                  className="btn btn-secondary"
                  style={{ borderColor: "var(--blue)", color: "var(--blue)", flexDirection: "column", padding: "10px 8px" }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Good (4)</span>
                  <span style={{ fontSize: 10, opacity: 0.8 }}>4 Days Review</span>
                </button>
                <button
                  id="sm2-rate-5"
                  onClick={(e) => { e.stopPropagation(); handleRate(5); }}
                  className="btn btn-primary"
                  style={{ background: "var(--green)", borderColor: "var(--green)", flexDirection: "column", padding: "10px 8px" }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Easy (5)</span>
                  <span style={{ fontSize: 10, opacity: 0.9 }}>7 Days Review</span>
                </button>
              </div>
            )}

            {ratingMessage && (
              <div style={{ padding: "8px 14px", borderRadius: "var(--radius-md)", background: "var(--green-light)", color: "var(--green)", fontSize: 12, fontWeight: 600, textAlign: "center" }}>
                {ratingMessage}
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "28px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--green-light)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              All Daily Review Cards Completed! 🎉
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, maxWidth: 460 }}>
              Your memory intervals have been refreshed using SuperMemo-2. No knowledge decay today!
            </p>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setCurrentIndex(0); setIsFlipped(false); }}
              style={{ gap: 6, marginTop: 4 }}
            >
              <RefreshCw size={12} /> Practice Entire Deck Again
            </button>
          </div>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Solved",       value: "11",     sub: "vs 6 yesterday",    icon: Code2,      color: "var(--blue)"   },
          { label: "Accuracy",     value: "73%",    sub: "↑ from 65% yest.",  icon: Target,     color: "var(--green)"  },
          { label: "Time Coding",  value: "3h 12m", sub: "209 active min",    icon: Clock,      color: "var(--violet)" },
          { label: "XP Earned",    value: "+420",   sub: "Total: 4,820 XP",   icon: Zap,        color: "var(--amber)"  },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="surface-card" style={{ padding: 20 }}>
            <div style={{ width: 34, height: 34, borderRadius: "var(--radius-md)", background: `color-mix(in srgb, ${color} 12%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>{value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", margin: "3px 0 0" }}>{label}</div>
            <div style={{ fontSize: 11, color: "var(--green)", marginTop: 4, fontWeight: 600 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <div className="surface-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>Coding Activity</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>Problems by hour</p>
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

      {/* Strong / Weak + Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <div className="surface-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <TrendingUp size={14} style={{ color: "var(--green)" }} />
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Strong Today</h3>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Graphs","Arrays","Hash Maps","Stack"].map((t) => (
              <span key={t} style={{ padding: "5px 10px", borderRadius: "var(--radius-full)", fontSize: 11.5, fontWeight: 500, background: "var(--green-light)", color: "var(--green)", border: "1px solid color-mix(in srgb, var(--green) 25%, transparent)" }}>
                ✓ {t}
              </span>
            ))}
          </div>
        </div>
        <div className="surface-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <TrendingDown size={14} style={{ color: "var(--red)" }} />
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Needs Work</h3>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Dynamic Programming","Binary Search","Backtracking"].map((t) => (
              <span key={t} style={{ padding: "5px 10px", borderRadius: "var(--radius-full)", fontSize: 11.5, fontWeight: 500, background: "var(--red-light)", color: "var(--red)", border: "1px solid color-mix(in srgb, var(--red) 25%, transparent)" }}>
                ↓ {t}
              </span>
            ))}
          </div>
        </div>
        <div className="surface-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <Brain size={14} style={{ color: "var(--blue)" }} />
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Next Actions</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {actions.map(({ n, title, color }) => (
              <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: `color-mix(in srgb, ${color} 12%, transparent)`, color, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{n}</span>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Problems table */}
      <div className="surface-card" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Today's Problems</h3>
          <span className="badge badge-blue">{solved.length} attempted</span>
        </div>
        <div className="divide-theme">
          {solved.map(({ title, diff, status, topics, dur, time }) => (
            <div key={title + time} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px" }}>
              <div style={{ flexShrink: 0 }}>
                {status === "Accepted"
                  ? <CheckCircle2 size={14} style={{ color: "var(--green)" }} />
                  : status === "Wrong Answer"
                  ? <XCircle size={14} style={{ color: "var(--red)" }} />
                  : <AlertCircle size={14} style={{ color: "var(--amber)" }} />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {topics.map((t) => (
                    <span key={t} className="badge badge-neutral" style={{ fontSize: 10 }}>{t}</span>
                  ))}
                </div>
              </div>
              <span className={`badge ${diff === "Easy" ? "diff-easy" : diff === "Medium" ? "diff-medium" : "diff-hard"}`} style={{ flexShrink: 0 }}>{diff}</span>
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
