import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Flame, Clock, Target, TrendingUp, TrendingDown, CheckCircle2,
  XCircle, AlertCircle, ChevronRight, Zap, Code2, Brain, Calendar,
} from "lucide-react";

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
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg,#f59e0b,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Flame size={18} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{today}</p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>Today's Review</h2>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" style={{ gap: 5 }}>
          <Calendar size={12} /> View history
        </button>
      </div>

      {/* Metrics */}
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
