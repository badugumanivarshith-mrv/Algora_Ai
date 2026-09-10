import { useState } from "react";
import { Trophy, CheckCircle2, ChevronRight, Zap, Target, BookOpen, Flame } from "lucide-react";
import type { LearningPath } from "../../types";

interface LearningPathViewProps {
  paths: LearningPath[];
  onSelectTopic?: (topicId: string) => void;
}

export default function LearningPathView({ paths }: LearningPathViewProps) {
  const [selectedPathId, setSelectedPathId] = useState<string>(paths[0]?.id || "dsa-interview");

  const currentPath = paths.find((p) => p.id === selectedPathId) || paths[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Overall Progress Tracker Hero Card */}
      <div
        className="surface-card"
        style={{
          padding: 22,
          background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-subtle) 100%)",
          border: "1px solid var(--border)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "var(--blue-light)",
              color: "var(--blue)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BookOpen size={20} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>150+</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Curriculum Problems</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "var(--green-light)",
              color: "var(--green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>101</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Problems Mastered</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "var(--amber-light)",
              color: "var(--amber)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Flame size={20} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>28 Days</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Active Daily Streak</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "rgba(124, 58, 237, 0.1)",
              color: "var(--violet)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trophy size={20} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>4,820 XP</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Total Earned XP</div>
          </div>
        </div>
      </div>

      {/* Path Selector Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        {paths.map((path) => {
          const isSelected = path.id === selectedPathId;
          return (
            <div
              key={path.id}
              onClick={() => setSelectedPathId(path.id)}
              className="surface-card"
              style={{
                padding: 18,
                cursor: "pointer",
                border: "1px solid",
                borderColor: isSelected ? "var(--blue)" : "var(--border)",
                background: isSelected ? "var(--bg-raised)" : "var(--bg-surface)",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span className="badge badge-blue" style={{ fontSize: 10 }}>
                  ROADMAP PATH
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--blue)" }}>
                  {path.progress}% Complete
                </span>
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>
                {path.title}
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 14px", lineHeight: 1.5 }}>
                {path.description}
              </p>

              <div className="progress">
                <div className="progress-fill" style={{ width: `${path.progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Topics breakdown of selected path */}
      {currentPath && (
        <div className="surface-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>
            Topics in {currentPath.title}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
            {currentPath.topics.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: 14,
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{t.title}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--blue)" }}>{t.progress}%</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 8 }}>
                  {t.completedProblems} of {t.totalProblems} problems solved
                </div>
                <div className="progress">
                  <div className="progress-fill" style={{ width: `${t.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
