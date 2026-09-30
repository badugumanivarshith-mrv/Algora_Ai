import { useState } from "react";
import {
  CheckCircle2, Lock, PlayCircle, Circle, BookOpen, Code2,
  ClipboardCheck, Brain, ChevronRight, ChevronDown, Zap, Clock, BarChart2, Star,
} from "lucide-react";

type Status = "completed" | "active" | "locked";

interface Lesson {
  id: string;
  title: string;
  type: "lesson" | "example" | "quiz" | "problem" | "assignment";
  dur: string;
  status: Status;
}

interface Module {
  id: string;
  title: string;
  status: Status;
  lessons: Lesson[];
  progress: number;
}

interface Path {
  id: string;
  title: string;
  description: string;
  color: string;
  totalModules: number;
  completedModules: number;
  progress: number;
  modules: Module[];
}

const PATHS: Path[] = [
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    description: "Master core DSA for technical interviews",
    color: "var(--blue)",
    totalModules: 12,
    completedModules: 5,
    progress: 42,
    modules: [
      {
        id: "arrays",
        title: "Arrays & Hashing",
        status: "completed",
        progress: 100,
        lessons: [
          { id: "a1", title: "Introduction to Arrays", type: "lesson", dur: "12 min", status: "completed" },
          { id: "a2", title: "Two Sum — worked example", type: "example", dur: "8 min", status: "completed" },
          { id: "a3", title: "Hash map fundamentals", type: "lesson", dur: "15 min", status: "completed" },
          { id: "a4", title: "Group Anagrams", type: "problem", dur: "25 min", status: "completed" },
          { id: "a5", title: "Arrays & Hashing quiz", type: "quiz", dur: "10 min", status: "completed" },
        ],
      },
      {
        id: "tw",
        title: "Two Pointers",
        status: "active",
        progress: 60,
        lessons: [
          { id: "t1", title: "Two pointer technique", type: "lesson", dur: "14 min", status: "completed" },
          { id: "t2", title: "Valid Palindrome", type: "example", dur: "10 min", status: "completed" },
          { id: "t3", title: "Container With Most Water", type: "problem", dur: "30 min", status: "active" },
          { id: "t4", title: "3Sum", type: "problem", dur: "35 min", status: "locked" },
          { id: "t5", title: "Two Pointers quiz", type: "quiz", dur: "10 min", status: "locked" },
        ],
      },
      {
        id: "sw",
        title: "Sliding Window",
        status: "locked",
        progress: 0,
        lessons: [
          { id: "s1", title: "Sliding window pattern", type: "lesson", dur: "16 min", status: "locked" },
          { id: "s2", title: "Longest Substring Without Repeating", type: "example", dur: "12 min", status: "locked" },
          { id: "s3", title: "Minimum Window Substring", type: "problem", dur: "40 min", status: "locked" },
          { id: "s4", title: "Sliding Window quiz", type: "quiz", dur: "10 min", status: "locked" },
        ],
      },
    ],
  },
  {
    id: "cp",
    title: "Competitive Programming",
    description: "Prepare for contests and advanced problems",
    color: "var(--violet)",
    totalModules: 8,
    completedModules: 1,
    progress: 14,
    modules: [],
  },
  {
    id: "sys",
    title: "System Design",
    description: "Large-scale system architecture fundamentals",
    color: "var(--cyan)",
    totalModules: 6,
    completedModules: 0,
    progress: 0,
    modules: [],
  },
];

const TYPE_ICONS: Record<Lesson["type"], any> = {
  lesson:     BookOpen,
  example:    Code2,
  quiz:       ClipboardCheck,
  problem:    Brain,
  assignment: Star,
};

const TYPE_COLORS: Record<Lesson["type"], string> = {
  lesson:     "var(--blue)",
  example:    "var(--violet)",
  quiz:       "var(--amber)",
  problem:    "var(--green)",
  assignment: "var(--cyan)",
};

export default function Learning() {
  const [pathId, setPathId] = useState("dsa");
  const [expanded, setExpanded] = useState<string[]>(["tw"]);
  const [activeLesson, setActiveLesson] = useState<string>("t3");

  const path = PATHS.find((p) => p.id === pathId)!;

  const toggle = (id: string) => {
    setExpanded((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const allLessons = path.modules.flatMap((m) => m.lessons);
  const currentLesson = allLessons.find((l) => l.id === activeLesson);
  const currentModule = path.modules.find((m) => m.lessons.some((l) => l.id === activeLesson));

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left sidebar */}
      <div style={{ width: 300, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
        {/* Path switcher */}
        <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid var(--border)" }}>
          {PATHS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPathId(p.id); setExpanded([]); }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "9px 10px",
                borderRadius: "var(--radius-md)", border: "none",
                background: pathId === p.id ? "var(--bg-subtle)" : "transparent",
                cursor: "pointer", fontFamily: "inherit", textAlign: "left", marginBottom: 3,
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12.5, fontWeight: pathId === p.id ? 600 : 500, color: pathId === p.id ? "var(--text-primary)" : "var(--text-secondary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                <div className="progress" style={{ height: 3, marginTop: 4 }}>
                  <div className="progress-fill" style={{ width: `${p.progress}%`, background: p.color }} />
                </div>
              </div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>{p.progress}%</span>
            </button>
          ))}
        </div>

        {/* Module list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {path.modules.map((mod) => {
            const open = expanded.includes(mod.id);
            return (
              <div key={mod.id}>
                <button
                  onClick={() => toggle(mod.id)}
                  style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 16px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                >
                  <div style={{ flexShrink: 0 }}>
                    {mod.status === "completed"
                      ? <CheckCircle2 size={14} style={{ color: "var(--green)" }} />
                      : mod.status === "active"
                      ? <PlayCircle size={14} style={{ color: "var(--blue)" }} />
                      : <Lock size={14} style={{ color: "var(--text-disabled)" }} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 500, color: mod.status === "locked" ? "var(--text-muted)" : "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mod.title}</p>
                    {mod.status !== "locked" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                        <div className="progress" style={{ height: 3, flex: 1 }}>
                          <div className="progress-fill" style={{ width: `${mod.progress}%` }} />
                        </div>
                        <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>{mod.progress}%</span>
                      </div>
                    )}
                  </div>
                  <ChevronDown size={13} style={{ color: "var(--text-muted)", transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s", flexShrink: 0 }} />
                </button>

                {open && (
                  <div style={{ paddingBottom: 4 }}>
                    {mod.lessons.map((lesson) => {
                      const LIcon = TYPE_ICONS[lesson.type];
                      const isActive = lesson.id === activeLesson;
                      return (
                        <button
                          key={lesson.id}
                          disabled={lesson.status === "locked"}
                          onClick={() => lesson.status !== "locked" && setActiveLesson(lesson.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 9,
                            width: "100%", padding: "7px 16px 7px 36px",
                            border: "none", background: isActive ? "var(--blue-light)" : "transparent",
                            cursor: lesson.status === "locked" ? "not-allowed" : "pointer",
                            fontFamily: "inherit", textAlign: "left",
                            opacity: lesson.status === "locked" ? 0.5 : 1,
                            borderLeft: isActive ? "2px solid var(--blue)" : "2px solid transparent",
                          }}
                        >
                          <LIcon size={12} style={{ color: isActive ? "var(--blue)" : TYPE_COLORS[lesson.type], flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 12, color: isActive ? "var(--blue)" : "var(--text-secondary)", fontWeight: isActive ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {lesson.title}
                          </span>
                          <span style={{ fontSize: 10.5, color: "var(--text-muted)", flexShrink: 0 }}>{lesson.dur}</span>
                          <div style={{ flexShrink: 0 }}>
                            {lesson.status === "completed"
                              ? <CheckCircle2 size={11} style={{ color: "var(--green)" }} />
                              : lesson.status === "active"
                              ? <Circle size={11} style={{ color: "var(--blue)" }} />
                              : <Lock size={11} style={{ color: "var(--text-disabled)" }} />
                            }
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {currentModule && (
          <div style={{ padding: "18px 28px 0", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
            <span>{path.title}</span>
            <ChevronRight size={12} />
            <span>{currentModule.title}</span>
            <ChevronRight size={12} />
            <span style={{ color: "var(--text-primary)" }}>{currentLesson?.title}</span>
          </div>
        )}

        <div style={{ padding: "16px 28px 28px", flex: 1 }}>
          {currentLesson ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    {(() => { const LIcon = TYPE_ICONS[currentLesson.type]; return <LIcon size={15} style={{ color: TYPE_COLORS[currentLesson.type] }} />; })()}
                    <span style={{ fontSize: 11.5, fontWeight: 500, color: TYPE_COLORS[currentLesson.type], textTransform: "capitalize" }}>{currentLesson.type}</span>
                    <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>· {currentLesson.dur}</span>
                  </div>
                  <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>{currentLesson.title}</h1>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button className="btn btn-secondary btn-sm">Previous</button>
                  <button className="btn btn-primary btn-sm" style={{ gap: 5 }}>Next <ChevronRight size={12} /></button>
                </div>
              </div>

              <div className="surface-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 12px" }}>Problem</h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.75, margin: "0 0 14px" }}>
                  You are given an integer array <code style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12.5, background: "var(--bg-subtle)", padding: "1px 5px", borderRadius: 4, color: "var(--blue)" }}>height</code> of length{" "}
                  <code style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12.5, background: "var(--bg-subtle)", padding: "1px 5px", borderRadius: 4, color: "var(--blue)" }}>n</code>. There are <code style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12.5, background: "var(--bg-subtle)", padding: "1px 5px", borderRadius: 4, color: "var(--blue)" }}>n</code> vertical
                  lines drawn such that the two endpoints of the <code style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12.5, background: "var(--bg-subtle)", padding: "1px 5px", borderRadius: 4, color: "var(--blue)" }}>i<sup>th</sup></code> line are{" "}
                  <code style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12.5, background: "var(--bg-subtle)", padding: "1px 5px", borderRadius: 4, color: "var(--blue)" }}>(i, 0)</code> and{" "}
                  <code style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12.5, background: "var(--bg-subtle)", padding: "1px 5px", borderRadius: 4, color: "var(--blue)" }}>(i, height[i])</code>.
                </p>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.75, margin: 0 }}>
                  Find two lines that together with the x-axis form a container that contains the most water. Return the maximum amount of water a container can store.
                </p>
                <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  <span className="badge diff-medium">Medium</span>
                  <span className="badge badge-neutral">Two Pointers</span>
                  <span className="badge badge-neutral">Arrays</span>
                </div>
              </div>

              <div className="surface-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 14px" }}>Examples</h3>
                {[
                  { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49" },
                  { input: "height = [1,1]", output: "1" },
                ].map(({ input, output }, i) => (
                  <div key={i} style={{ marginBottom: i === 0 ? 12 : 0, padding: 14, background: "var(--bg-subtle)", borderRadius: "var(--radius-md)" }}>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 5px", fontWeight: 600 }}>Example {i + 1}</p>
                    <div style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12 }}>
                      <div style={{ color: "var(--text-secondary)" }}><span style={{ color: "var(--text-muted)" }}>Input:  </span>{input}</div>
                      <div style={{ color: "var(--text-secondary)" }}><span style={{ color: "var(--text-muted)" }}>Output: </span>{output}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="surface-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 14px" }}>Approach — Two Pointer</h3>
                <ol style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
                  <li>Place one pointer at the left edge, one at the right edge of the array.</li>
                  <li>Compute area: <code style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12, background: "var(--bg-subtle)", padding: "1px 5px", borderRadius: 4, color: "var(--violet)" }}>min(height[l], height[r]) × (r - l)</code></li>
                  <li>Update maximum area if this is larger.</li>
                  <li>Move the pointer pointing to the shorter line inward — this is the key insight.</li>
                  <li>Repeat until pointers meet. Time O(n), space O(1).</li>
                </ol>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  <Zap size={14} /> Open in Workspace
                </button>
                <button className="btn btn-secondary" style={{ justifyContent: "center" }}>
                  <BarChart2 size={14} /> Solutions
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--text-muted)" }}>
              Select a lesson to begin
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar — up next */}
      <div style={{ width: 230, borderLeft: "1px solid var(--border)", overflow: "auto", flexShrink: 0, padding: "20px 0" }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", padding: "0 16px", margin: "0 0 10px" }}>Up Next</p>
        {path.modules.flatMap((m) => m.lessons).filter((l) => l.status !== "completed").slice(0, 6).map((lesson) => {
          const LIcon = TYPE_ICONS[lesson.type];
          const isActive = lesson.id === activeLesson;
          return (
            <button
              key={lesson.id}
              disabled={lesson.status === "locked"}
              onClick={() => lesson.status !== "locked" && setActiveLesson(lesson.id)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                width: "100%", padding: "9px 16px",
                border: "none", background: isActive ? "var(--blue-light)" : "transparent",
                cursor: lesson.status === "locked" ? "not-allowed" : "pointer",
                fontFamily: "inherit", textAlign: "left",
                opacity: lesson.status === "locked" ? 0.5 : 1,
              }}
            >
              <div style={{ width: 28, height: 28, borderRadius: "var(--radius-md)", background: isActive ? "var(--blue-light)" : "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <LIcon size={12} style={{ color: isActive ? "var(--blue)" : TYPE_COLORS[lesson.type] }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: isActive ? 500 : 400, color: isActive ? "var(--blue)" : "var(--text-secondary)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lesson.title}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, display: "flex", alignItems: "center", gap: 3 }}>
                  <Clock size={9} />{lesson.dur}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
