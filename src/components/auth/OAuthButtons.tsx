import React, { useState } from "react";
import { OAuthApi, OAuthProvider } from "../../services/oauthApi";
import { Loader2 } from "lucide-react";

interface OAuthButtonsProps {
  action?: "login" | "link";
  onSuccess?: (result: any) => void;
  onError?: (errorMsg: string) => void;
  className?: string;
  disabledProviders?: OAuthProvider[];
}

export default function OAuthButtons({
  action = "login",
  onSuccess,
  onError,
  className = "",
  disabledProviders = [],
}: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);

  const handleOAuthClick = async (provider: OAuthProvider) => {
    try {
      setLoadingProvider(provider);
      const result = await OAuthApi.initiateOAuthPopup(provider, action);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      if (onError) {
        onError(err.message || `Failed to authenticate with ${provider}`);
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Primary: Continue with Google */}
      <button
        type="button"
        disabled={loadingProvider !== null || disabledProviders.includes("google")}
        onClick={() => handleOAuthClick("google")}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-raised)] text-[var(--text-primary)] text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingProvider === "google" ? (
          <Loader2 size={18} className="animate-spin text-indigo-500" />
        ) : (
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
        )}
        <span>
          {loadingProvider === "google"
            ? "Connecting to Google..."
            : action === "link"
            ? "Link Google Account"
            : "Sign in with Google"}
        </span>
      </button>
    </div>
  );
}
