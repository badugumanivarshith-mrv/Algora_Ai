/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Landing Page with Authentic Security & Auth Flows
 */

import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight, Brain, BarChart2, Code2, Trophy, Zap, Target,
  CheckCircle2, ChevronRight, Sparkles, TrendingUp, Users,
  BookOpen, CalendarCheck, Play, Shield, Globe, Lock, UserCheck,
} from "lucide-react";
import AlgoraLogo from "../components/AlgoraLogo";
import { useTheme, type Theme } from "../components/ThemeContext";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";

/* ─── Mini reusable components ─── */

function Chip({ children, color = "var(--blue)" }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
        color,
        border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* ─── Mock UI widgets ─── */

function MockChatBubble() {
  return (
    <div
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        boxShadow: "var(--shadow-xl)",
        maxWidth: 460,
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-surface)",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg,#2563eb,#06b6d4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Brain size={15} color="white" />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>AI Mentor</p>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div className="status-dot status-online" />
            <span style={{ fontSize: 11, color: "var(--green)" }}>Online</span>
          </div>
        </div>
      </div>
      <div style={{ padding: "14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            padding: "9px 13px",
            borderRadius: "14px 14px 14px 2px",
            background: "var(--bg-subtle)",
            color: "var(--text-secondary)",
            fontSize: 12.5,
            lineHeight: 1.5,
          }}
        >
          👋 Welcome to ALGORA! How can I help you master programming and algorithms today?
        </div>
      </div>
    </div>
  );
}

/* ─── Main Landing Page ─── */

export default function Landing() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, isGuest, continueAsGuest } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "guest">("login");

  const openAuth = (mode: "login" | "register" | "guest") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleStartLearning = () => {
    if (user || isGuest) {
      navigate("/dashboard");
    } else {
      openAuth("register");
    }
  };

  return (
    <div style={{ background: "var(--bg)", color: "var(--text-primary)", minHeight: "100vh" }}>
      {/* ── Top Navbar ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: 60,
          display: "flex",
          alignItems: "center",
          paddingInline: "clamp(20px,5vw,60px)",
          background: "var(--bg-overlay)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <AlgoraLogo size={30} />

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {/* Theme switcher */}
          <div
            className="hide-mobile"
            style={{
              display: "flex",
              alignItems: "center",
              padding: 3,
              gap: 1,
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
            }}
          >
            {(["light","dark","gradient"] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  padding: "3px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: theme === t ? "var(--bg-raised)" : "transparent",
                  color: theme === t ? "var(--blue)" : "var(--text-muted)",
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textTransform: "capitalize",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {user || isGuest ? (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate("/dashboard")}
              style={{ gap: 6 }}
            >
              <UserCheck size={14} />
              <span>Go to Dashboard</span>
            </button>
          ) : (
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => openAuth("guest")}
                style={{ color: "var(--amber)", fontSize: 13 }}
              >
                Guest Access
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => openAuth("login")}
                style={{ color: "var(--text-secondary)", fontSize: 13 }}
              >
                Sign in
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => openAuth("register")}
                style={{ gap: 5 }}
              >
                Get started <ArrowRight size={13} />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="hero-mesh"
        style={{
          padding: "80px clamp(20px,5vw,80px) 96px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", maxWidth: 780, margin: "0 auto" }}>
          <Chip color="var(--blue)">
            <Sparkles size={10} /> AI-Powered Personalized Coding Education Platform
          </Chip>

          <h1
            className="text-display"
            style={{
              margin: "22px 0 20px",
              color: "var(--text-primary)",
            }}
          >
            Master coding with an
            <br />
            <span className="gradient-text">AI that knows you</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(15px,2vw,18px)",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              maxWidth: 560,
              margin: "0 auto 36px",
            }}
          >
            ALGORA adapts to your exact skill level. Learn concepts, solve problems, build projects, and prepare for interviews with an AI mentor.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleStartLearning}
              style={{ gap: 7 }}
            >
              Start learning free <ArrowRight size={15} />
            </button>

            <button
              className="btn btn-secondary btn-lg"
              onClick={() => {
                continueAsGuest();
                navigate("/workspace");
              }}
              style={{ gap: 7, borderColor: "var(--amber)", color: "var(--amber)" }}
            >
              <Play size={14} /> Try as Guest
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 24,
              marginTop: 64,
              maxWidth: 520,
              marginInline: "auto",
            }}
          >
            {[
              { value: "120K+", label: "Students" },
              { value: "850+",  label: "Problems" },
              { value: "94%",   label: "Placed" },
              { value: "200+",  label: "Colleges" },
            ].map((s) => <StatPill key={s.label} {...s} />)}
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={() => navigate("/dashboard")}
      />
    </div>
  );
}
