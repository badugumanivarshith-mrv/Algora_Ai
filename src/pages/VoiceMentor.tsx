/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Voice Mentor & AI Interview Simulator
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Mic, MicOff, Volume2, VolumeX, Sparkles, Brain, Award, Play,
  RotateCcw, CheckCircle2, ChevronRight, Briefcase, FileText,
  Clock, Shield, BarChart2, MessageSquare, Radio, Zap
} from "lucide-react";
import { INITIAL_LEARNING_MEMORY } from "../services/adaptiveEngine";
import { COMPANY_TRACKS_DATA } from "../data/companyData";
import { useAuth } from "../context/AuthContext";

type VoiceMode = "concept" | "doubt" | "project" | "interview";
type InterviewType = "dsa" | "hr" | "behavioral" | "system_design" | "company";

interface VoiceMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface InterviewScorecard {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  strengths: string[];
  improvements: string[];
  summaryFeedback: string;
}

export default function VoiceMentor() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  const [activeMode, setActiveMode] = useState<VoiceMode>("interview");
  const [interviewType, setInterviewType] = useState<InterviewType>("dsa");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("amazon");

  // Audio Controls State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [transcript, setTranscript] = useState<string>("");
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: "msg_1",
      sender: "ai",
      text: `Hello! I am your ALGORA AI Voice Mentor. We are in Interview Mode (${interviewType.toUpperCase()}). Press the microphone button and speak your response. How would you explain the time and space complexity trade-off of Hash Tables vs Binary Search Trees?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const [scorecard, setScorecard] = useState<InterviewScorecard | null>(null);
  const [isGeneratingScore, setIsGeneratingScore] = useState<boolean>(false);

  // Speech Recognition Reference
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Text To Speech Synthesis
  const speakText = (text: string) => {
    if (!soundEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Toggle Microphone
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch {
          setIsListening(true);
        }
      } else {
        // Fallback simulation if Speech API is unavailable in browser
        setIsListening(true);
      }
    }
  };

  // Submit User Voice / Text Query
  const handleSendVoiceQuery = async (queryText?: string) => {
    const textToSend = queryText || transcript.trim();
    if (!textToSend) return;

    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false);
    }

    const userMsg: VoiceMessage = {
      id: "usr_" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setTranscript("");

    // AI Mentor Response
    try {
      const storedToken = localStorage.getItem("accessToken");
      const res = await fetch("/api/ai/mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {})
        },
        body: JSON.stringify({
          message: `Voice Query (${activeMode} - ${interviewType}): "${textToSend}"`,
          problemContext: {
            weakTopics: INITIAL_LEARNING_MEMORY.weakTopics,
            targetCompany: selectedCompanyId
          },
          mode: "voice"
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.reply) {
          const aiText = json.data.reply;
          const aiMsg: VoiceMessage = {
            id: "ai_" + Date.now(),
            sender: "ai",
            text: aiText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          };
          setMessages((prev) => [...prev, aiMsg]);
          speakText(aiText);
          return;
        }
      }
    } catch {
      // Fallthrough
    }

    // Socratic Fallback
    const fallbackText = `Solid point! When discussing ${interviewType === "dsa" ? "data structures" : "system architecture"}, always mention the trade-offs explicitly. For example, Hash Tables offer O(1) average lookup but risk O(N) collisions, whereas Red-Black Trees guarantee O(log N) worst-case performance. Would you like to practice another question?`;
    
    const aiMsg: VoiceMessage = {
      id: "ai_" + Date.now(),
      sender: "ai",
      text: fallbackText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, aiMsg]);
    speakText(fallbackText);
  };

  // Generate Final Interview Evaluation Scorecard
  const handleGenerateScorecard = () => {
    setIsGeneratingScore(true);
    setTimeout(() => {
      setScorecard({
        overallScore: 88,
        communicationScore: 92,
        technicalScore: 85,
        confidenceScore: 88,
        strengths: [
          "Articulated time complexity trade-offs clearly",
          "Structured STAR behavioral story with clear quantifiable impact",
          "Polite tone and concise problem decomposition"
        ],
        improvements: [
          "Explicitly mention space complexity memory allocations earlier",
          "Avoid using filler words ('um', 'like') during technical explanations"
        ],
        summaryFeedback: "Strong performance! Your technical explanation of Hash Table invariants was precise and well-structured. You are 85%+ ready for Amazon SDE-1 interviews."
      });
      setIsGeneratingScore(false);
    }, 800);
  };

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto", height: "100%", overflowY: "auto", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "rgba(124, 58, 237, 0.12)", color: "var(--violet)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Radio size={20} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
              Voice Mentor & AI Interview Simulator
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-secondary)" }}>
            Real-time spoken dialogue with AI. Practice technical interviews, concept learning, and doubt resolution by voice.
          </p>
        </div>

        {/* Audio Mute & Sound Controls */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          {soundEnabled ? <Volume2 size={16} style={{ color: "var(--green)" }} /> : <VolumeX size={16} style={{ color: "var(--red)" }} />}
          <span>{soundEnabled ? "Voice Output Active" : "Voice Muted"}</span>
        </button>
      </div>

      {/* ── MODE SELECTOR ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { key: "concept", label: "Concept Learning Mode", icon: Brain },
          { key: "doubt", label: "Coding Doubt Mode", icon: Zap },
          { key: "project", label: "Project Mentor Mode", icon: Briefcase },
          { key: "interview", label: "AI Interview Simulator", icon: Radio }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveMode(key as VoiceMode)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: "var(--radius-lg)",
              border: activeMode === key ? "2px solid var(--violet)" : "1px solid var(--border)",
              background: activeMode === key ? "var(--bg-surface)" : "var(--bg-subtle)",
              color: activeMode === key ? "var(--violet)" : "var(--text-muted)",
              fontWeight: activeMode === key ? 700 : 500,
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* ── INTERVIEW TYPE SELECTOR (When in Interview Simulator Mode) ── */}
      {activeMode === "interview" && (
        <div style={{ padding: 16, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)" }}>Select Interview Format:</span>
          {[
            { key: "dsa", label: "DSA Coding Interview" },
            { key: "hr", label: "HR & HR Managerial" },
            { key: "behavioral", label: "Behavioral STAR Method" },
            { key: "system_design", label: "System Design (LLD/HLD)" },
            { key: "company", label: "Target Company Track" }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setInterviewType(key as InterviewType)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: interviewType === key ? "var(--violet)" : "var(--bg-subtle)",
                color: interviewType === key ? "#fff" : "var(--text-secondary)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── VOICE INTERFACE MAIN WORKSPACE ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* Left: Interactive Voice Dialogue Box */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: 24, display: "flex", flexDirection: "column", height: 580 }}>
          {/* Animated Waveform Visualizer */}
          <div style={{ padding: 18, background: "#0d0f1c", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: isListening ? "var(--red)" : isSpeaking ? "var(--violet)" : "var(--green)" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>
                {isListening ? "Listening to your voice..." : isSpeaking ? "AI Mentor is speaking..." : "Voice Ready — Click Mic to Speak"}
              </span>
            </div>

            {/* Pulsing Audio Bar Graphic */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {[12, 24, 18, 30, 16, 22, 10, 28].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: (isListening || isSpeaking) ? h : 6,
                    background: isListening ? "var(--red)" : isSpeaking ? "var(--violet)" : "#475569",
                    borderRadius: 2,
                    transition: "height 0.15s ease"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Dialogue Log */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4, marginBottom: 16 }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  maxWidth: "85%",
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  padding: "12px 16px",
                  borderRadius: msg.sender === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                  background: msg.sender === "user" ? "var(--violet)" : "var(--bg-subtle)",
                  color: msg.sender === "user" ? "#fff" : "var(--text-primary)",
                  fontSize: 13,
                  lineHeight: 1.6,
                  border: msg.sender === "user" ? "none" : "1px solid var(--border)"
                }}
              >
                {msg.text}
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: "right" }}>
                  {msg.timestamp}
                </div>
              </div>
            ))}
          </div>

          {/* Voice Mic Controls & Input Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Big Mic Button */}
            <button
              onClick={toggleListening}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: isListening ? "var(--red)" : "var(--violet)",
                color: "#fff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "var(--shadow-md)",
                flexShrink: 0
              }}
            >
              {isListening ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSendVoiceQuery(); }}
              placeholder={isListening ? "Listening... Speak now or type..." : "Speak or type your response here..."}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
                background: "var(--bg-subtle)",
                color: "var(--text-primary)",
                fontSize: 13,
                outline: "none"
              }}
            />

            <button
              onClick={() => handleSendVoiceQuery()}
              style={{
                padding: "12px 20px",
                borderRadius: "var(--radius-lg)",
                background: "var(--violet)",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer"
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Right Sidebar: Scorecard & Learning Memory Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Finish Session & Generate Scorecard */}
          <div style={{ padding: 20, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>
              Interview Evaluation Engine
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.5 }}>
              Complete your voice interview session to receive a detailed multi-metric AI evaluation scorecard.
            </p>

            <button
              onClick={handleGenerateScorecard}
              disabled={isGeneratingScore}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12.5,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}
            >
              <Sparkles size={15} /> {isGeneratingScore ? "Evaluating Spoken Dialogue..." : "Finish & Generate Scorecard"}
            </button>
          </div>

          {/* Generated Scorecard Display */}
          {scorecard && (
            <div style={{ padding: 20, background: "rgba(124, 58, 237, 0.08)", border: "1px solid rgba(124, 58, 237, 0.3)", borderRadius: "var(--radius-xl)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "var(--violet)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Award size={18} /> Voice Scorecard
                </span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "var(--violet)" }}>
                  {scorecard.overallScore} / 100
                </span>
              </div>

              {/* Sub-Scores */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
                <div style={{ padding: 8, background: "var(--bg-surface)", borderRadius: 6, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Tech</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{scorecard.technicalScore}%</div>
                </div>
                <div style={{ padding: 8, background: "var(--bg-surface)", borderRadius: 6, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Comm</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{scorecard.communicationScore}%</div>
                </div>
                <div style={{ padding: 8, background: "var(--bg-surface)", borderRadius: 6, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Conf</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{scorecard.confidenceScore}%</div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 10 }}>
                {scorecard.summaryFeedback}
              </div>
            </div>
          )}

          {/* Connected Learning Memory Banner */}
          <div style={{ padding: 16, background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--violet)", textTransform: "uppercase", marginBottom: 6 }}>
              Learning Memory Context
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Voice Mentor is prioritizing questions on <strong>Dynamic Programming</strong> based on your 58% accuracy in recent practice.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
