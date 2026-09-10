import { useState, useEffect, type ElementType } from "react";
import { Bell, Search, Sun, Moon, Sparkles, Command, Flame, Zap, Award } from "lucide-react";
import { useTheme, type Theme } from "./ThemeContext";
import { GamificationApi, GamificationProfileResponse } from "../services/gamificationApi";

interface TopNavProps {
  title?: string;
  subtitle?: string;
}

const themes: { key: Theme; icon: ElementType; label: string }[] = [
  { key: "light", icon: Sun, label: "Light" },
  { key: "dark", icon: Moon, label: "Dark" },
  { key: "gradient", icon: Sparkles, label: "Gradient" },
];

export default function TopNav({ title, subtitle }: TopNavProps) {
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<GamificationProfileResponse | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const data = await GamificationApi.getGamificationProfile();
      if (data) {
        setProfile(data);
      }
    }
    loadProfile();
  }, []);

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
              <span className="hide-mobile" style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Gamification Pills */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Rating Pill */}
        <div
          className="hide-mobile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 10px",
            background: "color-mix(in srgb, var(--amber) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--amber) 25%, transparent)",
            borderRadius: "var(--radius-full)",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--amber)",
          }}
          title="Competitive Rating"
        >
          <Zap size={13} style={{ fill: "currentColor" }} />
          <span>{profile ? profile.rating.toLocaleString() : "1,842"}</span>
          <span style={{ fontSize: 10.5, fontWeight: 500, opacity: 0.85 }}>
            {profile?.ratingTier || "Expert"}
          </span>
        </div>

        {/* Level & XP Pill */}
        <div
          className="hide-mobile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            background: "color-mix(in srgb, var(--violet) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--violet) 25%, transparent)",
            borderRadius: "var(--radius-full)",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--violet)",
          }}
          title="Level & XP"
        >
          <Award size={13} />
          <span>Lvl {profile ? profile.level : 6}</span>
          <span style={{ fontSize: 10.5, fontWeight: 500, opacity: 0.85 }}>
            {profile ? `${(profile.totalXP / 1000).toFixed(1)}k XP` : "4.8k XP"}
          </span>
        </div>

        {/* Streak Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 10px",
            background: "color-mix(in srgb, var(--red) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--red) 25%, transparent)",
            borderRadius: "var(--radius-full)",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--red)",
          }}
          title="Daily Practice Streak"
        >
          <Flame size={13} style={{ fill: "currentColor" }} />
          <span>{profile ? profile.streakDays : 7}d</span>
        </div>
      </div>

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
          minWidth: 160,
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

      {/* Notifications */}
      <button
        style={{
          position: "relative",
          width: 34,
          height: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          color: "var(--text-secondary)",
          cursor: "pointer",
        }}
      >
        <Bell size={14} />
        <span
          style={{
            position: "absolute",
            top: 7,
            right: 7,
            width: 5,
            height: 5,
            background: "var(--blue)",
            borderRadius: "50%",
          }}
        />
      </button>

      {/* Avatar */}
      <div
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
        AP
      </div>
    </header>
  );
}
