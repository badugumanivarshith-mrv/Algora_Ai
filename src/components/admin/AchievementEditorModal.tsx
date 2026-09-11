import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Award } from "lucide-react";
import { AchievementCMSEntity } from "../../types";
import { AdminApi } from "../../services/adminApi";

interface AchievementEditorModalProps {
  achievement: AchievementCMSEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (saved: AchievementCMSEntity) => void;
}

export default function AchievementEditorModal({
  achievement,
  isOpen,
  onClose,
  onSave,
}: AchievementEditorModalProps) {
  const [badgeCode, setBadgeCode] = useState("");
  const [badgeName, setBadgeName] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("Award");
  const [xpReward, setXpReward] = useState(100);
  const [category, setCategory] = useState<AchievementCMSEntity["category"]>("problem_solving");
  const [unlockCondition, setUnlockCondition] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (achievement) {
      setBadgeCode(achievement.badgeCode);
      setBadgeName(achievement.badgeName);
      setDescription(achievement.description);
      setIconName(achievement.iconName || "Award");
      setXpReward(achievement.xpReward);
      setCategory(achievement.category);
      setUnlockCondition(achievement.unlockCondition);
      setIsPublished(achievement.isPublished);
    } else {
      setBadgeCode("ALGORITHM_EXPLORER");
      setBadgeName("Algorithm Explorer");
      setDescription("Solve algorithmic problems across 5 different foundational topics.");
      setIconName("Compass");
      setXpReward(150);
      setCategory("problem_solving");
      setUnlockCondition("Solve at least 1 problem each in 5 distinct topic categories.");
      setIsPublished(true);
    }
    setError(null);
  }, [achievement, isOpen]);

  const handleSave = async () => {
    if (!badgeCode.trim() || !badgeName.trim()) {
      setError("Badge code and name are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload: Partial<AchievementCMSEntity> = {
      badgeCode: badgeCode.toUpperCase().replace(/\s+/g, "_"),
      badgeName,
      description,
      iconName,
      xpReward: Number(xpReward),
      category,
      unlockCondition,
      isPublished,
    };

    try {
      if (achievement?.id) {
        const res = await AdminApi.updateAchievement(achievement.id, payload);
        if (res.success && res.data) {
          onSave(res.data);
          onClose();
        } else {
          setError(res.error?.message || "Failed to update achievement.");
        }
      } else {
        const res = await AdminApi.createAchievement(payload);
        if (res.success && res.data) {
          onSave(res.data);
          onClose();
        } else {
          setError(res.error?.message || "Failed to create achievement.");
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg, 12px)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "var(--radius-md)",
                background: "color-mix(in srgb, var(--amber, #f59e0b) 15%, transparent)",
                color: "var(--amber, #f59e0b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Award size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                {achievement ? `Edit Badge: ${achievement.badgeName}` : "Create New Achievement Badge"}
              </h2>
              <p style={{ fontSize: 12, margin: 0, color: "var(--text-muted)" }}>
                Define unlock trigger criteria, badge visual code, and gamification XP value
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 20px",
              background: "color-mix(in srgb, var(--red, #ef4444) 15%, transparent)",
              borderBottom: "1px solid color-mix(in srgb, var(--red, #ef4444) 30%, transparent)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "var(--red, #ef4444)",
            }}
          >
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Badge Name *
              </label>
              <input
                type="text"
                value={badgeName}
                onChange={(e) => setBadgeName(e.target.value)}
                placeholder="e.g. Master DP Solver"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Badge Code (Unique Identifier) *
              </label>
              <input
                type="text"
                value={badgeCode}
                onChange={(e) => setBadgeCode(e.target.value)}
                placeholder="MASTER_DP_SOLVER"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  fontFamily: "var(--font-mono, monospace)",
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                }}
              >
                <option value="problem_solving">Problem Solving</option>
                <option value="streak">Daily Streak</option>
                <option value="contest">Contests & Battles</option>
                <option value="learning">Learning & Tracks</option>
                <option value="social">Community & Social</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                XP Reward
              </label>
              <input
                type="number"
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                min={25}
                step={25}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Status
              </label>
              <select
                value={isPublished ? "published" : "hidden"}
                onChange={(e) => setIsPublished(e.target.value === "published")}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                }}
              >
                <option value="published">Published</option>
                <option value="hidden">Hidden / Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
              Badge Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: 13,
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
              Automated Unlock Condition Rule
            </label>
            <input
              type="text"
              value={unlockCondition}
              onChange={(e) => setUnlockCondition(e.target.value)}
              placeholder="e.g. Solve 10 problems tagged with Dynamic Programming"
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: 13,
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 10,
            background: "var(--bg-subtle)",
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "7px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--bg-surface)",
              color: "var(--text-secondary)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "var(--brand)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            <Save size={14} />
            <span>{loading ? "Saving..." : achievement ? "Save Badge" : "Create Badge"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
