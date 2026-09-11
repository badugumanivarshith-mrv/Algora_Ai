import React, { useState } from "react";
import { Bot, Save, ShieldAlert, Cpu, Sparkles, Check } from "lucide-react";

export default function AIConfigPanel() {
  const [model, setModel] = useState("gemini-2.5-flash");
  const [reasoningModel, setReasoningModel] = useState("gemini-2.5-pro");
  const [temperature, setTemperature] = useState(0.4);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [preventFullSolutions, setPreventFullSolutions] = useState(true);
  const [socraticSystemPrompt, setSocraticSystemPrompt] = useState(
    `You are the Algora AI Senior Socratic Mentor, an elite algorithms tutor.
Your core teaching philosophy:
1. Guide through progressive questioning and intuition building.
2. NEVER output complete copy-paste code solutions for problems or contests.
3. Suggest small pseudocode snippets (max 6-8 lines) only when the student is stuck.
4. Highlight time and space complexity trade-offs at each step.`
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "color-mix(in srgb, var(--blue) 15%, transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--blue)",
            }}
          >
            <Bot size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              AI Engine & Socratic Prompt Studio
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
              Configure model routing, temperature parameters, and Socratic guardrails.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: saved ? "var(--green)" : "var(--blue)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? "Saved Configuration" : "Save Settings"}
        </button>
      </div>

      {/* Grid Settings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Model Routing */}
        <div
          style={{
            padding: 20,
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary)", fontWeight: 700, fontSize: 14 }}>
            <Cpu size={16} color="var(--blue)" /> Model Routing Configuration
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              Default Socratic Chat & Hint Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
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
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra Fast, Low Latency)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Reasoning)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              Deep Code Review & Complexity Engine
            </label>
            <select
              value={reasoningModel}
              onChange={(e) => setReasoningModel(e.target.value)}
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
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Highest Code Synthesis Depth)</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                Sampling Temperature: <span style={{ color: "var(--blue)" }}>{temperature}</span>
              </label>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                Max Output Tokens: <span style={{ color: "var(--blue)" }}>{maxTokens}</span>
              </label>
              <input
                type="range"
                min="512"
                max="4096"
                step="256"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>

        {/* Safety & Guardrails */}
        <div
          style={{
            padding: 20,
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary)", fontWeight: 700, fontSize: 14 }}>
            <ShieldAlert size={16} color="var(--red)" /> Socratic Integrity & Guardrails
          </div>

          <div
            style={{
              padding: 12,
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <input
              type="checkbox"
              id="guardrail-chk"
              checked={preventFullSolutions}
              onChange={(e) => setPreventFullSolutions(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <label htmlFor="guardrail-chk" style={{ fontSize: 12.5, color: "var(--text-primary)", cursor: "pointer", lineHeight: 1.4 }}>
              <strong>Enforce Anti-Spoil Protocol:</strong> System prompts strictly forbid providing full code solutions. AI provides hints, questions, and debugging guidance only.
            </label>
          </div>

          <div
            style={{
              padding: 12,
              background: "color-mix(in srgb, var(--amber) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--amber) 25%, transparent)",
              borderRadius: "var(--radius-md)",
              fontSize: 12,
              color: "var(--text-primary)",
              lineHeight: 1.5,
            }}
          >
            <strong>Contest Mode Lockout:</strong> When a user participates in an active rated contest, all AI assistance (hints, reviews, Socratic chat) is automatically suppressed on contest problems.
          </div>
        </div>
      </div>

      {/* System Prompt Editor */}
      <div
        style={{
          padding: 20,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary)", fontWeight: 700, fontSize: 14 }}>
          <Sparkles size={16} color="var(--violet)" /> Socratic Persona System Prompt
        </div>
        <textarea
          rows={7}
          value={socraticSystemPrompt}
          onChange={(e) => setSocraticSystemPrompt(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            fontSize: 12.5,
            fontFamily: "var(--font-mono, monospace)",
            lineHeight: 1.5,
            resize: "vertical",
          }}
        />
      </div>
    </div>
  );
}
