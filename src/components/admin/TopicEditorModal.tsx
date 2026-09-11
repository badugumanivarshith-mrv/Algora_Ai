import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, BookOpen } from "lucide-react";
import { TopicCMSEntity } from "../../types";
import { AdminApi } from "../../services/adminApi";

interface TopicEditorModalProps {
  topic: TopicCMSEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (saved: TopicCMSEntity) => void;
}

export default function TopicEditorModal({
  topic,
  isOpen,
  onClose,
  onSave,
}: TopicEditorModalProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [language, setLanguage] = useState("Python / C++");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("Grid");
  const [orderIndex, setOrderIndex] = useState(1);
  const [prerequisitesInput, setPrerequisitesInput] = useState("");
  const [objectivesInput, setObjectivesInput] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (topic) {
      setTitle(topic.title);
      setSlug(topic.slug);
      setLanguage(topic.language || "Python / C++");
      setDescription(topic.description || "");
      setIconName(topic.iconName || "Grid");
      setOrderIndex(topic.orderIndex || 1);
      setPrerequisitesInput(topic.prerequisites?.join("\n") || "");
      setObjectivesInput(topic.learningObjectives?.join("\n") || "");
      setIsPublished(topic.isPublished);
    } else {
      setTitle("");
      setSlug("");
      setLanguage("Python / C++");
      setDescription("");
      setIconName("Grid");
      setOrderIndex(1);
      setPrerequisitesInput("Arrays & Hashing");
      setObjectivesInput("Master foundational problem patterns\nAnalyze space-time complexity");
      setIsPublished(true);
    }
    setError(null);
  }, [topic, isOpen]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!topic) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
      );
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      setError("Topic title and slug are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const prerequisites = prerequisitesInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const learningObjectives = objectivesInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Partial<TopicCMSEntity> = {
      title,
      slug,
      language,
      description,
      iconName,
      orderIndex: Number(orderIndex),
      prerequisites,
      learningObjectives,
      isPublished,
    };

    try {
      if (topic?.id) {
        const res = await AdminApi.updateTopic(topic.id, payload);
        if (res.success && res.data) {
          onSave(res.data);
          onClose();
        } else {
          setError(res.error?.message || "Failed to update topic.");
        }
      } else {
        const res = await AdminApi.createTopic(payload);
        if (res.success && res.data) {
          onSave(res.data);
          onClose();
        } else {
          setError(res.error?.message || "Failed to create topic.");
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
          maxWidth: 680,
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
            padding: "16px 20px",
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
              <BookOpen size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                {topic ? `Edit Topic: ${topic.title}` : "Create New Topic Track"}
              </h2>
              <p style={{ fontSize: 12, margin: 0, color: "var(--text-muted)" }}>
                Configure topic taxonomy, order sequence, prerequisites, and learning objectives
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
              padding: "10px 20px",
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
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Topic Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Dynamic Programming"
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
                placeholder="dynamic-programming"
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Primary Language / Focus
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
                Order Sequence #
              </label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                min={1}
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
                <option value="published">Published (Visible)</option>
                <option value="hidden">Hidden / Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Summary of algorithms and concepts taught..."
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Prerequisites (One per line)
              </label>
              <textarea
                value={prerequisitesInput}
                onChange={(e) => setPrerequisitesInput(e.target.value)}
                rows={3}
                placeholder="Recursion&#10;Arrays & Hashing"
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
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Learning Objectives (One per line)
              </label>
              <textarea
                value={objectivesInput}
                onChange={(e) => setObjectivesInput(e.target.value)}
                rows={3}
                placeholder="Derive state transitions&#10;Compress space complexity"
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
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 20px",
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
            <span>{loading ? "Saving..." : topic ? "Update Topic" : "Create Topic"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
