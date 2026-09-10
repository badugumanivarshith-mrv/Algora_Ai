import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Trophy, Clock, Users, Zap, Play, Calendar, ChevronRight, TrendingUp, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";

const ratingHistory = [
  { d: "Jan", r: 1320 },{ d: "Feb", r: 1285 },{ d: "Mar", r: 1410 },
  { d: "Apr", r: 1380 },{ d: "May", r: 1455 },{ d: "Jun", r: 1490 },
  { d: "Jul", r: 1520 },{ d: "Aug", r: 1485 },{ d: "Sep", r: 1605 },
];

const rankTrend = [
  { c: "W143", r: 380 },{ c: "W144", r: 290 },{ c: "W145", r: 178 },
  { c: "W146", r: 412 },{ c: "W147", r: 234 },
];

const upcoming = [
  { name: "Algora Weekly 148",    date: "Today, 8:00 PM",    dur: "1h 30m", participants: "4,200 reg.", type: "Rated",    problems: 4, registered: true },
  { name: "FAANG Prep #12",       date: "Tomorrow, 6:00 PM", dur: "2h",     participants: "1,850 reg.", type: "Practice", problems: 5, registered: false },
  { name: "Campus Code Sprint",   date: "Sep 14, 10:00 AM",  dur: "3h",     participants: "2,100 reg.", type: "Rated",    problems: 6, registered: false },
];

const history = [
  { name: "Algora Weekly 147", date: "Sep 7",  rank: 234,  total: 3180, rating: "+45", solved: "3/4" },
  { name: "FAANG Sprint #11",  date: "Sep 3",  rank: 89,   total: 1240, rating: "+72", solved: "4/5" },
  { name: "Algora Weekly 146", date: "Aug 31", rank: 412,  total: 3320, rating: "−18", solved: "2/4" },
  { name: "Campus Sprint VII", date: "Aug 25", rank: 12,   total: 580,  rating: "+88", solved: "5/6" },
  { name: "Algora Weekly 145", date: "Aug 24", rank: 178,  total: 3100, rating: "+32", solved: "3/4" },
];

const liveProblems = [
  { title: "Two City Scheduling",              diff: "Easy",   done: true,  pts: 100 },
  { title: "Minimum Cost to Connect Points",   diff: "Medium", done: true,  pts: 200 },
  { title: "Kth Largest Element",              diff: "Medium", done: true,  pts: 200 },
  { title: "Jump Game VII",                    diff: "Hard",   done: false, pts: 300 },
];

type Tab = "upcoming" | "live" | "history" | "analytics";

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "8px 12px", boxShadow: "var(--shadow-md)", fontSize: 11 }}>
      <p style={{ fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: "var(--text-muted)" }}>
          {p.name}: <span style={{ color: p.stroke || p.fill, fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Contest() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("upcoming");

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Rating",      value: "1,605",  sub: "+45 this week",   icon: Zap,        color: "var(--amber)"  },
          { label: "Best Rank",   value: "#12",    sub: "Campus Sprint",   icon: Trophy,     color: "var(--violet)" },
          { label: "Contests",    value: "28",     sub: "Total attended",  icon: Calendar,   color: "var(--blue)"   },
          { label: "Avg %ile",    value: "Top 8%", sub: "Last 5 contests", icon: TrendingUp, color: "var(--green)"  },
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

      {/* Tabs */}
      <div style={{ display: "flex", gap: 3, padding: 4, background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", width: "fit-content" }}>
        {(["upcoming","live","history","analytics"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "7px 16px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: tab === t ? "var(--bg-raised)" : "transparent",
              color: tab === t ? "var(--text-primary)" : "var(--text-muted)",
              fontSize: 13,
              fontWeight: tab === t ? 500 : 400,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: tab === t ? "var(--shadow-xs)" : "none",
              display: "flex",
              alignItems: "center",
              gap: 5,
              textTransform: "capitalize",
            }}
          >
            {t === "live" && <span className="status-dot status-live" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Upcoming */}
      {tab === "upcoming" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {upcoming.map((c) => (
            <div key={c.name} className="surface-card" style={{ padding: 22, display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{c.name}</h3>
                  <span className={`badge ${c.type === "Rated" ? "badge-blue" : "badge-green"}`}>{c.type}</span>
                  {c.registered && <span className="badge badge-green">Registered</span>}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 12, color: "var(--text-muted)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} />{c.date}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{c.dur}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={11} />{c.participants}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{c.problems} problems</span>
                </div>
              </div>
              {c.registered
                ? <button className="btn btn-primary btn-sm" onClick={() => navigate("/workspace")} style={{ gap: 5, flexShrink: 0 }}><Play size={12} /> Enter</button>
                : <button className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>Register</button>
              }
            </div>
          ))}
        </div>
      )}

      {/* Live */}
      {tab === "live" && (
        <div className="surface-card" style={{ padding: 24, border: "2px solid color-mix(in srgb, var(--red) 30%, transparent)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                <div className="status-dot status-live" />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--red)" }}>Live Now</span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                Algora Weekly 147
              </h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                45:32
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>remaining</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Current Rank", value: "#234", sub: "of 3,180" },
              { label: "Solved",        value: "3/4",  sub: "problems" },
              { label: "Estimated",     value: "Top 7.3%", sub: "percentile" },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{ textAlign: "center", padding: "14px 10px", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{value}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</div>
                <div style={{ fontSize: 10.5, color: "var(--text-disabled)" }}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {liveProblems.map(({ title, diff, done, pts }) => (
              <div
                key={title}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.1s" }}
                onClick={() => navigate("/workspace")}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-subtle)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-surface)"; }}
              >
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${done ? "var(--green)" : "var(--border-strong)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {done && <span style={{ fontSize: 10, color: "var(--green)" }}>✓</span>}
                </div>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: done ? "var(--text-muted)" : "var(--text-primary)" }}>{title}</span>
                <span className={`badge ${diff === "Easy" ? "diff-easy" : diff === "Medium" ? "diff-medium" : "diff-hard"}`}>{diff}</span>
                <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: "var(--text-muted)", minWidth: 36, textAlign: "right" }}>+{pts}</span>
                <ChevronRight size={13} style={{ color: "var(--text-disabled)" }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div className="surface-card" style={{ overflow: "hidden" }}>
          <div className="divide-theme">
            {history.map(({ name, date, rank, total, rating, solved }) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px" }}>
                <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--bg-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Trophy size={15} style={{ color: "var(--blue)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{date}</p>
                </div>
                <div style={{ textAlign: "center", minWidth: 60 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>#{rank}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>of {total.toLocaleString()}</p>
                </div>
                <div style={{ textAlign: "center", minWidth: 44 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", margin: 0 }}>{solved}</p>
                  <p style={{ fontSize: 10, color: "var(--text-disabled)", margin: 0 }}>solved</p>
                </div>
                <span className={`badge ${rating.startsWith("+") ? "badge-green" : "badge-red"}`} style={{ minWidth: 46, justifyContent: "center" }}>
                  {rating}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics */}
      {tab === "analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="surface-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>Rating History</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>Current: 1,605 · Peak: 1,605</p>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={ratingHistory} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="var(--violet)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[1200, 1700]} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="r" name="Rating" stroke="var(--violet)" strokeWidth={2} fill="url(#rg)" dot={false} activeDot={{ r: 4, fill: "var(--violet)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="surface-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>Rank Trend</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>Lower = better</p>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={rankTrend} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <XAxis dataKey="c" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} reversed />
                <Tooltip content={<Tip />} />
                <Bar dataKey="r" name="Rank" fill="var(--blue)" fillOpacity={0.8} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
