import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight, Brain, BarChart2, Code2, Trophy, Zap, Target, Flame,
  CheckCircle2, Star, ChevronRight, Sparkles, TrendingUp, Users,
  BookOpen, CalendarCheck, Play, Shield, Globe,
} from "lucide-react";
import AlgoraLogo from "../components/AlgoraLogo";
import { useTheme, type Theme } from "../components/ThemeContext";

/* ─── Mini reusable components ─── */

function Chip({ children, color = "var(--blue)" }: { children: ReactNode; color?: string }) {
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

function StatPill({ value, label }: { value: string; label: string; key?: string }) {
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
      {/* Header */}
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
      {/* Messages */}
      <div style={{ padding: "14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            padding: "9px 13px",
            borderRadius: "14px 14px 14px 2px",
            background: "var(--bg-subtle)",
            color: "var(--text-secondary)",
            fontSize: 12.5,
            lineHeight: 1.55,
            maxWidth: "88%",
          }}
        >
          I'm stuck on Dynamic Programming — I understand the concept but keep failing edge cases.
        </div>
        <div
          style={{
            padding: "9px 13px",
            borderRadius: "14px 14px 2px 14px",
            background: "var(--blue)",
            color: "white",
            fontSize: 12.5,
            lineHeight: 1.55,
            maxWidth: "88%",
            alignSelf: "flex-end",
          }}
        >
          Let's diagnose this. When you define your base case, what exactly are you initializing — the problem size or the result?
        </div>
        <div
          style={{
            padding: "10px 13px",
            borderRadius: "14px 14px 14px 2px",
            background: "var(--amber-light)",
            border: "1px solid color-mix(in srgb, var(--amber) 25%, transparent)",
            color: "var(--amber)",
            fontSize: 12,
            lineHeight: 1.5,
            maxWidth: "92%",
          }}
        >
          <span style={{ fontWeight: 600, display: "block", marginBottom: 2 }}>💡 Key Insight</span>
          Always initialize dp[0] = 0 (empty problem has zero cost), not dp[1]. This is the most common edge-case error in DP.
        </div>
      </div>
    </div>
  );
}

function MockSkillRadar() {
  const points = [
    [0, 0.85], [1, 0.72], [2, 0.58], [3, 0.90], [4, 0.65], [5, 0.78],
  ];
  const labels = ["Arrays", "Trees", "DP", "Graphs", "Strings", "Math"];
  const cx = 110, cy = 110, R = 88;

  const poly = (vals: number[][]) =>
    vals.map(([i, v]) => {
      const a = (i * 60 - 90) * (Math.PI / 180);
      return `${cx + Math.cos(a) * R * v},${cy + Math.sin(a) * R * v}`;
    }).join(" ");

  return (
    <div
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        padding: 20,
        boxShadow: "var(--shadow-xl)",
        width: "100%",
        maxWidth: 280,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Skill Mastery</p>
        <span className="badge badge-blue" style={{ fontSize: 10 }}>Level 12</span>
      </div>
      <svg viewBox="0 0 220 220" style={{ width: "100%", height: "auto", display: "block" }}>
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <polygon
            key={r}
            points={[0,1,2,3,4,5].map((i) => {
              const a = (i*60-90) * (Math.PI/180);
              return `${cx+Math.cos(a)*R*r},${cy+Math.sin(a)*R*r}`;
            }).join(" ")}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}
        {[0,1,2,3,4,5].map((i) => {
          const a = (i*60-90) * (Math.PI/180);
          return <line key={i} x1={cx} y1={cy} x2={cx+Math.cos(a)*R} y2={cy+Math.sin(a)*R} stroke="var(--border)" strokeWidth="1" />;
        })}
        <polygon
          points={poly(points)}
          fill="url(#rfill)"
          stroke="var(--blue)"
          strokeWidth="1.5"
        />
        <defs>
          <linearGradient id="rfill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--blue)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {labels.map((label, i) => {
          const a = (i*60-90) * (Math.PI/180);
          const r = R + 16;
          return (
            <text key={label} x={cx+Math.cos(a)*r} y={cy+Math.sin(a)*r}
              textAnchor="middle" dominantBaseline="middle"
              fill="var(--text-muted)" fontSize="9.5" fontFamily="Inter,sans-serif"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function MockCodePanel() {
  const lines = [
    { tokens: [{ t: "def ", c: "editor-keyword" }, { t: "expand_center", c: "editor-fn" }, { t: "(s, l, r):", c: "editor-line" }] },
    { tokens: [{ t: "    while", c: "editor-keyword" }, { t: " l >= ", c: "editor-line" }, { t: "0", c: "editor-number" }, { t: " and r < len(s) and s[l] == s[r]:", c: "editor-line" }] },
    { tokens: [{ t: "        l -= ", c: "editor-line" }, { t: "1", c: "editor-number" }, { t: "; r += ", c: "editor-line" }, { t: "1", c: "editor-number" }] },
    { tokens: [{ t: "    return", c: "editor-keyword" }, { t: " s[l+", c: "editor-line" }, { t: "1", c: "editor-number" }, { t: ":r]", c: "editor-line" }] },
    { tokens: [] },
    { tokens: [{ t: "def ", c: "editor-keyword" }, { t: "longest_palindrome", c: "editor-fn" }, { t: "(s):", c: "editor-line" }] },
    { tokens: [{ t: "    res = ", c: "editor-line" }, { t: '""', c: "editor-string" }] },
    { tokens: [{ t: "    for", c: "editor-keyword" }, { t: " i in range(len(s)):", c: "editor-line" }] },
    { tokens: [{ t: "        ", c: "" }, { t: "# expand odd and even", c: "editor-comment" }] },
    { tokens: [{ t: "        for", c: "editor-keyword" }, { t: " p in (expand_center(s,i,i), expand_center(s,i,i+", c: "editor-line" }, { t: "1", c: "editor-number" }, { t: ")):", c: "editor-line" }] },
    { tokens: [{ t: "            if", c: "editor-keyword" }, { t: " len(p) > len(res): res = p", c: "editor-line" }] },
    { tokens: [{ t: "    return", c: "editor-keyword" }, { t: " res", c: "editor-line" }] },
  ];

  return (
    <div
      style={{
        background: "#0d0f1c",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        boxShadow: "var(--shadow-xl)",
        border: "1px solid #1e2236",
        width: "100%",
        maxWidth: 480,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: "1px solid #1e2236", background: "#0b0d18" }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: "#ff5f57" }} />
        <div style={{ width: 10, height: 10, borderRadius: 5, background: "#ffbd2e" }} />
        <div style={{ width: 10, height: 10, borderRadius: 5, background: "#28c840" }} />
        <span style={{ marginLeft: 8, fontSize: 11, color: "#4b527a", fontFamily: "'JetBrains Mono',monospace" }}>
          solution.py
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "#1a2236", color: "#4b527a", fontFamily: "inherit" }}>Python</span>
        </div>
      </div>
      <div style={{ padding: "14px 0", overflow: "hidden" }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: "flex", lineHeight: "1.65" }}>
            <div className="editor-gutter" style={{ minWidth: 42, paddingRight: 14, paddingLeft: 14, userSelect: "none", textAlign: "right" }}>
              {i + 1}
            </div>
            <div className="editor-line" style={{ paddingRight: 20, whiteSpace: "pre" }}>
              {line.tokens.map((tok, j) => (
                <span key={j} className={tok.c}>{tok.t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Test result */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid #1e2236", background: "#090b15", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <CheckCircle2 size={13} color="#34d399" />
          <span style={{ fontSize: 11, color: "#34d399", fontFamily: "'JetBrains Mono',monospace" }}>
            3/3 tests passed · 12ms · 14.2MB
          </span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button style={{ fontSize: 11, padding: "3px 9px", borderRadius: 5, background: "#1a2236", border: "1px solid #283050", color: "#a9b1d6", cursor: "pointer", fontFamily: "inherit" }}>
            Run
          </button>
          <button style={{ fontSize: 11, padding: "3px 9px", borderRadius: 5, background: "#2563eb", border: "none", color: "white", cursor: "pointer", fontFamily: "inherit" }}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main landing component ─── */

const features = [
  {
    icon: Brain,
    title: "AI Mentor",
    desc: "Context-aware guidance that explains concepts, debugs code, and gives Socratic hints without spoiling the solution.",
    color: "var(--blue)",
    path: "/ai-mentor",
  },
  {
    icon: BarChart2,
    title: "AI Analyst",
    desc: "Deep skill-level analytics: radar charts, topic mastery heat maps, accuracy trends, and hyper-personalized recommendations.",
    color: "var(--violet)",
    path: "/ai-analyst",
  },
  {
    icon: Code2,
    title: "Online Judge",
    desc: "Battle-tested execution engine for Python, C++, Java, and JavaScript. Millisecond-precise runtimes and memory tracking.",
    color: "var(--cyan)",
    path: "/workspace",
  },
  {
    icon: Target,
    title: "Adaptive Paths",
    desc: "Learning paths that evolve with your skill level. Structured modules from DSA fundamentals to FAANG prep.",
    color: "var(--green)",
    path: "/learning",
  },
  {
    icon: Trophy,
    title: "Rated Contests",
    desc: "Weekly rated contests, company mock tests, and live campus challenges with real-time leaderboards.",
    color: "var(--amber)",
    path: "/contests",
  },
  {
    icon: CalendarCheck,
    title: "Daily Review",
    desc: "A daily digest of your performance, weak topics, time spent, and exactly what to practice tomorrow.",
    color: "var(--red)",
    path: "/daily-review",
  },
];

const testimonials = [
  {
    name: "Priya Patel",
    role: "SWE @ Google",
    school: "IIT Bombay · 2025",
    content: "Algora's AI Mentor caught exactly what I was missing in DP. I went from struggling on mediums to solving hards consistently in 3 weeks.",
    rating: 5,
    initials: "PP",
    color: "#2563eb",
  },
  {
    name: "Rahul Kumar",
    role: "SWE @ Microsoft",
    school: "NIT Trichy · 2025",
    content: "The skill radar showed me I was wasting time on easy graph problems when I should have been drilling trees. That single insight changed my prep.",
    rating: 5,
    initials: "RK",
    color: "#7c3aed",
  },
  {
    name: "Sneha Reddy",
    role: "SWE @ Amazon",
    school: "BITS Pilani · 2025",
    content: "Daily reviews kept me disciplined. I knew exactly what to study each morning. The AI recommendations felt eerily accurate about my weak spots.",
    rating: 5,
    initials: "SR",
    color: "#06b6d4",
  },
  {
    name: "Vikram Nair",
    role: "SWE @ Flipkart",
    school: "VIT Vellore · 2025",
    content: "Contest mode simulated real interview pressure perfectly. My problem-solving speed doubled in two months and my confidence shot up.",
    rating: 5,
    initials: "VN",
    color: "#059669",
  },
];

const companies = ["Google", "Microsoft", "Amazon", "Meta", "Adobe", "Flipkart", "Razorpay", "Atlassian"];

export default function Landing() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <div
      data-theme={theme}
      style={{
        background: "var(--bg)",
        color: "var(--text-primary)",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* ── Navbar ── */}
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
          gap: 0,
        }}
      >
        <AlgoraLogo size={30} />

        <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 32 }}>
          {["Features", "Learning Paths", "Contests", "Blog"].map((item) => (
            <button
              key={item}
              className="btn btn-ghost btn-sm hide-mobile"
              style={{ fontSize: 13 }}
            >
              {item}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
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
                  boxShadow: theme === t ? "var(--shadow-xs)" : "none",
                  textTransform: "capitalize",
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm" style={{ color: "var(--text-secondary)" }}>
            Sign in
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/dashboard")}
            style={{ gap: 5 }}
          >
            Get started <ArrowRight size={13} />
          </button>
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
        {/* Grid dots */}
        <div
          className="grid-dots"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.5,
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 80%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: 780, margin: "0 auto" }}>
          <Chip color="var(--blue)">
            <Sparkles size={10} /> AI-powered · 120,000+ students placed
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
            Algora adapts to your exact skill level. Learn, practice, and get placed faster with
            personalized paths, an AI mentor, and deep performance analytics.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate("/dashboard")}
              style={{ gap: 7 }}
            >
              Start learning free <ArrowRight size={15} />
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => navigate("/workspace")}
              style={{ gap: 7 }}
            >
              <Play size={14} /> Try a problem
            </button>
          </div>

          {/* Stats */}
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
            ].map((s) => <StatPill key={s.label} value={s.value} label={s.label} />)}
          </div>
        </div>

        {/* ── Hero product mockup ── */}
        <div
          style={{
            marginTop: 64,
            display: "flex",
            justifyContent: "center",
            gap: 20,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <MockCodePanel />
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
            <MockSkillRadar />
          </div>
        </div>
      </section>

      {/* ── Companies ── */}
      <div
        style={{
          padding: "28px clamp(20px,5vw,80px)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-surface)",
          overflow: "hidden",
        }}
      >
        <p style={{ textAlign: "center", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 20 }}>
          Students placed at
        </p>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px 32px" }}>
          {companies.map((c) => (
            <span key={c} style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "-0.01em" }}>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section style={{ padding: "96px clamp(20px,5vw,80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Chip color="var(--blue)">Everything you need</Chip>
            <h2 className="text-h1" style={{ margin: "16px 0 14px" }}>
              Built for serious learners
            </h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: 460, margin: "0 auto", fontSize: 15, lineHeight: 1.6 }}>
              From your first "Hello World" to cracking FAANG — every tool you need at every stage.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {features.map(({ icon: Icon, title, desc, color, path }) => (
              <div
                key={title}
                className="surface-card"
                style={{ padding: 24, cursor: "pointer", transition: "all 0.15s" }}
                onClick={() => navigate(path)}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, { transform: "translateY(-2px)", boxShadow: "var(--shadow-lg)" })}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, { transform: "translateY(0)", boxShadow: "var(--shadow-card)" })}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "var(--radius-md)",
                    background: `color-mix(in srgb, ${color} 12%, transparent)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <h3 className="text-h3" style={{ color: "var(--text-primary)", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 16, color, fontSize: 12, fontWeight: 500 }}>
                  Explore <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Mentor showcase ── */}
      <section style={{ padding: "96px clamp(20px,5vw,80px)", background: "var(--bg-surface)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <Chip color="var(--blue)">
              <Brain size={10} /> AI Mentor
            </Chip>
            <h2 className="text-h1" style={{ margin: "16px 0 16px" }}>
              Never hit a wall<br />
              <span className="gradient-text">alone again</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
              The AI Mentor understands where you are in the problem — not just what you typed.
              It gives Socratic hints, explains concepts in context, and guides you to the "aha"
              moment without giving away the answer.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Progressive hints — nudges to full walkthroughs",
                "Real-time code debugging with explanation",
                "Concepts grounded in your current problem",
                "Tracks learning to avoid repetitive help",
              ].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "var(--text-secondary)" }}>
                  <CheckCircle2 size={15} style={{ color: "var(--green)", flexShrink: 0, marginTop: 1 }} />
                  {item}
                </li>
              ))}
            </ul>
            <button className="btn btn-primary" onClick={() => navigate("/ai-mentor")} style={{ gap: 6 }}>
              Try AI Mentor <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <MockChatBubble />
          </div>
        </div>
      </section>

      {/* ── Skill analytics ── */}
      <section style={{ padding: "96px clamp(20px,5vw,80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              className="surface-card"
              style={{ padding: 28, width: "100%", maxWidth: 400 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", margin: 0 }}>Skill Mastery</p>
                <span className="badge badge-blue">Level 12</span>
              </div>
              {/* Radar inline */}
              <svg viewBox="0 0 220 220" style={{ width: "100%", height: "auto", display: "block", marginBottom: 20 }}>
                {[0.25,0.5,0.75,1].map((r) => (
                  <polygon key={r}
                    points={[0,1,2,3,4,5].map((i) => {
                      const a=(i*60-90)*(Math.PI/180);
                      return `${110+Math.cos(a)*88*r},${110+Math.sin(a)*88*r}`;
                    }).join(" ")}
                    fill="none" stroke="var(--border)" strokeWidth="1"
                  />
                ))}
                {[0,1,2,3,4,5].map((i) => {
                  const a=(i*60-90)*(Math.PI/180);
                  return <line key={i} x1={110} y1={110} x2={110+Math.cos(a)*88} y2={110+Math.sin(a)*88} stroke="var(--border)" strokeWidth="1" />;
                })}
                <polygon
                  points={[[0,.85],[1,.72],[2,.58],[3,.90],[4,.65],[5,.78]].map(([i,v]) => {
                    const a=(i*60-90)*(Math.PI/180);
                    return `${110+Math.cos(a)*88*v},${110+Math.sin(a)*88*v}`;
                  }).join(" ")}
                  fill="url(#rg2)" stroke="var(--blue)" strokeWidth="1.5"
                />
                <defs>
                  <linearGradient id="rg2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--blue)" stopOpacity=".25" />
                    <stop offset="100%" stopColor="var(--violet)" stopOpacity=".12" />
                  </linearGradient>
                </defs>
                {["Arrays","Trees","DP","Graphs","Strings","Math"].map((lb,i) => {
                  const a=(i*60-90)*(Math.PI/180);
                  return <text key={lb} x={110+Math.cos(a)*104} y={110+Math.sin(a)*104} textAnchor="middle" dominantBaseline="middle" fill="var(--text-muted)" fontSize="9.5" fontFamily="Inter,sans-serif">{lb}</text>;
                })}
              </svg>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { label: "Arrays", val: 85, color: "var(--blue)" },
                  { label: "Trees", val: 72, color: "var(--violet)" },
                  { label: "DP", val: 58, color: "var(--amber)" },
                  { label: "Graphs", val: 90, color: "var(--green)" },
                  { label: "Strings", val: 65, color: "var(--cyan)" },
                  { label: "Math", val: 78, color: "var(--red)" },
                ].map(({ label, val, color }) => (
                  <div key={label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{label}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-primary)" }}>{val}%</span>
                    </div>
                    <div className="progress" style={{ height: 3 }}>
                      <div className="progress-fill" style={{ width: `${val}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Chip color="var(--violet)">
              <BarChart2 size={10} /> AI Analyst
            </Chip>
            <h2 className="text-h1" style={{ margin: "16px 0 16px" }}>
              Know your skills<br />
              <span className="gradient-text">down to the subtopic</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
              Most platforms tell you pass or fail. Algora tells you <em>why</em> — which patterns
              you've mastered, which edge cases trip you, and exactly how to close the gap.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
              {[
                { label: "Problems Solved", value: "347", icon: Code2 },
                { label: "Accuracy Rate", value: "73%", icon: Target },
                { label: "Current Streak", value: "28 days", icon: Flame },
                { label: "Global Rank", value: "#1,204", icon: Trophy },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="surface" style={{ padding: "14px 16px" }}>
                  <Icon size={13} style={{ color: "var(--blue)", marginBottom: 6 }} />
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{value}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => navigate("/ai-analyst")} style={{ gap: 6 }}>
              View your analytics <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Learning Paths ── */}
      <section style={{ padding: "96px clamp(20px,5vw,80px)", background: "var(--bg-surface)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <Chip color="var(--violet)">Structured mastery</Chip>
            <h2 className="text-h1" style={{ margin: "16px 0 14px" }}>
              Learning paths that actually go somewhere
            </h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: 480, margin: "0 auto", fontSize: 15 }}>
              No more random grinding. Every problem serves a purpose in your journey.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
            {[
              { title: "DSA Fundamentals", desc: "Arrays · Linked Lists · Trees · Graphs", prog: 68, problems: 45, color: "var(--blue)", level: "Beginner" },
              { title: "Placement Prep", desc: "FAANG-focused DSA + System Design basics", prog: 34, problems: 120, color: "var(--violet)", level: "Intermediate" },
              { title: "Competitive CP", desc: "Segment trees, network flow, advanced DP", prog: 12, problems: 200, color: "var(--cyan)", level: "Advanced" },
            ].map(({ title, desc, prog, problems, color, level }) => (
              <div
                key={title}
                className="surface-card"
                style={{ padding: 24, cursor: "pointer" }}
                onClick={() => navigate("/learning")}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                  <div>
                    <span
                      className="badge"
                      style={{ background: `color-mix(in srgb, ${color} 10%, transparent)`, color, marginBottom: 8, display: "inline-flex" }}
                    >
                      {level}
                    </span>
                    <h3 className="text-h3" style={{ color: "var(--text-primary)", margin: 0 }}>{title}</h3>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>{desc}</p>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
                  <span>{prog}% complete</span>
                  <span>{problems} problems</span>
                </div>
                <div className="progress">
                  <div className="progress-fill" style={{ width: `${prog}%`, background: color }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 14, color, fontSize: 12, fontWeight: 500 }}>
                  Continue <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: "96px clamp(20px,5vw,80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <Chip color="var(--green)">Student stories</Chip>
            <h2 className="text-h1" style={{ margin: "16px 0 0" }}>
              Students who got placed
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="surface-card"
                style={{
                  padding: 24,
                  cursor: "pointer",
                  outline: activeTestimonial === i ? `2px solid ${t.color}` : "none",
                  outlineOffset: -1,
                  transition: "all 0.15s",
                }}
                onClick={() => setActiveTestimonial(i)}
              >
                <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={12} fill={t.color} color={t.color} />
                  ))}
                </div>
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: 18 }}>
                  "{t.content}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-md)",
                      background: `linear-gradient(135deg,${t.color},${t.color}80)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{t.role} · {t.school}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "0 clamp(20px,5vw,80px) 96px" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            borderRadius: "var(--radius-2xl)",
            background: "linear-gradient(135deg,#1e3a8a 0%,#312e81 45%,#0e7490 100%)",
            padding: "64px clamp(32px,5vw,80px)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 60% 60% at 20% 30%, rgba(255,255,255,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 50% at 80% 70%, rgba(6,182,212,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <Sparkles size={28} color="rgba(255,255,255,0.5)" style={{ margin: "0 auto 16px" }} />
            <h2
              style={{
                fontSize: "clamp(1.6rem,3vw,2.2rem)",
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.03em",
                margin: "0 0 14px",
              }}
            >
              Start your journey today
            </h2>
            <p style={{ color: "rgba(147,197,253,0.9)", fontSize: 15, maxWidth: 440, margin: "0 auto 36px", lineHeight: 1.6 }}>
              Join 120,000+ students learning smarter with AI-powered guidance.
              Free to start. No credit card required.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              <button
                style={{
                  padding: "12px 24px",
                  borderRadius: "var(--radius-lg)",
                  background: "white",
                  color: "#1e3a8a",
                  fontWeight: 600,
                  fontSize: 14,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
                onClick={() => navigate("/dashboard")}
              >
                Get started free <ArrowRight size={14} />
              </button>
              <button
                style={{
                  padding: "12px 24px",
                  borderRadius: "var(--radius-lg)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 500,
                  fontSize: 14,
                  border: "1px solid rgba(255,255,255,0.25)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
                onClick={() => navigate("/workspace")}
              >
                <Play size={13} /> View demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "32px clamp(20px,5vw,80px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          background: "var(--bg-surface)",
        }}
      >
        <AlgoraLogo size={24} />
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
          © 2025 Algora Technologies. Built for learners, by engineers.
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Contact", "Status"].map((l) => (
            <button key={l} style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              {l}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
