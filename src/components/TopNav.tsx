import { useState, useEffect, useRef, type ElementType } from "react";
import { Bell, Search, Sun, Moon, Sparkles, Command, Flame, Zap, Award, Check, ExternalLink, Radio, RefreshCw } from "lucide-react";
import { useTheme, type Theme } from "./ThemeContext";
import { GamificationApi, GamificationProfileResponse } from "../services/gamificationApi";

interface TopNavProps {
  title?: string;
  subtitle?: string;
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

const themes: { key: Theme; icon: ElementType; label: string }[] = [
  { key: "light", icon: Sun, label: "Light" },
  { key: "dark", icon: Moon, label: "Dark" },
  { key: "gradient", icon: Sparkles, label: "Gradient" },
];

export default function TopNav({ title, subtitle }: TopNavProps) {
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<GamificationProfileResponse | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(2);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProfile() {
      const data = await GamificationApi.getGamificationProfile();
      if (data) {
        setProfile(data);
      }
    }
    loadProfile();
    fetchNotifications();

    // Click outside listener for notification dropdown
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchNotifications() {
    try {
      setIsLoadingNotifs(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setNotifications(json.data.notifications || []);
          setUnreadCount(json.data.unreadCount || 0);
          return;
        }
      }
    } catch {
      // fallback seed
    } finally {
      setIsLoadingNotifs(false);
    }

    // Default fallback
    setNotifications([
      {
        id: "notif-1",
        type: "admin_announcement",
        title: "Algora Weekly Contest 42 Announced!",
        message: "Registration open. Compete with top algorithm engineers worldwide this Saturday at 2:00 PM UTC.",
        link: "/contests",
        isRead: false,
        createdAt: "10 mins ago",
      },
      {
        id: "notif-2",
        type: "achievement_unlock",
        title: "Achievement: Graph Pioneer Unlocked",
        message: "You completed 10 Graph BFS & Dijkstra challenges in under 3 days! +150 XP.",
        link: "/profile",
        isRead: false,
        createdAt: "2 hours ago",
      },
      {
        id: "notif-3",
        type: "mentor_tip",
        title: "AI Mentor Diagnostic Ready",
        message: "Your Socratic analysis recommended focused practice on 1D Dynamic Programming.",
        link: "/mentor",
        isRead: true,
        createdAt: "1 day ago",
      },
    ]);
  }

  async function markAsRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      // ignore
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function markAllAsRead() {
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
    } catch {
      // ignore
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

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
        position: "relative",
        zIndex: 40,
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

      {/* Notifications Button & Dropdown */}
      <div ref={notifRef} style={{ position: "relative" }}>
        <button
          onClick={() => setIsNotifOpen((prev) => !prev)}
          title="Notifications & Announcements"
          style={{
            position: "relative",
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isNotifOpen ? "var(--bg-raised)" : "var(--bg-subtle)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: isNotifOpen ? "var(--blue)" : "var(--text-secondary)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <Bell size={14} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 5,
                right: 5,
                width: 7,
                height: 7,
                background: "var(--blue)",
                borderRadius: "50%",
                boxShadow: "0 0 0 2px var(--bg-surface)",
              }}
            />
          )}
        </button>

        {isNotifOpen && (
          <div
            style={{
              position: "absolute",
              top: 42,
              right: 0,
              width: 340,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
              zIndex: 100,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "12px 14px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--bg-subtle)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Notifications</span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 10,
                      background: "var(--blue)",
                      color: "#fff",
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={fetchNotifications}
                  title="Refresh"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: 2,
                  }}
                >
                  <RefreshCw size={12} className={isLoadingNotifs ? "animate-spin" : ""} />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--blue)",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                  No new notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    style={{
                      padding: "10px 14px",
                      borderBottom: "1px solid var(--border)",
                      background: n.isRead ? "transparent" : "color-mix(in srgb, var(--blue) 5%, transparent)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                      transition: "background 0.12s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        {!n.isRead && (
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--blue)" }} />
                        )}
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                          {n.title}
                        </span>
                      </div>
                      <span style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {n.createdAt.includes("T") ? new Date(n.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }) : n.createdAt}
                      </span>
                    </div>
                    <p style={{ fontSize: 11.5, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    {n.link && (
                      <a
                        href={n.link}
                        style={{
                          fontSize: 11,
                          color: "var(--blue)",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          marginTop: 2,
                          fontWeight: 600,
                        }}
                      >
                        View Details <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

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
