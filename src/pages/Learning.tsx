import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  BookOpen, Code2, Map, Layers, Trophy, CheckCircle2,
  Sparkles, Search, Filter,
} from "lucide-react";
import LearningPathView from "../components/learning/LearningPathView";
import TopicExplorer from "../components/learning/TopicExplorer";
import ProblemExplorer from "../components/learning/ProblemExplorer";
import { LEARNING_PATHS, CURRICULUM_TOPICS } from "../data/curriculum";
import { PROBLEMS } from "../data/problems";

type LearningTab = "paths" | "topics" | "problems";

export default function Learning() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as LearningTab) || "paths";
  const [activeTab, setActiveTab] = useState<LearningTab>(initialTab);

  useEffect(() => {
    const tab = searchParams.get("tab") as LearningTab;
    if (tab && ["paths", "topics", "problems"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: LearningTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div style={{ padding: "24px", maxWidth: 1300, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Computer Science Curriculum & Problems
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: 0 }}>
            Master algorithms, data structures, and low-level systems programming across C, C++, Java, and Python.
          </p>
        </div>

        {/* Tab Navigation Pill Strip */}
        <div
          style={{
            display: "flex",
            gap: 6,
            background: "var(--bg-surface)",
            padding: 4,
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
          }}
        >
          <button
            onClick={() => handleTabChange("paths")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
              fontWeight: activeTab === "paths" ? 700 : 500,
              border: "none",
              background: activeTab === "paths" ? "var(--blue)" : "transparent",
              color: activeTab === "paths" ? "#ffffff" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 0.12s",
            }}
          >
            <Map size={14} /> Learning Paths
          </button>

          <button
            onClick={() => handleTabChange("topics")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
              fontWeight: activeTab === "topics" ? 700 : 500,
              border: "none",
              background: activeTab === "topics" ? "var(--blue)" : "transparent",
              color: activeTab === "topics" ? "#ffffff" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            <Layers size={14} /> Topic Explorer
          </button>

          <button
            onClick={() => handleTabChange("problems")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
              fontWeight: activeTab === "problems" ? 700 : 500,
              border: "none",
              background: activeTab === "problems" ? "var(--blue)" : "transparent",
              color: activeTab === "problems" ? "#ffffff" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            <Code2 size={14} /> Problem Explorer ({PROBLEMS.length})
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "paths" && <LearningPathView paths={LEARNING_PATHS} />}
      {activeTab === "topics" && <TopicExplorer topics={CURRICULUM_TOPICS} />}
      {activeTab === "problems" && <ProblemExplorer problems={PROBLEMS} />}
    </div>
  );
}
