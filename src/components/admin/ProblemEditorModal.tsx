import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Code2,
  CheckCircle2,
  FileText,
  History,
  AlertCircle,
  Save,
} from "lucide-react";
import { ProblemCMSEntity, ProblemDifficulty, SupportedLanguage, TestCaseItem, ProblemVersionEntity } from "../../types";
import { AdminApi } from "../../services/adminApi";

interface ProblemEditorModalProps {
  problem: ProblemCMSEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (saved: ProblemCMSEntity) => void;
}

const SUPPORTED_LANGS: SupportedLanguage[] = ["Python", "C++", "Java", "C"];
const DIFFICULTIES: ProblemDifficulty[] = ["Easy", "Medium", "Hard"];
const TOPICS = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Heap / Priority Queue",
  "Backtracking",
  "Tries",
  "Graphs",
  "Dynamic Programming",
  "Greedy",
  "Intervals",
  "Math & Geometry",
  "Bit Manipulation",
];

export default function ProblemEditorModal({
  problem,
  isOpen,
  onClose,
  onSave,
}: ProblemEditorModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "starter" | "testcases" | "history">("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [difficulty, setDifficulty] = useState<ProblemDifficulty>("Medium");
  const [language, setLanguage] = useState<SupportedLanguage>("Python");
  const [topic, setTopic] = useState("Arrays & Hashing");
  const [tagsInput, setTagsInput] = useState("Array, Hash Table");
  const [xpReward, setXpReward] = useState(100);
  const [description, setDescription] = useState("");
  const [constraintsInput, setConstraintsInput] = useState("1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9");
  const [hintsInput, setHintsInput] = useState("Consider using a hash table to store complement values.");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("published");

  // Code templates
  const [selectedLangTab, setSelectedLangTab] = useState<SupportedLanguage>("Python");
  const [starterCodes, setStarterCodes] = useState<Record<string, string>>({
    Python: "class Solution:\n    def solve(self) -> None:\n        pass",
    "C++": "class Solution {\npublic:\n    void solve() {\n    }\n};",
    Java: "class Solution {\n    public void solve() {\n    }\n}",
    C: "void solve() {\n}",
  });

  // Test cases
  const [testCases, setTestCases] = useState<TestCaseItem[]>([
    { id: "tc-1", input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0,1]", passed: true, runtimeMs: 4, memoryMb: 14.5 },
  ]);
  const [hiddenTestCases, setHiddenTestCases] = useState<TestCaseItem[]>([
    { id: "tc-h1", input: "nums = [3,3], target = 6", expectedOutput: "[0,1]", isHidden: true },
  ]);

  // Version history
  const [versions, setVersions] = useState<ProblemVersionEntity[]>([]);
  const [changeSummary, setChangeSummary] = useState("");

  useEffect(() => {
    if (problem) {
      setTitle(problem.title);
      setSlug(problem.slug);
      setDifficulty(problem.difficulty);
      setLanguage((problem.language as SupportedLanguage) || "Python");
      setTopic(problem.topic);
      setTagsInput(problem.tags.join(", "));
      setXpReward(problem.xpReward);
      setDescription(problem.description);
      setConstraintsInput(problem.constraints.join("\n"));
      setHintsInput(problem.hints?.join("\n") || "");
      setStatus(problem.status);
      setStarterCodes(problem.starterCodes || {
        Python: "class Solution:\n    def solve(self) -> None:\n        pass",
        "C++": "class Solution {\npublic:\n    void solve() {\n    }\n};",
        Java: "class Solution {\n    public void solve() {\n    }\n}",
        C: "void solve() {\n}",
      });
      setTestCases(problem.testCases && problem.testCases.length > 0 ? problem.testCases : [
        { id: "tc-1", input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0,1]" }
      ]);
      setHiddenTestCases(problem.hiddenTestCases || []);
      setChangeSummary("");

      // Fetch version history if editing existing
      if (problem.id) {
        AdminApi.getProblemVersions(problem.id).then((res) => {
          if (res.success && res.data) {
            setVersions(res.data);
          }
        });
      }
    } else {
      // Reset for new creation
      setTitle("");
      setSlug("");
      setDifficulty("Medium");
      setLanguage("Python");
      setTopic("Arrays & Hashing");
      setTagsInput("Array, Hash Table");
      setXpReward(100);
      setDescription("<p>Given an array of integers, return the optimal solution.</p>");
      setConstraintsInput("1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9");
      setHintsInput("Consider using extra space with a hash map.");
      setStatus("draft");
      setStarterCodes({
        Python: "class Solution:\n    def solve(self, nums: list[int]) -> int:\n        # Write solution\n        return 0",
        "C++": "class Solution {\npublic:\n    int solve(vector<int>& nums) {\n        return 0;\n    }\n};",
        Java: "class Solution {\n    public int solve(int[] nums) {\n        return 0;\n    }\n}",
        C: "int solve(int* nums, int numsSize) {\n    return 0;\n}",
      });
      setTestCases([{ id: `tc-${Date.now()}`, input: "nums = [1,2,3]", expectedOutput: "6" }]);
      setHiddenTestCases([{ id: `tc-h-${Date.now()}`, input: "nums = [10,20,30]", expectedOutput: "60", isHidden: true }]);
      setVersions([]);
      setChangeSummary("");
    }
    setError(null);
  }, [problem, isOpen]);

  // Auto-slug generator
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!problem) {
      const generatedSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setSlug(generatedSlug);
    }
  };

  const handleAddTestCase = (isHidden: boolean) => {
    const newCase: TestCaseItem = {
      id: `tc-${Date.now()}`,
      input: "nums = [1, 2]",
      expectedOutput: "3",
      isHidden,
    };
    if (isHidden) {
      setHiddenTestCases([...hiddenTestCases, newCase]);
    } else {
      setTestCases([...testCases, newCase]);
    }
  };

  const handleRemoveTestCase = (id: string, isHidden: boolean) => {
    if (isHidden) {
      setHiddenTestCases(hiddenTestCases.filter((tc) => tc.id !== id));
    } else {
      setTestCases(testCases.filter((tc) => tc.id !== id));
    }
  };

  const handleUpdateTestCase = (id: string, field: "input" | "expectedOutput", val: string, isHidden: boolean) => {
    if (isHidden) {
      setHiddenTestCases(
        hiddenTestCases.map((tc) => (tc.id === id ? { ...tc, [field]: val } : tc))
      );
    } else {
      setTestCases(
        testCases.map((tc) => (tc.id === id ? { ...tc, [field]: val } : tc))
      );
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const constraints = constraintsInput
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean);

    const hints = hintsInput
      .split("\n")
      .map((h) => h.trim())
      .filter(Boolean);

    const payload: Partial<ProblemCMSEntity> = {
      title,
      slug,
      difficulty,
      language,
      topic,
      tags,
      xpReward: Number(xpReward),
      description,
      constraints,
      hints,
      status,
      starterCodes,
      testCases,
      hiddenTestCases,
      changeSummary: changeSummary || (problem ? "Updated problem via CMS" : "Created new problem via CMS"),
    };

    try {
      if (problem?.id) {
        const res = await AdminApi.updateProblem(problem.id, payload);
        if (res.success && res.data) {
          onSave(res.data);
          onClose();
        } else {
          setError(res.error?.message || "Failed to update problem.");
        }
      } else {
        const res = await AdminApi.createProblem(payload);
        if (res.success && res.data) {
          onSave(res.data);
          onClose();
        } else {
          setError(res.error?.message || "Failed to create problem.");
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg, 12px)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                background: "color-mix(in srgb, var(--brand) 15%, transparent)",
                color: "var(--brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Code2 size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                {problem ? `Edit Problem: ${problem.title}` : "Create New Algorithmic Problem"}
              </h2>
              <p style={{ fontSize: 12, margin: 0, color: "var(--text-muted)" }}>
                {problem ? `ID #${problem.id} · Version ${versions.length || 1}` : "Define test cases, constraints, and starter boilerplate"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: 6,
              borderRadius: "var(--radius-sm)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            paddingInline: 24,
            background: "var(--bg-surface)",
            gap: 24,
          }}
        >
          {[
            { key: "general", label: "General & Description", icon: FileText },
            { key: "starter", label: "Starter Boilerplate", icon: Code2 },
            { key: "testcases", label: `Test Cases (${testCases.length + hiddenTestCases.length})`, icon: CheckCircle2 },
            { key: "history", label: `Versions (${versions.length})`, icon: History },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 4px",
                border: "none",
                background: "transparent",
                borderBottom: activeTab === key ? "2px solid var(--brand)" : "2px solid transparent",
                color: activeTab === key ? "var(--brand)" : "var(--text-secondary)",
                fontWeight: activeTab === key ? 600 : 500,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Error notification */}
        {error && (
          <div
            style={{
              padding: "10px 24px",
              background: "color-mix(in srgb, var(--red, #ef4444) 15%, transparent)",
              borderBottom: "1px solid color-mix(in srgb, var(--red, #ef4444) 30%, transparent)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "var(--red, #ef4444)",
            }}
          >
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {activeTab === "general" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    Problem Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Two Sum"
                    className="input-field w-full"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="two-sum"
                    className="input-field w-full"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as ProblemDifficulty)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    Primary Topic
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    XP Reward
                  </label>
                  <input
                    type="number"
                    value={xpReward}
                    onChange={(e) => setXpReward(Number(e.target.value))}
                    min={10}
                    max={1000}
                    step={10}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    Publish Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  >
                    <option value="draft">Draft (Admin Only)</option>
                    <option value="published">Published (Live to Students)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Array, Hash Table, Two Pointers"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Problem Statement & Description (Supports HTML/Markdown)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontFamily: "var(--font-mono, monospace)",
                    lineHeight: 1.5,
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    Constraints (One per line)
                  </label>
                  <textarea
                    value={constraintsInput}
                    onChange={(e) => setConstraintsInput(e.target.value)}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      fontSize: 12,
                      fontFamily: "var(--font-mono, monospace)",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    Hints (One per line)
                  </label>
                  <textarea
                    value={hintsInput}
                    onChange={(e) => setHintsInput(e.target.value)}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      fontSize: 12,
                    }}
                  />
                </div>
              </div>

              {problem && (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    Audit Change Summary (Optional for Version History)
                  </label>
                  <input
                    type="text"
                    value={changeSummary}
                    onChange={(e) => setChangeSummary(e.target.value)}
                    placeholder="e.g., Added hidden boundary test cases and updated constraints"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === "starter" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
                {SUPPORTED_LANGS.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLangTab(lang)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "var(--radius-md)",
                      border: selectedLangTab === lang ? "1px solid var(--brand)" : "1px solid var(--border)",
                      background: selectedLangTab === lang ? "color-mix(in srgb, var(--brand) 15%, transparent)" : "var(--bg-subtle)",
                      color: selectedLangTab === lang ? "var(--brand)" : "var(--text-secondary)",
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Starter Code Template ({selectedLangTab})
                </label>
                <textarea
                  value={starterCodes[selectedLangTab] || ""}
                  onChange={(e) => setStarterCodes({ ...starterCodes, [selectedLangTab]: e.target.value })}
                  rows={12}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontFamily: "var(--font-mono, monospace)",
                    lineHeight: 1.5,
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === "testcases" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Visible Test Cases */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Eye size={16} style={{ color: "var(--brand)" }} />
                    <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "var(--text-primary)" }}>
                      Public Example Test Cases (Visible in Student IDE)
                    </h3>
                  </div>
                  <button
                    onClick={() => handleAddTestCase(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={13} />
                    <span>Add Public Case</span>
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {testCases.map((tc, idx) => (
                    <div
                      key={tc.id || idx}
                      style={{
                        padding: 12,
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 40px",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                          Input Parameters #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={tc.input}
                          onChange={(e) => handleUpdateTestCase(tc.id, "input", e.target.value, false)}
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: 12,
                            fontFamily: "var(--font-mono, monospace)",
                            color: "var(--text-primary)",
                          }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                          Expected Output #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={tc.expectedOutput}
                          onChange={(e) => handleUpdateTestCase(tc.id, "expectedOutput", e.target.value, false)}
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: 12,
                            fontFamily: "var(--font-mono, monospace)",
                            color: "var(--text-primary)",
                          }}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveTestCase(tc.id, false)}
                        disabled={testCases.length <= 1}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--red, #ef4444)",
                          cursor: testCases.length <= 1 ? "not-allowed" : "pointer",
                          opacity: testCases.length <= 1 ? 0.3 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hidden Test Cases */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <EyeOff size={16} style={{ color: "var(--amber, #f59e0b)" }} />
                    <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "var(--text-primary)" }}>
                      Hidden Evaluation Test Cases (Judged in Sandbox Only)
                    </h3>
                  </div>
                  <button
                    onClick={() => handleAddTestCase(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={13} />
                    <span>Add Hidden Case</span>
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {hiddenTestCases.map((tc, idx) => (
                    <div
                      key={tc.id || idx}
                      style={{
                        padding: 12,
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 40px",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                          Hidden Input #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={tc.input}
                          onChange={(e) => handleUpdateTestCase(tc.id, "input", e.target.value, true)}
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: 12,
                            fontFamily: "var(--font-mono, monospace)",
                            color: "var(--text-primary)",
                          }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                          Expected Output #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={tc.expectedOutput}
                          onChange={(e) => handleUpdateTestCase(tc.id, "expectedOutput", e.target.value, true)}
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: 12,
                            fontFamily: "var(--font-mono, monospace)",
                            color: "var(--text-primary)",
                          }}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveTestCase(tc.id, true)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--red, #ef4444)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div>
              {versions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                  <History size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                  <p style={{ fontSize: 13 }}>No version history recorded yet. Saving modifications will create immutable snapshots.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {versions.map((ver) => (
                    <div
                      key={ver.id}
                      style={{
                        padding: 16,
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border)",
                        background: "var(--bg-subtle)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "var(--radius-full, 9999px)",
                              background: "color-mix(in srgb, var(--brand) 20%, transparent)",
                              color: "var(--brand)",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            v{ver.versionNumber}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                            {ver.title}
                          </span>
                        </div>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {new Date(ver.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 6px 0" }}>
                        <strong>Change:</strong> {ver.changeSummary || "No description provided"}
                      </p>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", gap: 12 }}>
                        <span>Author: {ver.changerName || "Admin"}</span>
                        <span>Difficulty: {ver.difficulty}</span>
                        <span>Test Cases: {ver.testCases?.length || 0} visible, {ver.hiddenTestCases?.length || 0} hidden</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 12,
            background: "var(--bg-subtle)",
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--bg-surface)",
              color: "var(--text-secondary)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "var(--brand)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Save size={14} />
            <span>{loading ? "Saving..." : problem ? "Save Changes" : "Create Problem"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
