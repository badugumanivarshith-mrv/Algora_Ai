import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Search, Filter, CheckCircle2, Circle, ArrowUpRight, Trophy, Code2, Tag } from "lucide-react";
import type { Problem, ProblemDifficulty, SupportedLanguage } from "../../types";

interface ProblemExplorerProps {
  problems: Problem[];
}

export default function ProblemExplorer({ problems }: ProblemExplorerProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [selectedLang, setSelectedLang] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const topics = useMemo(() => {
    const set = new Set(problems.map((p) => p.topic));
    return ["All", ...Array.from(set)];
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
        p.topic.toLowerCase().includes(search.toLowerCase());

      const matchDiff = selectedDifficulty === "All" || p.difficulty === selectedDifficulty;
      const matchTopic = selectedTopic === "All" || p.topic === selectedTopic;
      const matchLang = selectedLang === "All" || p.language === selectedLang;
      const matchStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Solved" && p.solved) ||
        (selectedStatus === "Todo" && !p.solved);

      return matchSearch && matchDiff && matchTopic && matchLang && matchStatus;
    });
  }, [problems, search, selectedDifficulty, selectedTopic, selectedLang, selectedStatus]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Controls Strip */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          background: "var(--bg-surface)",
          padding: "14px 16px",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Search input */}
        <div
          style={{
            position: "relative",
            flex: "1 1 240px",
            minWidth: 200,
          }}
        >
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems, topics, tags..."
            style={{
              width: "100%",
              padding: "7px 10px 7px 32px",
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
        </div>

        {/* Difficulty Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {["All", "Easy", "Medium", "Hard"].map((d) => {
            const active = selectedDifficulty === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 12,
                  fontWeight: active ? 600 : 500,
                  border: "1px solid",
                  borderColor: active ? "var(--border-strong)" : "transparent",
                  background: active ? "var(--bg-raised)" : "transparent",
                  color:
                    d === "Easy" && active
                      ? "var(--green)"
                      : d === "Medium" && active
                      ? "var(--amber)"
                      : d === "Hard" && active
                      ? "var(--red)"
                      : active
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                {d}
              </button>
            );
          })}
        </div>

        {/* Topic Filter dropdown */}
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          style={{
            padding: "6px 10px",
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            fontSize: 12,
            color: "var(--text-primary)",
            cursor: "pointer",
          }}
        >
          {topics.map((t) => (
            <option key={t} value={t}>
              {t === "All" ? "All Topics" : t}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: "6px 10px",
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            fontSize: 12,
            color: "var(--text-primary)",
            cursor: "pointer",
          }}
        >
          <option value="All">All Status</option>
          <option value="Solved">Solved</option>
          <option value="Todo">To Do</option>
        </select>
      </div>

      {/* Results summary */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--text-muted)", paddingInline: 4 }}>
        <span>Showing <strong>{filteredProblems.length}</strong> of {problems.length} problems</span>
        <span>Filter applied</span>
      </div>

      {/* Problems Table */}
      <div
        className="surface-card"
        style={{
          overflow: "hidden",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px 1fr 100px 90px 140px 80px 100px",
            padding: "10px 16px",
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border)",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text-muted)",
            letterSpacing: "0.04em",
          }}
        >
          <span>STATUS</span>
          <span>TITLE</span>
          <span>DIFFICULTY</span>
          <span>ACCEPTANCE</span>
          <span>TOPIC</span>
          <span>XP</span>
          <span style={{ textAlign: "right" }}>ACTION</span>
        </div>

        <div className="divide-theme">
          {filteredProblems.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              No problems match your current filter criteria.
            </div>
          ) : (
            filteredProblems.map((p) => {
              const diffCn =
                p.difficulty === "Easy" ? "diff-easy" : p.difficulty === "Medium" ? "diff-medium" : "diff-hard";
              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/workspace?problem=${p.slug}`)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 100px 90px 140px 80px 100px",
                    alignItems: "center",
                    padding: "12px 16px",
                    cursor: "pointer",
                    fontSize: 13,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Status */}
                  <div>
                    {p.solved ? (
                      <CheckCircle2 size={16} style={{ color: "var(--green)" }} />
                    ) : (
                      <Circle size={16} style={{ color: "var(--text-placeholder)" }} />
                    )}
                  </div>

                  {/* Title & tags */}
                  <div style={{ minWidth: 0, paddingRight: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {p.id}. {p.title}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                      {p.tags.slice(0, 2).map((t) => (
                        <span key={t} className="badge badge-neutral" style={{ fontSize: 10 }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <span className={`badge ${diffCn}`}>{p.difficulty}</span>
                  </div>

                  {/* Acceptance */}
                  <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                    {p.acceptance}
                  </div>

                  {/* Topic */}
                  <div style={{ color: "var(--text-muted)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.topic}
                  </div>

                  {/* XP */}
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--amber)",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <Trophy size={11} /> +{p.xpReward}
                    </span>
                  </div>

                  {/* Action */}
                  <div style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ padding: "4px 10px", fontSize: 11 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/workspace?problem=${p.slug}`);
                      }}
                    >
                      Solve <ArrowUpRight size={11} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
