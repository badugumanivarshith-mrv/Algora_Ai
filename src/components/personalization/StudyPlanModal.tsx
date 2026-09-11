import React, { useState } from "react";
import { X, Target, Calendar, Clock, Sparkles, Check, BookOpen } from "lucide-react";
import { StudyPlanType, StudyPlanDifficulty } from "../../types";

interface StudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    planType: StudyPlanType;
    title?: string;
    description?: string;
    targetRoleCompany?: string;
    difficulty?: StudyPlanDifficulty;
    durationWeeks?: number;
    dailyMinutesTarget?: number;
  }) => Promise<void>;
}

const PLAN_TYPES: { type: StudyPlanType; desc: string; defaultWeeks: number; icon: string }[] = [
  {
    type: "DSA Mastery",
    desc: "Comprehensive coverage of all standard DSA patterns, trees, graphs, and dynamic programming.",
    defaultWeeks: 6,
    icon: "⚡",
  },
  {
    type: "Interview Preparation",
    desc: "Curated high-frequency FAANG and top-tier product company technical questions.",
    defaultWeeks: 4,
    icon: "💼",
  },
  {
    type: "Competitive Programming",
    desc: "Speed, fast I/O, advanced graph theory, and mathematical optimization for weekly contests.",
    defaultWeeks: 8,
    icon: "🏆",
  },
  {
    type: "Beginner Roadmap",
    desc: "Step-by-step foundation building starting from arrays, strings, recursion, and basic math.",
    defaultWeeks: 4,
    icon: "🌱",
  },
  {
    type: "Company Preparation",
    desc: "Targeted company question banks (Google, Amazon, Microsoft, Uber, Meta, Bloomberg).",
    defaultWeeks: 3,
    icon: "🏢",
  },
];

export default function StudyPlanModal({ isOpen, onClose, onSubmit }: StudyPlanModalProps) {
  const [planType, setPlanType] = useState<StudyPlanType>("DSA Mastery");
  const [title, setTitle] = useState("");
  const [targetCompany, setTargetCompany] = useState("FAANG / Top Product Companies");
  const [difficulty, setDifficulty] = useState<StudyPlanDifficulty>("Intermediate");
  const [durationWeeks, setDurationWeeks] = useState(6);
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        planType,
        title: title.trim() || `${planType} - ${targetCompany}`,
        targetRoleCompany: targetCompany,
        difficulty,
        durationWeeks,
        dailyMinutesTarget: dailyMinutes,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="surface-card"
        style={{
          width: "100%",
          maxWidth: "580px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-xl)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-md)",
                background: "rgba(0,212,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--brand-primary)",
              }}
            >
              <Target size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Create Personalized Study Plan
              </h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                Tailor an adaptive curriculum to your exact target & velocity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Plan Type Selection */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>
              Select Track / Focus
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {PLAN_TYPES.map((pt) => {
                const isSelected = planType === pt.type;
                return (
                  <div
                    key={pt.type}
                    onClick={() => {
                      setPlanType(pt.type);
                      setDurationWeeks(pt.defaultWeeks);
                    }}
                    style={{
                      padding: "12px",
                      borderRadius: "var(--radius-md)",
                      border: isSelected ? "1.5px solid var(--brand-primary)" : "1px solid var(--border)",
                      background: isSelected ? "rgba(0,212,255,0.06)" : "var(--bg-raised)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {pt.icon} {pt.type}
                      </span>
                      {isSelected && <Check size={14} color="var(--brand-primary)" />}
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                      {pt.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Target Role or Company */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
              Target Role / Company
            </label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="e.g. Google SDE II, Amazon, Stripe, General FAANG"
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: "13px",
              }}
            />
          </div>

          {/* Difficulty & Timing Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                Difficulty Baseline
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as StudyPlanDifficulty)}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "12px",
                }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                Duration (Weeks)
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "12px",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                Daily Target (Mins)
              </label>
              <input
                type="number"
                min={15}
                max={240}
                step={15}
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "12px",
                }}
              />
            </div>
          </div>

          {/* AI Scaffolding note */}
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: "rgba(124, 58, 237, 0.08)",
              border: "1px solid rgba(124, 58, 237, 0.25)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "12px",
              color: "var(--text-secondary)",
            }}
          >
            <Sparkles size={16} color="var(--violet)" style={{ flexShrink: 0 }} />
            <span>
              Algora will automatically adapt milestone problems as your daily accuracy and topic velocity change.
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: "8px 16px", fontSize: "13px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ padding: "8px 18px", fontSize: "13px", gap: "6px" }}
            >
              <Sparkles size={14} />
              {isSubmitting ? "Generating Plan..." : "Generate Adaptive Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
