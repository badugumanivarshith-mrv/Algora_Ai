import {
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Trophy,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Terminal,
} from "lucide-react";
import type { UserSubmissionResult } from "../../types";

interface SubmissionResultsPanelProps {
  result: UserSubmissionResult | null;
  onGoToNextProblem?: () => void;
  onRetry?: () => void;
}

export default function SubmissionResultsPanel({
  result,
  onGoToNextProblem,
  onRetry,
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
        <p style={{ fontSize: 13, margin: 0 }}>
          Click "Run Code" or "Submit Solution" to evaluate against the online judge testcases.
        </p>
      </div>
    );
  }

  const isAccepted = result.status === "Accepted";
  const isTLE = result.status === "Time Limit Exceeded";
  const isCompilationError = result.status === "Compilation Error";
  const isRuntimeError = result.status === "Runtime Error";

  const getVerdictStyle = () => {
    if (isAccepted) {
      return {
        bg: "var(--green-light)",
        border: "var(--green)",
        color: "var(--green)",
        icon: <CheckCircle2 size={18} />,
      };
    }
    if (isTLE) {
      return {
        bg: "var(--amber-light)",
        border: "var(--amber)",
        color: "var(--amber)",
        icon: <Clock size={18} />,
      };
    }
    if (isCompilationError || isRuntimeError) {
      return {
        bg: "rgba(147, 51, 234, 0.1)",
        border: "rgba(147, 51, 234, 0.4)",
        color: "#9333ea",
        icon: <AlertTriangle size={18} />,
      };
    }
    return {
      bg: "var(--red-light)",
      border: "var(--red)",
      color: "var(--red)",
      icon: <XCircle size={18} />,
    };
  };

  const style = getVerdictStyle();

  return (
    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", height: "100%" }}>
      {/* Verdict Banner */}
      <div
        style={{
          padding: 16,
          borderRadius: "var(--radius-md)",
          background: style.bg,
          border: `1px solid ${style.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: style.color,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {style.icon}
          </div>
          <div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: style.color,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {result.status}
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
              {isCompilationError
                ? "Code could not be compiled"
                : `${result.passedCount} / ${result.totalCount} test cases passed`}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isAccepted && (
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
          )}

          {onRetry && !isAccepted && (
            <button
              onClick={onRetry}
              className="btn btn-secondary btn-sm"
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <RotateCcw size={12} /> Retry
            </button>
          )}

          {isAccepted && onGoToNextProblem && (
            <button
              onClick={onGoToNextProblem}
              className="btn btn-primary btn-sm"
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              Next Problem <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Error or Trace output */}
      {result.compilationError && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-canvas)",
            border: "1px solid rgba(147, 51, 234, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#9333ea", marginBottom: 6 }}>
            <Terminal size={12} /> Compilation Log
          </div>
          <pre style={{ margin: 0, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>
            {result.compilationError}
          </pre>
        </div>
      )}

      {result.errorMessage && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-canvas)",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--red)", marginBottom: 6 }}>
            <AlertTriangle size={12} /> Runtime Error Diagnostic
          </div>
          <pre style={{ margin: 0, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--red)", whiteSpace: "pre-wrap" }}>
            {result.errorMessage}
          </pre>
        </div>
      )}

      {/* Metrics Strip */}
      {!isCompilationError && (
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
            <div
              style={{
                fontSize: 11,
                color: isAccepted ? "var(--green)" : "var(--text-muted)",
                marginTop: 2,
                fontWeight: 600,
              }}
            >
              {result.runtimePercentile
                ? `Beats ${result.runtimePercentile}% of submissions`
                : "Standard benchmark"}
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
              <Zap size={12} />
              <span>Memory Usage</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
              {result.memoryMb} MB
            </div>
            <div
              style={{
                fontSize: 11,
                color: isAccepted ? "var(--green)" : "var(--text-muted)",
                marginTop: 2,
                fontWeight: 600,
              }}
            >
              {result.memoryPercentile
                ? `Beats ${result.memoryPercentile}% of submissions`
                : "Memory within standard limit"}
            </div>
          </div>
        </div>
      )}

      {/* Test Case Inspection Breakdown */}
      {result.testCases && result.testCases.length > 0 && !isCompilationError && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: "4px 0 0" }}>
            Testcase Evaluations
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {result.testCases.map((tc, idx) => (
              <div
                key={tc.id || idx}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-canvas)",
                  border: `1px solid ${tc.passed ? "var(--border)" : "rgba(220, 38, 38, 0.4)"}`,
                  fontSize: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {tc.passed ? (
                      <CheckCircle2 size={13} style={{ color: "var(--green)" }} />
                    ) : (
                      <XCircle size={13} style={{ color: "var(--red)" }} />
                    )}
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                      Test Case {idx + 1}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: tc.passed ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
                    {tc.passed ? "Passed" : isTLE ? "Time Limit Exceeded" : "Failed"}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 6 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Input</div>
                    <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)", fontSize: 11, marginTop: 2 }}>
                      {tc.input}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Expected</div>
                    <div style={{ fontFamily: "var(--font-mono)", color: "var(--green)", fontSize: 11, marginTop: 2 }}>
                      {tc.expectedOutput}
                    </div>
                  </div>
                </div>

                {tc.actualOutput && (
                  <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px dashed var(--border)" }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Actual Output</div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: tc.passed ? "var(--text-primary)" : "var(--red)",
                        fontSize: 11,
                        marginTop: 2,
                      }}
                    >
                      {tc.actualOutput}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
