import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Trophy, Clock, Users, Zap, Play, Calendar, ChevronRight, TrendingUp, CheckCircle2,
  Medal, AlertCircle, Info, Sparkles, Award, Shield, UserPlus, Plus, Copy
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { Contest as ContestType, ContestLeaderboardEntry, RatingHistoryPoint } from "../types";
import { GamificationApi, GamificationProfileResponse } from "../services/gamificationApi";
import { CommunityService, ContestTeamItem } from "../services/communityService";
import { RealtimeClient } from "../services/realtimeClient";

type Tab = "upcoming" | "live" | "history" | "leaderboard" | "teams" | "analytics";

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
  const [contests, setContests] = useState<ContestType[]>([]);
  const [activeContest, setActiveContest] = useState<ContestType | null>(null);
  const [liveLeaderboard, setLiveLeaderboard] = useState<ContestLeaderboardEntry[]>([]);
  const [profileData, setProfileData] = useState<GamificationProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Team Contests state
  const [teams, setTeams] = useState<ContestTeamItem[]>([]);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [joinTeamCode, setJoinTeamCode] = useState("");
  const [teamSuccessMsg, setTeamSuccessMsg] = useState("");

  const loadTeams = async (contestId: string) => {
    try {
      const res = await CommunityService.listContestTeams(contestId);
      setTeams(res.teams);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (tab === "teams" && activeContest) {
      loadTeams(activeContest.id);
      RealtimeClient.subscribeRoom(`contest:${activeContest.id}`);

      const unsub1 = RealtimeClient.on("TEAM_REGISTERED", (team: ContestTeamItem) => {
        setTeams((prev) => [team, ...prev]);
      });
      const unsub2 = RealtimeClient.on("TEAM_MEMBER_JOINED", () => {
        loadTeams(activeContest.id);
      });

      return () => {
        unsub1();
        unsub2();
        RealtimeClient.unsubscribeRoom(`contest:${activeContest.id}`);
      };
    }
  }, [tab, activeContest]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContest || !newTeamName.trim()) return;

    const res = await CommunityService.createContestTeam(activeContest.id, newTeamName);
    setShowCreateTeamModal(false);
    setNewTeamName("");
    setTeamSuccessMsg(`Team "${res.team.teamName}" created! Code: ${res.team.teamCode}`);
    setTimeout(() => setTeamSuccessMsg(""), 5000);
    loadTeams(activeContest.id);
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContest || !joinTeamCode.trim()) return;

    try {
      const res = await CommunityService.joinContestTeam(activeContest.id, joinTeamCode.trim().toUpperCase());
      setJoinTeamCode("");
      setTeamSuccessMsg(`Successfully joined team "${res.team.teamName}"!`);
      setTimeout(() => setTeamSuccessMsg(""), 5000);
      loadTeams(activeContest.id);
    } catch (err: any) {
      alert(err.message || "Failed to join team");
    }
  };

  useEffect(() => {
    async function loadContestData() {
      setLoading(true);
      try {
        const [contestList, gamProfile] = await Promise.all([
          GamificationApi.getContests(),
          GamificationApi.getGamificationProfile(),
        ]);
        setContests(contestList);
        setProfileData(gamProfile);

        // Find active contest or default to live/upcoming
        const active = contestList.find((c) => c.status === "active") || contestList[0];
        if (active) {
          const details = await GamificationApi.getContestDetails(active.id);
          setActiveContest(details || active);
          if (details?.leaderboard) {
            setLiveLeaderboard(details.leaderboard);
          }
        }
      } catch (err) {
        console.error("Failed to load contest data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadContestData();
  }, []);

  const handleRegister = async (contestId: string) => {
    setRegisteringId(contestId);
    const success = await GamificationApi.registerContest(contestId);
    if (success) {
      setContests((prev) =>
        prev.map((c) => (c.id === contestId ? { ...c, registered: true, participantCount: c.participantCount + 1 } : c))
      );
      if (activeContest?.id === contestId) {
        setActiveContest((prev) => prev ? { ...prev, registered: true } : null);
      }
      setShowNotification("Successfully registered! +50 XP bonus awarded.");
      setTimeout(() => setShowNotification(null), 4000);
    }
    setRegisteringId(null);
  };

  const activeContestItem = contests.find((c) => c.status === "active") || activeContest;
  const upcomingContests = contests.filter((c) => c.status === "upcoming");
  const completedContests = contests.filter((c) => c.status === "completed");

  const ratingPoints = (profileData?.recentRatingHistory && profileData.recentRatingHistory.length > 0)
    ? [...profileData.recentRatingHistory].reverse().map((r, i) => ({
        d: new Date(r.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        r: r.newRating,
      }))
    : [
        { d: "Week 1", r: 1650 },
        { d: "Week 2", r: 1722 },
        { d: "Week 3", r: 1772 },
        { d: "Week 4", r: 1754 },
        { d: "Current", r: profileData?.rating || 1842 },
      ];

  const rankTrend = [
    { c: "W145", r: 178 },
    { c: "W146", r: 412 },
    { c: "GMC", r: 12 },
    { c: "W147", r: 4 },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toast Notification */}
      {showNotification && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            background: "var(--bg-raised)",
            border: "1px solid var(--green)",
            boxShadow: "var(--shadow-lg)",
            borderRadius: "var(--radius-md)",
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: "var(--text-primary)",
          }}
        >
          <Sparkles size={16} style={{ color: "var(--green)" }} />
          <span>{showNotification}</span>
        </div>
      )}

      {/* Header Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          {
            label: "Global Rating",
            value: profileData?.rating ? profileData.rating.toLocaleString() : "1,842",
            sub: `${profileData?.ratingTier || "Expert"} Tier`,
            icon: Zap,
            color: "var(--amber)",
          },
          {
            label: "Peak Rating",
            value: profileData?.highestRating ? profileData.highestRating.toLocaleString() : "1,842",
            sub: "Top 4.2% percentile",
            icon: Trophy,
            color: "var(--violet)",
          },
          {
            label: "Total XP",
            value: profileData?.totalXP ? profileData.totalXP.toLocaleString() : "4,820",
            sub: `Level ${profileData?.level || 6} Master`,
            icon: Award,
            color: "var(--blue)",
          },
          {
            label: "Active Streak",
            value: `${profileData?.streakDays || 7} Days`,
            sub: "Keep the flame burning",
            icon: TrendingUp,
            color: "var(--green)",
          },
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
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              {value}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", margin: "3px 0 0" }}>{label}</div>
            <div style={{ fontSize: 11, color: "var(--green)", marginTop: 4, fontWeight: 600 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: 3,
          padding: 4,
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          width: "fit-content",
        }}
      >
        {(["upcoming", "live", "history", "leaderboard", "teams", "analytics"] as Tab[]).map((t) => (
          <button
            key={t}
            id={`tab-btn-${t}`}
            onClick={() => setTab(t)}
            style={{
              padding: "7px 16px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: tab === t ? "var(--bg-raised)" : "transparent",
              color: tab === t ? "var(--text-primary)" : "var(--text-muted)",
              fontSize: 13,
              fontWeight: tab === t ? 600 : 400,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: tab === t ? "var(--shadow-xs)" : "none",
              display: "flex",
              alignItems: "center",
              gap: 6,
              textTransform: "capitalize",
            }}
          >
            {t === "live" && <span className="status-dot status-live" />}
            {t === "leaderboard" ? "Live Standings" : t === "teams" ? "Team Contests" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Upcoming Contests */}
      {tab === "upcoming" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {upcomingContests.length === 0 ? (
            <div className="surface-card" style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
              No upcoming contests scheduled at this moment.
            </div>
          ) : (
            upcomingContests.map((c) => (
              <div
                key={c.id}
                className="surface-card"
                style={{ padding: 22, display: "flex", alignItems: "center", gap: 20 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                      {c.title}
                    </h3>
                    <span
                      className={`badge ${
                        c.contestType === "Weekly Contest"
                          ? "badge-blue"
                          : c.contestType === "Company Assessment"
                          ? "badge-violet"
                          : "badge-green"
                      }`}
                    >
                      {c.contestType}
                    </span>
                    <span className="badge badge-amber">{c.difficulty}</span>
                    {c.registered && (
                      <span className="badge badge-green" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={12} /> Registered
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "0 0 10px", lineHeight: 1.5 }}>
                    {c.description}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: "var(--text-muted)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Calendar size={13} style={{ color: "var(--blue)" }} />
                      {new Date(c.startTime).toLocaleDateString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Clock size={13} style={{ color: "var(--amber)" }} />
                      {c.durationMinutes} minutes
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Users size={13} style={{ color: "var(--violet)" }} />
                      {c.participantCount.toLocaleString()} registered
                    </span>
                  </div>
                </div>
                {c.registered ? (
                  <button
                    id={`enter-contest-${c.id}`}
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setTab("live");
                    }}
                    style={{ gap: 5, flexShrink: 0 }}
                  >
                    <Play size={12} /> Enter Arena
                  </button>
                ) : (
                  <button
                    id={`register-contest-${c.id}`}
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleRegister(c.id)}
                    disabled={registeringId === c.id}
                    style={{ flexShrink: 0 }}
                  >
                    {registeringId === c.id ? "Registering..." : "Register Now"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Live Contest Arena */}
      {tab === "live" && activeContestItem && (
        <div
          className="surface-card"
          style={{ padding: 24, border: "2px solid color-mix(in srgb, var(--red) 30%, transparent)" }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                <div className="status-dot status-live" />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--red)" }}>
                  Live Active Contest
                </span>
                <span className="badge badge-blue">{activeContestItem.contestType}</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                {activeContestItem.title}
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
                {activeContestItem.description}
              </p>
            </div>
            <div style={{ textAlign: "right", background: "var(--bg-subtle)", padding: "10px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: "var(--red)", letterSpacing: "-0.02em" }}>
                44:18
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>time remaining</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Your Current Rank", value: "#4", sub: "of 3,180 active" },
              { label: "Solved Problems", value: "3 of 4", sub: "500 / 800 pts" },
              { label: "Penalty Time", value: "35m 40s", sub: "Cumulative runtime" },
            ].map(({ label, value, sub }) => (
              <div
                key={label}
                style={{
                  textAlign: "center",
                  padding: "14px 10px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  {value}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</div>
                <div style={{ fontSize: 10.5, color: "var(--text-disabled)" }}>{sub}</div>
              </div>
            ))}
          </div>

          <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px" }}>
            Contest Problem Set
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(activeContestItem.problems || [
              { id: "1", title: "Two City Scheduling", diff: "Easy", solved: true, scorePoints: 100 },
              { id: "2", title: "Minimum Cost to Connect Points", diff: "Medium", solved: true, scorePoints: 200 },
              { id: "3", title: "Kth Largest Element", diff: "Medium", solved: true, scorePoints: 200 },
              { id: "4", title: "Jump Game VII", diff: "Hard", solved: false, scorePoints: 300 },
            ]).map((p: any, idx: number) => (
              <div
                key={p.id || idx}
                id={`contest-prob-${idx}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 18px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onClick={() => navigate("/workspace")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-subtle)";
                  e.currentTarget.style.borderColor = "var(--border-strong)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-surface)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: `2px solid ${p.solved ? "var(--green)" : "var(--border-strong)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: p.solved ? "color-mix(in srgb, var(--green) 15%, transparent)" : "transparent",
                  }}
                >
                  {p.solved && <CheckCircle2 size={14} style={{ color: "var(--green)" }} />}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-disabled)" }}>P{idx + 1}.</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: p.solved ? "var(--text-muted)" : "var(--text-primary)" }}>
                    {p.problemTitle || p.title}
                  </span>
                </div>
                <span
                  className={`badge ${
                    (p.difficulty || p.diff) === "Easy"
                      ? "diff-easy"
                      : (p.difficulty || p.diff) === "Medium"
                      ? "diff-medium"
                      : "diff-hard"
                  }`}
                >
                  {p.difficulty || p.diff || "Medium"}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono',monospace",
                    fontWeight: 700,
                    color: "var(--amber)",
                    minWidth: 50,
                    textAlign: "right",
                  }}
                >
                  +{p.scorePoints || p.pts || 200} pts
                </span>
                <button className="btn btn-secondary btn-sm" style={{ padding: "4px 10px", fontSize: 12 }}>
                  Solve <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standings / Leaderboard */}
      {tab === "leaderboard" && (
        <div className="surface-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Algora Weekly Contest 147 — Live Standings
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "3px 0 0" }}>
                Real-time scores with penalty duration calculation
              </p>
            </div>
            <span className="badge badge-green">3,180 Active Competitors</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: "10px 14px", width: 60 }}>Rank</th>
                  <th style={{ padding: "10px 14px" }}>Competitor</th>
                  <th style={{ padding: "10px 14px" }}>Institution</th>
                  <th style={{ padding: "10px 14px", textAlign: "center" }}>Solved</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>Score</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>Penalty</th>
                </tr>
              </thead>
              <tbody>
                {liveLeaderboard.length > 0 ? (
                  liveLeaderboard.map((entry) => (
                    <tr
                      key={entry.userId}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        background: entry.isCurrentUser ? "color-mix(in srgb, var(--blue) 8%, transparent)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "12px 14px", fontWeight: 700 }}>
                        {entry.rank === 1 ? (
                          <span style={{ color: "var(--amber)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Medal size={16} /> 1
                          </span>
                        ) : entry.rank === 2 ? (
                          <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Medal size={16} /> 2
                          </span>
                        ) : entry.rank === 3 ? (
                          <span style={{ color: "#cd7f32", display: "flex", alignItems: "center", gap: 4 }}>
                            <Medal size={16} /> 3
                          </span>
                        ) : (
                          `#${entry.rank}`
                        )}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <img
                            src={entry.avatarUrl}
                            alt={entry.fullName}
                            style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
                          />
                          <div>
                            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{entry.fullName}</span>
                            {entry.isCurrentUser && (
                              <span className="badge badge-blue" style={{ marginLeft: 6, fontSize: 10 }}>
                                You
                              </span>
                            )}
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>@{entry.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-muted)" }}>
                        {entry.institution || "Algora Academy"}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 600 }}>
                        {entry.problemsSolved} / {entry.totalProblems}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          textAlign: "right",
                          fontWeight: 800,
                          fontFamily: "'JetBrains Mono',monospace",
                          color: "var(--green)",
                        }}
                      >
                        {entry.score}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          textAlign: "right",
                          fontFamily: "'JetBrains Mono',monospace",
                          color: "var(--text-muted)",
                        }}
                      >
                        {Math.floor(entry.penaltySeconds / 60)}m {entry.penaltySeconds % 60}s
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                      Loading live standings...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div className="surface-card" style={{ overflow: "hidden" }}>
          <div className="divide-theme">
            {[
              { name: "Algora Grand Monthly Championship", date: "Sep 3, 2026", rank: 12, total: 5200, rating: "+88", solved: "5/6" },
              { name: "Algora Weekly Contest 146", date: "Aug 27, 2026", rank: 412, total: 3320, rating: "-18", solved: "2/4" },
              { name: "Algora Weekly Contest 145", date: "Aug 20, 2026", rank: 178, total: 3100, rating: "+50", solved: "3/4" },
              { name: "FAANG Sprint #11", date: "Aug 13, 2026", rank: 89, total: 1240, rating: "+72", solved: "4/5" },
            ].map(({ name, date, rank, total, rating, solved }) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Trophy size={16} style={{ color: "var(--blue)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>
                    {name}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{date}</p>
                </div>
                <div style={{ textAlign: "center", minWidth: 70 }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>#{rank}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>of {total.toLocaleString()}</p>
                </div>
                <div style={{ textAlign: "center", minWidth: 50 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", margin: 0 }}>{solved}</p>
                  <p style={{ fontSize: 10, color: "var(--text-disabled)", margin: 0 }}>solved</p>
                </div>
                <span
                  className={`badge ${rating.startsWith("+") ? "badge-green" : "badge-red"}`}
                  style={{ minWidth: 52, justifyContent: "center", fontWeight: 700 }}
                >
                  {rating}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Contests Tab */}
      {tab === "teams" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {teamSuccessMsg && (
            <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", background: "color-mix(in srgb, var(--green) 15%, transparent)", border: "1px solid var(--green)", color: "var(--green)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={16} /> {teamSuccessMsg}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Collegiate & Group Team Contests
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
                Form teams of up to 3 coders, collaborate in real-time, and compete on the global team scoreboard
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowCreateTeamModal(true)}
                style={{ padding: "8px 16px", borderRadius: "var(--radius-md)", background: "var(--brand)", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
              >
                <Plus size={14} /> Create Team
              </button>
            </div>
          </div>

          {/* Join Team by Code Form */}
          <div className="surface-card" style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Shield size={18} style={{ color: "var(--brand)" }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Have a Team Invite Code?</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Enter your team's 6-character access token to join the squad</div>
              </div>
            </div>

            <form onSubmit={handleJoinTeam} style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                maxLength={8}
                placeholder="e.g. TM9482"
                value={joinTeamCode}
                onChange={(e) => setJoinTeamCode(e.target.value.toUpperCase())}
                style={{ padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-canvas)", color: "var(--text-primary)", fontSize: 12, fontFamily: "var(--font-mono, monospace)", width: 140 }}
              />
              <button
                type="submit"
                style={{ padding: "6px 14px", borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                Join Team
              </button>
            </form>
          </div>

          {/* Teams Scoreboard Table */}
          <div className="surface-card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                Team Standings & Rosters ({teams.length} Registered Teams)
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase" }}>
                  <th style={{ padding: "10px 16px", textAlign: "left", width: 60 }}>Rank</th>
                  <th style={{ padding: "10px 16px", textAlign: "left" }}>Team Name & Code</th>
                  <th style={{ padding: "10px 16px", textAlign: "left" }}>Members</th>
                  <th style={{ padding: "10px 16px", textAlign: "center", width: 100 }}>Problems Solved</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", width: 120 }}>Penalty Time</th>
                </tr>
              </thead>
              <tbody>
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                      No teams registered for this contest yet. Create the first team above!
                    </td>
                  </tr>
                ) : (
                  teams.map((t, idx) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: idx < 3 ? "var(--amber)" : "var(--text-muted)" }}>
                        #{idx + 1}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{t.teamName}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)" }}>
                          Invite Code: <strong style={{ color: "var(--brand)" }}>{t.teamCode}</strong>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {t.members.map((m) => (
                            <span
                              key={m.userId}
                              style={{
                                padding: "2px 8px",
                                borderRadius: "var(--radius-sm)",
                                background: m.role === "captain" ? "color-mix(in srgb, var(--brand) 15%, transparent)" : "var(--bg-subtle)",
                                color: m.role === "captain" ? "var(--brand)" : "var(--text-secondary)",
                                fontSize: 11,
                                fontWeight: m.role === "captain" ? 700 : 500,
                                border: "1px solid var(--border)"
                              }}
                            >
                              {m.role === "captain" ? "👑 " : ""}{m.username}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "var(--green)" }}>
                        {t.solvedCount}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "var(--font-mono, monospace)", color: "var(--text-muted)" }}>
                        {Math.floor(t.penaltySeconds / 60)}m {t.penaltySeconds % 60}s
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Create Team Modal */}
          {showCreateTeamModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", maxWidth: 440, width: "100%", padding: 24, boxShadow: "var(--shadow-lg)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>
                  Create Contest Team
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>
                  Set your squad name. You'll receive a unique invite code to share with teammates.
                </p>

                <form onSubmit={handleCreateTeam} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                      Team Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Algorithmic Titans"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-canvas)", color: "var(--text-primary)", fontSize: 13 }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => setShowCreateTeamModal(false)}
                      style={{ padding: "8px 14px", borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: "8px 16px", borderRadius: "var(--radius-md)", background: "var(--brand)", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    >
                      Register Team
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics */}
      {tab === "analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="surface-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>
              Rating Trajectory
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>
              Current Rating: {profileData?.rating || 1842} · Peak: {profileData?.highestRating || 1842}
            </p>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={ratingPoints} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="rg2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--violet)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[1500, 2000]} />
                <Tooltip content={<Tip />} />
                <Area
                  type="monotone"
                  dataKey="r"
                  name="Rating"
                  stroke="var(--violet)"
                  strokeWidth={2.5}
                  fill="url(#rg2)"
                  dot={{ r: 4, fill: "var(--violet)" }}
                  activeDot={{ r: 6, fill: "var(--violet)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="surface-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>
              Finishing Rank Evolution
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>
              Lower rank = superior performance
            </p>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={rankTrend} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <XAxis dataKey="c" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} reversed domain={[1, 500]} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="r" name="Rank" fill="var(--blue)" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
