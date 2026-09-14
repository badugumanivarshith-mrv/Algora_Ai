import React, { useState, useEffect } from "react";
import { OAuthApi, LinkedOAuthAccount, OAuthProvider } from "../../services/oauthApi";
import OAuthButtons from "../auth/OAuthButtons";
import { ShieldCheck, CheckCircle2, AlertCircle, Trash2, Link2, ExternalLink, RefreshCw } from "lucide-react";

export default function ConnectedAccounts() {
  const [identities, setIdentities] = useState<LinkedOAuthAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlinkingProvider, setUnlinkingProvider] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadIdentities = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await OAuthApi.getLinkedIdentities();
      setIdentities(list);
    } catch (err: any) {
      setError(err.message || "Failed to load linked accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIdentities();
  }, []);

  const handleUnlink = async (provider: OAuthProvider) => {
    if (!window.confirm(`Are you sure you want to unlink your ${provider === "google" ? "Google" : "GitHub"} account?`)) {
      return;
    }

    try {
      setUnlinkingProvider(provider);
      setError(null);
      setSuccess(null);
      const res = await OAuthApi.unlinkProvider(provider);
      setSuccess(res.message || `Unlinked ${provider} successfully.`);
      await loadIdentities();
    } catch (err: any) {
      setError(err.message || `Failed to unlink ${provider}`);
    } finally {
      setUnlinkingProvider(null);
    }
  };

  const handleLinkSuccess = (result: any) => {
    setSuccess(`Successfully linked your ${result.linkedAccount?.provider || "OAuth"} account!`);
    loadIdentities();
  };

  const googleAccount = identities.find((i) => i.provider === "google");
  const githubAccount = identities.find((i) => i.provider === "github");
  const linkedProviders: OAuthProvider[] = identities.map((i) => i.provider);

  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-400" />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Connected Accounts & Identity</h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Manage your Google and GitHub accounts for fast 1-click sign-in and profile synchronization.
          </p>
        </div>
        <button
          onClick={loadIdentities}
          disabled={loading}
          className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-raised)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          title="Refresh linked accounts"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 size={14} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Google Card */}
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center">
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
                <h3 className="text-xs font-bold text-[var(--text-primary)]">Google</h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {googleAccount ? googleAccount.email : "Not connected"}
                </p>
              </div>
            </div>
            {googleAccount ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                Connected
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-[var(--bg-raised)] text-[var(--text-muted)] text-[10px] font-semibold border border-[var(--border)]">
                Disconnected
              </span>
            )}
          </div>

          {googleAccount ? (
            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-[10px] text-[var(--text-muted)]">
                Linked {new Date(googleAccount.linkedAt).toLocaleDateString()}
              </span>
              <button
                type="button"
                disabled={unlinkingProvider === "google"}
                onClick={() => handleUnlink("google")}
                className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Trash2 size={12} />
                <span>{unlinkingProvider === "google" ? "Unlinking..." : "Unlink"}</span>
              </button>
            </div>
          ) : (
            <div className="pt-2">
              <OAuthButtons
                action="link"
                disabledProviders={["github"]}
                onSuccess={handleLinkSuccess}
                onError={(err) => setError(err)}
              />
            </div>
          )}
        </div>

        {/* GitHub Card */}
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] flex flex-col justify-between space-y-4">
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
                <h3 className="text-xs font-bold text-[var(--text-primary)]">GitHub</h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {githubAccount ? githubAccount.displayName || githubAccount.email : "Not connected"}
                </p>
              </div>
            </div>
            {githubAccount ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                Connected
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-[var(--bg-raised)] text-[var(--text-muted)] text-[10px] font-semibold border border-[var(--border)]">
                Disconnected
              </span>
            )}
          </div>

          {githubAccount ? (
            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-[10px] text-[var(--text-muted)]">
                Linked {new Date(githubAccount.linkedAt).toLocaleDateString()}
              </span>
              <button
                type="button"
                disabled={unlinkingProvider === "github"}
                onClick={() => handleUnlink("github")}
                className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Trash2 size={12} />
                <span>{unlinkingProvider === "github" ? "Unlinking..." : "Unlink"}</span>
              </button>
            </div>
          ) : (
            <div className="pt-2">
              <OAuthButtons
                action="link"
                disabledProviders={["google"]}
                onSuccess={handleLinkSuccess}
                onError={(err) => setError(err)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
