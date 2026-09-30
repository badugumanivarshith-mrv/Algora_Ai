/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Workspace — Production Code Editor, Multi-Language Judge & 6-Tier Socratic Ladder
 */

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  Play, RotateCcw, Send, ChevronDown, Lightbulb, Brain,
  CheckCircle2, XCircle, Clock, BookOpen, Copy, AlertCircle,
  Code2, Sparkles, Lock, Terminal, Shield, Filter, Award, RefreshCw
} from "lucide-react";
import { PROBLEM_BANK } from "../data/problemsData";
import { Problem } from "../types/problem";
import { executeCodeLocally, ExecutionResult } from "../services/codeExecution";
import { useAuth } from "../context/AuthContext";

type LeftTab = "problem" | "hints" | "mentor";
type RightTab = "testcases" | "results";
type LanguageKey = "python" | "cpp" | "java" | "c";

const LANGUAGE_LABELS: Record<LanguageKey, string> = {
  python: "Python 3",
  cpp: "C++ 20",
  java: "Java 17",
  c: "C (GCC)"
};

export default function Workspace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const problemSlug = searchParams.get("problem") || "two-sum";
  const { user, isGuest } = useAuth();

  // Selected Problem
  const [currentProblem, setCurrentProblem] = useState<Problem>(() => {
    return PROBLEM_BANK.find((p) => p.slug === problemSlug || p.id === problemSlug) || PROBLEM_BANK[0];
  });

  // Editor State
  const [language, setLanguage] = useState<LanguageKey>("python");
  const [code, setCode] = useState<string>(() => currentProblem.starterCode.python);
  const [leftTab, setLeftTab] = useState<LeftTab>("problem");
  const [rightTab, setRightTab] = useState<RightTab>("testcases");

  // Hint Ladder State (1 to 6)
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [confirmUnlockSolution, setConfirmUnlockSolution] = useState<boolean>(false);

  // Execution & Judge State
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);
  const [customInput, setCustomInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // AI Mentor Chat State
  const [mentorMsg, setMentorMsg] = useState<string>("");
  const [mentorLog, setMentorLog] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    {
      role: "ai",
      text: `Hello! I am your ALGORA Socratic AI Mentor. I see you are working on "${currentProblem.title}". What is your initial intuition on the optimal data structure or approach?`
    }
  ]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Synchronize when problem slug changes
  useEffect(() => {
    const found = PROBLEM_BANK.find((p) => p.slug === problemSlug || p.id === problemSlug);
    if (found) {
      setCurrentProblem(found);
      setCode(found.starterCode[language] || found.starterCode.python);
      setUnlockedLevel(1);
      setExecResult(null);
      setMentorLog([
        {
          role: "ai",
          text: `Now viewing "${found.title}". Remember: try solving it first! I can guide you step-by-step through the 6-tier Socratic ladder when you're stuck.`
        }
      ]);
    }
  }, [problemSlug]);

  // Synchronize code when language changes
  const handleLanguageChange = (newLang: LanguageKey) => {
    setLanguage(newLang);
    setCode(currentProblem.starterCode[newLang] || "");
  };

  // Reset starter code
  const handleResetCode = () => {
    setCode(currentProblem.starterCode[language] || "");
    setExecResult(null);
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  // Run Code against sample tests
  const handleRunCode = async () => {
    setIsExecuting(true);
    setRightTab("results");

    try {
      // Execute via real backend or client engine fallback
      const response = await fetch("/api/problems/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: currentProblem.id,
          code,
          language,
          customInput: customInput || undefined
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          const resData = json.data;
          setExecResult({
            status: resData.status,
            runtimeMs: resData.executionTimeMs,
            memoryMb: resData.memoryMb,
            passedTests: resData.totalPassed,
            totalTests: resData.totalTestCases,
            stdout: resData.results?.map((r: any) => `Test ${r.testCaseIndex}: ${r.passed ? "PASSED" : "FAILED"}`).join("\n") || "Executed",
            testResults: resData.results?.map((r: any, idx: number) => ({
              testCaseId: `tc-${idx + 1}`,
              input: r.input,
              expected: r.expected,
              actual: r.actual,
              passed: r.passed
            })) || []
          });
          setIsExecuting(false);
          return;
        }
      }
    } catch {
      // Fallback local execution if offline or dev
    }

    // Fallback local judge runner
    const sampleCases = currentProblem.examples.map((ex, idx) => ({
      id: `tc-${idx + 1}`,
      input: ex.input,
      expectedOutput: ex.output
    }));

    const result = await executeCodeLocally(code, language, sampleCases, customInput);
    setExecResult(result);
    setIsExecuting(false);
  };

  // Submit Official Solution
  const handleSubmitCode = async () => {
    if (isGuest) {
      setLeftTab("mentor");
      setMentorLog((l) => [
        ...l,
        {
          role: "ai",
          text: "⚠️ Official submission tracking requires a logged-in account to earn XP, maintain streaks, and log spaced repetition cards! You can test code freely in Guest Mode."
        }
      ]);
    }

    setIsSubmitting(true);
    setRightTab("results");

    try {
      const storedToken = localStorage.getItem("accessToken");
      const res = await fetch("/api/problems/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {})
        },
        body: JSON.stringify({
          problemId: currentProblem.id,
          code,
          language
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setExecResult({
            status: json.data.isAccepted ? "Accepted" : "Wrong Answer",
            runtimeMs: json.data.submission.execution_time_ms,
            memoryMb: json.data.submission.memory_mb,
            passedTests: json.data.submission.passed_test_cases,
            totalTests: json.data.submission.total_test_cases,
            stdout: `Official Submission Evaluated!\nVerdict: ${json.data.submission.status}\nXP Earned: ${json.data.xpEarned || 0}`,
            testResults: [
              {
                testCaseId: "tc-hidden",
                input: "Hidden Test Suite",
                expected: "All Pass",
                actual: json.data.isAccepted ? "All Pass" : "Mismatch on hidden cases",
                passed: json.data.isAccepted
              }
            ]
          });
          setIsSubmitting(false);
          return;
        }
      }
    } catch {
      // Fallthrough
    }

    // Client fallback
    const sampleCases = currentProblem.examples.map((ex, idx) => ({
      id: `tc-${idx + 1}`,
      input: ex.input,
      expectedOutput: ex.output
    }));

    const result = await executeCodeLocally(code, language, sampleCases);
    setExecResult(result);
    setIsSubmitting(false);
  };

  // Send Socratic Mentor query
  const sendMentorMessage = async () => {
    if (!mentorMsg.trim() || isAiThinking) return;

    const userText = mentorMsg.trim();
    setMentorMsg("");
    setMentorLog((l) => [...l, { role: "user", text: userText }]);
    setIsAiThinking(true);

    try {
      const storedToken = localStorage.getItem("accessToken");
      const res = await fetch("/api/ai/mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {})
        },
        body: JSON.stringify({
          message: userText,
          problemContext: {
            title: currentProblem.title,
            difficulty: currentProblem.difficulty,
            unlockedHintLevel: unlockedLevel,
            userCode: code,
            language
          },
          mode: "practice"
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.reply) {
          setMentorLog((l) => [...l, { role: "ai", text: json.reply }]);
          setIsAiThinking(false);
          return;
        }
      }
    } catch {
      // Ignore
    }

    // Default Socratic fallback response
    setTimeout(() => {
      setMentorLog((l) => [
        ...l,
        {
          role: "ai",
          text: `For "${currentProblem.title}", think about the time complexity constraint (${currentProblem.constraints[0] || 'O(N)'}). Are you storing state as you traverse, or performing nested scans? Let's check Level ${Math.min(unlockedLevel + 1, 6)} hint if you'd like a structural clue!`
        }
      ]);
      setIsAiThinking(false);
    }, 600);
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "var(--bg)" }}>
      {/* ── Left panel: Problem, Hints, AI Mentor ── */}
      <div
        style={{
          width: 420,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--border)",
          background: "var(--bg-surface)",
          overflow: "hidden"
        }}
      >
        {/* Header Problem Selector */}
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--bg-subtle)", display: "flex", alignItems: "center", gap: 8 }}>
          <Code2 size={16} style={{ color: "var(--blue)" }} />
          <select
            value={currentProblem.slug}
            onChange={(e) => setSearchParams({ problem: e.target.value })}
            style={{
              flex: 1,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
              fontSize: 12.5,
              fontWeight: 600,
              padding: "4px 8px",
              outline: "none",
              cursor: "pointer"
            }}
          >
            {PROBLEM_BANK.map((p) => (
              <option key={p.id} value={p.slug}>
                [{p.difficulty}] {p.title} ({p.topicTitle})
              </option>
            ))}
          </select>
        </div>

        {/* Tab Bar */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 6px" }}>
          {[
            { key: "problem", label: "Description", icon: BookOpen },
            { key: "hints", label: `Socratic Hints (${unlockedLevel}/6)`, icon: Lightbulb },
            { key: "mentor", label: "AI Mentor", icon: Brain }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setLeftTab(key as LeftTab)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "10px 12px",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
                border: "none",
                background: "none",
                color: leftTab === key ? "var(--blue)" : "var(--text-muted)",
                borderBottom: `2px solid ${leftTab === key ? "var(--blue)" : "transparent"}`,
                cursor: "pointer",
                marginBottom: -1
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
          {leftTab === "problem" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                  {currentProblem.title}
                </h2>
                <span
                  className={`badge ${
                    currentProblem.difficulty === "Easy"
                      ? "diff-easy"
                      : currentProblem.difficulty === "Medium"
                      ? "diff-medium"
                      : "diff-hard"
                  }`}
                >
                  {currentProblem.difficulty}
                </span>
              </div>

              {/* Tags & Companies */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {currentProblem.tags.map((t) => (
                  <span key={t} className="badge badge-neutral" style={{ fontSize: 10.5 }}>{t}</span>
                ))}
                {currentProblem.companies.map((c) => (
                  <span key={c} style={{ fontSize: 10.5, padding: "2px 6px", borderRadius: 4, background: "rgba(59, 130, 246, 0.1)", color: "var(--blue)", fontWeight: 600 }}>
                    🏢 {c}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.65, whiteSpace: "pre-line", marginBottom: 20 }}>
                {currentProblem.description}
              </div>

              {/* Learning Objectives */}
              {currentProblem.learningObjectives && currentProblem.learningObjectives.length > 0 && (
                <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <Sparkles size={13} style={{ color: "var(--blue)" }} /> Learning Objectives
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)" }}>
                    {currentProblem.learningObjectives.map((obj, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Examples */}
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>Sample Examples</h3>
              {currentProblem.examples.map((ex, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: 12,
                    marginBottom: 10,
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace"
                  }}
                >
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Example {idx + 1}</div>
                  <div style={{ color: "var(--text-secondary)" }}><span style={{ color: "var(--text-muted)" }}>Input: </span>{ex.input}</div>
                  <div style={{ color: "var(--text-secondary)" }}><span style={{ color: "var(--text-muted)" }}>Output: </span>{ex.output}</div>
                  {ex.explanation && <div style={{ color: "var(--text-muted)", marginTop: 4 }}>Explanation: {ex.explanation}</div>}
                </div>
              ))}

              {/* Constraints */}
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginTop: 16, marginBottom: 8 }}>Constraints</h3>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
                {currentProblem.constraints.map((c, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ── 6-Tier Socratic Hint Ladder ── */}
          {leftTab === "hints" && (
            <div>
              <div style={{ marginBottom: 16, padding: 12, background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "var(--radius-md)" }}>
                <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  🎓 <strong>Socratic Learning Principle:</strong> ALGORA guides you step-by-step through a 6-tier ladder (Hint → Approach → Algorithm → Pseudocode → Partial Code → Solution). Unlocking higher hints builds deep problem-solving intuition!
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentProblem.hints.map((hint, idx) => {
                  const levelNum = hint.level;
                  const isUnlocked = levelNum <= unlockedLevel;

                  return (
                    <div
                      key={idx}
                      style={{
                        border: `1px solid ${isUnlocked ? "var(--border-strong)" : "var(--border)"}`,
                        borderRadius: "var(--radius-md)",
                        background: isUnlocked ? "var(--bg-surface)" : "var(--bg-subtle)",
                        overflow: "hidden"
                      }}
                    >
                      <div
                        style={{
                          padding: "10px 14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: isUnlocked ? "var(--bg-subtle)" : "transparent"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              background: isUnlocked ? "var(--blue)" : "var(--bg-muted)",
                              color: isUnlocked ? "#fff" : "var(--text-disabled)",
                              fontSize: 10,
                              fontWeight: 800,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {levelNum}
                          </span>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: isUnlocked ? "var(--text-primary)" : "var(--text-muted)" }}>
                            {hint.title}
                          </span>
                        </div>

                        {isUnlocked ? (
                          <span className="badge badge-green" style={{ fontSize: 10 }}>Unlocked</span>
                        ) : (
                          <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Lock size={12} /> Tier {levelNum}
                          </span>
                        )}
                      </div>

                      {isUnlocked && (
                        <div style={{ padding: 14, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6, borderTop: "1px solid var(--border)" }}>
                          <div style={{ whiteSpace: "pre-line" }}>{hint.content}</div>
                          {hint.codeSnippet && (
                            <pre
                              style={{
                                marginTop: 10,
                                padding: 10,
                                background: "#0d0f1c",
                                color: "#a9b1d6",
                                borderRadius: "var(--radius-sm)",
                                fontSize: 11.5,
                                fontFamily: "'JetBrains Mono', monospace",
                                overflowX: "auto"
                              }}
                            >
                              {hint.codeSnippet}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Unlock Next Tier Button */}
              {unlockedLevel < 6 && (
                <div style={{ marginTop: 16 }}>
                  {unlockedLevel === 5 ? (
                    <div>
                      {!confirmUnlockSolution ? (
                        <button
                          onClick={() => setConfirmUnlockSolution(true)}
                          style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "var(--radius-md)",
                            border: "1px dashed var(--amber)",
                            background: "rgba(217, 119, 6, 0.08)",
                            color: "var(--amber)",
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6
                          }}
                        >
                          <Lock size={14} /> Unlock Tier 6: Full Solution Code
                        </button>
                      ) : (
                        <div style={{ padding: 12, background: "var(--bg-subtle)", border: "1px solid var(--amber)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                          <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--text-secondary)" }}>
                            Are you sure? Trying to code it yourself first leads to 3x higher interview retention!
                          </p>
                          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                            <button
                              onClick={() => {
                                setUnlockedLevel(6);
                                setConfirmUnlockSolution(false);
                              }}
                              style={{ padding: "6px 14px", borderRadius: 4, background: "var(--amber)", color: "#fff", border: "none", fontWeight: 700, fontSize: 11, cursor: "pointer" }}
                            >
                              Show Solution
                            </button>
                            <button
                              onClick={() => setConfirmUnlockSolution(false)}
                              style={{ padding: "6px 14px", borderRadius: 4, background: "var(--bg-muted)", color: "var(--text-primary)", border: "none", fontWeight: 600, fontSize: 11, cursor: "pointer" }}
                            >
                              Keep Trying
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setUnlockedLevel((lvl) => Math.min(lvl + 1, 6))}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--blue)",
                        background: "rgba(59, 130, 246, 0.08)",
                        color: "var(--blue)",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6
                      }}
                    >
                      <Lightbulb size={14} /> Reveal Tier {unlockedLevel + 1} Hint
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI Mentor Tab */}
          {leftTab === "mentor" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4 }}>
                {mentorLog.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      maxWidth: "90%",
                      alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                      padding: "10px 14px",
                      borderRadius: m.role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      background: m.role === "user" ? "var(--blue)" : "var(--bg-subtle)",
                      color: m.role === "user" ? "#fff" : "var(--text-secondary)",
                      fontSize: 12.5,
                      lineHeight: 1.55,
                      border: m.role === "user" ? "none" : "1px solid var(--border)"
                    }}
                  >
                    {m.text}
                  </div>
                ))}
                {isAiThinking && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", display: "flex", alignItems: "center", gap: 6 }}>
                    <Sparkles size={12} className="animate-spin" /> AI Mentor is crafting a Socratic hint...
                  </div>
                )}
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={mentorMsg}
                  onChange={(e) => setMentorMsg(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendMentorMessage(); }}
                  placeholder="Ask a question about your code or approach..."
                  style={{
                    flex: 1,
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "8px 12px",
                    fontSize: 12.5,
                    color: "var(--text-primary)",
                    outline: "none"
                  }}
                />
                <button
                  onClick={sendMentorMessage}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--blue)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Center & Right: Code Editor & Judge Execution Output ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Editor Toolbar */}
        <div
          style={{
            height: 48,
            flexShrink: 0,
            background: "#0b0d18",
            borderBottom: "1px solid #1e2236",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            gap: 12
          }}
        >
          {/* Language Picker */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as LanguageKey)}
            style={{
              background: "#1a2236",
              border: "1px solid #283050",
              borderRadius: "var(--radius-sm)",
              color: "#a9b1d6",
              fontSize: 12,
              fontWeight: 600,
              padding: "4px 10px",
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer",
              outline: "none"
            }}
          >
            {(Object.keys(LANGUAGE_LABELS) as LanguageKey[]).map((key) => (
              <option key={key} value={key}>{LANGUAGE_LABELS[key]}</option>
            ))}
          </select>

          <div style={{ flex: 1 }} />

          {/* Controls */}
          <button
            onClick={handleCopyCode}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: "var(--radius-sm)", background: "#1a2236", border: "1px solid #283050", color: "#a9b1d6", fontSize: 11.5, cursor: "pointer" }}
          >
            <Copy size={12} /> Copy
          </button>
          <button
            onClick={handleResetCode}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: "var(--radius-sm)", background: "#1a2236", border: "1px solid #283050", color: "#a9b1d6", fontSize: 11.5, cursor: "pointer" }}
          >
            <RotateCcw size={12} /> Reset
          </button>

          {/* Run Code */}
          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              background: "#1e293b",
              border: "1px solid #334155",
              color: "#e2e8f0",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <Play size={12} style={{ color: "var(--green)" }} /> {isExecuting ? "Executing..." : "Run Code"}
          </button>

          {/* Submit Code */}
          <button
            onClick={handleSubmitCode}
            disabled={isSubmitting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 16px",
              borderRadius: "var(--radius-sm)",
              background: "linear-gradient(135deg, #2563eb, #4f46e5)",
              border: "none",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            <Send size={12} /> {isSubmitting ? "Judging..." : "Submit Solution"}
          </button>
        </div>

        {/* Code Input Area */}
        <div style={{ flex: 1, background: "#0d0f1c", position: "relative", display: "flex" }}>
          {/* Textarea Code Editor with Monospace styling */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            style={{
              width: "100%",
              height: "100%",
              background: "transparent",
              color: "#a9b1d6",
              fontFamily: "'JetBrains Mono', Consolas, Monaco, monospace",
              fontSize: 13,
              lineHeight: "1.6",
              padding: "16px 20px",
              border: "none",
              outline: "none",
              resize: "none"
            }}
          />
        </div>

        {/* Bottom Judge Execution Panel */}
        <div style={{ height: 210, background: "#080a12", borderTop: "1px solid #1e2236", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #1e2236", padding: "0 8px" }}>
            <button
              onClick={() => setRightTab("testcases")}
              style={{
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                background: "none",
                color: rightTab === "testcases" ? "#38bdf8" : "#64748b",
                borderBottom: `2px solid ${rightTab === "testcases" ? "#38bdf8" : "transparent"}`,
                cursor: "pointer"
              }}
            >
              Test Cases & Custom Input
            </button>
            <button
              onClick={() => setRightTab("results")}
              style={{
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                background: "none",
                color: rightTab === "results" ? "#38bdf8" : "#64748b",
                borderBottom: `2px solid ${rightTab === "results" ? "#38bdf8" : "transparent"}`,
                cursor: "pointer"
              }}
            >
              Execution Results {execResult && `(${execResult.status})`}
            </button>
          </div>

          <div style={{ flex: 1, padding: 14, overflowY: "auto" }}>
            {rightTab === "testcases" && (
              <div style={{ display: "flex", gap: 16, height: "100%" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>Sample Test Inputs</div>
                  {currentProblem.examples.map((ex, idx) => (
                    <div key={idx} style={{ padding: "6px 10px", background: "#131522", borderRadius: 4, marginBottom: 6, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#cbd5e1" }}>
                      Case {idx + 1}: {ex.input}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>Custom Test Input (Optional)</div>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter custom input string or array..."
                    style={{ width: "100%", height: 80, background: "#131522", border: "1px solid #1e293b", borderRadius: 4, padding: 8, color: "#e2e8f0", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", resize: "none" }}
                  />
                </div>
              </div>
            )}

            {rightTab === "results" && (
              <div>
                {!execResult ? (
                  <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", marginTop: 30 }}>
                    Click "Run Code" or "Submit Solution" to evaluate against the judge suite.
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: 4,
                          background: execResult.status === "Accepted" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: execResult.status === "Accepted" ? "#4ade80" : "#f87171"
                        }}
                      >
                        {execResult.status}
                      </span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        Runtime: <strong>{execResult.runtimeMs} ms</strong>
                      </span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        Memory: <strong>{execResult.memoryMb} MB</strong>
                      </span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        Passed: <strong>{execResult.passedTests} / {execResult.totalTests}</strong>
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {execResult.testResults.map((tr, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: "#131522",
                            border: `1px solid ${tr.passed ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                            borderRadius: 6,
                            padding: "8px 12px",
                            minWidth: 160
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            {tr.passed ? <CheckCircle2 size={13} style={{ color: "#4ade80" }} /> : <XCircle size={13} style={{ color: "#f87171" }} />}
                            <span style={{ fontSize: 11, fontWeight: 700, color: tr.passed ? "#4ade80" : "#f87171" }}>
                              Case {idx + 1}
                            </span>
                          </div>
                          <div style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: "#cbd5e1" }}>
                            <div>In: {tr.input}</div>
                            <div>Expected: {tr.expected}</div>
                            <div>Got: {tr.actual}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
