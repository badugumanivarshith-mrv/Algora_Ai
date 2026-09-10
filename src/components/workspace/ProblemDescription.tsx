import { useState } from "react";
import { Lightbulb, ChevronDown, ChevronRight, Copy, Check, AlertCircle, Tag } from "lucide-react";
import type { Problem } from "../../types";

interface ProblemDescriptionProps {
  problem: Problem;
}

export default function ProblemDescription({ problem }: ProblemDescriptionProps) {
  const [unlockedHints, setUnlockedHints] = useState<number[]>([0]);
  const [copiedExampleIndex, setCopiedExampleIndex] = useState<number | null>(null);

  const toggleHint = (index: number) => {
    if (unlockedHints.includes(index)) {
      setUnlockedHints(unlockedHints.filter((h) => h !== index));
    } else {
      setUnlockedHints([...unlockedHints, index]);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedExampleIndex(index);
    setTimeout(() => setCopiedExampleIndex(null), 1800);
  };

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Description */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
          {problem.title}
        </h2>
        <div
          style={{
            fontSize: 13.5,
            lineHeight: 1.7,
            color: "var(--text-secondary)",
          }}
          dangerouslySetInnerHTML={{ __html: problem.description }}
        />
      </div>

      {/* Examples Section */}
      <div>
        <h3
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 12,
            letterSpacing: "-0.01em",
          }}
        >
          Examples
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {problem.examples.map((example, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "14px",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                  Example {idx + 1}
                </span>
                <button
                  onClick={() => handleCopy(`Input: ${example.input}\nOutput: ${example.output}`, idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                  title="Copy example"
                >
                  {copiedExampleIndex === idx ? (
                    <>
                      <Check size={12} style={{ color: "var(--green)" }} />
                      <span style={{ color: "var(--green)" }}>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                }}
              >
                <div>
                  <strong style={{ color: "var(--text-muted)" }}>Input: </strong>
                  <code>{example.input}</code>
                </div>
                <div>
                  <strong style={{ color: "var(--text-muted)" }}>Output: </strong>
                  <code>{example.output}</code>
                </div>
                {example.explanation && (
                  <div style={{ marginTop: 6, color: "var(--text-muted)", fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
                    <strong>Explanation: </strong>
                    {example.explanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Constraints Section */}
      <div>
        <h3
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <AlertCircle size={14} style={{ color: "var(--amber)" }} />
          Constraints
        </h3>
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            fontSize: 12.5,
            color: "var(--text-secondary)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {problem.constraints.map((c, idx) => (
            <li key={idx}>{c}</li>
          ))}
        </ul>
      </div>

      {/* Hints Section */}
      <div>
        <h3
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Lightbulb size={14} style={{ color: "var(--blue)" }} />
          Progressive Hints ({problem.hints.length})
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {problem.hints.map((hint, idx) => {
            const isOpen = unlockedHints.includes(idx);
            return (
              <div
                key={idx}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-surface)",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => toggleHint(idx)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    textAlign: "left",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "var(--blue-light)",
                        color: "var(--blue)",
                        fontSize: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                      }}
                    >
                      {idx + 1}
                    </span>
                    Hint {idx + 1}
                  </span>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: "10px 14px 14px 38px",
                      fontSize: 12.5,
                      lineHeight: 1.6,
                      color: "var(--text-secondary)",
                      borderTop: "1px solid var(--border-subtle)",
                      background: "var(--bg-raised)",
                    }}
                  >
                    {hint}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-muted)",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Tag size={12} /> Tags & Topic
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <span className="badge badge-blue">{problem.topic}</span>
          {problem.tags.map((tag) => (
            <span key={tag} className="badge badge-neutral">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
