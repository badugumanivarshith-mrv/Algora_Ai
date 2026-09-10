import { CheckCircle2, XCircle, Clock, Zap, Database, Trophy, ArrowRight } from "lucide-react";
import type { UserSubmissionResult } from "../../types";

interface SubmissionResultsPanelProps {
  result: UserSubmissionResult | null;
  onGoToNextProblem?: () => void;
}

export default function SubmissionResultsPanel({
  result,
  onGoToNextProblem,
}: SubmissionResultsPanelProps) {
  if (!result) {
    return (
      <div
        style={{
          padding: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "var(--text-muted)",
          textAlign: "center",
        }}
      >
        <Zap size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
        <p style={{ fontSize: 13, margin: 0 }}>Click "Submit" to validate all test cases and view performance metrics.</p>
      </div>
    );
  }

  const isAccepted = result.status === "Accepted";

  return (
    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", height: "100%" }}>
      {/* Verdict Banner */}
      <div
        style={{
          padding: 16,
          borderRadius: "var(--radius-md)",
          background: isAccepted ? "var(--green-light)" : "var(--red-light)",
          border: `1px solid ${isAccepted ? "var(--green)" : "var(--red)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isAccepted ? (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--green)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={18} />
            </div>
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--red)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XCircle size={18} />
            </div>
          )}
          <div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: isAccepted ? "var(--green)" : "var(--red)",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {result.status}
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
              {result.passedCount} / {result.totalCount} test cases passed
            </p>
          </div>
        </div>

        {isAccepted && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              className="badge"
              style={{
                background: "var(--amber-light)",
                color: "var(--amber)",
                padding: "4px 8px",
                fontSize: 12,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontWeight: 700,
              }}
            >
              <Trophy size={13} /> +100 XP Earned
            </span>
            {onGoToNextProblem && (
              <button
                onClick={onGoToNextProblem}
                className="btn btn-primary btn-sm"
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                Next Problem <ArrowRight size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Metrics Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Runtime */}
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
            <Clock size={12} />
            <span>Runtime</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            {result.runtimeMs} ms
          </div>
          <div style={{ fontSize: 11, color: "var(--green)", marginTop: 2, fontWeight: 600 }}>
            Beats 88.4% of submissions
          </div>
        </div>

        {/* Memory */}
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
            <Database size={12} />
            <span>Memory</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            {result.memoryMb} MB
          </div>
          <div style={{ fontSize: 11, color: "var(--blue)", marginTop: 2, fontWeight: 600 }}>
            Beats 76.1% of submissions
          </div>
        </div>
      </div>

      {/* Test Case Breakdown */}
      <div>
        <h4 style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
          Test Case Breakdown
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {result.testCases.map((tc, idx) => (
            <div
              key={tc.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                fontSize: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {tc.passed ? (
                  <CheckCircle2 size={14} style={{ color: "var(--green)" }} />
                ) : (
                  <XCircle size={14} style={{ color: "var(--red)" }} />
                )}
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Case {idx + 1}</span>
                <span style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                  {tc.input.length > 30 ? tc.input.slice(0, 30) + "..." : tc.input}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--text-muted)" }}>
                <span>{tc.runtimeMs ?? 4} ms</span>
                <span className={`badge ${tc.passed ? "badge-green" : "badge-red"}`} style={{ fontSize: 10 }}>
                  {tc.passed ? "Passed" : "Failed"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
