/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Authentication & Guest Mode Modal
 */

import React, { useState } from "react";
import { X, Mail, Lock, User as UserIcon, Building2, Target, ArrowRight, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register" | "guest";
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, initialMode = "login", onSuccess }: AuthModalProps) {
  const { login, register, continueAsGuest, authError, clearError } = useAuth();
  const [mode, setMode] = useState<"login" | "register" | "guest">(initialMode);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("IIT Bombay");
  const [targetCompany, setTargetCompany] = useState("Google");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    clearError();

    let success = false;
    if (mode === "login") {
      success = await login(email, password);
    } else if (mode === "register") {
      success = await register(name, email, password, college, targetCompany);
    }

    setSubmitting(false);
    if (success) {
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(6, 8, 15, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-xl)",
          overflow: "hidden",
          animation: "scaleIn 0.2s ease forwards",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              A
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              {mode === "login" ? "Sign In to ALGORA" : mode === "register" ? "Create ALGORA Account" : "Guest Access"}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 2,
            padding: 6,
            background: "var(--bg-subtle)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <button
            onClick={() => { setMode("login"); clearError(); }}
            style={{
              padding: "7px 0",
              borderRadius: "var(--radius-md)",
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              background: mode === "login" ? "var(--bg-raised)" : "transparent",
              color: mode === "login" ? "var(--blue)" : "var(--text-muted)",
              boxShadow: mode === "login" ? "var(--shadow-xs)" : "none",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Sign In
          </button>

          <button
            onClick={() => { setMode("register"); clearError(); }}
            style={{
              padding: "7px 0",
              borderRadius: "var(--radius-md)",
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              background: mode === "register" ? "var(--bg-raised)" : "transparent",
              color: mode === "register" ? "var(--blue)" : "var(--text-muted)",
              boxShadow: mode === "register" ? "var(--shadow-xs)" : "none",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Register
          </button>

          <button
            onClick={() => { setMode("guest"); clearError(); }}
            style={{
              padding: "7px 0",
              borderRadius: "var(--radius-md)",
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              background: mode === "guest" ? "var(--bg-raised)" : "transparent",
              color: mode === "guest" ? "var(--amber)" : "var(--text-muted)",
              boxShadow: mode === "guest" ? "var(--shadow-xs)" : "none",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Guest Mode
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: 20 }}>
          {authError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                background: "var(--red-light)",
                color: "var(--red)",
                fontSize: 12,
                marginBottom: 16,
                border: "1px solid color-mix(in srgb, var(--red) 30%, transparent)",
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          {mode === "guest" ? (
            <div>
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--amber)", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                  <ShieldCheck size={16} />
                  <span>Free Guest Browsing</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                  In Guest Mode, you can browse all learning tracks, inspect problems, explore projects, and try the AI Mentor. Your progress, submissions, and analytics will not be saved across sessions.
                </p>
              </div>

              <button
                onClick={handleGuest}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: "linear-gradient(135deg, #d97706, #ea580c)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span>Continue as Guest</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {mode === "register" && (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                    Full Name
                  </label>
                  <div style={{ position: "relative" }}>
                    <UserIcon size={14} style={{ position: "absolute", left: 10, top: 11, color: "var(--text-muted)" }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px 9px 32px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={14} style={{ position: "absolute", left: 10, top: 11, color: "var(--text-muted)" }} />
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px 9px 32px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={14} style={{ position: "absolute", left: 10, top: 11, color: "var(--text-muted)" }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px 9px 32px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {mode === "register" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                      College / Institution
                    </label>
                    <select
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        fontSize: 12,
                      }}
                    >
                      <option value="IIT Bombay">IIT Bombay</option>
                      <option value="IIT Delhi">IIT Delhi</option>
                      <option value="NIT Trichy">NIT Trichy</option>
                      <option value="BITS Pilani">BITS Pilani</option>
                      <option value="VIT Vellore">VIT Vellore</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Target Company
                    </label>
                    <select
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        fontSize: 12,
                      }}
                    >
                      <option value="Google">Google</option>
                      <option value="Amazon">Amazon</option>
                      <option value="Microsoft">Microsoft</option>
                      <option value="Adobe">Adobe</option>
                      <option value="Oracle">Oracle</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 6,
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                <span>{submitting ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
