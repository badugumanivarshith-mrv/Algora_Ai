import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Trophy, Plus, Trash2 } from "lucide-react";
import { ContestEntity, ContestProblemEntity } from "../../types";
import { AdminApi } from "../../services/adminApi";

interface ContestEditorModalProps {
  contest: ContestEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (saved: ContestEntity) => void;
}

export default function ContestEditorModal({
  contest,
  isOpen,
  onClose,
  onSave,
}: ContestEditorModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contestType, setContestType] = useState("Weekly Contest");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [difficulty, setDifficulty] = useState("All Levels");
  const [status, setStatus] = useState<"upcoming" | "active" | "completed">("upcoming");
  const [problems, setProblems] = useState<ContestProblemEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contest) {
      setTitle(contest.title);
      setDescription(contest.description);
      setContestType(contest.contestType);
      setStartTime(contest.startTime.slice(0, 16));
      setEndTime(contest.endTime.slice(0, 16));
      setDurationMinutes(contest.durationMinutes);
      setDifficulty(contest.difficulty);
      setStatus(contest.status);
      setProblems(contest.problems || []);
    } else {
      const now = new Date();
      const inTwoDays = new Date(Date.now() + 2 * 86400000);
      const ends = new Date(inTwoDays.getTime() + 90 * 60000);

      setTitle("Algora Weekly Championship");
      setDescription("Timed competitive battle with dynamic leaderboard ranking.");
      setContestType("Weekly Contest");
      setStartTime(inTwoDays.toISOString().slice(0, 16));
      setEndTime(ends.toISOString().slice(0, 16));
      setDurationMinutes(90);
      setDifficulty("All Levels");
      setStatus("upcoming");
      setProblems([
        { id: `cp-${Date.now()}-1`, contestId: "", problemId: 1, problemSlug: "two-sum", problemTitle: "Two Sum", orderIndex: 1, scorePoints: 100, difficulty: "Easy" },
        { id: `cp-${Date.now()}-2`, contestId: "", problemId: 2, problemSlug: "longest-palindromic-substring", problemTitle: "Longest Palindromic Substring", orderIndex: 2, scorePoints: 300, difficulty: "Medium" },
      ]);
    }
    setError(null);
  }, [contest, isOpen]);

  const handleAddProblem = () => {
    const newProb: ContestProblemEntity = {
      id: `cp-${Date.now()}`,
      contestId: contest?.id || "",
      problemId: 4,
      problemSlug: "valid-anagram",
      problemTitle: "Valid Anagram",
      orderIndex: problems.length + 1,
      scorePoints: 200,
      difficulty: "Easy",
    };
    setProblems([...problems, newProb]);
  };

  const handleRemoveProblem = (id: string) => {
    setProblems(problems.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim() || !startTime || !endTime) {
      setError("Contest title, start time, and end time are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload: Partial<ContestEntity> = {
      title,
      description,
      contestType,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      durationMinutes: Number(durationMinutes),
      difficulty,
      status,
      problems,
    };

    try {
      if (contest?.id) {
        const res = await AdminApi.updateContest(contest.id, payload);
        if (res.success && res.data) {
          onSave(res.data);
          onClose();
        } else {
          setError(res.error?.message || "Failed to update contest.");
        }
      } else {
        const res = await AdminApi.createContest(payload);
        if (res.success && res.data) {
          onSave(res.data);
          onClose();
        } else {
          setError(res.error?.message || "Failed to create contest.");
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
          maxWidth: 780,
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
              <Trophy size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                {contest ? `Edit Contest: ${contest.title}` : "Schedule New Timed Contest"}
              </h2>
              <p style={{ fontSize: 12, margin: 0, color: "var(--text-muted)" }}>
                Configure contest time window, problem sequence, and score weight distributions
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
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
              Contest Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Algora Weekly Championship #43"
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Contest Format
              </label>
              <select
                value={contestType}
                onChange={(e) => setContestType(e.target.value)}
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
                <option value="Weekly Contest">Weekly Contest</option>
                <option value="Biweekly Contest">Biweekly Contest</option>
                <option value="Topic Contest">Topic Contest</option>
                <option value="Sprint Match">Sprint Match</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Duration (Min)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min={15}
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
                Target Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
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
                <option value="All Levels">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Medium">Medium</option>
                <option value="Advanced / Master">Advanced / Master</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Lifecycle Status
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
                <option value="upcoming">Upcoming (Registration Open)</option>
                <option value="active">Active / In-Progress</option>
                <option value="completed">Completed / Archived</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Start Timestamp *
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
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
                End Timestamp *
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
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

          {/* Problem Assignments */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                Contest Problem Pool ({problems.length})
              </label>
              <button
                onClick={handleAddProblem}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 8px",
                  background: "transparent",
                  border: "none",
                  color: "var(--brand)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus size={13} />
                <span>Add Problem</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {problems.map((prob, idx) => (
                <div
                  key={prob.id || idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "30px 1fr 100px 80px 30px",
                    gap: 8,
                    alignItems: "center",
                    padding: "8px 12px",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>#{idx + 1}</span>
                  <input
                    type="text"
                    value={prob.problemTitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProblems(problems.map((p) => (p.id === prob.id ? { ...p, problemTitle: val } : p)));
                    }}
                    placeholder="Problem Title"
                    style={{
                      padding: "4px 8px",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: 12,
                      color: "var(--text-primary)",
                    }}
                  />
                  <select
                    value={prob.difficulty}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setProblems(problems.map((p) => (p.id === prob.id ? { ...p, difficulty: val } : p)));
                    }}
                    style={{
                      padding: "4px 6px",
                      fontSize: 11,
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                      background: "var(--bg-surface)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <input
                    type="number"
                    value={prob.scorePoints}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setProblems(problems.map((p) => (p.id === prob.id ? { ...p, scorePoints: val } : p)));
                    }}
                    style={{
                      padding: "4px 6px",
                      fontSize: 12,
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      textAlign: "right",
                    }}
                  />
                  <button
                    onClick={() => handleRemoveProblem(prob.id)}
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
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
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
            <span>{loading ? "Saving..." : contest ? "Save Changes" : "Schedule Contest"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
