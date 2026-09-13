import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, BookOpen, Code2, Brain, BarChart2, CalendarCheck,
  Trophy, Users, GraduationCap, Settings, LogOut, ChevronRight, ShieldCheck,
  MessageSquare, Briefcase, Target, Award, Sparkles, User,
} from "lucide-react";
import AlgoraLogo from "./AlgoraLogo";

interface NavSection {
  title?: string;
  items: {
    icon: any;
    label: string;
    path: string;
    badge?: string;
  }[];
}

const navSections: NavSection[] = [
  {
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: BookOpen,        label: "Learning",   path: "/learning" },
      { icon: Code2,           label: "Workspace",  path: "/workspace" },
      { icon: Brain,           label: "AI Mentor",  path: "/ai-mentor" },
      { icon: BarChart2,       label: "AI Analyst", path: "/ai-analyst" },
      { icon: CalendarCheck,   label: "Daily Review", path: "/daily-review" },
      { icon: Sparkles,        label: "Adaptive Path", path: "/adaptive-roadmap", badge: "v2" },
    ],
  },
  {
    title: "Competition & Peer",
    items: [
      { icon: Trophy,          label: "Contests",   path: "/contests" },
      { icon: Users,           label: "Leaderboard", path: "/leaderboard" },
      { icon: MessageSquare,   label: "Community",  path: "/community" },
    ],
  },
  {
    title: "Career & Enterprise",
    items: [
      { icon: Briefcase,       label: "Interviews", path: "/interviews", badge: "AI" },
      { icon: Target,          label: "Placement Hub", path: "/placements" },
      { icon: Award,           label: "Certificates", path: "/certifications" },
      { icon: GraduationCap,   label: "Faculty LMS", path: "/faculty" },
      { icon: ShieldCheck,     label: "Admin CMS",  path: "/admin" },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside
      style={{
        width: 236,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      {/* Logo row */}
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          paddingInline: 16,
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <AlgoraLogo size={28} />
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
        {navSections.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: sIdx < navSections.length - 1 ? 12 : 4 }}>
            {section.title && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-disabled)",
                  padding: "4px 8px 6px 8px",
                }}
              >
                {section.title}
              </div>
            )}
            {section.items.map(({ icon: Icon, label, path, badge }) => {
              const active =
                pathname === path ||
                (path === "/dashboard" && (pathname === "/" || pathname === "/app"));
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`nav-link w-full text-left${active ? " active" : ""}`}
                  style={{ marginBottom: 1, display: "flex", alignItems: "center", gap: 8, padding: "7px 10px" }}
                >
                  <Icon size={14} style={{ flexShrink: 0 }} />
                  <span className="sidebar-label" style={{ flex: 1, fontSize: 12.5 }}>{label}</span>
                  {badge && (
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        padding: "1px 5px",
                        borderRadius: "var(--radius-full, 9999px)",
                        background: active ? "var(--brand)" : "var(--bg-muted)",
                        color: active ? "#fff" : "var(--text-muted)",
                      }}
                    >
                      {badge}
                    </span>
                  )}
                  {active && (
                    <ChevronRight size={11} style={{ opacity: 0.6 }} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom zone */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "8px 8px" }}>
        <button
          onClick={() => navigate("/profile")}
          className={`nav-link w-full text-left${pathname === "/profile" ? " active" : ""}`}
          style={{ marginBottom: 1 }}
        >
          <User size={14} style={{ flexShrink: 0 }} />
          <span className="sidebar-label" style={{ flex: 1 }}>My Profile</span>
        </button>
        <button
          onClick={async () => {
            const { ApiClient } = await import("../services/apiClient");
            await ApiClient.logout();
            navigate("/");
          }}
          className="nav-link w-full text-left"
          style={{ marginBottom: 6 }}
        >
          <LogOut size={14} style={{ flexShrink: 0, color: "var(--red)" }} />
          <span className="sidebar-label" style={{ color: "var(--red)" }}>Sign out</span>
        </button>

        {/* User card */}
        <div
          onClick={() => navigate("/profile")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-subtle)",
            cursor: "pointer",
            transition: "background 0.15s ease",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg,#2563eb,#7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            AS
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                margin: 0,
              }}
            >
              Arjun Sharma
            </p>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                margin: 0,
              }}
            >
              Level 12 · 4,820 XP
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
