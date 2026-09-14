import React, { useState, useEffect } from "react";
import {
  Building2,
  Briefcase,
  Target,
  Sparkles,
  CheckCircle2,
  Clock,
  Code2,
  Calendar,
  Zap,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Filter,
  Play,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import {
  CompanyPrepApi,
  CompanyTrack,
  CompanyRoadmapWeek,
  CompanyProblemMapping,
  CompanyInterviewPatternRound,
  CompanyUserReadiness,
  CompanyPrepPlan,
  MockInterviewQuestion,
} from "../services/companyPrepApi";

export const CompanyPrep: React.FC = () => {
  const [tracks, setTracks] = useState<CompanyTrack[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("amazon");
  const [activeTab, setActiveTab] = useState<"tracks" | "roadmap" | "problems" | "patterns" | "readiness" | "planner" | "mock">("tracks");

  const [trackDetails, setTrackDetails] = useState<{
    track: CompanyTrack | null;
    roadmap: CompanyRoadmapWeek[];
    interviewPattern: CompanyInterviewPatternRound[];
    highFreqProblems: CompanyProblemMapping[];
  } | null>(null);

  const [readiness, setReadiness] = useState<CompanyUserReadiness | null>(null);
  const [problems, setProblems] = useState<CompanyProblemMapping[]>([]);
  const [problemFilterTopic, setProblemFilterTopic] = useState<string>("");
  const [problemFilterDiff, setProblemFilterDiff] = useState<string>("");

  // AI Planner state
  const [targetDate, setTargetDate] = useState<string>("30 Days");
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(15);
  const [prepPlan, setPrepPlan] = useState<CompanyPrepPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);

  // AI Mock Interview state
  const [mockRoundType, setMockRoundType] = useState<string>("Coding");
  const [mockDifficulty, setMockDifficulty] = useState<string>("Medium");
  const [mockQuestions, setMockQuestions] = useState<MockInterviewQuestion[]>([]);
  const [isGeneratingMock, setIsGeneratingMock] = useState<boolean>(false);
  const [activeMockIndex, setActiveMockIndex] = useState<number>(0);
  const [userMockCode, setUserMockCode] = useState<string>("");
  const [showHint, setShowHint] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadInitialTracks();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadCompanyDetails(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const loadInitialTracks = async () => {
    setLoading(true);
    try {
      const data = await CompanyPrepApi.getTracks();
      setTracks(data);
    } catch (err) {
      console.error("Error loading company tracks:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyDetails = async (cid: string) => {
    try {
      const [details, read, probs] = await Promise.all([
        CompanyPrepApi.getTrackDetails(cid),
        CompanyPrepApi.getReadiness(cid),
        CompanyPrepApi.getProblems(cid, problemFilterTopic, problemFilterDiff),
      ]);
      setTrackDetails(details);
      setReadiness(read);
      setProblems(probs);
    } catch (err) {
      console.error("Error loading track details:", err);
    }
  };

  const handleFilterProblems = async () => {
    try {
      const probs = await CompanyPrepApi.getProblems(selectedCompanyId, problemFilterTopic, problemFilterDiff);
      setProblems(probs);
    } catch (err) {
      console.error("Error filtering problems:", err);
    }
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const plan = await CompanyPrepApi.generatePrepPlan(selectedCompanyId, targetDate, hoursPerWeek);
      setPrepPlan(plan);
    } catch (err) {
      console.error("Error generating plan:", err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleGenerateMock = async () => {
    setIsGeneratingMock(true);
    try {
      const questions = await CompanyPrepApi.generateMockInterview(selectedCompanyId, mockRoundType, mockDifficulty);
      setMockQuestions(questions);
      setActiveMockIndex(0);
      if (questions.length > 0) {
        setUserMockCode(questions[0].starterCode);
      }
    } catch (err) {
      console.error("Error generating mock interview:", err);
    } finally {
      setIsGeneratingMock(false);
    }
  };

  const currentTrack = trackDetails?.track;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Building2 className="w-4 h-4" /> Company Preparation Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Target Tech Giant Career Pathways
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Tailored learning roadmaps, high-frequency company problem maps, interview pattern timelines, and AI readiness evaluations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3">
              <Target className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-xs text-slate-400">Current Target</div>
                <div className="text-sm font-semibold text-white capitalize">{selectedCompanyId}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Selector Grid */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {tracks.map((t) => (
              <button
                key={t.companyId}
                onClick={() => setSelectedCompanyId(t.companyId)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCompanyId === t.companyId
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                {t.name}
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-950/40 text-indigo-300 border border-indigo-500/20">
                  {t.baseDifficulty}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-6 text-sm font-medium overflow-x-auto">
          {[
            { id: "tracks", label: "Company Overview", icon: Building2 },
            { id: "roadmap", label: "Learning Roadmap", icon: Calendar },
            { id: "problems", label: "Problem Mapping", icon: Code2 },
            { id: "patterns", label: "Interview Patterns", icon: Clock },
            { id: "readiness", label: "Readiness Score", icon: TrendingUp },
            { id: "planner", label: "AI Prep Planner", icon: Sparkles },
            { id: "mock", label: "AI Mock Interview", icon: Zap },
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

        {/* TAB 1: COMPANY TRACK OVERVIEW */}
        {activeTab === "tracks" && currentTrack && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-400" /> {currentTrack.name} Track Overview
                  </h2>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {currentTrack.category}
                  </span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{currentTrack.overview}</p>

                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3">Core Recommended Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentTrack.recommendedTopics.map((topic, idx) => (
                      <span key={idx} className="bg-slate-800 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" /> Standard Hiring Process Stages
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentTrack.hiringProcess.map((step, idx) => (
                    <div key={idx} className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-lg flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/20">
                        0{idx + 1}
                      </div>
                      <span className="text-sm font-medium text-slate-200">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 text-center">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Estimated Target Readiness</div>
                <div className="text-5xl font-black text-indigo-400">{readiness?.readinessScore || 75}%</div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${readiness?.readinessScore || 75}%` }}></div>
                </div>
                <p className="text-xs text-slate-400">Based on past submissions, memory retention, and contest ranks.</p>
                <button
                  onClick={() => setActiveTab("readiness")}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
                >
                  View Full Breakdown
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Interview Format
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  {currentTrack.interviewPattern.map((pat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-400" /> {pat}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPANY ROADMAP ENGINE */}
        {activeTab === "roadmap" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white capitalize">{selectedCompanyId} Preparation Roadmap</h2>
                <p className="text-slate-400 text-sm">Structured weekly curriculum designed specifically for {selectedCompanyId} interview standards.</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Est. Total Time</span>
                <div className="text-lg font-bold text-emerald-400">60 Hours</div>
              </div>
            </div>

            <div className="space-y-4">
              {trackDetails?.roadmap.map((week) => (
                <div key={week.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-lg text-xs font-bold">
                        Week {week.weekNumber}
                      </div>
                      <h3 className="text-lg font-bold text-white">{week.title}</h3>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" /> {week.estimatedHours} Hours Required
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {week.topics.map((top, idx) => (
                      <span key={idx} className="bg-slate-950 text-slate-300 border border-slate-800 px-3 py-1 rounded-md text-xs font-medium">
                        {top}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COMPANY PROBLEM MAPPING */}
        {activeTab === "problems" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Filter className="w-4 h-4 text-indigo-400" />
                <input
                  type="text"
                  placeholder="Filter by Topic..."
                  value={problemFilterTopic}
                  onChange={(e) => setProblemFilterTopic(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={problemFilterDiff}
                  onChange={(e) => setProblemFilterDiff(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <button onClick={handleFilterProblems} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-lg font-medium">
                  Apply Filter
                </button>
              </div>
              <span className="text-xs text-slate-400">{problems.length} Company Problems Found</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 text-xs uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Problem Title</th>
                      <th className="py-3 px-4">Frequency</th>
                      <th className="py-3 px-4">Importance</th>
                      <th className="py-3 px-4">Difficulty</th>
                      <th className="py-3 px-4">Topics</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {problems.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-all">
                        <td className="py-3 px-4 font-semibold text-white">{p.title}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${p.frequency}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-indigo-400">{p.frequency}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              p.importance === "Critical"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {p.importance}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs font-semibold ${
                              p.difficulty === "Easy" ? "text-emerald-400" : p.difficulty === "Medium" ? "text-amber-400" : "text-rose-400"
                            }`}
                          >
                            {p.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {p.topics.map((t, idx) => (
                              <span key={idx} className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[11px]">
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white px-3 py-1 rounded text-xs transition-all border border-indigo-500/30">
                            Solve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INTERVIEW PATTERN DATABASE */}
        {activeTab === "patterns" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-2 capitalize">{selectedCompanyId} Interview Process Stages</h2>
              <p className="text-slate-400 text-sm">Official round breakdowns, target durations, and key interviewer evaluation focus points.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trackDetails?.interviewPattern.map((round) => (
                <div key={round.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center text-sm">
                        R{round.roundNumber}
                      </div>
                      <div>
                        <h3 className="text-md font-bold text-white">{round.roundName}</h3>
                        <span className="text-xs text-slate-400">{round.roundType} Round</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" /> {round.durationMinutes} mins
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed">{round.description}</p>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interviewer Evaluation Criteria</div>
                    <div className="flex flex-wrap gap-2">
                      {round.keyFocus.map((focus, idx) => (
                        <span key={idx} className="bg-slate-950 border border-slate-800 text-indigo-300 text-xs px-2.5 py-1 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {focus}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: COMPANY READINESS ENGINE */}
        {activeTab === "readiness" && readiness && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">AI Readiness Assessment</span>
                <h2 className="text-3xl font-black text-white capitalize">{selectedCompanyId} Readiness Index</h2>
                <p className="text-slate-400 text-sm max-w-xl">
                  Calculated from problems solved, topic mastery, contest percentile, retention memory decay, and adaptive performance profiles.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center bg-slate-950/80 border border-indigo-500/30 p-6 rounded-2xl min-w-[200px]">
                <div className="text-5xl font-black text-indigo-400">{readiness.readinessScore}%</div>
                <div className="text-xs font-semibold text-slate-300 mt-2">Overall Fit Score</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="text-md font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Identified Strengths
                </h3>
                <div className="space-y-2">
                  {readiness.strengths.map((s, idx) => (
                    <div key={idx} className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg text-sm text-slate-200">
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="text-md font-bold text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Weaknesses
                </h3>
                <div className="space-y-2">
                  {readiness.weaknesses.map((w, idx) => (
                    <div key={idx} className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg text-sm text-slate-200">
                      {w}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="text-md font-bold text-amber-400 flex items-center gap-2">
                  <Target className="w-5 h-5" /> High-Priority Improvement Areas
                </h3>
                <div className="space-y-2">
                  {readiness.improvementAreas.map((area, idx) => (
                    <div key={idx} className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg text-sm text-slate-200">
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AI COMPANY PREPARATION PLANNER */}
        {activeTab === "planner" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" /> AI Gemini Company Prep Generator
                  </h2>
                  <p className="text-slate-400 text-sm">Generate customized daily, weekly, and monthly study plans for {selectedCompanyId}.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Target Interview Horizon</label>
                  <select
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value="15 Days">15 Days (Crash Course)</option>
                    <option value="30 Days">30 Days (Standard)</option>
                    <option value="60 Days">60 Days (Deep Preparation)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Available Study Time (Hours/Week)</label>
                  <input
                    type="number"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleGeneratePlan}
                    disabled={isGeneratingPlan}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-600/30"
                  >
                    {isGeneratingPlan ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isGeneratingPlan ? "Synthesizing Plan..." : "Generate AI Plan"}
                  </button>
                </div>
              </div>
            </div>

            {prepPlan && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <h3 className="text-md font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" /> Daily Action Items
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {prepPlan.dailyPlan.map((d, idx) => (
                      <div key={idx} className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-400">{d.day}</span>
                          <span className="text-slate-400">{d.estMinutes} mins</span>
                        </div>
                        <div className="text-sm font-semibold text-white">{d.task}</div>
                        <span className="inline-block bg-indigo-500/10 text-indigo-300 text-[11px] px-2 py-0.5 rounded border border-indigo-500/20">
                          {d.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <h3 className="text-md font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" /> Weekly Milestones
                  </h3>
                  <div className="space-y-3">
                    {prepPlan.weeklyPlan.map((w, idx) => (
                      <div key={idx} className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
                        <div className="text-xs font-bold text-emerald-400">Week {w.week} Focus: {w.focus}</div>
                        <div className="flex flex-wrap gap-2">
                          {w.milestones.map((m, mIdx) => (
                            <span key={mIdx} className="bg-slate-900 text-slate-300 text-xs px-2.5 py-1 rounded border border-slate-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: AI MOCK INTERVIEW GENERATOR */}
        {activeTab === "mock" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-400" /> AI Mock Interview Generator
                  </h2>
                  <p className="text-slate-400 text-sm">Simulate real-world {selectedCompanyId} technical rounds with custom starter templates.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Round Type</label>
                  <select
                    value={mockRoundType}
                    onChange={(e) => setMockRoundType(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value="OA">Online Assessment (OA)</option>
                    <option value="Coding">DSA Technical Coding</option>
                    <option value="LLD">Low-Level System Design (LLD)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Difficulty Level</label>
                  <select
                    value={mockDifficulty}
                    onChange={(e) => setMockDifficulty(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleGenerateMock}
                    disabled={isGeneratingMock}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-600/30"
                  >
                    {isGeneratingMock ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {isGeneratingMock ? "Generating Questions..." : "Start Mock Interview"}
                  </button>
                </div>
              </div>
            </div>

            {mockQuestions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-indigo-400 uppercase">{mockQuestions[activeMockIndex].roundName}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                      {mockQuestions[activeMockIndex].difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{mockQuestions[activeMockIndex].questionTitle}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{mockQuestions[activeMockIndex].problemDescription}</p>

                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs font-mono text-slate-300">
                    <div className="text-slate-400 font-sans mb-1 font-semibold">Expected Output:</div>
                    {mockQuestions[activeMockIndex].expectedOutputFormat}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> {showHint ? "Hide Interviewer Hint" : "Show Interviewer Hint"}
                    </button>
                    {showHint && (
                      <div className="mt-2 bg-indigo-950/40 border border-indigo-500/20 p-3 rounded-lg text-xs text-indigo-200">
                        {mockQuestions[activeMockIndex].hints.join(" | ")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400">Code Workspace</span>
                      <span className="text-xs text-slate-500">JavaScript / Node</span>
                    </div>
                    <textarea
                      value={userMockCode}
                      onChange={(e) => setUserMockCode(e.target.value)}
                      rows={12}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-indigo-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />
                  </div>

                  <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Submit for AI Review
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default CompanyPrep;
