import { useState, useEffect } from "react";
import { Trophy, Zap, Flame, ArrowUpRight, ArrowDownRight, Minus, Search, ChevronLeft, ChevronRight, Medal, Sparkles, Building2 } from "lucide-react";
import { GamificationApi } from "../services/gamificationApi";
import { GlobalLeaderboardUser } from "../types";

type SortBy = "rating" | "totalXP" | "streakDays";
type Tab = "global" | "weekly" | "xp" | "college";

export default function Leaderboard() {
  const [tab, setTab] = useState<Tab>("global");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("rating");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState<GlobalLeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | undefined>(4);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboardData() {
      setLoading(true);
      try {
        const activeSort = tab === "xp" ? "totalXP" : tab === "weekly" ? "streakDays" : sortBy;
        const res = await GamificationApi.getGlobalLeaderboard({
          page,
          limit: 15,
          search,
          sortBy: activeSort,
        });
        setUsers(res.items);
        setTotalPages(res.totalPages || 1);
        setTotalUsers(res.total || 0);
        if (res.currentUserRank) {
          setCurrentUserRank(res.currentUserRank);
        }
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchLeaderboardData();
    }, 200);

    return () => clearTimeout(timer);
  }, [page, search, sortBy, tab]);

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    setPage(1);
    if (newTab === "xp") setSortBy("totalXP");
    else if (newTab === "weekly") setSortBy("streakDays");
    else setSortBy("rating");
  };

  const topThree = users.slice(0, 3);
  const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

  const currentUser = users.find((u) => u.isCurrentUser) || {
    rank: currentUserRank || 4,
    fullName: "Arjun Patel",
    username: "arjun_patel",
    institution: "NIT Trichy",
    rating: 1842,
    streakDays: 7,
    totalXP: 4820,
    isCurrentUser: true,
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Current User Card */}
      <div
        style={{
          borderRadius: "var(--radius-xl)",
          background: "linear-gradient(135deg,#1e3a8a 0%,#312e81 45%,#0e7490 100%)",
          padding: "22px 28px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 60% 60% at 80% 50%, rgba(6,182,212,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "var(--radius-lg)",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            AP
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <p style={{ color: "white", fontWeight: 700, fontSize: 18, margin: 0, letterSpacing: "-0.01em" }}>
              {currentUser.fullName}
            </p>
            <p style={{ color: "rgba(147,197,253,0.9)", fontSize: 12.5, margin: "2px 0 0" }}>
              {currentUser.institution || "Algora Academy"} · @{currentUser.username}
            </p>
          </div>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {[
              { label: "Global Rank", value: `#${currentUser.rank || 4}` },
              { label: "Rating", value: currentUser.rating.toLocaleString() },
              { label: "Total XP", value: `${(currentUser.totalXP / 1000).toFixed(1)}k` },
              { label: "Streak", value: `${currentUser.streakDays}d` },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ color: "white", fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>
                  {value}
                </div>
                <div style={{ color: "rgba(147,197,253,0.75)", fontSize: 11 }}>{label}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: "rgba(52,211,153,0.95)",
              fontSize: 12,
              fontWeight: 600,
              background: "rgba(16,185,129,0.15)",
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
            }}
          >
            <ArrowUpRight size={14} /> Top 5% Global
          </div>
        </div>
      </div>

      {/* Controls: Tabs, Filters, Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "space-between" }}>
        <div
          style={{
            display: "flex",
            gap: 3,
            padding: 4,
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          {[
            { id: "global", label: "Global Rating" },
            { id: "weekly", label: "Weekly Streaks" },
            { id: "xp", label: "XP Titans" },
            { id: "college", label: "Colleges" },
          ].map((t) => (
            <button
              key={t.id}
              id={`lead-tab-${t.id}`}
              onClick={() => handleTabChange(t.id as Tab)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: tab === t.id ? "var(--bg-raised)" : "transparent",
                color: tab === t.id ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: 12.5,
                fontWeight: tab === t.id ? 600 : 400,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: tab === t.id ? "var(--shadow-xs)" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              width: 280,
              padding: "7px 12px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <input
              id="leaderboard-search-input"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by student, college, or handle…"
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontSize: 13,
                color: "var(--text-primary)",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>
      </div>

      {/* Podium for Top 3 */}
      {!search && page === 1 && topThree.length >= 3 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {podiumOrder.map((u, idx) => {
            if (!u) return null;
            const isFirst = u.rank === 1;
            const isSecond = u.rank === 2;
            const bgGrad = isFirst
              ? "linear-gradient(135deg,#f59e0b,#d97706)"
              : isSecond
              ? "linear-gradient(135deg,#94a3b8,#64748b)"
              : "linear-gradient(135deg,#fb923c,#ea580c)";
            const medal = isFirst ? "🥇 Rank 1" : isSecond ? "🥈 Rank 2" : "🥉 Rank 3";

            return (
              <div
                key={u.userId}
                className="surface-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  padding: "22px 14px",
                  position: "relative",
                  border: isFirst ? "2px solid var(--amber)" : "1px solid var(--border)",
                  transform: isFirst ? "translateY(-4px)" : "none",
                  boxShadow: isFirst ? "var(--shadow-md)" : "none",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: bgGrad,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 800,
                    fontSize: 18,
                    boxShadow: "var(--shadow-sm)",
                    overflow: "hidden",
                  }}
                >
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    u.fullName.slice(0, 2)
                  )}
                </div>
                <div style={{ textAlign: "center" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isFirst ? "var(--amber)" : isSecond ? "var(--text-muted)" : "#ea580c",
                    }}
                  >
                    {medal}
                  </span>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "2px 0 2px" }}>
                    {u.fullName}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                    {u.institution || "Algora Academy"}
                  </p>
                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ color: "var(--blue)" }}>{u.rating.toLocaleString()} rating</span>
                    <span style={{ color: "var(--text-disabled)" }}>·</span>
                    <span style={{ color: "var(--amber)" }}>{(u.totalXP / 1000).toFixed(1)}k XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Table */}
      <div className="surface-card" style={{ overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 160px 90px 80px 80px 60px",
            padding: "11px 20px",
            background: "var(--bg-subtle)",
            borderBottom: "1px solid var(--border)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          <span>Rank</span>
          <span>Student</span>
          <span>Institution</span>
          <span style={{ textAlign: "right" }}>Rating</span>
          <span style={{ textAlign: "right" }}>Streak</span>
          <span style={{ textAlign: "right" }}>Total XP</span>
          <span style={{ textAlign: "right" }}>Tier</span>
        </div>

        <div className="divide-theme">
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
              Loading leaderboard rankings...
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
              No students found matching "{search}".
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u.userId}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 160px 90px 80px 80px 60px",
                  padding: "12px 20px",
                  alignItems: "center",
                  background: u.isCurrentUser ? "color-mix(in srgb, var(--blue) 8%, transparent)" : "transparent",
                  transition: "background 0.1s ease",
                }}
                onMouseEnter={(e) => {
                  if (!u.isCurrentUser) e.currentTarget.style.background = "var(--bg-subtle)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = u.isCurrentUser
                    ? "color-mix(in srgb, var(--blue) 8%, transparent)"
                    : "transparent";
                }}
              >
                <div>
                  {u.rank === 1 ? (
                    <span style={{ fontSize: 16 }}>🥇</span>
                  ) : u.rank === 2 ? (
                    <span style={{ fontSize: 16 }}>🥈</span>
                  ) : u.rank === 3 ? (
                    <span style={{ fontSize: 16 }}>🥉</span>
                  ) : (
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: u.isCurrentUser ? "var(--blue)" : "var(--text-muted)",
                      }}
                    >
                      #{u.rank}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <img
                    src={u.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`}
                    alt={u.fullName}
                    style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 13.5,
                          fontWeight: u.isCurrentUser ? 700 : 600,
                          color: u.isCurrentUser ? "var(--blue)" : "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {u.fullName}
                      </span>
                      {u.isCurrentUser && (
                        <span className="badge badge-blue" style={{ fontSize: 10, padding: "1px 6px" }}>
                          You
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>@{u.username}</p>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 12.5,
                    color: "var(--text-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {u.institution || "Algora Academy"}
                </span>

                <span
                  style={{
                    textAlign: "right",
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {u.rating.toLocaleString()}
                </span>

                <span
                  style={{
                    textAlign: "right",
                    fontSize: 12.5,
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 3,
                  }}
                >
                  <Flame size={12} style={{ color: "var(--red)" }} />
                  {u.streakDays}d
                </span>

                <span
                  style={{
                    textAlign: "right",
                    fontSize: 12.5,
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {(u.totalXP / 1000).toFixed(1)}k
                </span>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <span
                    className={`badge ${
                      u.rating >= 2200
                        ? "badge-red"
                        : u.rating >= 1900
                        ? "badge-amber"
                        : u.rating >= 1600
                        ? "badge-blue"
                        : "badge-green"
                    }`}
                    style={{ fontSize: 10, padding: "2px 6px" }}
                  >
                    {u.rating >= 2200 ? "Master" : u.rating >= 1900 ? "Expert" : u.rating >= 1600 ? "Adv" : "Int"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        <div
          style={{
            padding: "12px 20px",
            background: "var(--bg-subtle)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          <span>
            Showing page {page} of {totalPages} ({totalUsers.toLocaleString()} competitors)
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{ padding: "4px 8px" }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{ padding: "4px 8px" }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
