/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Contest Engine — Live Timed Competitions, Rating System & AI Post-Contest Review
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Trophy, Clock, Users, Zap, Play, Calendar, ChevronRight, TrendingUp,
  ArrowUpRight, AlertCircle, CheckCircle2, XCircle, Brain, Target, Shield,
  Award, RefreshCw, Sparkles, BarChart2
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import {
  CONTEST_RATING_HISTORY, CONTEST_SESSIONS, CONTEST_HISTORY,
  getRatingTier, ContestSession
} from "../data/contestData";
import { useAuth } from "../context/AuthContext";

type ContestTab = "live" | "upcoming" | "virtual" | "history" | "analytics" | "review";

export default function Contest() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  const [activeTab, setActiveTab] = useState<ContestTab>("live");
  const [userRating, setUserRating] = useState<number>(1605);
  const ratingTier = getRatingTier(userRating);

  // Live Contest Timer Simulation (45 minutes, 32 seconds)
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(2732);

  // AI Post-Contest Review State
  const [reviewInput, setReviewInput] = useState<string>("");
  const [reviewLog, setMentorLog] = useState<Array<{ role: "ai" | "user"; text: string }>>([
    {
      role: "ai",
      text: "Great job completing Algora Weekly 147! You solved 3/4 problems in 28 minutes with a +45 rating gain. Your speed on Arrays was 4m (Top 5%), but DP problem #4 timed out. How can I help you analyze your contest strategy?"
    }
  ]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemainingSeconds((sec) => (sec > 0 ? sec - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Send AI Review query
  const sendReviewMessage = async () => {
    if (!reviewInput.trim() || isAiThinking) return;
    const userText = reviewInput.trim();
    setReviewInput("");
    setMentorLog((l) => [...l, { role: "user", text: userText }]);
    setIsAiThinking(true);

    try {
      const storedToken = localStorage.getItem("accessToken");
      const res = await fetch("/api/ai/mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {})
        },
        body: JSON.stringify({
          message: `Contest Review Analysis: "${userText}"`,
          problemContext: { contest: "Algora Weekly 147", solved: "3/4", ratingDelta: "+45" },
          mode: "contest_review"
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.reply) {
          setMentorLog((l) => [...l, { role: "ai", text: json.reply }]);
          setIsAiThinking(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    setTimeout(() => {
      setMentorLog((l) => [
        ...l,
        {
          role: "ai",
          text: "To improve your speed on Hard contest problems: 1) Spend 3 minutes reading ALL problems first before coding. 2) Solve Easy/Medium problems in under 15 mins to save a 45-minute block for the Hard DP problem!"
        }
      ]);
      setIsAiThinking(false);
    }, 600);
  };

  const liveSession = CONTEST_SESSIONS[0];

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto", height: "100%", overflowY: "auto", background: "var(--bg)" }}>
      {/* ── TOP STATS & RATING TIER BANNER ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {/* Rating Card */}
        <div className="surface-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Contest Rating
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: ratingTier.color, background: "var(--bg-subtle)", padding: "2px 8px", borderRadius: 4 }}>
              {ratingTier.badge}
            </span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            {userRating} <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 700 }}>+45</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>
            Tier: {ratingTier.tier} (Target: 1800 Expert)
          </div>
        </div>

        {/* Global Rank Card */}
        <div className="surface-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
            Global Rank
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            #234 <span style={{ fontSize: 12, color: "var(--text-muted)" }}>/ 3,180</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--green)", marginTop: 4, fontWeight: 600 }}>
            Top 7.3% Percentile
          </div>
        </div>

        {/* Total Contests Attended */}
        <div className="surface-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
            Contests Attended
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            28 Contests
          </div>
          <div style={{ fontSize: 11.5, color: "var(--blue)", marginTop: 4, fontWeight: 600 }}>
            82.4% Contest Win Rate
          </div>
        </div>

        {/* Time Penalty Clock */}
        <div className="surface-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
            Contest Penalty Clock
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--amber)", letterSpacing: "-0.03em" }}>
            +10 Mins
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>
            1 Wrong Submission Penalty
          </div>
        </div>
      </div>

      {/* ── CONTEST ENGINE TAB NAVIGATION ── */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 24, background: "var(--bg-surface)", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0", padding: "0 8px" }}>
        {[
          { key: "live", label: "Live Active Contest", icon: Play },
          { key: "upcoming", label: "Upcoming Contests", icon: Calendar },
          { key: "virtual", label: "Virtual & Practice Replays", icon: Clock },
          { key: "history", label: "Contest History & Rating Curve", icon: Trophy },
          { key: "analytics", label: "Speed & Accuracy Analytics", icon: BarChart2 },
          { key: "review", label: "AI Post-Contest Review", icon: Brain }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as ContestTab)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "12px 16px",
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: "inherit",
              border: "none",
              background: "none",
              color: activeTab === key ? "var(--blue)" : "var(--text-muted)",
              borderBottom: `2px solid ${activeTab === key ? "var(--blue)" : "transparent"}`,
              cursor: "pointer",
              marginBottom: -1
            }}
          >
            <Icon size={14} />
            {label}
            {key === "live" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)" }} />}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: 24, minHeight: 450 }}>
        {/* LIVE CONTEST TAB */}
        {activeTab === "live" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span className="badge badge-red" style={{ fontSize: 11, fontWeight: 700 }}>● LIVE COMPETITION</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{liveSession.registeredCount} Registered Contestants</span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  {liveSession.title}
                </h2>
              </div>

              {/* Countdown Display */}
              <div style={{ textAlign: "right", padding: "8px 16px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--red)", textTransform: "uppercase" }}>Time Remaining</div>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "var(--red)" }}>
                  {formatTimer(timeRemainingSeconds)}
                </div>
              </div>
            </div>

            {/* Live Problems Table */}
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>Contest Problem Set</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {liveSession.problems.map((prob, idx) => (
                <div
                  key={prob.id}
                  onClick={() => navigate(`/workspace?problem=${prob.slug}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    borderRadius: "var(--radius-md)",
                    background: prob.solved ? "rgba(34, 197, 94, 0.08)" : "var(--bg-subtle)",
                    border: `1px solid ${prob.solved ? "rgba(34, 197, 94, 0.3)" : "var(--border)"}`,
                    cursor: "pointer"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: prob.solved ? "var(--green)" : "var(--bg-muted)", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {prob.solved ? "✓" : idx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>
                        {prob.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                        {prob.points} Points · {prob.attempts > 0 ? `${prob.attempts} Submissions` : "Unattempted"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className={`badge ${prob.difficulty === "Easy" ? "diff-easy" : prob.difficulty === "Medium" ? "diff-medium" : "diff-hard"}`}>
                      {prob.difficulty}
                    </span>
                    <button style={{ padding: "6px 14px", borderRadius: "var(--radius-sm)", background: "var(--blue)", color: "#fff", border: "none", fontWeight: 700, fontSize: 11.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      Solve <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UPCOMING CONTESTS TAB */}
        {activeTab === "upcoming" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Upcoming Official Contests</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CONTEST_SESSIONS.filter((s) => s.type === "Upcoming").map((cnt) => (
                <div key={cnt.id} style={{ padding: 18, border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span className="badge badge-blue" style={{ fontSize: 10 }}>Rated Official</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{cnt.registeredCount} Registered</span>
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                      {cnt.title}
                    </h4>
                  </div>
                  <button style={{ padding: "8px 18px", borderRadius: "var(--radius-md)", background: "var(--blue)", color: "#fff", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                    Register for Contest
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIRTUAL REPLAYS TAB */}
        {activeTab === "virtual" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Virtual Contests & Self-Paced Replays</h3>
            <div style={{ padding: 20, border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", background: "var(--bg-subtle)" }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>
                Algora Virtual Contest 146
              </h4>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "0 0 16px" }}>
                Replay past official contests with an isolated 90-minute timer and realistic ranking simulation.
              </p>
              <button onClick={() => navigate("/workspace?problem=3sum")} style={{ padding: "8px 18px", borderRadius: "var(--radius-md)", background: "var(--blue)", color: "#fff", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Play size={14} /> Start Virtual Replay Session
              </button>
            </div>
          </div>
        )}

        {/* CONTEST HISTORY & RATING CURVE TAB */}
        {activeTab === "history" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Contest Rating Trajectory & History</h3>
            
            {/* Rating Area Chart */}
            <div style={{ height: 220, marginBottom: 24 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CONTEST_RATING_HISTORY}>
                  <defs>
                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--blue)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis domain={[1100, 1800]} stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="rating" stroke="var(--blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorRating)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* History Table */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CONTEST_HISTORY.map((h) => (
                <div key={h.id} style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>{h.contestTitle}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{h.date} · Rank #{h.rank} of {h.totalParticipants}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: h.ratingDelta >= 0 ? "var(--green)" : "var(--red)" }}>
                      {h.ratingDelta >= 0 ? `+${h.ratingDelta}` : h.ratingDelta}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>New Rating: {h.newRating}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Contest Performance Analytics</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ padding: 18, border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", background: "var(--bg-subtle)" }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>Strong Contest Topics</h4>
                <div style={{ fontSize: 12.5, color: "var(--green)", fontWeight: 600 }}>✓ Arrays & Hashing (92% Pass Rate)</div>
                <div style={{ fontSize: 12.5, color: "var(--green)", fontWeight: 600 }}>✓ Two Pointers (88% Pass Rate)</div>
              </div>
              <div style={{ padding: 18, border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", background: "var(--bg-subtle)" }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>Weak Contest Topics</h4>
                <div style={{ fontSize: 12.5, color: "var(--red)", fontWeight: 600 }}>⚠ Dynamic Programming (Timed Out on 2 Contests)</div>
                <div style={{ fontSize: 12.5, color: "var(--amber)", fontWeight: 600 }}>⚠ Backtracking (1 Wrong Submission Penalty)</div>
              </div>
            </div>
          </div>
        )}

        {/* AI POST-CONTEST REVIEW TAB */}
        {activeTab === "review" && (
          <div style={{ maxWidth: 800, height: 450, display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>Socratic AI Post-Contest Review</h3>
            
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 4 }}>
              {reviewLog.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    maxWidth: "88%",
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    padding: "10px 14px",
                    borderRadius: m.role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                    background: m.role === "user" ? "var(--blue)" : "var(--bg-subtle)",
                    color: m.role === "user" ? "#fff" : "var(--text-secondary)",
                    fontSize: 12.5,
                    lineHeight: 1.55,
                    border: m.role === "user" ? "none" : "1px solid var(--border)"
                  }}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <input
                type="text"
                value={reviewInput}
                onChange={(e) => setReviewInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendReviewMessage(); }}
                placeholder="Ask about your contest time management or problem strategy..."
                style={{ flex: 1, background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "8px 12px", fontSize: 12.5, color: "var(--text-primary)", outline: "none" }}
              />
              <button onClick={sendReviewMessage} style={{ padding: "8px 16px", borderRadius: "var(--radius-md)", background: "var(--blue)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
