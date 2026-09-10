import { useState } from "react";
import { Play, Send, Plus, CheckCircle2, XCircle } from "lucide-react";
import type { TestCase } from "../../types";

interface TestCasesPanelProps {
  testCases: TestCase[];
  isRunning: boolean;
  isSubmitting: boolean;
  onRunCode: () => void;
  onSubmitCode: () => void;
  hasRun?: boolean;
}

export default function TestCasesPanel({
  testCases,
  isRunning,
  isSubmitting,
  onRunCode,
  onSubmitCode,
}: TestCasesPanelProps) {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [customInput, setCustomInput] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const activeCase = testCases[selectedCaseIdx];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg-surface)",
      }}
    >
      {/* Testcase Tabs Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
          padding: "6px 12px",
          background: "var(--bg-surface)",
          flexShrink: 0,
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, overflowX: "auto" }}>
          {testCases.map((tc, idx) => {
            const isActive = !isCustom && selectedCaseIdx === idx;
            return (
              <button
                key={tc.id}
                onClick={() => {
                  setSelectedCaseIdx(idx);
                  setIsCustom(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 500,
                  border: "1px solid",
                  borderColor: isActive ? "var(--border-strong)" : "transparent",
                  background: isActive ? "var(--bg-raised)" : "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                {tc.passed !== undefined && (
                  tc.passed ? (
                    <CheckCircle2 size={12} style={{ color: "var(--green)" }} />
                  ) : (
                    <XCircle size={12} style={{ color: "var(--red)" }} />
                  )
                )}
                Case {idx + 1}
              </button>
            );
          })}

          <button
            onClick={() => setIsCustom(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "5px 10px",
              borderRadius: "var(--radius-sm)",
              fontSize: 12,
              fontWeight: isCustom ? 600 : 500,
              border: "1px solid",
              borderColor: isCustom ? "var(--border-strong)" : "transparent",
              background: isCustom ? "var(--bg-raised)" : "transparent",
              color: isCustom ? "var(--text-primary)" : "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            <Plus size={12} /> Custom
          </button>
        </div>

        {/* Action buttons: Run & Submit */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={onRunCode}
            disabled={isRunning || isSubmitting}
            className="btn btn-secondary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <Play size={12} />
            {isRunning ? "Running..." : "Run"}
          </button>

          <button
            onClick={onSubmitCode}
            disabled={isRunning || isSubmitting}
            className="btn btn-primary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <Send size={12} />
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {/* Case content */}
      <div style={{ flex: 1, padding: 14, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        {isCustom ? (
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
              CUSTOM INPUT
            </label>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. nums = [1, 2, 3], target = 4"
              rows={4}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: "var(--bg-raised)",
                color: "var(--text-primary)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>
        ) : activeCase ? (
          <>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                INPUT
              </span>
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "var(--text-primary)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {activeCase.input}
              </div>
            </div>

            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                EXPECTED OUTPUT
              </span>
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "var(--text-primary)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {activeCase.expectedOutput}
              </div>
            </div>

            {activeCase.actualOutput && (
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: activeCase.passed ? "var(--green)" : "var(--red)",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  YOUR OUTPUT ({activeCase.passed ? "Passed" : "Failed"})
                </span>
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: activeCase.passed ? "var(--green-light)" : "var(--red-light)",
                    border: `1px solid ${activeCase.passed ? "var(--green)" : "var(--red)"}`,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    color: "var(--text-primary)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {activeCase.actualOutput}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
