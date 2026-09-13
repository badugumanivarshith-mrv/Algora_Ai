import React, { useState, useEffect } from "react";
import {
  Briefcase, Zap, Layers, Cpu, TrendingUp, Award, Play, CheckCircle2,
  Clock, AlertCircle, Sparkles, ChevronRight, BarChart3, RotateCcw,
  Code2, MessageSquare, ShieldCheck, ArrowRight
} from "lucide-react";
import {
  CommunityService, InterviewTrackItem, InterviewQuestionItem, MockInterviewSessionItem
} from "../services/communityService";

export default function InterviewHub() {
  const [tracks, setTracks] = useState<InterviewTrackItem[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<InterviewTrackItem | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestionItem[]>([]);
  const [pastSessions, setPastSessions] = useState<MockInterviewSessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Mock Interview state
  const [activeQuestion, setActiveQuestion] = useState<InterviewQuestionItem | null>(null);
  const [interviewMode, setInterviewMode] = useState<"prep" | "interview" | "result">("prep");
  const [timerSeconds, setTimerSeconds] = useState(1800); // 30 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [candidateResponse, setCandidateResponse] = useState("");
  const [candidateCode, setCandidateCode] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  // Timer loop
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((t) => t - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Load tracks & history
  useEffect(() => {
    setLoading(true);
    Promise.all([
      CommunityService.listInterviewTracks(),
      CommunityService.listUserMockSessions("u-1"),
    ])
      .then(([trackRes, sessRes]) => {
        setTracks(trackRes.tracks);
        if (trackRes.tracks.length > 0) {
          setSelectedTrack(trackRes.tracks[0]);
        }
        setPastSessions(sessRes.sessions);
      })
      .finally(() => setLoading(false));
  }, []);

  // Load questions for selected track
  useEffect(() => {
    if (!selectedTrack) return;
    CommunityService.listInterviewQuestions(selectedTrack.slug).then((res) => {
      setQuestions(res.questions);
    });
  }, [selectedTrack]);

  const startMockInterview = (q: InterviewQuestionItem) => {
    setActiveQuestion(q);
    setCandidateResponse("");
    setCandidateCode("");
    setTimerSeconds(1800);
    setIsTimerRunning(true);
    setInterviewMode("interview");
  };

  const handleFinishAndEvaluate = async () => {
    if (!activeQuestion || !selectedTrack) return;
    setIsTimerRunning(false);
    setEvaluating(true);

    try {
      const res = await CommunityService.submitMockInterview({
        trackSlug: selectedTrack.slug,
        interviewType: selectedTrack.type || "technical",
        companyTarget: selectedTrack.name,
        questionTitle: activeQuestion.title,
        questionPrompt: activeQuestion.prompt,
        userResponse: candidateResponse,
        codeSnippet: candidateCode,
        durationSeconds: 1800 - timerSeconds,
      });

      setEvaluationResult(res.session.aiFeedback);
      setPastSessions((prev) => [res.session, ...prev]);
      setInterviewMode("result");
    } catch (e: any) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-canvas)] overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 bg-[var(--bg-surface)] border-b border-[var(--border)] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            Interview Preparation & AI Mock Simulator
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            FAANG & Tier-1 company tracks with real-time AI Rubric feedback
          </p>
        </div>

        {interviewMode === "interview" && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-mono font-bold text-sm">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>{formatTime(timerSeconds)}</span>
            </div>

            <button
              onClick={handleFinishAndEvaluate}
              disabled={evaluating}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {evaluating ? "Evaluating AI Rubric..." : "Submit to AI Bar Raiser"}
            </button>
          </div>
        )}
      </header>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {interviewMode === "prep" && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Company Tracks Selection */}
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Select Targeted Career Track
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {tracks.map((t) => {
                  const active = selectedTrack?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTrack(t)}
                      className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                        active
                          ? "bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/40"
                          : "bg-[var(--bg-surface)] border-[var(--border)] hover:border-indigo-500/30"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[10px] font-bold text-indigo-400">
                            {t.companyTier}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] font-semibold">{t.difficulty}</span>
                        </div>

                        <h3 className="text-sm font-bold text-[var(--text-primary)]">{t.name}</h3>
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2">{t.description}</p>
                      </div>

                      <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-semibold">
                        <span>{t.questionCount} Questions</span>
                        <ChevronRight className={`w-4 h-4 ${active ? "text-indigo-400" : "text-[var(--text-muted)]"}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Questions Bank for Track */}
            {selectedTrack && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      {selectedTrack.name} Interview Bank
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Companies: {selectedTrack.companies.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-indigo-500/40 flex flex-col justify-between space-y-4 transition"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            q.difficulty === "Hard"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {q.difficulty}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                            {q.type}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-[var(--text-primary)]">{q.title}</h3>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{q.prompt}</p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {q.companyTags?.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[10px] text-[var(--text-muted)]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => startMockInterview(q)}
                        className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Play className="w-3.5 h-3.5" /> Start AI Mock Round (30m)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Mock Sessions Report */}
            {pastSessions.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Your AI Mock Interview History & Performance
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastSessions.map((sess) => (
                    <div key={sess.id} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-primary)]">{sess.companyTarget}</span>
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                          sess.aiFeedback?.readinessRating === "Strong Hire"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {sess.aiFeedback?.readinessRating} ({sess.score}/100)
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        {sess.aiFeedback?.summary}
                      </p>

                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[var(--border)] text-center text-[10px]">
                        <div className="p-1.5 rounded bg-[var(--bg-canvas)]">
                          <p className="text-[var(--text-muted)]">Problem Solving</p>
                          <p className="font-bold text-indigo-400">{sess.aiFeedback?.breakdown?.problemSolving}%</p>
                        </div>
                        <div className="p-1.5 rounded bg-[var(--bg-canvas)]">
                          <p className="text-[var(--text-muted)]">Code Quality</p>
                          <p className="font-bold text-emerald-400">{sess.aiFeedback?.breakdown?.codeQuality}%</p>
                        </div>
                        <div className="p-1.5 rounded bg-[var(--bg-canvas)]">
                          <p className="text-[var(--text-muted)]">Communication</p>
                          <p className="font-bold text-amber-400">{sess.aiFeedback?.breakdown?.communication}%</p>
                        </div>
                        <div className="p-1.5 rounded bg-[var(--bg-canvas)]">
                          <p className="text-[var(--text-muted)]">Pacing</p>
                          <p className="font-bold text-purple-400">{sess.aiFeedback?.breakdown?.timeManagement}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACTIVE MOCK INTERVIEW SIMULATOR */}
        {interviewMode === "interview" && activeQuestion && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="p-5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                  Target: {selectedTrack?.name}
                </span>
                <h2 className="text-base font-bold text-[var(--text-primary)] mt-1">{activeQuestion.title}</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{activeQuestion.prompt}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs text-[var(--text-muted)]">Target Complexity</span>
                <p className="text-xs font-mono font-bold text-emerald-400">{activeQuestion.rubric?.timeComplexityTarget || "O(N)"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Candidate Explanation & Breakdown */}
              <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] flex flex-col space-y-3 h-[480px]">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    Candidate Explanation & STAR Breakdown
                  </h3>
                  <span className="text-[10px] text-[var(--text-muted)]">Voice/Text</span>
                </div>

                <textarea
                  rows={16}
                  placeholder={`Explain your approach systematically:\n1. State clarifying assumptions & edge cases\n2. Outline brute force vs optimal approach\n3. Prove time & auxiliary space complexity`}
                  value={candidateResponse}
                  onChange={(e) => setCandidateResponse(e.target.value)}
                  className="flex-1 w-full p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Right: Code Construction Editor */}
              <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] flex flex-col space-y-3 h-[480px]">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    Code Solution Editor (C++, Python, Java)
                  </h3>
                  <span className="text-[10px] font-mono text-indigo-300">Clean Production Code</span>
                </div>

                <textarea
                  rows={16}
                  placeholder={`class Solution {\npublic:\n    // Implement your optimal solution here\n};`}
                  value={candidateCode}
                  onChange={(e) => setCandidateCode(e.target.value)}
                  className="flex-1 w-full p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-indigo-200 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setInterviewMode("prep")}
                className="px-4 py-2 rounded-lg bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-muted)] hover:text-white"
              >
                Abort Mock Interview
              </button>

              <button
                onClick={handleFinishAndEvaluate}
                disabled={evaluating}
                className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md flex items-center gap-2 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {evaluating ? "AI Bar Raiser Evaluating..." : "Submit for Final AI Rubric Evaluation"}
              </button>
            </div>
          </div>
        )}

        {/* RESULTS REPORT VIEW */}
        {interviewMode === "result" && evaluationResult && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-indigo-500/40 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                    Google Bar Raiser Evaluation Report
                  </span>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mt-1">
                    {activeQuestion?.title}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-right">
                    <p className="text-[10px] text-emerald-400 font-bold uppercase">Hiring Verdict</p>
                    <p className="text-base font-extrabold text-emerald-400">{evaluationResult.readinessRating}</p>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-right">
                    <p className="text-[10px] text-indigo-400 font-bold uppercase">Overall Score</p>
                    <p className="text-base font-extrabold text-indigo-400">{evaluationResult.score}/100</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--text-secondary)] leading-relaxed">
                  "{evaluationResult.summary}"
                </p>
              </div>

              {/* Rubric Breakdown Grid */}
              <div>
                <h3 className="text-xs font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  Bar Raiser Competency Rubric
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] space-y-1">
                    <span className="text-[11px] text-[var(--text-muted)]">Problem Solving</span>
                    <p className="text-sm font-bold text-indigo-400">{evaluationResult.breakdown?.problemSolving}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] space-y-1">
                    <span className="text-[11px] text-[var(--text-muted)]">Code Quality</span>
                    <p className="text-sm font-bold text-emerald-400">{evaluationResult.breakdown?.codeQuality}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] space-y-1">
                    <span className="text-[11px] text-[var(--text-muted)]">Communication</span>
                    <p className="text-sm font-bold text-amber-400">{evaluationResult.breakdown?.communication}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] space-y-1">
                    <span className="text-[11px] text-[var(--text-muted)]">STAR Structure</span>
                    <p className="text-sm font-bold text-purple-400">{evaluationResult.breakdown?.behavioralStar || 90}%</p>
                  </div>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-500/20 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Key Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                    {evaluationResult.strengths?.map((s: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/10 border border-amber-500/20 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Actionable Improvements
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                    {evaluationResult.improvements?.map((imp: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setInterviewMode("prep")}
                  className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Practice Another Track Question
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
