import React, { useState } from "react";
import { X, Lock, Mail, User, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import OAuthButtons from "./OAuthButtons";
import AlgoraLogo from "../AlgoraLogo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
  onSuccess?: (user: any) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailOrUsername, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || "Login failed");
        }
        if (data.data?.token) {
          localStorage.setItem("algora_token", data.data.token);
          localStorage.setItem("token", data.data.token);
          if (data.data.user) {
            localStorage.setItem("algora_user", JSON.stringify(data.data.user));
          }
        }
        setSuccessMsg("Welcome back! Loading your profile...");
        setTimeout(() => {
          if (onSuccess) onSuccess(data.data?.user);
          onClose();
          window.location.reload();
        }, 500);
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || "Registration failed");
        }
        if (data.data?.token) {
          localStorage.setItem("algora_token", data.data.token);
          localStorage.setItem("token", data.data.token);
          if (data.data.user) {
            localStorage.setItem("algora_user", JSON.stringify(data.data.user));
          }
        }
        setSuccessMsg("Account created successfully!");
        setTimeout(() => {
          if (onSuccess) onSuccess(data.data?.user);
          onClose();
          window.location.reload();
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSuccess = (result: any) => {
    setSuccessMsg("Authentication successful! Redirecting...");
    setTimeout(() => {
      if (onSuccess) onSuccess(result.authResult?.user);
      onClose();
      window.location.reload();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition-colors"
        >
          <X size={18} />
        </button>

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <AlgoraLogo size={32} />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {mode === "login" ? "Sign in to Algora" : "Create your Algora account"}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {mode === "login"
              ? "Access problems, AI guidance, and competitive contests"
              : "Master DSA, compete globally, and get AI-assisted mentoring"}
          </p>
        </div>

        {/* OAuth 2.0 Buttons */}
        <OAuthButtons
          action="login"
          onSuccess={handleOAuthSuccess}
          onError={(err) => setError(err)}
          className="mb-5"
        />

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="w-full border-t border-[var(--border)]" />
          <span className="absolute px-3 bg-[var(--bg-surface)] text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Or continue with email
          </span>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" ? (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-canvas)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Username
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alex_coder"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-canvas)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Email or Username
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                <input
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="name@example.com or handle"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-canvas)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3 text-[var(--text-muted)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-canvas)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-5 text-center text-xs text-[var(--text-muted)]">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className="text-indigo-400 hover:underline font-semibold"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="text-indigo-400 hover:underline font-semibold"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
