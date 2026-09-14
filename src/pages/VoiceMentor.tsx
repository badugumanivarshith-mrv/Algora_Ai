import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  BookOpen,
  Code2,
  Briefcase,
  HelpCircle,
  BarChart2,
  Globe,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Send,
  Zap,
} from "lucide-react";
import {
  VoiceMentorApi,
  VoiceSession,
  VoiceChatResponse,
  VoiceTopicExplanation,
  VoiceCodingHelpResponse,
  VoiceInterviewQuestion,
  VoiceInterviewEvaluation,
  VoiceQuizQuestion,
  VoiceQuizResult,
  VoiceReviewResponse,
  VoiceAnalytics,
} from "../services/voiceMentorApi";

export const VoiceMentor: React.FC = () => {
  const [language, setLanguage] = useState<string>("English");
  const [activeTab, setActiveTab] = useState<"mentor" | "learning" | "coding" | "interview" | "quiz" | "review" | "analytics">("mentor");

  // Session State
  const [currentSession, setCurrentSession] = useState<VoiceSession | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [sessionTime, setSessionTime] = useState<number>(0);

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; text: string; audioUrl?: string }>>([]);
  const [spokenInputText, setSpokenInputText] = useState<string>("");
  const [isProcessingChat, setIsProcessingChat] = useState<boolean>(false);

  // Learning Mode State
  const [learnTopicInput, setLearnTopicInput] = useState<string>("Breadth-First Search");
  const [topicExplanation, setTopicExplanation] = useState<VoiceTopicExplanation | null>(null);
  const [isLearning, setIsLearning] = useState<boolean>(false);

  // Coding Assistant State
  const [codeSnippet, setCodeSnippet] = useState<string>("function binarySearch(arr, target) {\n  let left = 0, right = arr.length;\n  while (left <= right) {\n    let mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid;\n    else right = mid - 1;\n  }\n  return -1;\n}");
  const [problemContext, setProblemContext] = useState<string>("Binary Search Array Out of Bounds / Infinite Loop");
  const [codingHelp, setCodingHelp] = useState<VoiceCodingHelpResponse | null>(null);
  const [isAnalyzingCode, setIsAnalyzingCode] = useState<boolean>(false);

  // Interview Mode State
  const [selectedCompany, setSelectedCompany] = useState<string>("Amazon");
  const [selectedRound, setSelectedRound] = useState<string>("DSA");
  const [interviewQuestion, setInterviewQuestion] = useState<VoiceInterviewQuestion | null>(null);
  const [spokenAnswer, setSpokenAnswer] = useState<string>("");
  const [interviewEvaluation, setInterviewEvaluation] = useState<VoiceInterviewEvaluation | null>(null);
  const [isEvaluatingInterview, setIsEvaluatingInterview] = useState<boolean>(false);

  // Quiz Mode State
  const [quizTopic, setQuizTopic] = useState<string>("Graphs & BFS");
  const [quizQuestion, setQuizQuestion] = useState<VoiceQuizQuestion | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string>("");
  const [quizResult, setQuizResult] = useState<VoiceQuizResult | null>(null);

  // Review & Analytics State
  const [reviewData, setReviewData] = useState<VoiceReviewResponse | null>(null);
  const [analytics, setAnalytics] = useState<VoiceAnalytics | null>(null);

  useEffect(() => {
    loadAnalyticsAndReview();
  }, [language]);

  useEffect(() => {
    let timer: any;
    if (currentSession) {
      timer = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    } else {
      setSessionTime(0);
    }
    return () => clearInterval(timer);
  }, [currentSession]);

  const loadAnalyticsAndReview = async () => {
    try {
      const [anData, revData] = await Promise.all([
        VoiceMentorApi.getAnalytics(),
        VoiceMentorApi.getReview(language),
      ]);
      setAnalytics(anData);
      setReviewData(revData);
    } catch (err) {
      console.error("Error loading voice analytics/review:", err);
    }
  };

  const handleStartSession = async () => {
    try {
      const session = await VoiceMentorApi.startSession("Mentor", language);
      setCurrentSession(session);
    } catch (err) {
      console.error("Error starting session:", err);
    }
  };

  const handleStopSession = async () => {
    if (!currentSession) return;
    try {
      await VoiceMentorApi.endSession(currentSession.id, sessionTime);
      setCurrentSession(null);
      loadAnalyticsAndReview();
    } catch (err) {
      console.error("Error stopping session:", err);
    }
  };

  const speakTextInBrowser = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (language === "Telugu") utterance.lang = "te-IN";
      else if (language === "Hindi") utterance.lang = "hi-IN";
      else utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendVoiceChat = async () => {
    if (!spokenInputText.trim()) return;
    setIsProcessingChat(true);

    const userText = spokenInputText;
    setChatMessages((prev) => [...prev, { role: "user", text: userText }]);
    setSpokenInputText("");

    try {
      const sid = currentSession?.id || `vsess-${Date.now()}`;
      const response: VoiceChatResponse = await VoiceMentorApi.voiceChat(sid, userText, language);

      setChatMessages((prev) => [...prev, { role: "assistant", text: response.aiResponse, audioUrl: response.audioUrl }]);
      speakTextInBrowser(response.aiResponse);
    } catch (err) {
      console.error("Error in voice chat:", err);
    } finally {
      setIsProcessingChat(false);
    }
  };

  const handleLearnTopic = async () => {
    setIsLearning(true);
    try {
      const exp = await VoiceMentorApi.learnTopic(learnTopicInput, language);
      setTopicExplanation(exp);
      speakTextInBrowser(`${exp.concept}. Time complexity is ${exp.timeComplexity}.`);
    } catch (err) {
      console.error("Error in learn topic:", err);
    } finally {
      setIsLearning(false);
    }
  };

  const handleAnalyzeCode = async () => {
    setIsAnalyzingCode(true);
    try {
      const res = await VoiceMentorApi.codeHelp(codeSnippet, problemContext, language);
      setCodingHelp(res);
      speakTextInBrowser(`Bug Analysis: ${res.bugAnalysis}. Hint: ${res.hint}`);
    } catch (err) {
      console.error("Error analyzing code:", err);
    } finally {
      setIsAnalyzingCode(false);
    }
  };

  const handleStartInterview = async () => {
    try {
      const q = await VoiceMentorApi.startInterview(selectedCompany, selectedRound, language);
      setInterviewQuestion(q);
      setInterviewEvaluation(null);
      setSpokenAnswer("");
      speakTextInBrowser(q.question);
    } catch (err) {
      console.error("Error starting interview:", err);
    }
  };

  const handleEvaluateInterview = async () => {
    if (!interviewQuestion) return;
    setIsEvaluatingInterview(true);
    try {
      const ev = await VoiceMentorApi.answerInterview(
        interviewQuestion.sessionId,
        selectedCompany,
        selectedRound,
        spokenAnswer,
        language
      );
      setInterviewEvaluation(ev);
      speakTextInBrowser(`Score is ${ev.score}. ${ev.technicalFeedback}`);
    } catch (err) {
      console.error("Error evaluating interview:", err);
    } finally {
      setIsEvaluatingInterview(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      const q = await VoiceMentorApi.startQuiz(quizTopic, language);
      setQuizQuestion(q);
      setQuizResult(null);
      setSelectedQuizOption("");
      speakTextInBrowser(q.question);
    } catch (err) {
      console.error("Error starting quiz:", err);
    }
  };

  const handleAnswerQuiz = async () => {
    if (!quizQuestion || !selectedQuizOption) return;
    try {
      const res = await VoiceMentorApi.answerQuiz(quizQuestion.quizId, selectedQuizOption, quizQuestion.correctOption, language);
      setQuizResult(res);
      speakTextInBrowser(res.feedback);
    } catch (err) {
      console.error("Error answering quiz:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Controls */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Mic className="w-4 h-4 animate-pulse" /> Voice AI Mentor Engine v3.0
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Real-Time Speech & Audio Mentorship
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Voice-first interactive Socratic mentor for DSA learning, code debugging, mock interviews, daily retention reviews, and company preparation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-sm text-slate-200 focus:outline-none"
              >
                <option value="English" className="bg-slate-900 text-white">English</option>
                <option value="Telugu" className="bg-slate-900 text-white">Telugu (తెలుగు)</option>
                <option value="Hindi" className="bg-slate-900 text-white">Hindi (हिंदी)</option>
              </select>
            </div>

            {!currentSession ? (
              <button
                onClick={handleStartSession}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
              >
                <Mic className="w-4 h-4" /> Start Voice Session
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  Recording ({Math.floor(sessionTime / 60)}m {sessionTime % 60}s)
                </span>
                <button
                  onClick={handleStopSession}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-rose-600/30"
                >
                  <MicOff className="w-4 h-4" /> End Session
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-6 text-sm font-medium overflow-x-auto">
          {[
            { id: "mentor", label: "Voice Mentor Chat", icon: Mic },
            { id: "learning", label: "Voice Learning Mode", icon: BookOpen },
            { id: "coding", label: "Voice Coding Assistant", icon: Code2 },
            { id: "interview", label: "Voice Mock Interview", icon: Briefcase },
            { id: "quiz", label: "Voice Quiz", icon: HelpCircle },
            { id: "review", label: "Voice Review", icon: RotateCcw },
            { id: "analytics", label: "Voice Analytics", icon: BarChart2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-400 font-semibold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: VOICE MENTOR CHAT */}
        {activeTab === "mentor" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-[420px] flex flex-col justify-between">
                <div className="space-y-3 overflow-y-auto pr-2">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-20 space-y-2">
                      <Volume2 className="w-8 h-8 text-indigo-400 mx-auto animate-bounce" />
                      <div className="text-slate-300 font-semibold text-sm">Push To Talk or Type Your Question</div>
                      <p className="text-slate-500 text-xs max-w-sm mx-auto">
                        Ask about BFS vs DFS, Dynamic Programming state transitions, or Amazon interview strategies in {language}.
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl text-sm max-w-[85%] space-y-1 ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white ml-auto"
                            : "bg-slate-950 border border-slate-800 text-slate-200"
                        }`}
                      >
                        <div className="text-[11px] opacity-70 font-bold uppercase">{msg.role}</div>
                        <div>{msg.text}</div>
                        {msg.role === "assistant" && (
                          <button
                            onClick={() => speakTextInBrowser(msg.text)}
                            className="mt-1 flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            <Volume2 className="w-3.0 h-3.0" /> Replay Speech
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`p-3 rounded-xl transition-all ${
                      isRecording ? "bg-rose-600 text-white animate-pulse" : "bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    placeholder={`Speak or type in ${language}...`}
                    value={spokenInputText}
                    onChange={(e) => setSpokenInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendVoiceChat()}
                    className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSendVoiceChat}
                    disabled={isProcessingChat}
                    className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Socratic Voice Prompts
                </h3>
                <div className="space-y-2 text-xs">
                  {[
                    "Teach me BFS algorithm with an example",
                    "How do I solve Two Sum in O(N) time?",
                    "Explain Amazon SDE 1 interview process",
                    "Help me debug an array out of bounds bug",
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSpokenInputText(prompt)}
                      className="w-full text-left bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 p-2.5 rounded-lg transition-all"
                    >
                      "{prompt}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VOICE LEARNING MODE */}
        {activeTab === "learning" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" /> Voice Concept Explainer
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Topic (e.g. Breadth-First Search, Trees, DP)"
                  value={learnTopicInput}
                  onChange={(e) => setLearnTopicInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleLearnTopic}
                  disabled={isLearning}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  {isLearning ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Explain Topic
                </button>
              </div>
            </div>

            {topicExplanation && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-md font-bold text-white">{learnTopicInput} Breakdown</h3>
                  <button
                    onClick={() => speakTextInBrowser(topicExplanation.concept)}
                    className="px-3 py-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Volume2 className="w-4 h-4" /> Listen Audio
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Core Concept</div>
                    <p className="text-slate-300 text-sm mt-1">{topicExplanation.concept}</p>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Example</div>
                    <p className="text-slate-300 text-sm mt-1">{topicExplanation.example}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-400 font-bold">Time Complexity</div>
                      <div className="text-sm font-bold text-emerald-400">{topicExplanation.timeComplexity}</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-400 font-bold">Space Complexity</div>
                      <div className="text-sm font-bold text-indigo-400">{topicExplanation.spaceComplexity}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VOICE CODING ASSISTANT */}
        {activeTab === "coding" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" /> Socratic Code Inspector
              </h3>
              <textarea
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                rows={10}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-indigo-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
              <button
                onClick={handleAnalyzeCode}
                disabled={isAnalyzingCode}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {isAnalyzingCode ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Analyze Code & Speak Hint
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-md font-bold text-amber-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> AI Bug Analysis & Hints
              </h3>
              {codingHelp ? (
                <div className="space-y-4 text-sm">
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-400 font-bold uppercase mb-1">Bug Analysis</div>
                    <p className="text-slate-300">{codingHelp.bugAnalysis}</p>
                  </div>
                  <div className="bg-amber-950/30 p-3.5 rounded-lg border border-amber-500/30">
                    <div className="text-xs text-amber-400 font-bold uppercase mb-1">Guided Hint (No Solution Generated)</div>
                    <p className="text-amber-200">{codingHelp.hint}</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-xs">Submit code for analysis to receive socratic hints.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: VOICE MOCK INTERVIEW */}
        {activeTab === "interview" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Target Company</label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    {["Amazon", "Google", "Microsoft", "Meta", "TCS", "Infosys"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Round Type</label>
                  <select
                    value={selectedRound}
                    onChange={(e) => setSelectedRound(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    {["DSA", "LLD", "HLD", "HR"].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleStartInterview}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" /> Start Interview Round
                  </button>
                </div>
              </div>
            </div>

            {interviewQuestion && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="font-bold text-indigo-400">{selectedCompany} Interviewer</span>
                    <button
                      onClick={() => speakTextInBrowser(interviewQuestion.question)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Replay
                    </button>
                  </div>
                  <h3 className="text-md font-bold text-white">{interviewQuestion.question}</h3>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white">Your Oral / Code Answer</h3>
                  <textarea
                    value={spokenAnswer}
                    onChange={(e) => setSpokenAnswer(e.target.value)}
                    rows={4}
                    placeholder="Speak or type your interview solution..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-3 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleEvaluateInterview}
                    disabled={isEvaluatingInterview}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg transition-all"
                  >
                    Submit Answer for Voice Scoring
                  </button>

                  {interviewEvaluation && (
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <div className="text-xl font-bold text-indigo-400">Score: {interviewEvaluation.score}%</div>
                      <p className="text-xs text-slate-300">{interviewEvaluation.technicalFeedback}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: VOICE QUIZ */}
        {activeTab === "quiz" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Voice Quiz Session</h2>
                <p className="text-slate-400 text-sm">Auditory rapid-fire DSA quizzes.</p>
              </div>
              <button onClick={handleStartQuiz} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg">
                Generate Question
              </button>
            </div>

            {quizQuestion && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="text-md font-bold text-white">{quizQuestion.question}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quizQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedQuizOption(opt)}
                      className={`p-3 rounded-lg border text-sm text-left transition-all ${
                        selectedQuizOption === opt
                          ? "bg-indigo-600 border-indigo-500 text-white font-bold"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <button onClick={handleAnswerQuiz} className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg">
                  Submit Quiz Answer
                </button>

                {quizResult && (
                  <div className="p-3 bg-slate-950 border border-slate-800 text-xs font-bold text-indigo-300 rounded-lg">
                    {quizResult.feedback}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: VOICE REVIEW */}
        {activeTab === "review" && reviewData && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Spaced Repetition Voice Review</h2>
              <button
                onClick={() => speakTextInBrowser(reviewData.guidanceText)}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Volume2 className="w-4 h-4" /> Listen Daily Overview
              </button>
            </div>
            <p className="text-slate-300 text-sm">{reviewData.guidanceText}</p>
          </div>
        )}

        {/* TAB 7: VOICE ANALYTICS */}
        {activeTab === "analytics" && analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="text-xs text-slate-400 font-bold uppercase">Total Sessions</div>
              <div className="text-3xl font-black text-indigo-400 mt-1">{analytics.totalSessions}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="text-xs text-slate-400 font-bold uppercase">Minutes Learned</div>
              <div className="text-3xl font-black text-emerald-400 mt-1">{analytics.totalMinutes}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="text-xs text-slate-400 font-bold uppercase">Mock Interviews</div>
              <div className="text-3xl font-black text-amber-400 mt-1">{analytics.interviewSessions}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="text-xs text-slate-400 font-bold uppercase">Retention Reviews</div>
              <div className="text-3xl font-black text-purple-400 mt-1">{analytics.reviewSessions}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceMentor;
