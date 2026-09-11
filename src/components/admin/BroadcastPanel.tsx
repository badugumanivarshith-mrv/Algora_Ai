import React, { useState, useEffect } from "react";
import { Radio, Send, Bell, CheckCircle2, AlertCircle } from "lucide-react";
import { AdminApi } from "../../services/adminApi";

export default function BroadcastPanel() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const loadAnnouncements = async () => {
    try {
      const res = await AdminApi.getAnnouncements();
      if (res.success && res.data) {
        setAnnouncements(res.data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setSending(true);
    try {
      const res = await AdminApi.broadcastAnnouncement({ title, message, link });
      if (res.success) {
        setSuccess(true);
        setTitle("");
        setMessage("");
        setLink("");
        loadAnnouncements();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "color-mix(in srgb, var(--amber) 15%, transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--amber)",
            }}
          >
            <Radio size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Notifications & Broadcast Announcements
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
              Broadcast real-time announcements, contest updates, and system alerts to all users.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16 }}>
        {/* Broadcast Form */}
        <form
          onSubmit={handleBroadcast}
          style={{
            padding: 20,
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
            Send Platform-Wide Announcement
          </div>

          {success && (
            <div
              style={{
                padding: "10px 14px",
                background: "color-mix(in srgb, var(--green) 12%, transparent)",
                border: "1px solid var(--green)",
                borderRadius: "var(--radius-md)",
                color: "var(--green)",
                fontSize: 12.5,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <CheckCircle2 size={15} /> Announcement dispatched to all connected clients!
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              Announcement Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Algora Weekly Contest 42 Announced"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: 13,
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              Message Body *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Provide context, scheduled time, or important rule updates..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: 13,
                resize: "vertical",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              Action Link (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. /contests or /problems/coin-change"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: 13,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={sending || !title || !message}
            style={{
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px 16px",
              background: "var(--blue)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              opacity: sending || !title || !message ? 0.6 : 1,
            }}
          >
            <Send size={14} /> {sending ? "Broadcasting..." : "Dispatch Broadcast"}
          </button>
        </form>

        {/* Live Announcements Log */}
        <div
          style={{
            padding: 20,
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
            <Bell size={16} color="var(--blue)" /> Dispatched Announcements History
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 380, overflowY: "auto" }}>
            {announcements.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                No active announcements found.
              </div>
            ) : (
              announcements.map((a, idx) => (
                <div
                  key={a.id || idx}
                  style={{
                    padding: 12,
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{a.title}</span>
                    <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent"}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>{a.message}</p>
                  {a.link && (
                    <span style={{ fontSize: 11, color: "var(--blue)", fontWeight: 600 }}>Link: {a.link}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
