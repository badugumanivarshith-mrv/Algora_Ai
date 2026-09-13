import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Search, Code2, BookOpen, MessageSquare, Trophy, UserCheck,
  Users, GraduationCap, X, ArrowRight, CornerDownLeft, Sparkles
} from "lucide-react";
import { EnterpriseService, GlobalSearchResultItem } from "../services/enterpriseService";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [results, setResults] = useState<GlobalSearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const cat = activeCategory === "all" ? undefined : activeCategory;
        const res = await EnterpriseService.searchGlobal(query.trim(), cat);
        setResults(res.topResults);
        setSelectedIndex(0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, activeCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  if (!isOpen) return null;

  const handleSelect = (item: GlobalSearchResultItem) => {
    onClose();
    navigate(item.url);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "problem": return <Code2 size={15} style={{ color: "var(--brand)" }} />;
      case "topic": return <BookOpen size={15} style={{ color: "var(--blue)" }} />;
      case "discussion": return <MessageSquare size={15} style={{ color: "var(--green)" }} />;
      case "contest": return <Trophy size={15} style={{ color: "var(--amber)" }} />;
      case "mentor": return <UserCheck size={15} style={{ color: "var(--violet)" }} />;
      case "group": return <Users size={15} style={{ color: "var(--indigo, #6366f1)" }} />;
      case "classroom": return <GraduationCap size={15} style={{ color: "var(--cyan, #06b6d4)" }} />;
      default: return <Sparkles size={15} />;
    }
  };

  const categories = [
    { id: "all", label: "All Items" },
    { id: "problem", label: "Problems" },
    { id: "topic", label: "Topics" },
    { id: "discussion", label: "Discussions" },
    { id: "contest", label: "Contests" },
    { id: "mentor", label: "Mentors" },
    { id: "group", label: "Study Groups" },
    { id: "classroom", label: "Classrooms" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        zIndex: 9999,
        paddingTop: "12vh",
        paddingInline: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-canvas)",
          }}
        >
          <Search size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search problems, topics, discussions, contests, mentors, classrooms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: 14,
              fontWeight: 500,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: 4,
                display: "flex",
              }}
            >
              <X size={15} />
            </button>
          )}
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono, monospace)",
              padding: "2px 6px",
              borderRadius: 4,
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            ESC
          </span>
        </div>

        {/* Category Pills */}
        <div
          style={{
            display: "flex",
            gap: 6,
            padding: "8px 14px",
            background: "var(--bg-subtle)",
            borderBottom: "1px solid var(--border)",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              style={{
                padding: "4px 10px",
                borderRadius: "var(--radius-sm)",
                fontSize: 11,
                fontWeight: activeCategory === c.id ? 700 : 500,
                background: activeCategory === c.id ? "var(--brand)" : "transparent",
                color: activeCategory === c.id ? "#fff" : "var(--text-secondary)",
                border: activeCategory === c.id ? "none" : "1px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div
          style={{
            maxHeight: 380,
            overflowY: "auto",
            padding: "6px 8px",
          }}
        >
          {loading ? (
            <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
              Searching Algora ecosystem...
            </div>
          ) : !query.trim() ? (
            <div style={{ padding: "28px 16px", textAlign: "center" }}>
              <Sparkles size={24} style={{ color: "var(--brand)", margin: "0 auto 8px" }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Instant Global Ecosystem Search</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                Type problem names, algorithms (DP, Graphs, Trees), contest titles, or faculty classrooms.
              </div>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
              No matching results found for "{query}".
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.category}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    background: isSelected ? "color-mix(in srgb, var(--brand) 12%, transparent)" : "transparent",
                    border: isSelected ? "1px solid color-mix(in srgb, var(--brand) 30%, transparent)" : "1px solid transparent",
                    cursor: "pointer",
                    marginBottom: 2,
                    transition: "all 0.1s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "var(--radius-sm)",
                        background: "var(--bg-canvas)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {getCategoryIcon(item.category)}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "1px 6px",
                              borderRadius: 4,
                              background: "var(--bg-subtle)",
                              border: "1px solid var(--border)",
                              color: "var(--text-secondary)",
                              textTransform: "capitalize",
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: 2,
                        }}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", flexShrink: 0 }}>
                    {isSelected ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--brand)", fontWeight: 600 }}>
                        Open <CornerDownLeft size={12} />
                      </span>
                    ) : (
                      <ArrowRight size={13} style={{ opacity: 0.4 }} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: "8px 16px",
            background: "var(--bg-canvas)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 11,
            color: "var(--text-muted)",
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            <span><strong style={{ color: "var(--text-primary)" }}>↑↓</strong> Navigate</span>
            <span><strong style={{ color: "var(--text-primary)" }}>↵</strong> Select</span>
            <span><strong style={{ color: "var(--text-primary)" }}>ESC</strong> Close</span>
          </div>
          <span>Algora Universal Search V2</span>
        </div>
      </div>
    </div>
  );
}
