import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell,
} from "recharts";
import { Brain, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ChevronRight } from "lucide-react";

const radarData = [
  { topic: "Arrays",  you: 85, avg: 70 },
  { topic: "Trees",   you: 72, avg: 65 },
  { topic: "DP",      you: 58, avg: 55 },
  { topic: "Graphs",  you: 90, avg: 60 },
  { topic: "Strings", you: 65, avg: 72 },
  { topic: "Math",    you: 78, avg: 65 },
  { topic: "Heap",    you: 55, avg: 48 },
  { topic: "BT",      you: 48, avg: 45 },
];

const accuracyData = [
  { w: "W1", a: 62 },{ w: "W2", a: 68 },{ w: "W3", a: 61 },{ w: "W4", a: 75 },
  { w: "W5", a: 70 },{ w: "W6", a: 79 },{ w: "W7", a: 73 },{ w: "W8", a: 83 },
];

const timeData = [
  { d: "Mon", m: 45 },{ d: "Tue", m: 90 },{ d: "Wed", m: 30 },
  { d: "Thu", m: 120 },{ d: "Fri", m: 75 },{ d: "Sat", m: 150 },{ d: "Sun", m: 60 },
];

const mastery = [
  { topic: "Arrays & Hashing",  e: 18, m: 12, h: 5,  pct: 88 },
  { topic: "Two Pointers",      e: 8,  m: 7,  h: 2,  pct: 82 },
  { topic: "Sliding Window",    e: 6,  m: 5,  h: 1,  pct: 78 },
  { topic: "Binary Search",     e: 5,  m: 6,  h: 2,  pct: 74 },
  { topic: "Graphs / BFS",      e: 10, m: 9,  h: 4,  pct: 90 },
  { topic: "Dynamic Prog.",     e: 8,  m: 5,  h: 1,  pct: 58 },
  { topic: "Trees / DFS",       e: 12, m: 8,  h: 3,  pct: 72 },
  { topic: "Heaps",             e: 4,  m: 3,  h: 0,  pct: 55 },
];

const reccs = [
  { type: "weak",   topic: "Dynamic Programming", insight: "DP accuracy 58% vs your 73% average. Focus on 1D patterns first.", action: "Practice 5 medium DP problems", priority: "High",   color: "var(--red)"   },
  { type: "weak",   topic: "Backtracking",         insight: "Only 6 backtracking problems solved. Appears in 25% of medium rounds.", action: "Start with Permutations", priority: "Medium", color: "var(--amber)" },
  { type: "strong", topic: "Graph Algorithms",     insight: "Top 15% globally for graphs! Consider advanced flow problems.", action: "Try Network Flow",          priority: "Stretch", color: "var(--green)"  },
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
  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Overall Mastery", value: "73%",    change: "+8%",   up: true },
          { label: "Strongest Topic", value: "Graphs", change: "90%",   up: true },
          { label: "Weakest Topic",   value: "BT",     change: "48%",   up: false },
          { label: "Focus Score",     value: "7.2/10", change: "+1.1",  up: true },
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
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>8-week rolling</p>
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

      {/* Time + Topic mastery */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
        <div className="surface-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>Time Spent</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>Minutes this week</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={timeData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="d" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="m" name="Minutes" radius={[4,4,0,0]}>
                {timeData.map((e, i) => (
                  <Cell key={i} fill={e.m >= 100 ? "var(--blue)" : e.m >= 60 ? "var(--indigo)" : "var(--bg-muted)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>
            <span>Total: 570 min</span>
            <span style={{ color: "var(--green)", fontWeight: 600 }}>+12% vs last week</span>
          </div>
        </div>

        <div className="surface-card" style={{ overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Topic Mastery</h3>
            <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />Easy</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--amber)", display: "inline-block" }} />Med</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--red)", display: "inline-block" }} />Hard</span>
            </div>
          </div>
          <div className="divide-theme">
            {mastery.map(({ topic, e, m, h, pct }) => (
              <div key={topic} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 20px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{topic}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                    <span style={{ color: "var(--green)" }}>{e}E</span>
                    <span style={{ color: "var(--border-strong)" }}>·</span>
                    <span style={{ color: "var(--amber)" }}>{m}M</span>
                    <span style={{ color: "var(--border-strong)" }}>·</span>
                    <span style={{ color: "var(--red)" }}>{h}H</span>
                  </div>
                </div>
                <div style={{ width: 100 }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{pct}%</span>
                  </div>
                  <div className="progress" style={{ height: 5 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 80 ? "var(--green)" : pct >= 65 ? "var(--blue)" : pct >= 50 ? "var(--amber)" : "var(--red)" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="surface-card" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <Brain size={15} style={{ color: "var(--blue)" }} />
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>AI Recommendations</h3>
          <span className="badge badge-blue" style={{ marginLeft: "auto" }}>Based on your patterns</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderTop: "none" }}>
          {reccs.map(({ topic, insight, action, priority, color, type }, i) => (
            <div
              key={topic}
              style={{
                padding: "20px 22px",
                borderRight: i < reccs.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                {type === "weak"
                  ? <TrendingDown size={14} style={{ color: "var(--red)" }} />
                  : <TrendingUp size={14} style={{ color: "var(--green)" }} />
                }
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{topic}</span>
                <span
                  className="badge"
                  style={{
                    marginLeft: "auto",
                    background: priority === "High" ? "var(--red-light)" : priority === "Medium" ? "var(--amber-light)" : "var(--green-light)",
                    color: priority === "High" ? "var(--red)" : priority === "Medium" ? "var(--amber)" : "var(--green)",
                  }}
                >
                  {priority}
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 14px" }}>{insight}</p>
              <button style={{ fontSize: 12, color, display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                {action} <ChevronRight size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
