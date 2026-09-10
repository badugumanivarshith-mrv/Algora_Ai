import { useState } from "react";
import { ChevronDown, CheckCircle2, Trophy, ArrowLeft } from "lucide-react";
import type { Problem } from "../../types";

interface ProblemHeaderProps {
  currentProblem: Problem;
  allProblems: Problem[];
  onSelectProblem: (problem: Problem) => void;
  onBackToExplorer?: () => void;
}

export default function ProblemHeader({
  currentProblem,
  allProblems,
  onSelectProblem,
  onBackToExplorer,
}: ProblemHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const diffClass =
    currentProblem.difficulty === "Easy"
      ? "diff-easy"
      : currentProblem.difficulty === "Medium"
      ? "diff-medium"
      : "diff-hard";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-surface)",
        flexShrink: 0,
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      {/* Left: Back & Problem Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
        {onBackToExplorer && (
          <button
            onClick={onBackToExplorer}
            title="Back to Problems"
            className="btn btn-ghost"
            style={{ padding: "5px 8px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
          >
            <ArrowLeft size={14} />
            <span className="hide-mobile">Problems</span>
          </button>
        )}

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontFamily: "inherit",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>
              {currentProblem.id}. {currentProblem.title}
            </span>
            <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: 4,
                width: 300,
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                zIndex: 50,
                maxHeight: 280,
                overflowY: "auto",
                padding: "4px",
              }}
            >
              {allProblems.map((p) => {
                const isCurrent = p.id === currentProblem.id;
                const badgeCn =
                  p.difficulty === "Easy" ? "diff-easy" : p.difficulty === "Medium" ? "diff-medium" : "diff-hard";
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProblem(p);
                      setDropdownOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "8px 10px",
                      background: isCurrent ? "var(--blue-light)" : "transparent",
                      color: isCurrent ? "var(--blue)" : "var(--text-primary)",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      fontSize: 12.5,
                      fontWeight: isCurrent ? 600 : 400,
                      textAlign: "left",
                    }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.id}. {p.title}
                    </span>
                    <span className={`badge ${badgeCn}`} style={{ fontSize: 10 }}>
                      {p.difficulty}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <span className={`badge ${diffClass}`}>{currentProblem.difficulty}</span>

        {currentProblem.solved && (
          <span
            className="badge badge-green"
            style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11 }}
          >
            <CheckCircle2 size={11} /> Solved
          </span>
        )}
      </div>

      {/* Right: Meta Badges (Acceptance, Topic, XP Reward) */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--text-muted)" }}>
        <span className="hide-mobile">
          Acceptance: <strong style={{ color: "var(--text-primary)" }}>{currentProblem.acceptance}</strong>
        </span>
        <span className="hide-mobile" style={{ color: "var(--border)" }}>|</span>
        <span className="hide-mobile" style={{ background: "var(--bg-subtle)", padding: "3px 8px", borderRadius: "var(--radius-sm)" }}>
          {currentProblem.topic}
        </span>
        <span
          className="badge"
          style={{
            background: "var(--amber-light)",
            color: "var(--amber)",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontWeight: 700,
          }}
        >
          <Trophy size={11} /> +{currentProblem.xpReward} XP
        </span>
      </div>
    </div>
  );
}
