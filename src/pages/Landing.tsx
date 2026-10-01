/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Landing Page matching uploaded screenshots exactly
 */

import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight, Sparkles, Play, Star, UserCheck
} from "lucide-react";
import AlgoraLogo from "../components/AlgoraLogo";
import { useTheme, type Theme } from "../components/ThemeContext";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";

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
    <div style={{ background: "#ffffff", color: "#1e293b", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>
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
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #e2e8f0",
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
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            {(["light","dark","gradient"] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  padding: "3px 10px",
                  borderRadius: "6px",
                  border: "none",
                  background: theme === t ? "#ffffff" : "transparent",
                  color: theme === t ? "#2563eb" : "#64748b",
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
                style={{ color: "#d97706", fontSize: 13 }}
              >
                Guest Access
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => openAuth("login")}
                style={{ color: "#475569", fontSize: 13 }}
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

      {/* ── Hero Section (Screenshot 2) ── */}
      <section
        style={{
          padding: "80px clamp(20px,5vw,80px) 40px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          background: "#ffffff"
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Top Badge Pill */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "6px 14px", borderRadius: "9999px", background: "#e0e7ff", border: "1px solid #c7d2fe", color: "#4338ca", fontSize: "0.8rem", fontWeight: "600", marginBottom: "2rem" }}>
            <Sparkles size={12} style={{ color: "#2563eb" }} />
            <span>AI-Powered Personalized Coding Education Platform</span>
          </div>

          {/* Main Title Heading */}
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: "900", letterSpacing: "-0.04em", lineHeight: "1.1", color: "#0f172a", margin: "0 0 1.5rem" }}>
            Master coding with an <br />
            <span style={{ background: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>AI that knows you</span>
          </h1>

          {/* Description Paragraph */}
          <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "#475569", lineHeight: "1.6", maxWidth: "680px", margin: "0 auto 2.5rem" }}>
            ALGORA adapts to your exact skill level. Learn concepts, solve problems, build projects, and prepare for interviews with an AI mentor.
          </p>

          {/* Center Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "5rem" }}>
            <button
              onClick={handleStartLearning}
              style={{ padding: "0.875rem 2rem", borderRadius: "12px", background: "#2563eb", color: "#fff", border: "none", fontWeight: "700", fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)" }}
            >
              <span>Start learning free</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => {
                continueAsGuest();
                navigate("/workspace");
              }}
              style={{ padding: "0.875rem 2rem", borderRadius: "12px", background: "transparent", border: "1px solid #e2e8f0", color: "#b45309", fontWeight: "600", fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Play size={14} style={{ fill: "#b45309", stroke: "none" }} />
              <span>Try as Guest</span>
            </button>
          </div>

          {/* Four Stat Columns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", maxWidth: "800px", margin: "0 auto" }}>
            {[
              { value: "120K+", label: "Students" },
              { value: "850+", label: "Problems" },
              { value: "94%", label: "Placed" },
              { value: "200+", label: "Colleges" }
            ].map((s, idx) => (
              <div key={idx} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.03em" }}>{s.value}</div>
                <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive Playground Section (Screenshot 1) ── */}
      <section style={{ padding: "60px clamp(20px,5vw,80px)", background: "#ffffff", borderTop: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "3rem", alignItems: "center" }}>
          
          {/* Left Column: Code Editor Mock */}
          <div style={{ background: "#0f111a", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
            {/* Header bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", background: "#0b0c13", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }}></span>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }}></span>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }}></span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", marginLeft: "12px" }}>solution.py</span>
              </div>
              <span style={{ padding: "2px 8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", color: "rgba(255,255,255,0.5)", fontSize: "10px", fontFamily: "monospace" }}>Python</span>
            </div>

            {/* Code Body */}
            <div style={{ padding: "18px", fontFamily: "monospace", fontSize: "13px", lineHeight: "1.7", background: "#0a0b10", color: "#a9b1d6", overflowX: "auto" }}>
              {[
                { n: "1", text: "def expand_center(s, l, r):", indent: 0 },
                { n: "2", text: "while l >= 0 and r < len(s) and s[l] == s[r]:", indent: 4 },
                { n: "3", text: "l -= 1; r += 1", indent: 8 },
                { n: "4", text: "return s[l+1:r]", indent: 4 },
                { n: "5", text: "", indent: 0 },
                { n: "6", text: "def longest_palindrome(s):", indent: 0 },
                { n: "7", text: "res = \"\"", indent: 4 },
                { n: "8", text: "for i in range(len(s)):", indent: 4 },
                { n: "9", text: "# expand odd and even", indent: 8, isComment: true },
                { n: "10", text: "for p in (expand_center(s,i,i), expand_center(s,i,i+1)):", indent: 8 },
                { n: "11", text: "if len(p) > len(res): res = p", indent: 12 },
                { n: "12", text: "return res", indent: 8 }
              ].map((line, idx) => (
                <div key={idx} style={{ display: "flex", minWidth: "400px" }}>
                  <span style={{ width: "24px", color: "rgba(255,255,255,0.15)", userSelect: "none" }}>{line.n}</span>
                  <span style={{ paddingLeft: `${line.indent * 8}px`, color: line.isComment ? "#565f89" : "#a9b1d6" }}>
                    {line.text.split(" ").map((w, wIdx) => {
                      if (w === "def" || w === "while" || w === "and" || w === "return" || w === "for" || w === "in" || w === "if") {
                        return <span key={wIdx} style={{ color: "#bb9af7" }}>{w} </span>;
                      }
                      return w + " ";
                    })}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", background: "#0b0c13", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981", fontSize: "12px", fontWeight: "600" }}>
                <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px" }}>✓</span>
                <span>3/3 tests passed · 12ms · 14.2MB</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={{ padding: "6px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Run</button>
                <button style={{ padding: "6px 14px", borderRadius: "6px", background: "#2563eb", border: "none", color: "#fff", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Submit</button>
              </div>
            </div>
          </div>

          {/* Right Column: Skill Mastery Card (Crisp White Layout to match Screenshot 1) */}
          <div style={{ background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.03)", position: "relative", minHeight: "380px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>Skill Mastery</h3>
              <span style={{ padding: "4px 10px", background: "#eff6ff", borderRadius: "999px", color: "#2563eb", fontSize: "11px", fontWeight: "700" }}>Level 12</span>
            </div>

            {/* SVG Spider Radar Chart */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "260px" }}>
              <svg width="250" height="250" viewBox="0 0 220 220" style={{ overflow: "visible" }}>
                {/* Concentric grid rings */}
                <polygon points="110,20 188,65 188,155 110,200 32,155 32,65" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                <polygon points="110,50 162,80 162,140 110,170 58,140 58,80" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                <polygon points="110,80 136,95 136,125 110,140 84,125 84,95" fill="none" stroke="#e2e8f0" strokeWidth="1" />

                {/* Axes lines */}
                <line x1="110" y1="110" x2="110" y2="20" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
                <line x1="110" y1="110" x2="188" y2="65" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
                <line x1="110" y1="110" x2="188" y2="155" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
                <line x1="110" y1="110" x2="110" y2="200" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
                <line x1="110" y1="110" x2="32" y2="155" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
                <line x1="110" y1="110" x2="32" y2="65" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />

                {/* Filled Mastery polygon shape */}
                <polygon points="110,35 172,74 156,136 110,160 50,130 54,78" fill="rgba(99, 102, 241, 0.12)" stroke="#6366f1" strokeWidth="2" />

                {/* Axes Labels */}
                <text x="110" y="12" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600">Arrays</text>
                <text x="198" y="62" textAnchor="start" fill="#64748b" fontSize="10" fontWeight="600">Trees</text>
                <text x="198" y="160" textAnchor="start" fill="#64748b" fontSize="10" fontWeight="600">DP</text>
                <text x="110" y="215" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600">Graphs</text>
                <text x="22" y="160" textAnchor="end" fill="#64748b" fontSize="10" fontWeight="600">Strings</text>
                <text x="22" y="62" textAnchor="end" fill="#64748b" fontSize="10" fontWeight="600">Math</text>
              </svg>
            </div>
          </div>

        </div>
      </section>

      {/* ── Corporate Placement Row (Screenshot 1 Bottom) ── */}
      <section style={{ padding: "40px clamp(20px,5vw,80px)", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", textAlign: "center" }}>
        <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", letterSpacing: "0.15em", marginBottom: "1.5rem" }}>STUDENTS PLACED AT</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "clamp(1.5rem, 4vw, 3.5rem)", flexWrap: "wrap", opacity: 0.85, fontSize: "1.1rem", fontWeight: "700" }}>
          {["Google", "Microsoft", "Amazon", "Meta", "Adobe", "Flipkart", "Razorpay", "Atlassian"].map((co, idx) => (
            <span key={idx} style={{ color: "#475569", letterSpacing: "-0.02em" }}>{co}</span>
          ))}
        </div>
      </section>

      {/* ── Student Stories / Testimonials (Screenshot 3) ── */}
      <section style={{ padding: "80px clamp(20px,5vw,80px)", background: "#ffffff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span style={{ padding: "4px 12px", background: "#ecfdf5", borderRadius: "999px", color: "#059669", fontSize: "12px", fontWeight: "700" }}>Student stories</span>
            <h2 style={{ fontSize: "2.25rem", fontWeight: "900", letterSpacing: "-0.03em", color: "#0f172a", marginTop: "1rem" }}>Students who got placed</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {[
              {
                stars: 5,
                starColor: "#3b82f6",
                text: "Algora's AI Mentor caught exactly what I was missing in DP. I went from struggling on mediums to solving hards consistently in 3 weeks.",
                author: "Priya Patel",
                meta: "SWE @ Google · IIT Bombay · 2025",
                avatar: "PP"
              },
              {
                stars: 5,
                starColor: "#8b5cf6",
                text: "The skill radar showed me I was wasting time on easy graph problems when I should have been drilling trees. That single insight changed my prep.",
                author: "Rahul Kumar",
                meta: "SWE @ Microsoft · NIT Trichy · 2025",
                avatar: "RK"
              },
              {
                stars: 5,
                starColor: "#06b6d4",
                text: "Daily reviews kept me disciplined. I knew exactly what to study each morning. The AI recommendations felt eerily accurate about my weak spots.",
                author: "Sneha Reddy",
                meta: "SWE @ Amazon · BITS Pilani · 2025",
                avatar: "SR"
              },
              {
                stars: 5,
                starColor: "#10b981",
                text: "Contest mode simulated real interview pressure perfectly. My problem-solving speed doubled in two months and my confidence shot up.",
                author: "Vikram Nair",
                meta: "SWE @ Flipkart · VIT Vellore · 2025",
                avatar: "VN"
              }
            ].map((story, i) => (
              <div key={i} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "220px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                <div>
                  {/* Rating Stars */}
                  <div style={{ display: "flex", gap: "2px", marginBottom: "1rem" }}>
                    {Array.from({ length: story.stars }).map((_, sIdx) => (
                      <Star key={sIdx} size={14} fill={story.starColor} stroke="none" />
                    ))}
                  </div>
                  <p style={{ fontSize: "13.5px", color: "#475569", lineHeight: "1.6" }}>
                    "{story.text}"
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "1.5rem" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#475569" }}>
                    {story.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0f172a" }}>{story.author}</div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>{story.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Block Card (Screenshot 4) ── */}
      <section style={{ padding: "60px clamp(20px,5vw,80px) 80px", background: "#ffffff" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: "32px", padding: "60px 40px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)" }}>
          
          <div style={{ display: "inline-flex", padding: "10px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "#94a3b8", marginBottom: "1.5rem" }}>
            <Sparkles size={20} />
          </div>

          <h2 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#fff", letterSpacing: "-0.03em", margin: "0 0 1rem" }}>
            Start your journey today
          </h2>

          <p style={{ fontSize: "16px", color: "#94a3b8", maxWidth: "560px", margin: "0 auto 2.5rem", lineHeight: "1.6" }}>
            Join 120,000+ students learning smarter with AI-powered guidance. Free to start. No credit card required.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={handleStartLearning}
              style={{ padding: "0.875rem 2rem", borderRadius: "12px", background: "#fff", color: "#0f172a", border: "none", fontWeight: "700", fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span>Get started free</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => {
                continueAsGuest();
                navigate("/workspace");
              }}
              style={{ padding: "0.875rem 2rem", borderRadius: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontWeight: "600", fontSize: "0.95rem", cursor: "pointer" }}
            >
              View demo
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer Section (Screenshot 4 Bottom) ── */}
      <footer style={{ padding: "40px clamp(20px,5vw,80px)", borderTop: "1px solid #e2e8f0", background: "#ffffff", fontSize: "12px", color: "#64748b" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
          
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "800", color: "#0f172a" }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#fff", fontWeight: "bold" }}>⟁</div>
            <span>Algora</span>
          </div>

          {/* Copyright */}
          <div>
            © 2025 Algora Technologies. Built for learners, by engineers.
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: "16px" }}>
            <span style={{ cursor: "pointer" }}>Privacy</span>
            <span style={{ cursor: "pointer" }}>Terms</span>
            <span style={{ cursor: "pointer" }}>Contact</span>
            <span style={{ cursor: "pointer" }}>Status</span>
          </div>

        </div>
      </footer>

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
