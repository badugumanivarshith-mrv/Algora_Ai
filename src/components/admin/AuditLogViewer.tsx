import React, { useState, useEffect } from "react";
import { ShieldCheck, RefreshCw, Filter, Clock } from "lucide-react";
import { AdminAuditLogEntity } from "../../types";
import { AdminApi } from "../../services/adminApi";

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AdminAuditLogEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await AdminApi.getAuditLogs(60);
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = filterType === "all" ? logs : logs.filter((l) => l.entityType === filterType);

  const getActionBadgeColor = (action: string) => {
    if (action.includes("CREATE")) return { bg: "color-mix(in srgb, var(--green, #10b981) 15%, transparent)", text: "var(--green, #10b981)" };
    if (action.includes("DELETE")) return { bg: "color-mix(in srgb, var(--red, #ef4444) 15%, transparent)", text: "var(--red, #ef4444)" };
    if (action.includes("PUBLISH")) return { bg: "color-mix(in srgb, var(--brand) 15%, transparent)", text: "var(--brand)" };
    return { bg: "color-mix(in srgb, var(--amber, #f59e0b) 15%, transparent)", text: "var(--amber, #f59e0b)" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={18} style={{ color: "var(--brand)" }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            Administrative Audit Trail
          </h2>
          <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 6 }}>
            ({filtered.length} captured actions)
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Filter size={14} style={{ color: "var(--text-muted)" }} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: "var(--bg-surface)",
                color: "var(--text-secondary)",
                fontSize: 12,
              }}
            >
              <option value="all">All Modules</option>
              <option value="problem">Problems</option>
              <option value="topic">Topics</option>
              <option value="curriculum">Curriculum</option>
              <option value="contest">Contests</option>
              <option value="achievement">Achievements</option>
              <option value="setting">Settings</option>
            </select>
          </div>

          <button
            onClick={loadLogs}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              fontSize: 12,
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Logs Table / List */}
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg, 12px)",
          background: "var(--bg-surface)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "180px 140px 180px 1fr 140px",
            padding: "10px 16px",
            background: "var(--bg-subtle)",
            borderBottom: "1px solid var(--border)",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <span>Timestamp</span>
          <span>Administrator</span>
          <span>Action</span>
          <span>Details & Parameters</span>
          <span>Target Entity</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            No audit logs match current filters.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.map((log, idx) => {
              const badge = getActionBadgeColor(log.action);
              return (
                <div
                  key={log.id || idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "180px 140px 180px 1fr 140px",
                    padding: "12px 16px",
                    borderBottom: idx === filtered.length - 1 ? "none" : "1px solid var(--border)",
                    alignItems: "center",
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)" }}>
                    <Clock size={13} />
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>

                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {log.adminName || "Administrator"}
                  </span>

                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        background: badge.bg,
                        color: badge.text,
                        fontWeight: 700,
                        fontSize: 10.5,
                        fontFamily: "var(--font-mono, monospace)",
                      }}
                    >
                      {log.action}
                    </span>
                  </div>

                  <div
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: 11,
                      color: "var(--text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {log.details ? JSON.stringify(log.details) : "-"}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "1px 6px",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--bg-subtle)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {log.entityType}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)" }}>
                      #{log.entityId}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
