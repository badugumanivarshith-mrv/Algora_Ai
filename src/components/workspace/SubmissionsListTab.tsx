import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  RotateCcw,
  Code,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  FileCode2,
  Copy,
  Check,
} from "lucide-react";
import type { SubmissionRecord, SupportedLanguage } from "../../types";

interface SubmissionsListTabProps {
  submissions: SubmissionRecord[];
  currentLanguage: SupportedLanguage;
  onLoadCode: (code: string, language: SupportedLanguage) => void;
  onSelectProblem?: (slug: string) => void;
}

export default function SubmissionsListTab({
  submissions,
  onLoadCode,
}: SubmissionsListTabProps) {
  const [expandedSubId, setExpandedSubId] = useState<string | null>(
    submissions.length > 0 ? submissions[0].id : null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getStatusBadge = (status: SubmissionRecord["status"]) => {
    switch (status) {
      case "Accepted":
        return {
          bg: "var(--green-light)",
          color: "var(--green)",
          border: "1px solid rgba(22, 163, 74, 0.3)",
          icon: <CheckCircle2 size={13} />,
        };
      case "Wrong Answer":
        return {
          bg: "var(--red-light)",
          color: "var(--red)",
          border: "1px solid rgba(220, 38, 38, 0.3)",
          icon: <XCircle size={13} />,
        };
      case "Time Limit Exceeded":
        return {
          bg: "var(--amber-light)",
          color: "var(--amber)",
          border: "1px solid rgba(217, 119, 6, 0.3)",
          icon: <Clock size={13} />,
        };
      case "Compilation Error":
      case "Runtime Error":
        return {
          bg: "rgba(147, 51, 234, 0.1)",
          color: "#9333ea",
          border: "1px solid rgba(147, 51, 234, 0.3)",
          icon: <AlertTriangle size={13} />,
        };
      default:
        return {
          bg: "var(--bg-raised)",
          color: "var(--text-secondary)",
          border: "1px solid var(--border)",
          icon: <Clock size={13} />,
        };
    }
  };

  if (submissions.length === 0) {
    return (
      <div
        style={{
          padding: "36px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          height: "100%",
          color: "var(--text-muted)",
        }}
      >
        <FileCode2 size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
        <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>
          No Submissions Yet
        </h4>
        <p style={{ fontSize: 13, margin: 0, maxWidth: 300, lineHeight: 1.5 }}>
          Submit your solution to record evaluation traces, runtime percentiles, and testcase diagnostics.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12, height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Submission History ({submissions.length})
        </h4>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {submissions.filter((s) => s.status === "Accepted").length} Accepted
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {submissions.map((sub) => {
          const isExpanded = expandedSubId === sub.id;
          const badge = getStatusBadge(sub.status);

          return (
            <div
              key={sub.id}
              style={{
                borderRadius: "var(--radius-md)",
                border: isExpanded ? "1px solid var(--border-strong)" : "1px solid var(--border)",
                background: "var(--bg-surface)",
                overflow: "hidden",
                transition: "border-color 0.15s ease",
              }}
            >
              {/* Header Row */}
              <div
                onClick={() => setExpandedSubId(isExpanded ? null : sub.id)}
                style={{
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  background: isExpanded ? "var(--bg-raised)" : "var(--bg-surface)",
                  userSelect: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 8px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      background: badge.bg,
                      color: badge.color,
                      border: badge.border,
                    }}
                  >
                    {badge.icon}
                    {sub.status}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                    {sub.language}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: "var(--text-muted)" }}>
                  {sub.status === "Accepted" && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "var(--text-secondary)" }}>
                      <Clock size={12} /> {sub.runtimeMs} ms
                    </span>
                  )}
                  {sub.status === "Accepted" && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "var(--text-secondary)" }}>
                      <Zap size={12} /> {sub.memoryMb} MB
                    </span>
                  )}
                  <span>{sub.timestamp}</span>
                </div>
              </div>

              {/* Expanded Detail Body */}
              {isExpanded && (
                <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Performance stats row */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
                    <div style={{ padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--bg-canvas)", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Testcases</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                        {sub.passedTests} / {sub.totalTests} passed
                      </div>
                    </div>
                    <div style={{ padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--bg-canvas)", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Runtime</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                        {sub.runtimeMs} ms
                        {sub.runtimePercentile > 0 && (
                          <span style={{ fontSize: 11, color: "var(--green)", marginLeft: 4 }}>
                            (Beats {sub.runtimePercentile}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--bg-canvas)", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Memory</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                        {sub.memoryMb} MB
                        {sub.memoryPercentile > 0 && (
                          <span style={{ fontSize: 11, color: "var(--green)", marginLeft: 4 }}>
                            (Beats {sub.memoryPercentile}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Error display if any */}
                  {sub.errorMessage && (
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--red-light)",
                        border: "1px solid rgba(220, 38, 38, 0.3)",
                        color: "var(--red)",
                        fontSize: 12,
                        fontFamily: "var(--font-mono)",
                        lineHeight: 1.4,
                      }}
                    >
                      {sub.errorMessage}
                    </div>
                  )}

                  {sub.compilationError && (
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(147, 51, 234, 0.1)",
                        border: "1px solid rgba(147, 51, 234, 0.3)",
                        color: "#9333ea",
                        fontSize: 12,
                        fontFamily: "var(--font-mono)",
                        lineHeight: 1.4,
                      }}
                    >
                      {sub.compilationError}
                    </div>
                  )}

                  {/* Code Snippet Box */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Code size={12} /> Submitted Code ({sub.language})
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button
                          onClick={() => handleCopy(sub.id, sub.code)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 8px",
                            borderRadius: "var(--radius-sm)",
                            fontSize: 11,
                            background: "transparent",
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                          }}
                        >
                          {copiedId === sub.id ? <Check size={11} /> : <Copy size={11} />}
                          {copiedId === sub.id ? "Copied" : "Copy"}
                        </button>
                        <button
                          onClick={() => onLoadCode(sub.code, sub.language)}
                          className="btn btn-primary btn-sm"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            padding: "3px 8px",
                          }}
                        >
                          <RotateCcw size={11} /> Load in Editor
                        </button>
                      </div>
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: "10px 12px",
                        background: "var(--bg-canvas)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: 12,
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-primary)",
                        overflowX: "auto",
                        maxHeight: 220,
                        lineHeight: 1.45,
                      }}
                    >
                      <code>{sub.code}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
