import { useState } from "react";
import { Trophy, Zap, Flame, ArrowUpRight, ArrowDownRight, Minus, Search } from "lucide-react";

type Tab = "global" | "weekly" | "monthly" | "college";

const NAMES = [
  "Priya Patel","Rahul Kumar","Sneha Reddy","Arjun Sharma","Kavya Singh",
  "Rohan Joshi","Ananya Iyer","Vikram Nair","Deepika Sharma","Aditya Gupta",
  "Neha Bansal","Siddharth Rao","Pooja Menon","Kartik Verma","Divya Krishnan",
  "Harsh Agarwal","Shreya Tiwari","Nikhil Jain","Manish Chauhan","Riya Sinha",
];

const COLLEGES = [
  "IIT Bombay","IIT Delhi","NIT Trichy","BITS Pilani","VIT Vellore",
  "NIT Surathkal","IIIT Hyderabad","Anna University","IIT Madras","IIT Kharagpur",
];

const CHANGES = [3, 1, 2, -1, 5, 0, -2, 4, -3, 1, 6, 0, -4, 2, 3, -1, 0, 2, -2, 1];

const makeUsers = (count = 20) =>
  Array.from({ length: count }, (_, i) => ({
    rank: i + 1,
    name: NAMES[i % NAMES.length],
    college: COLLEGES[i % COLLEGES.length],
    rating: Math.max(800, Math.floor(2840 - i * 58 + (i % 3) * 12)),
    solved: Math.max(50, Math.floor(680 - i * 16 + (i % 5) * 8)),
    streak: Math.max(0, Math.floor(90 - i * 3 + (i % 4) * 2)),
    xp: Math.max(1000, Math.floor(50000 - i * 1900 + (i % 3) * 200)),
    change: CHANGES[i % CHANGES.length],
    isMe: i === 3,
    badge: i < 3 ? ["🥇", "🥈", "🥉"][i] : null,
  }));

export default function Leaderboard() {
  const [tab, setTab] = useState<Tab>("global");
  const [q, setQ] = useState("");

  const rows = makeUsers(20).filter((u) => !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.college.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Your card */}
      <div
        style={{
          borderRadius: "var(--radius-xl)",
          background: "linear-gradient(135deg,#1e3a8a 0%,#312e81 45%,#0e7490 100%)",
          padding: "22px 28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 80% 50%, rgba(6,182,212,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ width: 52, height: 52, borderRadius: "var(--radius-lg)", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
            AS
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <p style={{ color: "white", fontWeight: 700, fontSize: 17, margin: 0, letterSpacing: "-0.01em" }}>Arjun Sharma</p>
            <p style={{ color: "rgba(147,197,253,0.85)", fontSize: 12, margin: 0 }}>NIT Trichy · Level 12</p>
          </div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              { label: "Global Rank", value: "#1,204" },
              { label: "Rating",      value: "1,605"  },
              { label: "Solved",      value: "347"    },
              { label: "Streak",      value: "28d"    },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ color: "white", fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>{value}</div>
                <div style={{ color: "rgba(147,197,253,0.75)", fontSize: 11 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(52,211,153,0.9)", fontSize: 12, fontWeight: 600 }}>
            <ArrowUpRight size={14} /> ↑ 48 spots this week
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 3, padding: 4, background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
          {(["global","weekly","monthly","college"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: tab === t ? "var(--bg-raised)" : "transparent",
                color: tab === t ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: 12.5,
                fontWeight: tab === t ? 500 : 400,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: tab === t ? "var(--shadow-xs)" : "none",
              }}
            >
              {t === "global" ? "🌍 Global" : t === "weekly" ? "📅 Weekly" : t === "monthly" ? "📆 Monthly" : "🎓 College"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, maxWidth: 280, padding: "7px 12px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
          <Search size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or college…"
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit" }}
          />
        </div>
      </div>

      {/* Podium */}
      {!q && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[1, 0, 2].map((idx) => {
            const u = rows[idx];
            if (!u) return null;
            const gradients = [
              "linear-gradient(135deg,#f59e0b,#d97706)",
              "linear-gradient(135deg,#e5e7eb,#9ca3af)",
              "linear-gradient(135deg,#fb923c,#ea580c)",
            ];
            const order = [1, 0, 2];
            return (
              <div key={u.rank} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "20px 12px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)" }}>
                <div style={{ width: 52, height: 52, borderRadius: "var(--radius-lg)", background: gradients[order[idx]], display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 16 }}>
                  {u.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 15, margin: "0 0 2px" }}>{u.badge}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>{u.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{u.college}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--blue)", margin: "6px 0 0" }}>{u.rating.toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="surface-card" style={{ overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "56px 1fr 150px 84px 80px 80px 80px 52px",
            padding: "10px 20px",
            background: "var(--bg-subtle)",
            borderBottom: "1px solid var(--border)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          <span>Rank</span>
          <span>Student</span>
          <span>College</span>
          <span style={{ textAlign: "right" }}>Rating</span>
          <span style={{ textAlign: "right" }}>Solved</span>
          <span style={{ textAlign: "right" }}>Streak</span>
          <span style={{ textAlign: "right" }}>XP</span>
          <span style={{ textAlign: "right" }}>Δ</span>
        </div>

        <div className="divide-theme">
          {rows.map((u) => (
            <div
              key={u.rank}
              style={{
                display: "grid",
                gridTemplateColumns: "56px 1fr 150px 84px 80px 80px 80px 52px",
                padding: "11px 20px",
                alignItems: "center",
                background: u.isMe ? "var(--blue-light)" : "transparent",
                cursor: "pointer",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { if (!u.isMe) e.currentTarget.style.background = "var(--bg-subtle)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = u.isMe ? "var(--blue-light)" : "transparent"; }}
            >
              <div>
                {u.rank <= 3
                  ? <span style={{ fontSize: 16 }}>{u.badge}</span>
                  : <span style={{ fontSize: 13, fontWeight: 700, color: u.isMe ? "var(--blue)" : "var(--text-muted)" }}>#{u.rank}</span>
                }
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                <div
                  style={{
                    width: 30, height: 30, borderRadius: "var(--radius-md)", flexShrink: 0,
                    background: u.isMe ? "linear-gradient(135deg,#2563eb,#7c3aed)" : `hsl(${(u.rank * 47) % 360},52%,54%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: 10, fontWeight: 700,
                  }}
                >
                  {u.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <span style={{ fontSize: 13, fontWeight: u.isMe ? 600 : 500, color: u.isMe ? "var(--blue)" : "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.name}
                </span>
              </div>

              <span style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.college}</span>

              <span style={{ textAlign: "right", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>{u.rating.toLocaleString()}</span>

              <span style={{ textAlign: "right", fontSize: 13, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>{u.solved}</span>

              <span style={{ textAlign: "right", fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3 }}>
                <Flame size={10} style={{ color: "var(--red)" }} />{u.streak}d
              </span>

              <span style={{ textAlign: "right", fontSize: 12, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                {(u.xp / 1000).toFixed(1)}k
              </span>

              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                {u.change > 0
                  ? <span style={{ fontSize: 11, color: "var(--green)", display: "flex", alignItems: "center", gap: 1 }}><ArrowUpRight size={10} />{u.change}</span>
                  : u.change < 0
                  ? <span style={{ fontSize: 11, color: "var(--red)", display: "flex", alignItems: "center", gap: 1 }}><ArrowDownRight size={10} />{Math.abs(u.change)}</span>
                  : <Minus size={11} style={{ color: "var(--text-disabled)" }} />
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
