import { useState, useRef, useEffect, MouseEvent, KeyboardEvent } from "react";
import {
  Brain,
  Send,
  Sparkles,
  Code2,
  BookOpen,
  Bug,
  Lightbulb,
  ChevronRight,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Plus,
  Trash2,
  Compass,
  Zap,
  Check,
  Target,
  Trophy,
  Briefcase,
  AlertTriangle,
  Rocket,
} from "lucide-react";
import { AIService } from "../services/aiService";
import { MentorConversation, MentorMessage, MentorQuickActionType } from "../types";

const TOPICS = [
  "Dynamic Programming",
  "Binary Search",
  "Two Pointers",
  "Sliding Window",
  "Trees & BST",
  "Graphs & BFS/DFS",
  "Backtracking",
  "Heap / Priority Queue",
  "Monotonic Stack",
];

const QUICK_ACTIONS: {
  id: MentorQuickActionType;
  label: string;
  icon: typeof BookOpen;
  color: string;
}[] = [
  { id: "explain_concept", label: "Explain Concept", icon: BookOpen, color: "var(--blue)" },
  { id: "give_hint", label: "Give Hint", icon: Lightbulb, color: "var(--amber)" },
  { id: "find_mistake", label: "Find Mistake", icon: Bug, color: "var(--red)" },
  { id: "improve_solution", label: "Improve Solution", icon: Code2, color: "var(--violet)" },
  { id: "learning_advice", label: "Learning Path Advice", icon: Compass, color: "var(--green)" },
  { id: "build_study_plan", label: "Build Study Plan", icon: Target, color: "var(--cyan)" },
  { id: "analyze_weaknesses", label: "Analyze Weaknesses", icon: AlertTriangle, color: "var(--amber)" },
  { id: "recommend_problems", label: "Recommend Problems", icon: Rocket, color: "var(--blue)" },
  { id: "contest_prep", label: "Contest Prep", icon: Trophy, color: "var(--amber)" },
  { id: "interview_prep", label: "Interview Prep", icon: Briefcase, color: "var(--green)" },
];

export default function AIMentor() {
  const [conversations, setConversations] = useState<MentorConversation[]>(() =>
    AIService.getConversations()
  );
  const [activeConvId, setActiveConvId] = useState<string>(
    () => conversations[0]?.id || "conv-initial"
  );
  const [selectedTopic, setSelectedTopic] = useState<string>("Dynamic Programming");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation =
    conversations.find((c) => c.id === activeConvId) || conversations[0];

  useEffect(() => {
    AIService.saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, isTyping]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (msgId: string, type: "positive" | "negative") => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConvId) return c;
        return {
          ...c,
          messages: c.messages.map((m) =>
            m.id === msgId ? { ...m, feedback: m.feedback === type ? undefined : type } : m
          ),
        };
      })
    );
  };

  const handleNewSession = (topic?: string) => {
    const newConv = AIService.createConversation(undefined, topic || selectedTopic);
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    if (topic) setSelectedTopic(topic);
  };

  const handleDeleteSession = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    if (conversations.length <= 1) {
      // Reset the only conversation
      const resetConv = AIService.createConversation();
      setConversations([resetConv]);
      setActiveConvId(resetConv.id);
      return;
    }
    const filtered = conversations.filter((c) => c.id !== id);
    setConversations(filtered);
    if (activeConvId === id) {
      setActiveConvId(filtered[0]?.id || "");
    }
  };

  const handleSend = async (customText?: string, actionType?: MentorQuickActionType) => {
    const textToSend = customText !== undefined ? customText : input;
    if (!textToSend.trim() && !actionType) return;

    const userMsgId = `msg-${Date.now()}`;
    const userMsg: MentorMessage = {
      id: userMsgId,
      role: "user",
      type: "text",
      content: textToSend || `[Quick Action: ${actionType?.replace("_", " ").toUpperCase()}]`,
      actionType,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Update conversation with user message immediately
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConvId) return c;
        return {
          ...c,
          updatedAt: new Date().toISOString(),
          messages: [...c.messages, userMsg],
        };
      })
    );

    if (customText === undefined) {
      setInput("");
    }
    setIsTyping(true);

    try {
      const aiReplies = await AIService.sendMentorMessage(textToSend, actionType, {
        topic: selectedTopic,
      });

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConvId) return c;
          return {
            ...c,
            updatedAt: new Date().toISOString(),
            messages: [...c.messages, ...aiReplies],
          };
        })
      );
    } catch {
      // Handle error gracefully
      const errorMsg: MentorMessage = {
        id: `msg-err-${Date.now()}`,
        role: "ai",
        type: "text",
        content: "I encountered a minor glitch retrieving that explanation. Please try asking again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConvId ? { ...c, messages: [...c.messages, errorMsg] } : c))
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      id="ai-mentor-page"
      style={{
        display: "flex",
        height: "calc(100vh - var(--topnav-height, 56px))",
        background: "var(--bg-canvas)",
        color: "var(--text-primary)",
        overflow: "hidden",
      }}
    >
      {/* LEFT SIDEBAR: Sessions & Topics */}
      <aside
        id="mentor-sessions-sidebar"
        style={{
          width: "280px",
          minWidth: "240px",
          borderRight: "1px solid var(--border)",
          background: "var(--bg-surface)",
          display: "flex",
          flexDirection: "column",
          padding: "16px 12px",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "var(--radius-md)",
                background: "rgba(0, 212, 255, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--brand-primary)",
              }}
            >
              <Brain size={16} />
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "-0.01em" }}>
              AI Mentor
            </span>
          </div>
          <button
            id="new-mentor-session-btn"
            onClick={() => handleNewSession()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "5px 9px",
              background: "var(--brand-primary)",
              color: "var(--bg-canvas)",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={13} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Saved Sessions */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "4px 8px",
            }}
          >
            History & Sessions
          </div>
          {conversations.map((conv) => {
            const isActive = conv.id === activeConvId;
            return (
              <div
                key={conv.id}
                id={`session-item-${conv.id}`}
                onClick={() => setActiveConvId(conv.id)}
                style={{
                  padding: "9px 10px",
                  borderRadius: "var(--radius-md)",
                  background: isActive ? "var(--bg-raised)" : "transparent",
                  border: isActive ? "1px solid var(--border)" : "1px solid transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "background 0.15s ease",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {conv.title}
                  </p>
                  <span style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>
                    {conv.topic || "General"} · {conv.messages.length} msgs
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(conv.id, e)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-tertiary)",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Delete Session"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Topic Scaffolding Selector */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "8px",
              paddingLeft: "4px",
            }}
          >
            Switch Topic Context
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxHeight: "120px", overflowY: "auto" }}>
            {TOPICS.map((topic) => {
              const isSelected = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  style={{
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "var(--radius-sm)",
                    background: isSelected ? "rgba(0, 212, 255, 0.12)" : "var(--bg-raised)",
                    color: isSelected ? "var(--brand-primary)" : "var(--text-secondary)",
                    border: isSelected ? "1px solid var(--brand-primary)" : "1px solid var(--border)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main
        id="mentor-chat-container"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          background: "var(--bg-canvas)",
        }}
      >
        {/* Chat Top Header */}
        <header
          id="mentor-chat-header"
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>
                  {activeConversation?.title || "Mentorship Session"}
                </h2>
                <span
                  style={{
                    fontSize: "10px",
                    padding: "2px 7px",
                    borderRadius: "10px",
                    background: "rgba(0, 212, 255, 0.1)",
                    color: "var(--brand-primary)",
                    border: "1px solid rgba(0, 212, 255, 0.2)",
                    fontWeight: 600,
                  }}
                >
                  {selectedTopic}
                </span>
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-tertiary)", margin: "2px 0 0" }}>
                Socratic Method Active: Guiding step-by-step intuition without spoiling code
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => {
                if (activeConversation) {
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === activeConvId
                        ? {
                            ...c,
                            messages: [c.messages[0]],
                          }
                        : c
                    )
                  );
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 10px",
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-secondary)",
                fontSize: "11px",
                cursor: "pointer",
              }}
              title="Reset to initial greeting"
            >
              <RotateCcw size={12} />
              <span>Clear History</span>
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <div
          id="mentor-messages-stream"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {activeConversation?.messages.map((msg) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg.id}
                id={`message-bubble-${msg.id}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isUser ? "flex-end" : "flex-start",
                  gap: "4px",
                }}
              >
                {/* Meta Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    color: "var(--text-tertiary)",
                    padding: "0 4px",
                  }}
                >
                  {!isUser && (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "var(--brand-primary)",
                        fontWeight: 600,
                      }}
                    >
                      <Sparkles size={11} />
                      Algora AI Mentor
                    </span>
                  )}
                  <span>{msg.timestamp}</span>
                </div>

                {/* Content Box */}
                <div
                  style={{
                    maxWidth: "85%",
                    borderRadius: "var(--radius-md)",
                    padding: msg.type === "code" ? "0" : "12px 16px",
                    background: isUser
                      ? "var(--brand-primary)"
                      : msg.type === "insight"
                      ? "rgba(0, 212, 255, 0.06)"
                      : msg.type === "hint"
                      ? "rgba(245, 158, 11, 0.08)"
                      : "var(--bg-surface)",
                    color: isUser ? "var(--bg-canvas)" : "var(--text-primary)",
                    border: isUser
                      ? "none"
                      : msg.type === "insight"
                      ? "1px solid rgba(0, 212, 255, 0.2)"
                      : msg.type === "hint"
                      ? "1px solid rgba(245, 158, 11, 0.25)"
                      : "1px solid var(--border)",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    position: "relative",
                  }}
                >
                  {msg.type === "code" ? (
                    <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 12px",
                          background: "var(--bg-raised)",
                          borderBottom: "1px solid var(--border)",
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{msg.language || "Code Structure"}</span>
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "11px",
                          }}
                        >
                          {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <pre
                        style={{
                          margin: 0,
                          padding: "12px 14px",
                          background: "#080c14",
                          color: "#e2e8f0",
                          fontFamily: "var(--font-mono, monospace)",
                          fontSize: "12px",
                          overflowX: "auto",
                          lineHeight: 1.5,
                        }}
                      >
                        <code>{msg.content}</code>
                      </pre>
                    </div>
                  ) : (
                    <div>
                      <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                      {!isUser && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "8px",
                            marginTop: "8px",
                            paddingTop: "6px",
                            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          <button
                            onClick={() => handleFeedback(msg.id, "positive")}
                            style={{
                              background: "none",
                              border: "none",
                              color: msg.feedback === "positive" ? "var(--green)" : "var(--text-tertiary)",
                              cursor: "pointer",
                              padding: "2px 4px",
                            }}
                            title="Helpful guidance"
                          >
                            <ThumbsUp size={12} />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, "negative")}
                            style={{
                              background: "none",
                              border: "none",
                              color: msg.feedback === "negative" ? "var(--red)" : "var(--text-tertiary)",
                              cursor: "pointer",
                              padding: "2px 4px",
                            }}
                            title="Too vague or incorrect"
                          >
                            <ThumbsDown size={12} />
                          </button>
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            style={{
                              background: "none",
                              border: "none",
                              color: copiedId === msg.id ? "var(--brand-primary)" : "var(--text-tertiary)",
                              cursor: "pointer",
                              padding: "2px 4px",
                            }}
                            title="Copy text"
                          >
                            {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                width: "fit-content",
              }}
            >
              <Sparkles size={13} color="var(--brand-primary)" className="animate-spin" />
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                AI Mentor formulating Socratic guidance...
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* BOTTOM QUICK ACTIONS & INPUT BOX */}
        <div
          id="mentor-input-container"
          style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--border)",
            background: "var(--bg-surface)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* 5 Standard Quick Action Buttons */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "2px" }}>
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  id={`mentor-quick-action-${action.id}`}
                  onClick={() => handleSend(undefined, action.id)}
                  disabled={isTyping}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: isTyping ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Icon size={13} style={{ color: action.color }} />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>

          {/* Textarea + Send Trigger */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "8px",
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "8px 12px",
            }}
          >
            <textarea
              ref={inputRef}
              id="mentor-chat-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask a question about ${selectedTopic}, paste code, or ask for a hint...`}
              rows={2}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text-primary)",
                fontSize: "13px",
                resize: "none",
                fontFamily: "inherit",
                lineHeight: 1.5,
              }}
            />
            <button
              id="mentor-send-btn"
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "34px",
                height: "34px",
                borderRadius: "var(--radius-md)",
                background: input.trim() && !isTyping ? "var(--brand-primary)" : "var(--border)",
                color: input.trim() && !isTyping ? "var(--bg-canvas)" : "var(--text-tertiary)",
                border: "none",
                cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
                transition: "all 0.15s ease",
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
