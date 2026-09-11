import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { SystemSettingEntity } from "../../types";
import { AdminApi } from "../../services/adminApi";

export default function SettingsEditor() {
  const [settings, setSettings] = useState<SystemSettingEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await AdminApi.getSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleUpdate = async (key: string, value: any) => {
    setSavingKey(key);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await AdminApi.updateSetting(key, { value });
      if (res.success && res.data) {
        setSettings(settings.map((s) => (s.key === key ? res.data! : s)));
        setSuccessMsg(`Setting '${key}' saved successfully.`);
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(res.error?.message || "Failed to update setting.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update setting.");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Settings size={18} style={{ color: "var(--brand)" }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            Platform System Settings & Engine Limits
          </h2>
        </div>
        <button
          onClick={loadSettings}
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
            cursor: "pointer",
          }}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {successMsg && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "var(--radius-md)",
            background: "color-mix(in srgb, var(--green, #10b981) 15%, transparent)",
            border: "1px solid color-mix(in srgb, var(--green, #10b981) 30%, transparent)",
            color: "var(--green, #10b981)",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "var(--radius-md)",
            background: "color-mix(in srgb, var(--red, #ef4444) 15%, transparent)",
            border: "1px solid color-mix(in srgb, var(--red, #ef4444) 30%, transparent)",
            color: "var(--red, #ef4444)",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg, 12px)",
          background: "var(--bg-surface)",
          overflow: "hidden",
        }}
      >
        {settings.map((setting, idx) => (
          <div
            key={setting.key}
            style={{
              padding: "16px 20px",
              borderBottom: idx === settings.length - 1 ? "none" : "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono, monospace)" }}>
                  {setting.key}
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    padding: "1px 6px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-subtle)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                    textTransform: "uppercase",
                  }}
                >
                  {setting.category}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                {setting.description}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              {typeof setting.value === "boolean" ? (
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={setting.value}
                    onChange={(e) => handleUpdate(setting.key, e.target.checked)}
                    disabled={savingKey === setting.key}
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 600, color: setting.value ? "var(--green, #10b981)" : "var(--text-muted)" }}>
                    {setting.value ? "ENABLED" : "DISABLED"}
                  </span>
                </label>
              ) : typeof setting.value === "number" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    value={setting.value}
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      setSettings(settings.map((s) => (s.key === setting.key ? { ...s, value: num } : s)));
                    }}
                    style={{
                      width: 100,
                      padding: "6px 10px",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      fontSize: 12,
                      fontFamily: "var(--font-mono, monospace)",
                      textAlign: "right",
                    }}
                  />
                  <button
                    onClick={() => handleUpdate(setting.key, setting.value)}
                    disabled={savingKey === setting.key}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "var(--radius-md)",
                      border: "none",
                      background: "var(--brand)",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Save size={13} />
                    <span>Save</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="text"
                    value={Array.isArray(setting.value) ? setting.value.join(", ") : String(setting.value)}
                    onChange={(e) => {
                      const val = Array.isArray(setting.value) ? e.target.value.split(",").map((s) => s.trim()) : e.target.value;
                      setSettings(settings.map((s) => (s.key === setting.key ? { ...s, value: val } : s)));
                    }}
                    style={{
                      width: 220,
                      padding: "6px 10px",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      fontSize: 12,
                    }}
                  />
                  <button
                    onClick={() => handleUpdate(setting.key, setting.value)}
                    disabled={savingKey === setting.key}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "var(--radius-md)",
                      border: "none",
                      background: "var(--brand)",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Save size={13} />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
