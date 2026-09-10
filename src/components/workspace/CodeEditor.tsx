import { useState, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { RotateCcw, Copy, Check, Code2 } from "lucide-react";
import type { SupportedLanguage } from "../../types";

interface CodeEditorProps {
  code: string;
  language: SupportedLanguage;
  onChangeCode: (code: string) => void;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onResetCode: () => void;
}

const LANGUAGES: SupportedLanguage[] = ["Python", "C++", "Java", "C"];

export default function CodeEditor({
  code,
  language,
  onChangeCode,
  onSelectLanguage,
  onResetCode,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<number>(13);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = code.split("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      onChangeCode(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Editor Toolbar */}
      <div
        style={{
          height: 42,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingInline: 12,
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        {/* Left: Language selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Code2 size={15} style={{ color: "var(--blue)" }} />
          <div style={{ display: "flex", gap: 4 }}>
            {LANGUAGES.map((lang) => {
              const active = lang === language;
              return (
                <button
                  key={lang}
                  onClick={() => onSelectLanguage(lang)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12,
                    fontWeight: active ? 600 : 500,
                    border: "1px solid",
                    borderColor: active ? "var(--blue)" : "var(--border)",
                    background: active ? "var(--blue-light)" : "transparent",
                    color: active ? "var(--blue)" : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Actions (Font, Reset, Copy) */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <select
            value={fontSize}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setFontSize(Number(e.target.value))}
            style={{
              padding: "3px 6px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "var(--bg-raised)",
              color: "var(--text-secondary)",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            <option value={12}>12px</option>
            <option value={13}>13px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
          </select>

          <button
            onClick={onResetCode}
            title="Reset code to initial template"
            className="btn btn-ghost btn-sm"
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px" }}
          >
            <RotateCcw size={12} />
            <span className="hide-mobile">Reset</span>
          </button>

          <button
            onClick={handleCopy}
            title="Copy code"
            className="btn btn-ghost btn-sm"
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px" }}
          >
            {copied ? (
              <>
                <Check size={12} style={{ color: "var(--green)" }} />
                <span style={{ color: "var(--green)" }}>Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span className="hide-mobile">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div
        style={{
          flex: 1,
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "var(--bg-raised)",
        }}
      >
        {/* Line numbers gutter */}
        <div
          style={{
            width: 48,
            paddingTop: 12,
            paddingBottom: 12,
            background: "var(--bg-surface)",
            borderRight: "1px solid var(--border)",
            userSelect: "none",
            textAlign: "right",
            paddingRight: 10,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: `${fontSize}px`,
            lineHeight: 1.6,
            color: "var(--text-placeholder)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea code editor */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          style={{
            flex: 1,
            padding: 12,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--text-primary)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: `${fontSize}px`,
            lineHeight: 1.6,
            resize: "none",
            whiteSpace: "pre",
            overflowWrap: "normal",
            overflowX: "auto",
            tabSize: 4,
          }}
        />
      </div>
    </div>
  );
}
