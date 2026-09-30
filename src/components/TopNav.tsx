/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Top Navigation Header with Dynamic Auth State
 */

import { useState } from "react";
import { Search, Sun, Moon, Sparkles, Command, UserPlus, ShieldAlert } from "lucide-react";
import { useTheme, type Theme } from "./ThemeContext";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

interface TopNavProps {
  title?: string;
  subtitle?: string;
}

const themes: { key: Theme; icon: React.ElementType; label: string }[] = [
  { key: "light",    icon: Sun,      label: "Light"    },
  { key: "dark",     icon: Moon,     label: "Dark"     },
  { key: "gradient", icon: Sparkles, label: "Gradient" },
];

export default function TopNav({ title, subtitle }: TopNavProps) {
  const { theme, setTheme } = useTheme();
  const { user, isGuest } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const getUserInitials = (name?: string) => {
    if (!name) return "GS";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header
      style={{
        height: 56,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        paddingInline: 20,
        gap: 12,
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <h1
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <span
                className="hide-mobile"
                style={{ fontSize: 12, color: "var(--text-muted)" }}
              >
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Guest Mode Alert Banner */}
      {isGuest && (
        <button
          onClick={() => setShowAuthModal(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: "var(--radius-full)",
            background: "rgba(217, 119, 6, 0.1)",
            border: "1px solid rgba(217, 119, 6, 0.25)",
            color: "var(--amber)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <ShieldAlert size={13} />
          <span>Guest Mode · Click to Register</span>
        </button>
      )}

      {/* Search pill */}
      <button
        className="hide-mobile"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 10px",
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          color: "var(--text-muted)",
          fontSize: 12,
          cursor: "pointer",
          minWidth: 180,
          fontFamily: "inherit",
        }}
      >
        <Search size={12} />
        <span style={{ flex: 1, textAlign: "left" }}>Search…</span>
        <kbd
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            background: "var(--bg-muted)",
            color: "var(--text-disabled)",
            padding: "1px 5px",
            borderRadius: 4,
            fontSize: 10,
            fontFamily: "inherit",
          }}
        >
          <Command size={9} />K
        </kbd>
      </button>

      {/* Theme switcher */}
      <div
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
        {themes.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTheme(key)}
            title={`${label} theme`}
            style={{
              width: 27,
              height: 27,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: theme === key ? "var(--bg-raised)" : "transparent",
              color: theme === key ? "var(--blue)" : "var(--text-muted)",
              boxShadow: theme === key ? "var(--shadow-xs)" : "none",
              cursor: "pointer",
              transition: "all 0.12s",
            }}
          >
            <Icon size={12} />
          </button>
        ))}
      </div>

      {/* User Avatar / Login Action */}
      {isGuest ? (
        <button
          onClick={() => setShowAuthModal(true)}
          style={{
            padding: "6px 12px",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "var(--blue)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <UserPlus size={13} />
          <span>Sign In</span>
        </button>
      ) : (
        <div
          title={user?.name}
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg,#2563eb,#7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            flexShrink: 0,
            cursor: "pointer",
          }}
        >
          {getUserInitials(user?.name)}
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode="login" />
    </header>
  );
}
