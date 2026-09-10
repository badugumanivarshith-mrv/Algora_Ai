import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  Play, Send, RotateCcw, Lightbulb, Brain, MessageSquare,
  FileText, CheckCircle2, ChevronRight, Sparkles,
} from "lucide-react";
import ProblemHeader from "../components/workspace/ProblemHeader";
import ProblemDescription from "../components/workspace/ProblemDescription";
import CodeEditor from "../components/workspace/CodeEditor";
import TestCasesPanel from "../components/workspace/TestCasesPanel";
import SubmissionResultsPanel from "../components/workspace/SubmissionResultsPanel";
import { PROBLEMS } from "../data/problems";
import type { Problem, SupportedLanguage, UserSubmissionResult } from "../types";

type LeftTab = "description" | "hints" | "ai-mentor";
type RightBottomTab = "testcases" | "results";

export default function Workspace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const problemSlug = searchParams.get("problem") || "longest-palindromic-substring";

  const [currentProblem, setCurrentProblem] = useState<Problem>(() => {
    return PROBLEMS.find((p) => p.slug === problemSlug) || PROBLEMS[1];
  });

  const [language, setLanguage] = useState<SupportedLanguage>("Python");
  const [code, setCode] = useState<string>(() => currentProblem.starterCodes[language] || "");
  const [leftTab, setLeftTab] = useState<LeftTab>("description");
  const [bottomTab, setBottomTab] = useState<RightBottomTab>("testcases");

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<UserSubmissionResult | null>(null);

  const [mentorInput, setMentorInput] = useState("");
  const [mentorChat, setMentorChat] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: `Hello! I am Algora AI, your algorithm mentor. Ask me for a hint on time complexity, edge cases, or optimization patterns for **${currentProblem.title}**!`,
    },
  ]);

  // When problem or language changes, synchronize code and URL
  useEffect(() => {
    const p = PROBLEMS.find((item) => item.slug === problemSlug);
    if (p) {
      setCurrentProblem(p);
      setCode(p.starterCodes[language] || "");
    }
  }, [problemSlug]);

  const handleSelectProblem = (problem: Problem) => {
    setCurrentProblem(problem);
    setSearchParams({ problem: problem.slug });
    setCode(problem.starterCodes[language] || "");
    setSubmissionResult(null);
    setBottomTab("testcases");
  };

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setCode(currentProblem.starterCodes[lang] || "");
  };

  const handleResetCode = () => {
    setCode(currentProblem.starterCodes[language] || "");
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setBottomTab("testcases");
    }, 600);
  };

  const handleSubmitCode = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const passedCount = currentProblem.testCases.length;
      const res: UserSubmissionResult = {
        status: "Accepted",
        passedCount: passedCount,
        totalCount: passedCount,
        runtimeMs: Math.floor(Math.random() * 8) + 4,
        memoryMb: Number((Math.random() * 2 + 14).toFixed(1)),
        timestamp: "Just now",
        testCases: currentProblem.testCases.map((tc) => ({
          ...tc,
          passed: true,
          actualOutput: tc.expectedOutput,
        })),
      };
      setSubmissionResult(res);
      setBottomTab("results");
    }, 900);
  };

  const handleNextProblem = () => {
    const currentIndex = PROBLEMS.findIndex((p) => p.id === currentProblem.id);
    const nextIndex = (currentIndex + 1) % PROBLEMS.length;
    handleSelectProblem(PROBLEMS[nextIndex]);
  };

  const handleSendMentor = () => {
    if (!mentorInput.trim()) return;
    const userText = mentorInput.trim();
    setMentorChat((prev) => [...prev, { sender: "user", text: userText }]);
    setMentorInput("");

    setTimeout(() => {
      let aiResponse = "";
      if (userText.toLowerCase().includes("complexity") || userText.toLowerCase().includes("time")) {
        aiResponse = `For **${currentProblem.title}**, the optimal approach runs in **O(n²)** time and **O(1)** extra space by expanding outward from palindrome centers.`;
      } else if (userText.toLowerCase().includes("hint") || userText.toLowerCase().includes("help")) {
        aiResponse = `Try breaking the problem into subproblems. ${currentProblem.hints[0] || "Consider how previous state answers can be cached."}`;
      } else {
        aiResponse = `Great question! Consider the boundary conditions and whether you have handled empty inputs or single-character inputs safely.`;
      }
      setMentorChat((prev) => [...prev, { sender: "ai", text: aiResponse }]);
    }, 600);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      {/* Top Problem Header */}
      <ProblemHeader
        currentProblem={currentProblem}
        allProblems={PROBLEMS}
        onSelectProblem={handleSelectProblem}
        onBackToExplorer={() => navigate("/learning?tab=problems")}
      />

      {/* Main Split Grid */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(320px, 45%) minmax(380px, 55%)",
          overflow: "hidden",
        }}
      >
        {/* Left Column: Problem Tabs (Description, Hints, AI Mentor) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid var(--border)",
            background: "var(--bg-surface)",
            overflow: "hidden",
          }}
        >
          {/* Left Tab Bar */}
          <div
            style={{
              height: 42,
              display: "flex",
              alignItems: "center",
              paddingInline: 12,
              borderBottom: "1px solid var(--border)",
              background: "var(--bg-surface)",
              flexShrink: 0,
              gap: 6,
            }}
          >
            <button
              onClick={() => setLeftTab("description")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: 12.5,
                fontWeight: leftTab === "description" ? 600 : 500,
                border: "none",
                background: leftTab === "description" ? "var(--bg-raised)" : "transparent",
                color: leftTab === "description" ? "var(--text-primary)" : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              <FileText size={13} /> Description
            </button>

            <button
              onClick={() => setLeftTab("hints")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: 12.5,
                fontWeight: leftTab === "hints" ? 600 : 500,
                border: "none",
                background: leftTab === "hints" ? "var(--bg-raised)" : "transparent",
                color: leftTab === "hints" ? "var(--text-primary)" : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              <Lightbulb size={13} /> Hints ({currentProblem.hints.length})
            </button>

            <button
              onClick={() => setLeftTab("ai-mentor")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: 12.5,
                fontWeight: leftTab === "ai-mentor" ? 600 : 500,
                border: "none",
                background: leftTab === "ai-mentor" ? "var(--blue-light)" : "transparent",
                color: leftTab === "ai-mentor" ? "var(--blue)" : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              <Sparkles size={13} /> AI Mentor
            </button>
          </div>

          {/* Left Content Area */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {leftTab === "description" && <ProblemDescription problem={currentProblem} />}

            {leftTab === "hints" && (
              <div style={{ padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>
                  Problem Solving Hints
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {currentProblem.hints.map((hint, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 14,
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-raised)",
                        border: "1px solid var(--border)",
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: "var(--text-secondary)",
                      }}
                    >
                      <strong style={{ color: "var(--blue)", display: "block", marginBottom: 4 }}>
                        Hint {idx + 1}
                      </strong>
                      {hint}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {leftTab === "ai-mentor" && (
              <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 16 }}>
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
                  {mentorChat.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                        maxWidth: "85%",
                        padding: "10px 14px",
                        borderRadius: "var(--radius-md)",
                        background: msg.sender === "user" ? "var(--blue)" : "var(--bg-raised)",
                        color: msg.sender === "user" ? "#fff" : "var(--text-primary)",
                        fontSize: 12.5,
                        lineHeight: 1.5,
                        border: msg.sender === "user" ? "none" : "1px solid var(--border)",
                      }}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <input
                    type="text"
                    value={mentorInput}
                    onChange={(e) => setMentorInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMentor()}
                    placeholder="Ask Algora AI a question..."
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      background: "var(--bg-raised)",
                      color: "var(--text-primary)",
                      fontSize: 12.5,
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={handleSendMentor}
                    className="btn btn-primary btn-sm"
                    style={{ paddingInline: 12 }}
                  >
                    Ask
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Test Cases / Results */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
            background: "var(--bg)",
          }}
        >
          {/* Top 60%: Code Editor Container */}
          <div style={{ flex: "1 1 60%", minHeight: 240, overflow: "hidden" }}>
            <CodeEditor
              code={code}
              language={language}
              onChangeCode={setCode}
              onSelectLanguage={handleSelectLanguage}
              onResetCode={handleResetCode}
            />
          </div>

          {/* Bottom 40%: Test Cases & Results Panel */}
          <div
            style={{
              flex: "0 0 40%",
              minHeight: 200,
              display: "flex",
              flexDirection: "column",
              borderTop: "1px solid var(--border)",
              background: "var(--bg-surface)",
              overflow: "hidden",
            }}
          >
            {/* Bottom Tabs Switcher */}
            <div
              style={{
                height: 38,
                display: "flex",
                alignItems: "center",
                paddingInline: 12,
                borderBottom: "1px solid var(--border)",
                background: "var(--bg-surface)",
                flexShrink: 0,
                gap: 6,
              }}
            >
              <button
                onClick={() => setBottomTab("testcases")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 12,
                  fontWeight: bottomTab === "testcases" ? 600 : 500,
                  border: "none",
                  background: bottomTab === "testcases" ? "var(--bg-raised)" : "transparent",
                  color: bottomTab === "testcases" ? "var(--text-primary)" : "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                Test Cases
              </button>

              <button
                onClick={() => setBottomTab("results")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 12,
                  fontWeight: bottomTab === "results" ? 600 : 500,
                  border: "none",
                  background: bottomTab === "results" ? "var(--bg-raised)" : "transparent",
                  color: bottomTab === "results" ? "var(--text-primary)" : "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                Submission Results {submissionResult && `(${submissionResult.status})`}
              </button>
            </div>

            {/* Bottom Panel Body */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              {bottomTab === "testcases" ? (
                <TestCasesPanel
                  testCases={currentProblem.testCases}
                  isRunning={isRunning}
                  isSubmitting={isSubmitting}
                  onRunCode={handleRunCode}
                  onSubmitCode={handleSubmitCode}
                />
              ) : (
                <SubmissionResultsPanel
                  result={submissionResult}
                  onGoToNextProblem={handleNextProblem}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
