import { useNavigate } from "react-router";
import {
  Zap, Flame, Code2, Trophy, TrendingUp, Brain, ArrowRight,
  ChevronRight, Clock, Target, Play, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";

const weeklyData = [
  { day: "Mon", problems: 4, accuracy: 75 },
  { day: "Tue", problems: 7, accuracy: 85 },
  { day: "Wed", problems: 3, accuracy: 66 },
  { day: "Thu", problems: 9, accuracy: 90 },
  { day: "Fri", problems: 6, accuracy: 80 },
  { day: "Sat", problems: 11, accuracy: 88 },
  { day: "Sun", problems: 5, accuracy: 72 },
];

const skillData = [
  { topic: "Arrays", value: 85 },
  { topic: "Trees", value: 72 },
  { topic: "DP", value: 58 },
  { topic: "Graphs", value: 90 },
  { topic: "Strings", value: 65 },
  { topic: "Math", value: 78 },
];

const activity = [
  { title: "Two Sum",               diff: "Easy",   status: "Accepted",      lang: "Python", time: "2 min ago" },
  { title: "Merge Intervals",        diff: "Medium", status: "Accepted",      lang: "C++",    time: "1 hr ago" },
  { title: "Trapping Rain Water",    diff: "Hard",   status: "Wrong Answer",  lang: "Java",   time: "2 hr ago" },
  { title: "LRU Cache",              diff: "Medium", status: "Accepted",      lang: "Python", time: "Yesterday" },
  { title: "Word Search II",         diff: "Hard",   status: "TLE",           lang: "C++",    time: "Yesterday" },
];

const recommendations = [
  {
    title: "DP: Knapsack Variants",
    desc: "DP accuracy dropped 12% this week. Start with 0/1 knapsack.",
    tag: "Weak area",
    tagColor: "var(--amber)",
    icon: Target,
  },
  {
    title: "Binary Search on Answer",
    desc: "3 related problems solved. Ready to level up this pattern.",
    tag: "Next step",
    tagColor: "var(--blue)",
    icon: TrendingUp,
  },
  {
    title: "Trie Data Structure",
    desc: "Asked in 40% of FAANG interviews. Not practiced yet.",
    tag: "Important",
    tagColor: "var(--red)",
    icon: Brain,
  },
];

const statData = [
  { label: "Total XP",    value: "4,820",  sub: "+320 this week",  icon: Zap,   color: "var(--amber)",  bg: "var(--amber-light)"  },
  { label: "Streak",      value: "28 days",sub: "Personal best!",  icon: Flame, color: "var(--red)",    bg: "var(--red-light)"    },
  { label: "Solved",      value: "347",    sub: "+12 this week",   icon: Code2, color: "var(--blue)",   bg: "var(--blue-light)"   },
  { label: "Rank",        value: "#1,204", sub: "↑ 48 spots",      icon: Trophy,color: "var(--violet)", bg: "rgba(124,58,237,.1)" },
];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "8px 12px",
        boxShadow: "var(--shadow-md)",
        fontSize: 11,
      }}
    >
      <p style={{ fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 16, color: "var(--text-muted)" }}>
          <span>{p.name}</span>
          <span style={{ color: p.stroke, fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function DiffBadge({ diff }: { diff: string }) {
  const cn = diff === "Easy" ? "diff-easy" : diff === "Medium" ? "diff-medium" : "diff-hard";
  return <span className={`badge ${cn}`}>{diff}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const color = status === "Accepted" ? "green" : status === "Wrong Answer" ? "red" : "amber";
  return <span className={`badge badge-${color}`}>{status}</span>;
}

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Stat row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {statData.map(({ label, value, sub, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="surface-card"
              style={{ padding: 20 }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--green)", display: "flex", alignItems: "center", gap: 3 }}>
                  <ArrowUpRight size={11} />{sub}
                </span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
                {value}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Charts row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
          {/* Weekly progress */}
          <div className="surface-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>Weekly Progress</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Problems solved & accuracy</p>
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--text-muted)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 12, height: 2, background: "var(--blue)", display: "inline-block", borderRadius: 1 }} /> Problems
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 12, height: 2, background: "var(--cyan)", display: "inline-block", borderRadius: 1 }} /> Accuracy %
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                <defs>
                  <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--blue)" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="var(--blue)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="problems" name="Problems" stroke="var(--blue)" strokeWidth={2} fill="url(#gP)" dot={false} activeDot={{ r: 4, fill: "var(--blue)" }} />
                <Area type="monotone" dataKey="accuracy" name="Accuracy" stroke="var(--cyan)" strokeWidth={2} fill="url(#gA)" dot={false} activeDot={{ r: 4, fill: "var(--cyan)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Skill radar */}
          <div className="surface-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>Skill Radar</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 4px" }}>Topic mastery</p>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={skillData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="topic"
                  tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "Inter,sans-serif" }}
                />
                <Radar dataKey="value" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.12} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Daily challenge + Recommendations ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
          {/* Daily challenge */}
          <div
            className="surface-card"
            style={{
              padding: 22,
              background: "linear-gradient(145deg, var(--bg-raised), var(--bg-surface))",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -24,
                right: -24,
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: "var(--amber)",
                opacity: 0.06,
                pointerEvents: "none",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
              <div style={{ width: 24, height: 24, borderRadius: "var(--radius-sm)", background: "var(--amber-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Flame size={13} style={{ color: "var(--amber)" }} />
              </div>
              <span className="text-label" style={{ color: "var(--text-muted)" }}>Daily Challenge</span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
              Maximum Product Subarray
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
              <span className="badge diff-medium">Medium</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>DP · Arrays</span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
              Find the subarray with the largest product. Positive, negative, and zero values are involved.
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 16 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} /> ~25 min</span>
              <span>12,847 solved today</span>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", gap: 6 }}
              onClick={() => navigate("/workspace")}
            >
              <Play size={13} /> Solve Now
            </button>
          </div>

          {/* Recommendations */}
          <div className="surface-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>AI Recommendations</h3>
              <button style={{ fontSize: 12, color: "var(--blue)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontFamily: "inherit" }}>
                View all <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recommendations.map(({ title, desc, tag, tagColor, icon: Icon }) => (
                <div
                  key={title}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: 14,
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-surface)",
                    cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "var(--radius-md)",
                      background: `color-mix(in srgb, ${tagColor} 10%, transparent)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={15} style={{ color: tagColor }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
                      <span className="badge" style={{ background: `color-mix(in srgb, ${tagColor} 10%, transparent)`, color: tagColor, flexShrink: 0 }}>{tag}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>{desc}</p>
                  </div>
                  <ChevronRight size={13} style={{ color: "var(--text-disabled)", flexShrink: 0, marginTop: 2 }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent activity ── */}
        <div className="surface-card" style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Recent Activity</h3>
            <button style={{ fontSize: 12, color: "var(--blue)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontFamily: "inherit" }}>
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-theme">
            {activity.map(({ title, diff, status, lang, time }) => (
              <div
                key={title + time}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 20px",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onClick={() => navigate("/workspace")}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ width: 32, height: 32, borderRadius: "var(--radius-md)", background: "var(--bg-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Code2 size={14} style={{ color: "var(--text-muted)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{lang} · {time}</p>
                </div>
                <DiffBadge diff={diff} />
                <StatusBadge status={status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
