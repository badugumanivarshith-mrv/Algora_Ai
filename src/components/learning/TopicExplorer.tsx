import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Code2, Cpu, Terminal, FileCode, ChevronRight, ChevronDown,
  CheckCircle2, Lock, PlayCircle, BookOpen, Clock, Zap,
} from "lucide-react";
import type { CurriculumTopic, SupportedLanguage } from "../../types";

interface TopicExplorerProps {
  topics: CurriculumTopic[];
}

const LANGUAGES: SupportedLanguage[] = ["Python", "C++", "Java", "C"];

export default function TopicExplorer({ topics }: TopicExplorerProps) {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("Python");
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const filteredTopics = topics.filter((t) => t.language === selectedLanguage);

  const toggleTopic = (id: string) => {
    setExpandedTopicId(expandedTopicId === id ? null : id);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Language Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          background: "var(--bg-surface)",
          padding: 6,
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          width: "fit-content",
        }}
      >
        {LANGUAGES.map((lang) => {
          const active = lang === selectedLanguage;
          return (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                border: "none",
                background: active ? "var(--blue)" : "transparent",
                color: active ? "#ffffff" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.12s ease",
              }}
            >
              {lang === "Python" && <FileCode size={15} />}
              {lang === "C++" && <Cpu size={15} />}
              {lang === "Java" && <Code2 size={15} />}
              {lang === "C" && <Terminal size={15} />}
              {lang} Curriculum
            </button>
          );
        })}
      </div>

      {/* Topic Cards Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filteredTopics.map((topic) => {
          const isExpanded = expandedTopicId === topic.id;
          return (
            <div
              key={topic.id}
              className="surface-card"
              style={{
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                border: "1px solid var(--border)",
              }}
            >
              {/* Header Strip */}
              <div
                onClick={() => toggleTopic(topic.id)}
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 260, flex: 1 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-md)",
                      background: "var(--blue-light)",
                      color: "var(--blue)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {topic.language === "Python" && <FileCode size={20} />}
                    {topic.language === "C++" && <Cpu size={20} />}
                    {topic.language === "Java" && <Code2 size={20} />}
                    {topic.language === "C" && <Terminal size={20} />}
                  </div>

                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 3px" }}>
                      {topic.title}
                    </h3>
                    <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: 0 }}>
                      {topic.description}
                    </p>
                  </div>
                </div>

                {/* Metrics & Difficulty breakdown */}
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
                    <span className="badge diff-easy">{topic.difficultyBreakdown.easy} Easy</span>
                    <span className="badge diff-medium">{topic.difficultyBreakdown.medium} Med</span>
                    <span className="badge diff-hard">{topic.difficultyBreakdown.hard} Hard</span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: 140 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: "var(--text-muted)" }}>{topic.completedProblems}/{topic.totalProblems} Solved</span>
                      <span style={{ fontWeight: 700, color: "var(--blue)" }}>{topic.progress}%</span>
                    </div>
                    <div className="progress">
                      <div className="progress-fill" style={{ width: `${topic.progress}%` }} />
                    </div>
                  </div>

                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
              </div>

              {/* Expanded Modules & Lessons */}
              {isExpanded && (
                <div style={{ borderTop: "1px solid var(--border)", background: "var(--bg-surface)", padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {topic.modules.map((module) => (
                      <div
                        key={module.id}
                        style={{
                          background: "var(--bg-raised)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            padding: "12px 16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderBottom: "1px solid var(--border-subtle)",
                          }}
                        >
                          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                            {module.title}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {module.lessons.filter((l) => l.status === "completed").length} / {module.lessons.length} Completed
                          </span>
                        </div>

                        <div className="divide-theme">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 16px",
                                fontSize: 12.5,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                {lesson.status === "completed" ? (
                                  <CheckCircle2 size={15} style={{ color: "var(--green)" }} />
                                ) : lesson.status === "active" ? (
                                  <PlayCircle size={15} style={{ color: "var(--blue)" }} />
                                ) : (
                                  <Lock size={15} style={{ color: "var(--text-disabled)" }} />
                                )}

                                <span
                                  style={{
                                    fontWeight: lesson.status === "active" ? 600 : 400,
                                    color:
                                      lesson.status === "locked"
                                        ? "var(--text-disabled)"
                                        : "var(--text-primary)",
                                  }}
                                >
                                  {lesson.title}
                                </span>

                                <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                                  {lesson.type}
                                </span>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                                  <Clock size={11} /> {lesson.duration}
                                </span>

                                {lesson.problemSlug ? (
                                  <button
                                    onClick={() => navigate(`/workspace?problem=${lesson.problemSlug}`)}
                                    className="btn btn-primary btn-sm"
                                    style={{ fontSize: 11, padding: "3px 8px" }}
                                  >
                                    Open in Workspace
                                  </button>
                                ) : (
                                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                    +{lesson.xp ?? 20} XP
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
