import { useState } from "react";
import {
  Users, BarChart2, ClipboardList, Download, Search, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Plus, Brain, Award, Clock,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell,
} from "recharts";

type Tab = "students" | "analytics" | "assignments";

const students = [
  { name: "Priya Patel",    id: "21CS001", accuracy: 88, streak: 32, solved: 148, lastActive: "2h ago",   risk: false },
  { name: "Rahul Kumar",    id: "21CS002", accuracy: 72, streak: 14, solved: 96,  lastActive: "5h ago",   risk: false },
  { name: "Sneha Reddy",    id: "21CS003", accuracy: 91, streak: 28, solved: 172, lastActive: "1h ago",   risk: false },
  { name: "Arjun Sharma",   id: "21CS004", accuracy: 73, streak: 28, solved: 347, lastActive: "30m ago",  risk: false },
  { name: "Kavya Singh",    id: "21CS005", accuracy: 45, streak: 2,  solved: 38,  lastActive: "3d ago",   risk: true  },
  { name: "Rohan Joshi",    id: "21CS006", accuracy: 60, streak: 7,  solved: 64,  lastActive: "1d ago",   risk: false },
  { name: "Ananya Iyer",    id: "21CS007", accuracy: 36, streak: 0,  solved: 22,  lastActive: "5d ago",   risk: true  },
  { name: "Vikram Nair",    id: "21CS008", accuracy: 79, streak: 19, solved: 118, lastActive: "4h ago",   risk: false },
  { name: "Deepika Sharma", id: "21CS009", accuracy: 52, streak: 3,  solved: 41,  lastActive: "2d ago",   risk: true  },
  { name: "Aditya Gupta",   id: "21CS010", accuracy: 84, streak: 22, solved: 134, lastActive: "6h ago",   risk: false },
];

const topicData = [
  { topic: "Arrays",   classAvg: 78, targetAvg: 70 },
  { topic: "Trees",    classAvg: 65, targetAvg: 65 },
  { topic: "DP",       classAvg: 52, targetAvg: 60 },
  { topic: "Graphs",   classAvg: 71, targetAvg: 65 },
  { topic: "Strings",  classAvg: 68, targetAvg: 65 },
  { topic: "Math",     classAvg: 74, targetAvg: 70 },
  { topic: "Heap",     classAvg: 58, targetAvg: 60 },
];

const engagementData = [
  { w: "W1", active: 38, submissions: 142 },
  { w: "W2", active: 42, submissions: 168 },
  { w: "W3", active: 35, submissions: 124 },
  { w: "W4", active: 48, submissions: 190 },
  { w: "W5", active: 44, submissions: 175 },
  { w: "W6", active: 50, submissions: 210 },
  { w: "W7", active: 46, submissions: 195 },
  { w: "W8", active: 52, submissions: 228 },
];

const assignments = [
  { title: "Week 3 — Arrays & Hashing", dueDate: "Sep 15", submitted: 45, total: 52, graded: 40, avgScore: 82 },
  { title: "Week 4 — Two Pointers",     dueDate: "Sep 22", submitted: 38, total: 52, graded: 30, avgScore: 74 },
  { title: "Week 5 — Binary Search",    dueDate: "Sep 29", submitted: 12, total: 52, graded: 0,  avgScore: 0 },
  { title: "Week 6 — Sliding Window",   dueDate: "Oct 6",  submitted: 0,  total: 52, graded: 0,  avgScore: 0 },
];

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "8px 12px", boxShadow: "var(--shadow-md)", fontSize: 11 }}>
      <p style={{ fontWeight: 600, color: "var(--text-primary)", margin: "0 0 5px" }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "var(--text-muted)" }}>
          <span>{p.name || p.dataKey}</span>
          <span style={{ color: p.stroke || p.fill, fontWeight: 600 }}>{p.value}{p.dataKey === "classAvg" || p.dataKey === "targetAvg" ? "%" : ""}</span>
        </div>
      ))}
    </div>
  );
}

export default function Faculty() {
  const [tab, setTab] = useState<Tab>("students");
  const [q, setQ] = useState("");

  const filtered = students.filter((s) => !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.id.includes(q));
  const atRisk = students.filter((s) => s.risk);

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 3px", letterSpacing: "-0.02em" }}>CS301 — Data Structures</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Semester 5 · Section A · 52 students</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary btn-sm" style={{ gap: 5 }}>
            <Download size={12} /> Export
          </button>
          <button className="btn btn-primary btn-sm" style={{ gap: 5 }}>
            <Plus size={12} /> New Assignment
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Total Students",  value: "52",   sub: "Active this week: 46", icon: Users,         color: "var(--blue)"   },
          { label: "Class Avg Acc.",  value: "67%",  sub: "↑ 4% vs last week",   icon: BarChart2,     color: "var(--green)"  },
          { label: "Avg Problems",    value: "94",   sub: "Solved per student",   icon: Brain,         color: "var(--violet)" },
          { label: "At-Risk Students",value: "3",    sub: "Need attention",        icon: AlertTriangle, color: "var(--red)"    },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="surface-card" style={{ padding: 20 }}>
            <div style={{ width: 34, height: 34, borderRadius: "var(--radius-md)", background: `color-mix(in srgb, ${color} 12%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>{value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>{label}</div>
            <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 600 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 3, padding: 4, background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", alignSelf: "flex-start" }}>
        {(["students","analytics","assignments"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "6px 16px", borderRadius: "var(--radius-md)", border: "none",
              background: tab === t ? "var(--bg-raised)" : "transparent",
              color: tab === t ? "var(--text-primary)" : "var(--text-muted)",
              fontSize: 12.5, fontWeight: tab === t ? 500 : 400,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: tab === t ? "var(--shadow-xs)" : "none",
            }}
          >
            {t === "students" ? "👤 Students" : t === "analytics" ? "📊 Analytics" : "📋 Assignments"}
          </button>
        ))}
      </div>

      {/* Students tab */}
      {tab === "students" && (
        <>
          <div className="surface-card" style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Student Roster</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 11px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                <Search size={12} style={{ color: "var(--text-muted)" }} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students…" style={{ background: "none", border: "none", outline: "none", fontSize: 12.5, color: "var(--text-primary)", fontFamily: "inherit", width: 160 }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 72px 72px 70px 90px 80px", padding: "9px 20px", background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              <span>Student</span>
              <span style={{ textAlign: "right" }}>Solved</span>
              <span style={{ textAlign: "right" }}>Accuracy</span>
              <span style={{ textAlign: "right" }}>Streak</span>
              <span style={{ textAlign: "center" }}>Status</span>
              <span style={{ textAlign: "right" }}>Last Active</span>
              <span />
            </div>

            <div className="divide-theme">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  style={{ display: "grid", gridTemplateColumns: "1fr 80px 72px 72px 70px 90px 80px", padding: "10px 20px", alignItems: "center" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-subtle)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "var(--radius-md)", background: s.risk ? "linear-gradient(135deg,#ef4444,#dc2626)" : `hsl(${(s.name.charCodeAt(0) * 13) % 360},52%,54%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                      {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>{s.name}</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{s.id}</p>
                    </div>
                  </div>

                  <span style={{ textAlign: "right", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>{s.solved}</span>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: s.accuracy >= 80 ? "var(--green)" : s.accuracy >= 60 ? "var(--amber)" : "var(--red)" }}>
                      {s.accuracy}%
                    </span>
                  </div>

                  <span style={{ textAlign: "right", fontSize: 12, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>{s.streak}d</span>

                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {s.risk
                      ? <span style={{ padding: "3px 8px", borderRadius: "var(--radius-full)", fontSize: 10, fontWeight: 600, background: "var(--red-light)", color: "var(--red)" }}>At Risk</span>
                      : <span style={{ padding: "3px 8px", borderRadius: "var(--radius-full)", fontSize: 10, fontWeight: 600, background: "var(--green-light)", color: "var(--green)" }}>Active</span>
                    }
                  </div>

                  <span style={{ textAlign: "right", fontSize: 11.5, color: "var(--text-muted)" }}>{s.lastActive}</span>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button style={{ fontSize: 11.5, color: "var(--blue)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* At-risk panel */}
          {atRisk.length > 0 && (
            <div className="surface-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <AlertTriangle size={14} style={{ color: "var(--red)" }} />
                <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>At-Risk Students</h3>
                <span className="badge badge-red" style={{ marginLeft: "auto" }}>{atRisk.length} students</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {atRisk.map((s) => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--red-light)", borderRadius: "var(--radius-md)", border: "1px solid color-mix(in srgb, var(--red) 20%, transparent)" }}>
                    <AlertTriangle size={13} style={{ color: "var(--red)", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>{s.name}</p>
                      <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>
                        Accuracy {s.accuracy}% · Streak {s.streak}d · Last active {s.lastActive}
                      </p>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>Send Nudge</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Analytics tab */}
      {tab === "analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="surface-card" style={{ padding: 22 }}>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>Topic Mastery</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Class average vs target</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topicData} margin={{ top: 0, right: 0, bottom: 0, left: -18 }}>
                  <XAxis dataKey="topic" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="classAvg" name="Class Avg" radius={[4, 4, 0, 0]}>
                    {topicData.map((d, i) => (
                      <Cell key={i} fill={d.classAvg >= d.targetAvg ? "var(--blue)" : "var(--amber)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, background: "var(--blue)", borderRadius: 2, display: "inline-block" }} /> Meeting target</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, background: "var(--amber)", borderRadius: 2, display: "inline-block" }} /> Below target</span>
              </div>
            </div>

            <div className="surface-card" style={{ padding: 22 }}>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>Weekly Engagement</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Active students & submissions</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={engagementData} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                  <defs>
                    <linearGradient id="eg1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--blue)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="var(--blue)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="eg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="var(--violet)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="w" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="active" name="Active Students" stroke="var(--blue)" strokeWidth={2} fill="url(#eg1)" dot={false} />
                  <Area type="monotone" dataKey="submissions" name="Submissions" stroke="var(--violet)" strokeWidth={2} fill="url(#eg2)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insight cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[
              { icon: TrendingUp,   color: "var(--green)",  title: "Strongest Topic",  body: "Graph algorithms — class avg 71%, above 65% target. Encourage advanced flow problems for top students." },
              { icon: TrendingDown, color: "var(--red)",    title: "Needs Attention",  body: "Dynamic Programming — class avg 52%, below target. Recommend a dedicated DP workshop before the exam." },
              { icon: Award,        color: "var(--amber)",  title: "Engagement Up",    body: "Weekly submissions rose 60% over 8 weeks. Daily challenge participation is driving consistent practice habits." },
            ].map(({ icon: Icon, color, title, body }) => (
              <div key={title} className="surface-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "var(--radius-md)", background: `color-mix(in srgb, ${color} 12%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{title}</span>
                </div>
                <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignments tab */}
      {tab === "assignments" && (
        <div className="surface-card" style={{ overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Assignments</h3>
            <button className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
              <Download size={11} /> Export grades
            </button>
          </div>

          <div className="divide-theme">
            {assignments.map((a) => {
              const pct = Math.round((a.submitted / a.total) * 100);
              return (
                <div key={a.title} style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>{a.title}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={11} /> Due {a.dueDate}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {a.avgScore > 0 && (
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: a.avgScore >= 75 ? "var(--green)" : "var(--amber)", letterSpacing: "-0.02em" }}>{a.avgScore}%</div>
                          <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>Avg score</div>
                        </div>
                      )}
                      <button className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>Details</button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 20, marginBottom: 10, fontSize: 12, color: "var(--text-muted)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <CheckCircle2 size={11} style={{ color: "var(--green)" }} /> {a.submitted}/{a.total} submitted
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <ClipboardList size={11} style={{ color: "var(--blue)" }} /> {a.graded} graded
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="progress" style={{ flex: 1, height: 6 }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 80 ? "var(--green)" : pct >= 50 ? "var(--blue)" : "var(--amber)" }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", flexShrink: 0 }}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
