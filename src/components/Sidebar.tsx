import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, BookOpen, Code2, Brain, BarChart2, CalendarCheck,
  Trophy, Users, GraduationCap, Settings, LogOut, ChevronRight,
} from "lucide-react";
import AlgoraLogo from "./AlgoraLogo";

const nav = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: BookOpen,        label: "Learning",   path: "/learning"   },
  { icon: Code2,           label: "Workspace",  path: "/workspace"  },
  { icon: Brain,           label: "AI Mentor",  path: "/ai-mentor"  },
  { icon: BarChart2,       label: "AI Analyst", path: "/ai-analyst" },
  { icon: CalendarCheck,   label: "Daily Review",path: "/daily-review"},
  { icon: Trophy,          label: "Contests",   path: "/contests"   },
  { icon: Users,           label: "Leaderboard",path: "/leaderboard"},
  { icon: GraduationCap,   label: "Faculty",    path: "/faculty"    },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside
      style={{
        width: 232,
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
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
        {nav.map(({ icon: Icon, label, path }) => {
          const active =
            pathname === path ||
            (path === "/dashboard" && (pathname === "/" || pathname === "/app"));
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`nav-link w-full text-left${active ? " active" : ""}`}
              style={{ marginBottom: 1 }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span className="sidebar-label" style={{ flex: 1 }}>{label}</span>
              {active && (
                <ChevronRight size={11} style={{ opacity: 0.5 }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom zone */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "8px 8px" }}>
        <button className="nav-link w-full text-left" style={{ marginBottom: 1 }}>
          <Settings size={15} style={{ flexShrink: 0 }} />
          <span className="sidebar-label">Settings</span>
        </button>
        <button
          onClick={async () => {
            const { ApiClient } = await import("../services/apiClient");
            await ApiClient.logout();
            navigate("/");
          }}
          className="nav-link w-full text-left"
          style={{ marginBottom: 8 }}
        >
          <LogOut size={15} style={{ flexShrink: 0, color: "var(--red)" }} />
          <span className="sidebar-label" style={{ color: "var(--red)" }}>Sign out</span>
        </button>

        {/* User card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-subtle)",
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
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
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
