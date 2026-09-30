/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Route Protection & Guest Access Enforcement Component
 */

import React, { useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, ArrowRight, Sparkles, UserPlus } from "lucide-react";
import AuthModal from "./AuthModal";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuthUser?: boolean; // Set true for features restricted from guest users
}

export default function ProtectedRoute({ children, requireAuthUser = false }: ProtectedRouteProps) {
  const { user, isGuest, isLoading } = useAuth();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (isLoading) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div className="status-dot status-live" style={{ width: 12, height: 12, margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, fontWeight: 500 }}>Initializing ALGORA Security Session...</p>
        </div>
      </div>
    );
  }

  // If user is neither logged in nor in Guest Mode, redirect to Landing Page
  if (!user && !isGuest) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If feature requires full authenticated user account and user is in Guest Mode
  if (requireAuthUser && isGuest) {
    return (
      <div style={{ padding: 32, maxWidth: 640, margin: "40px auto", textAlign: "center" }}>
        <div
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-xl)",
            padding: 32,
            boxShadow: "var(--shadow-xl)",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "var(--radius-xl)",
              background: "rgba(217, 119, 6, 0.12)",
              color: "var(--amber)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <ShieldAlert size={26} />
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.02em" }}>
            Account Registration Required
          </h2>

          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>
            You are currently in <strong>Guest Mode</strong>. Features like <strong>Daily Spaced Repetition</strong>, <strong>AI Analyst Reports</strong>, <strong>Contest Rankings</strong>, and <strong>Faculty Analytics</strong> require a personal account to track progress and calculate readiness.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                padding: "10px 20px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <UserPlus size={15} />
              <span>Create Free Account</span>
            </button>
          </div>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode="register" />
      </div>
    );
  }

  return <>{children}</>;
}
