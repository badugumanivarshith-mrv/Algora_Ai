import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Compass, Plus, Trash2 } from "lucide-react";
import { CurriculumPathEntity, CurriculumModuleEntity, CurriculumLessonEntity } from "../../types";
import { AdminApi } from "../../services/adminApi";

interface CurriculumEditorModalProps {
  path: CurriculumPathEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (saved: CurriculumPathEntity) => void;
}

export default function CurriculumEditorModal({
  path,
  isOpen,
  onClose,
  onSave,
}: CurriculumEditorModalProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [language, setLanguage] = useState("Python");
  const [description, setDescription] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [estimatedHours, setEstimatedHours] = useState(40);
  const [isPublished, setIsPublished] = useState(true);
  const [modules, setModules] = useState<CurriculumModuleEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (path) {
      setTitle(path.title);
      setSlug(path.slug);
      setLanguage(path.language || "Python");
      setDescription(path.description || "");
      setTargetRole(path.targetRole || "Software Engineer");
      setDifficulty(path.difficulty || "Intermediate");
      setEstimatedHours(path.estimatedHours || 40);
      setIsPublished(path.isPublished);
      setModules(path.modules || []);
    } else {
      setTitle("");
      setSlug("");
      setLanguage("Python");
      setDescription("");
      setTargetRole("Full Stack & Algorithms Engineer");
      setDifficulty("Beginner to Intermediate");
      setEstimatedHours(35);
      setIsPublished(true);
      setModules([
        {
          id: `mod-${Date.now()}`,
          pathId: "",
          title: "Module 1: Core Fundamentals",
          description: "Variables, control flow, and algorithmic complexity",
          orderIndex: 1,
          status: "active",
          createdAt: new Date().toISOString(),
          lessons: [
            {
              id: `les-${Date.now()}`,
              moduleId: "",
              title: "Lesson 1: Introduction & Complexity",
              lessonType: "lesson",
              duration: "15 min",
              xpReward: 25,
              orderIndex: 1,
              createdAt: new Date().toISOString(),
            },
          ],
        },
      ]);
    }
    setError(null);
  }, [path, isOpen]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!path) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
      );
    }
  };

  const handleAddModule = () => {
    const newMod: CurriculumModuleEntity = {
      id: `mod-${Date.now()}`,
      pathId: path?.id || "",
      title: `Module ${modules.length + 1}: New Curriculum Module`,
      description: "Module objectives and practical exercises",
      orderIndex: modules.length + 1,
      status: "active",
      createdAt: new Date().toISOString(),
      lessons: [],
    };
    setModules([...modules, newMod]);
  };

  const handleRemoveModule = (modId: string) => {
    setModules(modules.filter((m) => m.id !== modId));
  };

  const handleAddLesson = (modId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id !== modId) return m;
        const lessons = m.lessons || [];
        const newLesson: CurriculumLessonEntity = {
          id: `les-${Date.now()}`,
          moduleId: modId,
          title: `Lesson ${lessons.length + 1}: Practice & Concepts`,
          lessonType: "problem",
          duration: "20 min",
          problemSlug: "two-sum",
          xpReward: 50,
          orderIndex: lessons.length + 1,
          createdAt: new Date().toISOString(),
        };
        return { ...m, lessons: [...lessons, newLesson] };
      })
    );
  };

  const handleRemoveLesson = (modId: string, lesId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id !== modId) return m;
        return {
          ...m,
          lessons: (m.lessons || []).filter((l) => l.id !== lesId),
        };
      })
    );
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      setError("Path title and slug are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload: Partial<CurriculumPathEntity> = {
      title,
      slug,
      language,
      description,
      targetRole,
      difficulty,
      estimatedHours: Number(estimatedHours),
      isPublished,
      modules,
    };

    try {
      if (path?.id) {
        const res = await AdminApi.updateCurriculumPath(path.id, payload);
        if (res.success && res.data) {
          onSave(res.data);
          onClose();
        } else {
          setError(res.error?.message || "Failed to update curriculum path.");
        }
      } else {
        const res = await AdminApi.createCurriculumPath(payload);
        if (res.success && res.data) {
          onSave(res.data);
          onClose();
        } else {
          setError(res.error?.message || "Failed to create curriculum path.");
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
          maxWidth: 860,
          maxHeight: "90vh",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg, 12px)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "var(--radius-md)",
                background: "color-mix(in srgb, var(--brand) 15%, transparent)",
                color: "var(--brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Compass size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                {path ? `Edit Path: ${path.title}` : "Create Learning Curriculum Path"}
              </h2>
              <p style={{ fontSize: 12, margin: 0, color: "var(--text-muted)" }}>
                Structure modular course sequences, practice problem links, and milestone rewards
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
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

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

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Path Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Python Core & Data Structures"
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
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                URL Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="python-fundamentals"
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Target Language
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="Python / C++"
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
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Full Stack Engineer"
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
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Est. Hours
              </label>
              <input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                min={5}
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
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Status
              </label>
              <select
                value={isPublished ? "published" : "hidden"}
                onChange={(e) => setIsPublished(e.target.value === "published")}
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
                <option value="published">Published</option>
                <option value="hidden">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
              Path Overview & Learning Trajectory
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
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

          {/* Modules and Lessons Builder */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                Curriculum Modules ({modules.length})
              </h3>
              <button
                onClick={handleAddModule}
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
                <span>Add Module</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {modules.map((mod, modIdx) => (
                <div
                  key={mod.id}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: 16,
                    background: "var(--bg-subtle)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "var(--radius-sm)",
                          background: "color-mix(in srgb, var(--brand) 20%, transparent)",
                          color: "var(--brand)",
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      >
                        Module {modIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={mod.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setModules(modules.map((m) => (m.id === mod.id ? { ...m, title: val } : m)));
                        }}
                        style={{
                          flex: 1,
                          padding: "4px 8px",
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-sm)",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveModule(mod.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--red, #ef4444)",
                        cursor: "pointer",
                        padding: 4,
                        marginLeft: 8,
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Lessons in this module */}
                  <div style={{ paddingLeft: 12, borderLeft: "2px solid var(--border)", marginTop: 8 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(mod.lessons || []).map((les, lesIdx) => (
                        <div
                          key={les.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 100px 100px 80px 30px",
                            gap: 8,
                            alignItems: "center",
                            background: "var(--bg-surface)",
                            padding: "6px 10px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <input
                            type="text"
                            value={les.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setModules(
                                modules.map((m) =>
                                  m.id === mod.id
                                    ? {
                                        ...m,
                                        lessons: (m.lessons || []).map((l) => (l.id === les.id ? { ...l, title: val } : l)),
                                      }
                                    : m
                                )
                              );
                            }}
                            style={{
                              padding: "4px 8px",
                              background: "transparent",
                              border: "none",
                              fontSize: 12,
                              color: "var(--text-primary)",
                            }}
                          />
                          <select
                            value={les.lessonType}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setModules(
                                modules.map((m) =>
                                  m.id === mod.id
                                    ? {
                                        ...m,
                                        lessons: (m.lessons || []).map((l) => (l.id === les.id ? { ...l, lessonType: val } : l)),
                                      }
                                    : m
                                )
                              );
                            }}
                            style={{
                              padding: "4px 6px",
                              fontSize: 11,
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--border)",
                              background: "var(--bg-subtle)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            <option value="lesson">Lesson</option>
                            <option value="problem">Problem</option>
                            <option value="example">Example</option>
                            <option value="quiz">Quiz</option>
                          </select>
                          <input
                            type="text"
                            value={les.problemSlug || ""}
                            placeholder="slug..."
                            onChange={(e) => {
                              const val = e.target.value;
                              setModules(
                                modules.map((m) =>
                                  m.id === mod.id
                                    ? {
                                        ...m,
                                        lessons: (m.lessons || []).map((l) => (l.id === les.id ? { ...l, problemSlug: val } : l)),
                                      }
                                    : m
                                )
                              );
                            }}
                            style={{
                              padding: "4px 6px",
                              fontSize: 11,
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--border)",
                              background: "var(--bg-subtle)",
                              color: "var(--text-primary)",
                              fontFamily: "var(--font-mono, monospace)",
                            }}
                          />
                          <span style={{ fontSize: 11, color: "var(--amber, #f59e0b)", fontWeight: 600, textAlign: "right" }}>
                            +{les.xpReward} XP
                          </span>
                          <button
                            onClick={() => handleRemoveLesson(mod.id, les.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--text-muted)",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleAddLesson(mod.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        marginTop: 8,
                        background: "transparent",
                        border: "none",
                        color: "var(--brand)",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={12} />
                      <span>Add lesson to Module {modIdx + 1}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 10,
            background: "var(--bg-subtle)",
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "7px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--bg-surface)",
              color: "var(--text-secondary)",
              fontSize: 13,
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
              gap: 6,
              padding: "7px 16px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "var(--brand)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            <Save size={14} />
            <span>{loading ? "Saving..." : path ? "Save Path Changes" : "Create Curriculum Path"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
