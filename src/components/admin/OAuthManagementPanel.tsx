import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Users,
  Activity,
  KeyRound,
  ExternalLink,
  ShieldAlert,
  Sliders,
  Sparkles,
} from "lucide-react";
import { OAuthApi, OAuthMetricsResponse, OAuthProviderConfig } from "../../services/oauthApi";

export default function OAuthManagementPanel() {
  const [metrics, setMetrics] = useState<OAuthMetricsResponse | null>(null);
  const [configData, setConfigData] = useState<{ google: OAuthProviderConfig; github: OAuthProviderConfig } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState<any | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [m, c] = await Promise.all([OAuthApi.getMetrics(), OAuthApi.getConfig()]);
      setMetrics(m);
      setConfigData(c);
    } catch (err: any) {
      setError(err.message || "Failed to load OAuth platform metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <ShieldCheck size={20} className="text-indigo-400" />
            OAuth 2.0 & Identity Platform Management
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Real-time monitoring of Google & GitHub SSO, identity linking, active OAuth sessions, and security audit telemetry.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-raised)] text-xs font-semibold text-[var(--text-primary)] transition shadow-sm"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-indigo-400" : ""} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium">Total OAuth Logins</span>
            <Users size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">
            {metrics?.totalLogins ?? 0}
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">
            {metrics?.successfulLogins ?? 0} successful / {metrics?.failedLogins ?? 0} failed
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium">Linked Accounts</span>
            <KeyRound size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">
            {metrics?.totalLinkedAccounts ?? 0}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1">
            {metrics?.accountsByProvider.google ?? 0} Google · {metrics?.accountsByProvider.github ?? 0} GitHub
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium">Active Auth Sessions</span>
            <Activity size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">
            {metrics?.activeOAuthSessions ?? 0}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1">
            Pending PKCE & State verifications
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium">Auth Success Rate</span>
            <Sparkles size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">
            {metrics && metrics.totalLogins > 0
              ? `${Math.round((metrics.successfulLogins / metrics.totalLogins) * 100)}%`
              : "100%"}
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">
            Zero security violations
          </div>
        </div>
      </div>

      {/* Provider Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Google SSO Status */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Google OAuth 2.0</h3>
                <p className="text-xs text-[var(--text-muted)]">OpenID Connect + UserInfo API</p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                configData?.google.isConfigured
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              {configData?.google.isConfigured ? "Live Production" : "Sandbox Enabled"}
            </span>
          </div>

          <div className="space-y-2 text-xs bg-[var(--bg-canvas)] p-3 rounded-xl border border-[var(--border)]">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Config Status:</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {configData?.google.isConfigured ? "Configured (CLIENT_ID & SECRET)" : "Developer Sandbox Mode"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Scopes:</span>
              <span className="font-mono text-[11px] text-[var(--text-secondary)]">openid, email, profile</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Security Specs:</span>
              <span className="text-[var(--text-secondary)]">PKCE S256 + State Nonce</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Callback URI:</span>
              <span className="font-mono text-[10px] text-indigo-400 truncate max-w-[200px]">
                {configData?.google.callbackUrl || "/api/auth/oauth/google/callback"}
              </span>
            </div>
          </div>
        </div>

        {/* GitHub SSO Status */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1e232a] border border-[var(--border)] flex items-center justify-center text-white">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">GitHub OAuth App</h3>
                <p className="text-xs text-[var(--text-muted)]">User Profile & Verified Emails API</p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                configData?.github.isConfigured
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              {configData?.github.isConfigured ? "Live Production" : "Sandbox Enabled"}
            </span>
          </div>

          <div className="space-y-2 text-xs bg-[var(--bg-canvas)] p-3 rounded-xl border border-[var(--border)]">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Config Status:</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {configData?.github.isConfigured ? "Configured (CLIENT_ID & SECRET)" : "Developer Sandbox Mode"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Scopes:</span>
              <span className="font-mono text-[11px] text-[var(--text-secondary)]">read:user, user:email</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Security Specs:</span>
              <span className="text-[var(--text-secondary)]">Encrypted State + CSRF Guard</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Callback URI:</span>
              <span className="font-mono text-[10px] text-indigo-400 truncate max-w-[200px]">
                {configData?.github.callbackUrl || "/api/auth/oauth/github/callback"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit Telemetry Table */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">OAuth Security & Authentication Audit Logs</h3>
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">
            {metrics?.recentAuditLogs?.length ?? 0} events recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] font-semibold">
                <th className="pb-2.5">Time</th>
                <th className="pb-2.5">Event</th>
                <th className="pb-2.5">Provider</th>
                <th className="pb-2.5">Identity / Email</th>
                <th className="pb-2.5">IP Address</th>
                <th className="pb-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {metrics?.recentAuditLogs && metrics.recentAuditLogs.length > 0 ? (
                metrics.recentAuditLogs.map((log) => {
                  const isSuccess = log.eventType === "login_success" || log.eventType === "account_linked";
                  return (
                    <tr key={log.id} className="hover:bg-[var(--bg-raised)]/50 transition">
                      <td className="py-2.5 text-[var(--text-muted)] font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isSuccess
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {log.eventType}
                        </span>
                      </td>
                      <td className="py-2.5 font-semibold text-[var(--text-primary)] capitalize">
                        {log.provider}
                      </td>
                      <td className="py-2.5 text-[var(--text-secondary)] font-mono text-[11px]">
                        {log.email || log.providerUserId || "anonymous"}
                      </td>
                      <td className="py-2.5 text-[var(--text-muted)] font-mono text-[11px]">
                        {log.ipAddress || "internal"}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => setSelectedAuditLog(log)}
                          className="px-2 py-1 rounded bg-[var(--bg-canvas)] border border-[var(--border)] text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[var(--text-muted)]">
                    No OAuth audit events recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Audit Event: {selectedAuditLog.eventType}
              </h3>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="text-xs text-[var(--text-muted)] hover:text-white"
              >
                Close
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border)] text-emerald-400 font-mono text-xs overflow-x-auto max-h-80">
              {JSON.stringify(selectedAuditLog, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
