/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Navigation Sidebar with Dynamic Auth State
 */

import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, BookOpen, Code2, Brain, BarChart2, CalendarCheck,
  Trophy, Users, GraduationCap, LogOut, ChevronRight, UserPlus, ShieldAlert,
  FolderKanban, Briefcase, Mic
} from "lucide-react";
import AlgoraLogo from "./AlgoraLogo";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

const nav = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: BookOpen,        label: "Learning",   path: "/learning"   },
  { icon: Code2,           label: "Workspace",  path: "/workspace"  },
  { icon: FolderKanban,    label: "Project Hub",path: "/projects"   },
  { icon: Briefcase,       label: "Company Prep",path: "/company-prep"},
  { icon: Mic,             label: "Voice Mentor",path: "/voice-mentor"},
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
  const { user, isGuest, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "GS";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

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
        onClick={() => navigate("/")}
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          paddingInline: 16,
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
          cursor: "pointer",
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
        {isGuest ? (
          <button
            onClick={() => setShowAuthModal(true)}
            className="nav-link w-full text-left"
            style={{ marginBottom: 8, color: "var(--blue)" }}
          >
            <UserPlus size={15} style={{ flexShrink: 0 }} />
            <span className="sidebar-label" style={{ fontWeight: 600 }}>Sign In / Register</span>
          </button>
        ) : (
          <button
            onClick={handleSignOut}
            className="nav-link w-full text-left"
            style={{ marginBottom: 8 }}
          >
            <LogOut size={15} style={{ flexShrink: 0, color: "var(--red)" }} />
            <span className="sidebar-label" style={{ color: "var(--red)" }}>Sign out</span>
          </button>
        )}

        {/* Dynamic User / Guest Card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-subtle)",
            border: isGuest ? "1px dashed var(--amber)" : "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "var(--radius-md)",
              background: isGuest
                ? "linear-gradient(135deg, #d97706, #ea580c)"
                : "linear-gradient(135deg, #2563eb, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {getUserInitials(user?.name)}
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
                margin: 0,
              }}
            >
              {user ? user.name : "Guest Mode"}
            </p>
            <p
              style={{
                fontSize: 11,
                color: isGuest ? "var(--amber)" : "var(--text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                margin: 0,
              }}
            >
              {isGuest ? "Unsaved Session" : `Lvl ${user?.level || 1} · ${user?.xp || 0} XP`}
            </p>
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode="login" />
    </aside>
  );
}
