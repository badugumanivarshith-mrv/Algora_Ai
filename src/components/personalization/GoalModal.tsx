import React, { useState } from "react";
import { X, Target, Plus, Flame, Code2, Zap, Clock, Trophy } from "lucide-react";
import { UserGoalType, GoalMetric } from "../../types";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    title: string;
    goalType: UserGoalType;
    targetMetric: GoalMetric;
    targetValue: number;
    unit?: string;
  }) => Promise<void>;
}

const METRICS: { metric: GoalMetric; label: string; unit: string; defaultTarget: number; icon: any }[] = [
  { metric: "problems_solved", label: "Problems Solved", unit: "problems", defaultTarget: 3, icon: Code2 },
  { metric: "xp_earned", label: "XP Earned", unit: "XP", defaultTarget: 250, icon: Zap },
  { metric: "study_time", label: "Practice Time", unit: "minutes", defaultTarget: 45, icon: Clock },
  { metric: "topics_completed", label: "Topic Milestones", unit: "topics", defaultTarget: 1, icon: Target },
  { metric: "contest_count", label: "Contests Participated", unit: "contests", defaultTarget: 1, icon: Trophy },
];

export default function GoalModal({ isOpen, onClose, onSubmit }: GoalModalProps) {
  const [goalType, setGoalType] = useState<UserGoalType>("daily");
  const [metric, setMetric] = useState<GoalMetric>("problems_solved");
  const [targetValue, setTargetValue] = useState<number>(3);
  const [customTitle, setCustomTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentMetricConfig = METRICS.find((m) => m.metric === metric) || METRICS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const defaultTitle = `${goalType === "daily" ? "Daily" : goalType === "weekly" ? "Weekly" : "Monthly"} ${currentMetricConfig.label}: ${targetValue} ${currentMetricConfig.unit}`;
      await onSubmit({
        title: customTitle.trim() || defaultTitle,
        goalType,
        targetMetric: metric,
        targetValue,
        unit: currentMetricConfig.unit,
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
          maxWidth: "500px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-xl)",
          overflow: "hidden",
        }}
      >
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
                background: "rgba(16, 185, 129, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--green)",
              }}
            >
              <Target size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Set Learning Goal
              </h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                Build streak momentum with measurable targets
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

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Goal Frequency */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>
              Goal Frequency
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {(["daily", "weekly", "monthly"] as UserGoalType[]).map((gt) => {
                const isSelected = goalType === gt;
                return (
                  <button
                    type="button"
                    key={gt}
                    onClick={() => setGoalType(gt)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      border: isSelected ? "1.5px solid var(--brand-primary)" : "1px solid var(--border)",
                      background: isSelected ? "rgba(0,212,255,0.08)" : "var(--bg-raised)",
                      color: isSelected ? "var(--brand-primary)" : "var(--text-secondary)",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      cursor: "pointer",
                    }}
                  >
                    {gt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metric Selector */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>
              Target Metric
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {METRICS.map((m) => {
                const isSelected = metric === m.metric;
                const Icon = m.icon;
                return (
                  <div
                    key={m.metric}
                    onClick={() => {
                      setMetric(m.metric);
                      setTargetValue(m.defaultTarget);
                    }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "var(--radius-md)",
                      border: isSelected ? "1.5px solid var(--green)" : "1px solid var(--border)",
                      background: isSelected ? "rgba(16, 185, 129, 0.08)" : "var(--bg-raised)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Icon size={16} color={isSelected ? "var(--green)" : "var(--text-muted)"} />
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Target Value input */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                Target Amount ({currentMetricConfig.unit})
              </label>
              <input
                type="number"
                min={1}
                max={10000}
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
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

            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                Custom Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Master Tree Traversals"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
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
          </div>

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
              <Plus size={14} />
              {isSubmitting ? "Saving..." : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
