import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Play, RotateCcw, Send, ChevronDown, Lightbulb, Brain,
  CheckCircle2, XCircle, Clock, BookOpen, Copy, AlertCircle,
} from "lucide-react";

const PROBLEM = {
  id: 5,
  title: "Longest Palindromic Substring",
  difficulty: "Medium",
  acceptance: "33.4%",
  topics: ["String", "Dynamic Programming", "Two Pointers"],
  description: `Given a string <code style="background:var(--bg-muted);padding:1px 5px;border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:12px">s</code>, return the <strong>longest palindromic substring</strong> in <code style="background:var(--bg-muted);padding:1px 5px;border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:12px">s</code>.<br/><br/>A string is palindromic if it reads the same forward and backward.`,
  examples: [
    { input: 's = "babad"', output: '"bab"', note: '"aba" is also valid.' },
    { input: 's = "cbbd"',  output: '"bb"',  note: '' },
  ],
  constraints: ["1 ≤ s.length ≤ 1000", "s consists of digits and English letters."],
};

const CODE = `def longest_palindrome(s: str) -> str:
    if not s:
        return ""

    start, max_len = 0, 1

    def expand(left: int, right: int) -> None:
        nonlocal start, max_len
        while left >= 0 and right < len(s) \\
              and s[left] == s[right]:
            if right - left + 1 > max_len:
                start = left
                max_len = right - left + 1
            left -= 1
            right += 1

    for i in range(len(s)):
        expand(i, i)        # odd-length center
        expand(i, i + 1)    # even-length center

    return s[start : start + max_len]`;

const HINTS = [
  "Think about expanding outward from each character in the string.",
  "A palindrome has a center — either a single character (odd) or between two characters (even). Try both.",
  "For each center position, expand left and right as long as characters match.",
  "This O(n²) expand-around-center beats brute force O(n³) and is the expected solution here.",
];

const TESTS = [
  { input: '"babad"', expected: '"bab"', actual: '"bab"', pass: true,  ms: "12", mem: "14.2" },
  { input: '"cbbd"',  expected: '"bb"',  actual: '"bb"',  pass: true,  ms: "10", mem: "14.0" },
  { input: '"a"',     expected: '"a"',   actual: '"a"',   pass: true,  ms: "8",  mem: "13.8" },
  { input: '"ac"',    expected: '"a"',   actual: '"c"',   pass: false, ms: "—",  mem: "—"    },
];

type LeftTab = "problem" | "hints" | "mentor";
type RightTab = "testcases" | "results";

const TOKENS: [RegExp, string][] = [
  [/\b(def|return|if|not|while|for|in|and|or|nonlocal|class|import|from|True|False|None)\b/, "keyword"],
  [/"[^"]*"|'[^']*'/, "string"],
  [/\b\d+\b/, "number"],
  [/#.*$/, "comment"],
  [/\b([A-Z][a-z_A-Z0-9]*)\b/, "type"],
  [/\b([a-z_][a-z_0-9]*)\s*(?=\()/, "fn"],
];

function syntaxLine(line: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;
  while (remaining.length) {
    let matched = false;
    for (const [rx, cls] of TOKENS) {
      const m = remaining.match(new RegExp(`^(${rx.source})`, "m"));
      if (m) {
        result.push(<span key={key++} className={`editor-${cls}`}>{m[0]}</span>);
        remaining = remaining.slice(m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      result.push(<span key={key++} className="editor-line">{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }
  return result;
}

export default function Workspace() {
  const navigate = useNavigate();
  const [leftTab, setLeftTab] = useState<LeftTab>("problem");
  const [rightTab, setRightTab] = useState<RightTab>("testcases");
  const [hintsOpen, setHintsOpen] = useState(1);
  const [lang, setLang] = useState("Python");
  const [ran, setRan] = useState(false);
  const [mentorMsg, setMentorMsg] = useState("");
  const [mentorLog, setMentorLog] = useState([
    { role: "ai", text: "I see you're working on Longest Palindromic Substring! What approach are you thinking?" },
  ]);

  const run = () => { setRan(true); setRightTab("results"); };

  const sendMentor = () => {
    if (!mentorMsg.trim()) return;
    setMentorLog((l) => [
      ...l,
      { role: "user", text: mentorMsg },
      { role: "ai", text: "Great question! Expand-around-center is the O(n²) approach. You treat each index (and gap between indices) as a potential palindrome center, then expand outward while both sides match." },
    ]);
    setMentorMsg("");
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "var(--bg)" }}>
      {/* ── Left panel ── */}
      <div
        style={{
          width: 380,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--border)",
          background: "var(--bg-surface)",
          overflow: "hidden",
        }}
      >
        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 4px" }}>
          {([
            { key: "problem", label: "Problem", icon: BookOpen },
            { key: "hints",   label: "Hints",   icon: Lightbulb },
            { key: "mentor",  label: "AI Mentor",icon: Brain },
          ] as { key: LeftTab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setLeftTab(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "10px 12px",
                fontSize: 12.5,
                fontWeight: 500,
                fontFamily: "inherit",
                border: "none",
                background: "none",
                color: leftTab === key ? "var(--blue)" : "var(--text-muted)",
                borderBottom: `2px solid ${leftTab === key ? "var(--blue)" : "transparent"}`,
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              <Icon size={12} />
              {label}
              {key === "mentor" && (
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {leftTab === "problem" && (
            <div style={{ padding: "20px 20px" }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{PROBLEM.id}.</span>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                    {PROBLEM.title}
                  </h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="badge diff-medium">{PROBLEM.difficulty}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{PROBLEM.acceptance} acceptance</span>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 18 }}>
                {PROBLEM.topics.map((t) => (
                  <span key={t} className="badge badge-neutral">{t}</span>
                ))}
              </div>

              <p
                style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: 20 }}
                dangerouslySetInnerHTML={{ __html: PROBLEM.description }}
              />

              {PROBLEM.examples.map((ex, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "12px 14px",
                    marginBottom: 10,
                    fontSize: 12,
                  }}
                >
                  <p style={{ fontWeight: 600, color: "var(--text-primary)", margin: "0 0 6px" }}>Example {i + 1}</p>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, lineHeight: 1.7 }}>
                    <div style={{ color: "var(--text-secondary)" }}>
                      <span style={{ color: "var(--text-muted)" }}>Input: </span>{ex.input}
                    </div>
                    <div style={{ color: "var(--text-secondary)" }}>
                      <span style={{ color: "var(--text-muted)" }}>Output: </span>{ex.output}
                    </div>
                    {ex.note && <div style={{ color: "var(--text-muted)", marginTop: 2 }}>Note: {ex.note}</div>}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 18 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>Constraints</p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                  {PROBLEM.constraints.map((c) => (
                    <li key={c} style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: "var(--text-secondary)", display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <span style={{ color: "var(--blue)", marginTop: 1 }}>·</span>{c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {leftTab === "hints" && (
            <div style={{ padding: 20 }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
                Hints are unlocked progressively. Try the problem first.
              </p>
              {HINTS.map((hint, i) => (
                <div
                  key={i}
                  style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", marginBottom: 8, overflow: "hidden" }}
                >
                  <button
                    onClick={() => i < hintsOpen && setHintsOpen(Math.max(hintsOpen, i + 2))}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "var(--bg-subtle)",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>Hint {i + 1}</span>
                    {i >= hintsOpen
                      ? <span className="badge badge-amber">Locked</span>
                      : <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
                    }
                  </button>
                  {i < hintsOpen && (
                    <div style={{ padding: "10px 14px", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      {hint}
                    </div>
                  )}
                </div>
              ))}
              {hintsOpen < HINTS.length && (
                <button
                  onClick={() => setHintsOpen((n) => Math.min(n + 1, HINTS.length))}
                  style={{ fontSize: 12, color: "var(--blue)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit", marginTop: 4 }}
                >
                  <Lightbulb size={12} /> Reveal next hint
                </button>
              )}
            </div>
          )}

          {leftTab === "mentor" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {mentorLog.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      maxWidth: "88%",
                      alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                      padding: "9px 13px",
                      borderRadius: m.role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      background: m.role === "user" ? "var(--blue)" : "var(--bg-subtle)",
                      color: m.role === "user" ? "white" : "var(--text-secondary)",
                      fontSize: 12.5,
                      lineHeight: 1.55,
                    }}
                  >
                    {m.text}
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
                <textarea
                  value={mentorMsg}
                  onChange={(e) => setMentorMsg(e.target.value)}
                  placeholder="Ask about this problem…"
                  rows={2}
                  style={{
                    flex: 1,
                    resize: "none",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "7px 10px",
                    fontSize: 12.5,
                    fontFamily: "inherit",
                    color: "var(--text-primary)",
                    outline: "none",
                    lineHeight: 1.5,
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMentor(); } }}
                />
                <button
                  onClick={sendMentor}
                  style={{ width: 36, borderRadius: "var(--radius-md)", background: mentorMsg.trim() ? "var(--blue)" : "var(--bg-muted)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <Send size={13} color={mentorMsg.trim() ? "white" : "var(--text-disabled)"} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Center — editor ── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Toolbar */}
        <div
          style={{
            height: 46,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            gap: 8,
            background: "#0b0d18",
            borderBottom: "1px solid #1e2236",
          }}
        >
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{
              background: "#1a2236",
              border: "1px solid #283050",
              borderRadius: "var(--radius-sm)",
              color: "#a9b1d6",
              fontSize: 11,
              padding: "3px 8px",
              fontFamily: "'JetBrains Mono',monospace",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {["Python","C++","Java","JavaScript","Go"].map((l) => <option key={l}>{l}</option>)}
          </select>

          <div style={{ flex: 1 }} />

          <button
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: "var(--radius-sm)", background: "#1a2236", border: "1px solid #283050", color: "#a9b1d6", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
          >
            <Copy size={11} /> Copy
          </button>
          <button
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: "var(--radius-sm)", background: "#1a2236", border: "1px solid #283050", color: "#a9b1d6", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
          >
            <RotateCcw size={11} /> Reset
          </button>
          <button
            onClick={run}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: "var(--radius-sm)", background: "#1a2236", border: "1px solid #283050", color: "#a9b1d6", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
          >
            <Play size={11} /> Run
          </button>
          <button
            onClick={run}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: "var(--radius-sm)", background: "var(--blue)", border: "none", color: "white", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
          >
            <Send size={11} /> Submit
          </button>
        </div>

        {/* Code view */}
        <div style={{ flex: 1, background: "#0d0f1c", overflow: "auto" }}>
          {CODE.split("\n").map((line, i) => (
            <div key={i} style={{ display: "flex", minHeight: "21.45px" }}>
              <div className="editor-gutter" style={{ minWidth: 46, paddingInline: "10px 12px", userSelect: "none", textAlign: "right", flexShrink: 0 }}>
                {i + 1}
              </div>
              <div className="editor-line" style={{ paddingRight: 24, whiteSpace: "pre" }}>
                {syntaxLine(line)}
              </div>
            </div>
          ))}
        </div>

        {/* Results panel */}
        {ran && (
          <div style={{ flexShrink: 0, background: "#090b15", borderTop: "1px solid #1e2236", height: 200 }}>
            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1e2236", padding: "0 4px" }}>
              {(["testcases","results"] as RightTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setRightTab(t)}
                  style={{
                    padding: "9px 12px",
                    fontSize: 11.5,
                    fontWeight: 500,
                    fontFamily: "inherit",
                    border: "none",
                    background: "none",
                    color: rightTab === t ? "#a9b1d6" : "#3b4261",
                    borderBottom: `2px solid ${rightTab === t ? "#2563eb" : "transparent"}`,
                    cursor: "pointer",
                    textTransform: "capitalize",
                    marginBottom: -1,
                  }}
                >
                  {t}
                </button>
              ))}
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, paddingRight: 12 }}>
                <span style={{ fontSize: 11, color: "#3b4261", display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={10} /> 12ms avg
                </span>
                <span style={{ fontSize: 11, color: "#3b4261" }}>14.1MB</span>
              </div>
            </div>
            <div style={{ overflowX: "auto", padding: "12px 14px" }}>
              <div style={{ display: "flex", gap: 10, minWidth: "max-content" }}>
                {TESTS.map((tc, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#13151e",
                      border: `1px solid ${tc.pass ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
                      borderRadius: "var(--radius-md)",
                      padding: "10px 14px",
                      minWidth: 148,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                      {tc.pass
                        ? <CheckCircle2 size={12} color="#34d399" />
                        : <XCircle size={12} color="#f87171" />
                      }
                      <span style={{ fontSize: 11, color: tc.pass ? "#34d399" : "#f87171", fontWeight: 500 }}>
                        Case {i + 1}
                      </span>
                    </div>
                    <div style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.7 }}>
                      <div style={{ color: "#4b527a" }}>Input: <span style={{ color: "#a9b1d6" }}>{tc.input}</span></div>
                      <div style={{ color: "#4b527a" }}>Exp: <span style={{ color: "#a9b1d6" }}>{tc.expected}</span></div>
                      {!tc.pass && <div style={{ color: "#f87171" }}>Got: {tc.actual}</div>}
                      {tc.pass && <div style={{ color: "#4b527a", marginTop: 2 }}>{tc.ms}ms · {tc.mem}MB</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
