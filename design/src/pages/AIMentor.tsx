import { useState, useRef, useEffect } from "react";
import { Brain, Send, Sparkles, Code2, BookOpen, Bug, Lightbulb, ChevronRight, RotateCcw, ThumbsUp, ThumbsDown, Copy } from "lucide-react";

type MsgType = "text" | "code" | "insight";
interface Msg { role: "user" | "ai"; type: MsgType; content: string; time: string; }

const INITIAL: Msg[] = [
  { role: "ai", type: "text", time: "10:32",
    content: "Hi Arjun! I'm your AI Mentor, trained to help you master DSA without just giving you answers. What are you working on?" },
  { role: "user", type: "text", time: "10:33",
    content: "I understand DP conceptually but keep failing edge cases in harder problems. My recursive approach works but I miss memoization opportunities." },
  { role: "ai", type: "text", time: "10:33",
    content: "That's a super common pain point — and actually a great sign. It means you've internalized the recursion structure, which is the hardest part.\n\nLet me ask: when you write your recursive function, do you explicitly label what the 'parameters' represent? Like `dp(i, remaining_capacity)` vs `dp(idx)`?" },
  { role: "user", type: "text", time: "10:34",
    content: "Not always. I usually just write solve(i) and figure it out as I go." },
  { role: "ai", type: "text", time: "10:34",
    content: "That's exactly where edge cases creep in. If your subproblem definition is fuzzy, your memoization key will be wrong.\n\nHere's the habit that fixes this:\n\n**Before writing any code**, write one sentence: 'This function returns _____ given _____'. Fill in the blanks. If you can't, you don't understand the subproblem yet.\n\nLet me show you with Fibonacci first, then we'll move to a harder example." },
  { role: "ai", type: "code", time: "10:35",
    content: `# Step 1 — define the subproblem in English first:
# "fib(n) returns the nth Fibonacci number"

from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n: int) -> int:
    # Base cases — always ask: what's the smallest valid input?
    if n <= 1:
        return n
    # Recursive case — what decisions do I have?
    return fib(n - 1) + fib(n - 2)

# Without memo: O(2^n) — exponential
# With memo:    O(n)   — that's the entire power of DP` },
  { role: "ai", type: "insight", time: "10:35",
    content: "The memoization key = the function parameters. If fib(n) depends only on n, cache by n. If your knapsack function is solve(i, remaining), cache by (i, remaining). Every state you forget = a missed optimization." },
];

const QUICK = [
  { icon: Bug,       label: "Debug my code",      color: "var(--red)"    },
  { icon: Lightbulb, label: "Give me a hint",      color: "var(--amber)"  },
  { icon: BookOpen,  label: "Explain a concept",   color: "var(--blue)"   },
  { icon: Code2,     label: "Review my solution",  color: "var(--violet)" },
];

const TOPICS = [
  "Dynamic Programming","Binary Search","Two Pointers","Sliding Window",
  "Trees & BST","Graphs & BFS/DFS","Backtracking","Heap / Priority Queue",
  "Monotonic Stack","Segment Tree",
];

export default function AIMentor() {
  const [msgs, setMsgs] = useState<Msg[]>(INITIAL);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = (text?: string) => {
    const content = text || input;
    if (!content.trim()) return;
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setMsgs((m) => [...m, { role: "user", type: "text", content, time: now }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, {
        role: "ai", type: "text",
        content: "Great question! The key insight here is to think about what makes each subproblem unique. What changes between recursive calls? That's your state. Once you've nailed that down, memoization writes itself.",
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }]);
    }, 1400);
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* ── Left sidebar ── */}
      <div
        style={{
          width: 240,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--border)",
          background: "var(--bg-surface)",
          overflowY: "auto",
        }}
      >
        {/* Identity */}
        <div style={{ padding: "16px 16px 14px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Brain size={18} color="white" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Algora Mentor</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div className="status-dot status-online" />
                <span style={{ fontSize: 11, color: "var(--green)" }}>Online</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.55 }}>
            DSA & placement specialist. I ask questions, not give answers.
          </p>
        </div>

        {/* Quick actions */}
        <div style={{ padding: "14px 12px", borderBottom: "1px solid var(--border)" }}>
          <p className="text-label" style={{ color: "var(--text-muted)", marginBottom: 10 }}>Quick Actions</p>
          {QUICK.map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              onClick={() => send(label)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "8px 10px",
                marginBottom: 4,
                borderRadius: "var(--radius-md)",
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                fontSize: 12.5,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                transition: "all 0.1s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.color = "var(--text-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-raised)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              <div style={{ width: 24, height: 24, borderRadius: "var(--radius-sm)", background: `color-mix(in srgb, ${color} 12%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={12} style={{ color }} />
              </div>
              {label}
            </button>
          ))}
        </div>

        {/* Topics */}
        <div style={{ padding: "14px 12px" }}>
          <p className="text-label" style={{ color: "var(--text-muted)", marginBottom: 10 }}>Explore Topics</p>
          {TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => send(`Explain ${t}`)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 8px",
                marginBottom: 1,
                borderRadius: "var(--radius-sm)",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.color = "var(--text-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <ChevronRight size={10} style={{ flexShrink: 0, color: "var(--text-disabled)" }} />
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat ── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-surface)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={14} style={{ color: "var(--blue)" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Session</span>
            <span className="badge badge-blue">DP Fundamentals</span>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setMsgs([])}
            style={{ gap: 5 }}
          >
            <RotateCcw size={11} /> New session
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {msgs.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                alignItems: "flex-start",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "var(--radius-md)",
                  background: msg.role === "ai"
                    ? "linear-gradient(135deg,#2563eb,#06b6d4)"
                    : "linear-gradient(135deg,#2563eb,#7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 10,
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {msg.role === "ai" ? <Brain size={13} /> : "AS"}
              </div>

              {/* Bubble */}
              <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 4, alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.type === "code" ? (
                  <div
                    style={{
                      background: "#0d0f1c",
                      border: "1px solid #1e2236",
                      borderRadius: "var(--radius-lg)",
                      overflow: "hidden",
                      width: "100%",
                      maxWidth: 540,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", background: "#0b0d18", borderBottom: "1px solid #1e2236" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Code2 size={11} color="#4b527a" />
                        <span style={{ fontSize: 10.5, color: "#4b527a", fontFamily: "'JetBrains Mono',monospace" }}>Python</span>
                      </div>
                      <button style={{ fontSize: 10, color: "#4b527a", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontFamily: "inherit" }}>
                        <Copy size={10} /> Copy
                      </button>
                    </div>
                    <pre style={{ margin: 0, padding: "12px 16px", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: "#a9b1d6", lineHeight: 1.7, overflowX: "auto" }}>
                      {msg.content}
                    </pre>
                  </div>
                ) : msg.type === "insight" ? (
                  <div
                    style={{
                      background: "var(--amber-light)",
                      border: `1px solid color-mix(in srgb, var(--amber) 25%, transparent)`,
                      borderRadius: "var(--radius-lg)",
                      padding: "12px 16px",
                      maxWidth: 480,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <Lightbulb size={13} style={{ color: "var(--amber)" }} />
                      <span className="text-label" style={{ color: "var(--amber)", fontSize: 10 }}>Key Insight</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>{msg.content}</p>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: msg.role === "user" ? "var(--blue)" : "var(--bg-surface)",
                      border: msg.role === "ai" ? "1px solid var(--border)" : "none",
                      color: msg.role === "user" ? "white" : "var(--text-secondary)",
                      fontSize: 13,
                      lineHeight: 1.6,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {msg.content}
                  </div>
                )}
                {/* Meta */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, paddingInline: 2 }}>
                  <span style={{ fontSize: 10.5, color: "var(--text-disabled)" }}>{msg.time}</span>
                  {msg.role === "ai" && (
                    <>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-disabled)", padding: 2 }}><ThumbsUp size={10} /></button>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-disabled)", padding: 2 }}><ThumbsDown size={10} /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {typing && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg,#2563eb,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Brain size={13} color="white" />
              </div>
              <div style={{ padding: "12px 16px", borderRadius: "16px 16px 16px 4px", background: "var(--bg-surface)", border: "1px solid var(--border)", display: "flex", gap: 4, alignItems: "center" }}>
                {[0, 1, 2].map((j) => (
                  <div
                    key={j}
                    style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "var(--text-muted)",
                      animation: `blink 1.2s ${j * 0.2}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", background: "var(--bg-surface)" }}>
          <div
            style={{
              display: "flex",
              gap: 10,
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              padding: "10px 14px",
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about algorithms, debug your code, or request an explanation…"
              rows={2}
              style={{
                flex: 1, resize: "none", background: "transparent",
                border: "none", outline: "none",
                fontSize: 13, fontFamily: "inherit",
                color: "var(--text-primary)", lineHeight: 1.5,
              }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button
              onClick={() => send()}
              style={{
                width: 34, height: 34, borderRadius: "var(--radius-md)",
                background: input.trim() ? "var(--blue)" : "var(--bg-muted)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-end",
              }}
            >
              <Send size={13} color={input.trim() ? "white" : "var(--text-disabled)"} />
            </button>
          </div>
          <p style={{ fontSize: 10.5, color: "var(--text-disabled)", textAlign: "center", margin: "6px 0 0" }}>
            Shift+Enter for newline · Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
