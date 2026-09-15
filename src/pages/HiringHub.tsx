import React, { useState, useEffect } from "react";
import {
  HiringApi,
  Assessment,
  CandidateRanking,
  HiringPrediction,
  RecruiterEvaluation,
  BenchmarkComparison,
} from "../services/hiringApi";
import {
  Briefcase,
  UserCheck,
  Award,
  TrendingUp,
  Building2,
  BarChart3,
  Bot,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Send,
  Zap,
} from "lucide-react";

export const HiringHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | "assessments"
    | "recruiter"
    | "rankings"
    | "predictions"
    | "readiness"
    | "benchmarking"
    | "interview"
    | "analytics"
  >("assessments");

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [rankings, setRankings] = useState<CandidateRanking[]>([]);
  const [predictions, setPredictions] = useState<HiringPrediction[]>([]);
  const [benchmark, setBenchmark] = useState<BenchmarkComparison | null>(null);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("Google");
  const [analytics, setAnalytics] = useState<any>(null);

  // Recruiter AI State
  const [roundType, setRoundType] = useState<"HR" | "Technical" | "Behavioral" | "Leadership">("Technical");
  const [userResponseInput, setUserResponseInput] = useState("");
  const [recruiterEvaluation, setRecruiterEvaluation] = useState<RecruiterEvaluation | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedCompany]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [asmRes, rankRes, predRes, benchRes, pipeRes, anaRes] = await Promise.all([
        HiringApi.getAssessments(),
        HiringApi.getRankings(),
        HiringApi.getPredictions(),
        HiringApi.getBenchmark(),
        HiringApi.getPipeline(selectedCompany),
        HiringApi.getAnalytics(),
      ]);

      if (asmRes.success) {
        setAssessments(asmRes.assessments);
        if (asmRes.assessments.length > 0) setSelectedAssessment(asmRes.assessments[0]);
      }
      if (rankRes.success) setRankings(rankRes.rankings);
      if (predRes.success) setPredictions(predRes.predictions);
      if (benchRes.success) setBenchmark(benchRes.benchmark);
      if (pipeRes.success) setPipelines(pipeRes.pipelines);
      if (anaRes.success) setAnalytics(anaRes.analytics);
    } catch (e) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateAssessment = async (score: number) => {
    if (!selectedAssessment) return;
    try {
      await HiringApi.submitAttempt(selectedAssessment.id, score);
      const anaRes = await HiringApi.getAnalytics();
      if (anaRes.success) setAnalytics(anaRes.analytics);
      alert(`Assessment submitted with score ${score}! Hiring readiness updated.`);
    } catch (e) {
      // Fallback
    }
  };

  const handleEvaluateRecruiter = async () => {
    if (!userResponseInput.trim()) return;
    setEvalLoading(true);
    try {
      const res = await HiringApi.evaluateRecruiterSession({
        company: selectedCompany,
        roundType,
        userResponses: [userResponseInput],
      });
      if (res.success) setRecruiterEvaluation(res.evaluation);
    } catch (e) {
      // Fallback
    } finally {
      setEvalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-neutral-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <Briefcase className="w-3.5 h-3.5" />
              <span>AI Hiring & Assessment Platform (V3.6)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Algora AI Recruitment & Assessment Suite
            </h1>
            <p className="text-neutral-400 text-sm max-w-2xl">
              Simulated Online Assessments, Recruiter AI Interview Rounds, Candidate Ranking Engine, and Company Selection Probabilities.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-neutral-900/80 p-4 rounded-2xl border border-neutral-700/60 font-mono">
            <div>
              <p className="text-[10px] text-neutral-400 uppercase font-bold">Candidate Tier</p>
              <p className="text-xl font-black text-amber-400">{benchmark?.userTier || "Top 5%"}</p>
            </div>
            <div className="h-8 w-px bg-neutral-700" />
            <div>
              <p className="text-[10px] text-neutral-400 uppercase font-bold">Overall Readiness</p>
              <p className="text-xl font-black text-emerald-400">88.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-neutral-200 text-xs font-bold scrollbar-none">
        {[
          { id: "assessments", label: "Online Assessments", icon: Layers },
          { id: "recruiter", label: "Recruiter AI Rounds", icon: Bot },
          { id: "rankings", label: "Candidate Ranking", icon: Award },
          { id: "predictions", label: "Hiring Predictions", icon: TrendingUp },
          { id: "readiness", label: "Company Readiness", icon: Building2 },
          { id: "benchmarking", label: "Skill Benchmarking", icon: Zap },
          { id: "interview", label: "Interview Performance", icon: UserCheck },
          { id: "analytics", label: "Placement Analytics", icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-200/80"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-neutral-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Online Assessments */}
      {activeTab === "assessments" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-neutral-900">Target Company Assessments</h2>
            <div className="space-y-3">
              {assessments.map((a) => (
                <div
                  key={a.id}
                  onClick={() => setSelectedAssessment(a)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selectedAssessment?.id === a.id
                      ? "bg-neutral-900 text-white border-neutral-700 shadow-md"
                      : "bg-white text-neutral-900 border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                      selectedAssessment?.id === a.id ? "bg-emerald-400 text-neutral-950" : "bg-neutral-100 text-neutral-800"
                    }`}>
                      {a.company}
                    </span>
                    <span className="text-[11px] opacity-80 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {a.duration_minutes} mins
                    </span>
                  </div>
                  <h3 className="font-bold text-sm">{a.title}</h3>
                  <p className="text-xs opacity-75 line-clamp-2">{a.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedAssessment && (
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">{selectedAssessment.title}</h2>
                    <p className="text-xs text-neutral-500">{selectedAssessment.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSimulateAssessment(95)}
                      className="px-3 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700"
                    >
                      Simulate Score: 95%
                    </button>
                    <button
                      onClick={() => handleSimulateAssessment(75)}
                      className="px-3 py-2 bg-neutral-800 text-white font-bold text-xs rounded-xl hover:bg-neutral-900"
                    >
                      Simulate Score: 75%
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <h3 className="font-bold text-xs text-neutral-900 uppercase">Assessment Details</h3>
                  <div className="grid grid-cols-3 gap-4 text-xs font-mono text-neutral-700">
                    <div>Type: {selectedAssessment.assessment_type}</div>
                    <div>Difficulty: {selectedAssessment.difficulty}</div>
                    <div>Time Limit: {selectedAssessment.duration_minutes} Minutes</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Recruiter AI */}
      {activeTab === "recruiter" && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">AI Recruiter Evaluation Simulator</h2>
              <p className="text-xs text-neutral-500">
                Rigorous HR, Technical, Behavioral, and Leadership evaluations powered by Gemini.
              </p>
            </div>
            <Bot className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">Target Company:</label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none font-bold"
                  >
                    {["Google", "Amazon", "Microsoft", "Meta", "Netflix", "Uber", "Adobe", "Atlassian", "TCS", "Infosys"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-neutral-700">Round Type:</label>
                  <select
                    value={roundType}
                    onChange={(e) => setRoundType(e.target.value as any)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none font-bold"
                  >
                    {["HR", "Technical", "Behavioral", "Leadership"].map((r) => (
                      <option key={r} value={r}>{r} Round</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700">Enter Your Interview Response:</label>
                <textarea
                  value={userResponseInput}
                  onChange={(e) => setUserResponseInput(e.target.value)}
                  placeholder="Explain a complex architectural decision or code optimization using the STAR method..."
                  className="w-full h-36 p-3 bg-neutral-900 text-emerald-300 font-mono text-xs rounded-xl border border-neutral-700 focus:outline-none"
                />
              </div>

              <button
                onClick={handleEvaluateRecruiter}
                disabled={evalLoading}
                className="w-full py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{evalLoading ? "AI Recruiter Evaluating..." : "Evaluate Response"}</span>
              </button>
            </div>

            {/* Recruiter Evaluation Output */}
            <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200/80 space-y-4">
              <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Executive Recruiter Feedback
              </h3>

              {evalLoading ? (
                <p className="text-neutral-500 italic">Evaluating candidate responses against {selectedCompany} standards...</p>
              ) : recruiterEvaluation ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-xl">
                    <span className="font-bold text-neutral-800">Recommendation:</span>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-black rounded-md uppercase">
                      {recruiterEvaluation.recommendation} ({recruiterEvaluation.score}/100)
                    </span>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
                    <p className="font-bold text-emerald-900">Strengths:</p>
                    <ul className="list-disc pl-4 text-neutral-800 space-y-0.5">
                      {recruiterEvaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl space-y-1">
                    <p className="font-bold text-red-900">Weaknesses & Gaps:</p>
                    <ul className="list-disc pl-4 text-neutral-800 space-y-0.5">
                      {recruiterEvaluation.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
                    <p className="font-bold text-indigo-900">Improvement Plan:</p>
                    <ul className="list-disc pl-4 text-neutral-800 space-y-0.5">
                      {recruiterEvaluation.improvementPlan.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-neutral-500 text-xs">Submit an interview response above to view AI Recruiter evaluation.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Candidate Ranking */}
      {activeTab === "rankings" && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-neutral-900">Company Candidate Index Rankings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {rankings.map((r) => (
              <div key={r.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-neutral-900 text-sm">{r.company}</p>
                  <p className="text-neutral-500">Ranking Index Score: {r.ranking_score}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-indigo-600">{r.percentile}th</p>
                  <p className="text-[10px] text-neutral-400 font-mono uppercase">Percentile</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Hiring Predictions */}
      {activeTab === "predictions" && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-neutral-900">AI Selection Probabilities Across Top Tech Companies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {predictions.map((p) => (
              <div key={p.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 text-sm">{p.company}</span>
                  <span className="text-emerald-600 font-extrabold">{p.selection_probability}%</span>
                </div>
                <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, p.selection_probability)}%` }}
                  />
                </div>
                <p className="text-[10px] text-neutral-500 text-right">Confidence Score: {p.confidence_score}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Company Readiness & Pipelines */}
      {activeTab === "readiness" && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Company Hiring Pipeline Stages</h2>
              <p className="text-xs text-neutral-500">Stage-by-stage hiring process requirements.</p>
            </div>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-xs"
            >
              {["Google", "Amazon", "Microsoft", "Meta", "Netflix"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 text-xs">
            {pipelines.map((pipe, idx) => (
              <div key={pipe.id} className="flex items-start gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="w-7 h-7 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="font-bold text-neutral-900">{pipe.stage_name}</h3>
                  <p className="text-neutral-600 mt-0.5">{pipe.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Skill Benchmarking */}
      {activeTab === "benchmarking" && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-neutral-900">Candidate Cohort Skill Benchmarking</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p className="text-neutral-500">Contest Elo Rating</p>
              <p className="text-2xl font-black text-amber-500">{benchmark?.comparisonMetrics?.contestElo || 1820}</p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p className="text-neutral-500">Topic Mastery Average</p>
              <p className="text-2xl font-black text-indigo-600">{benchmark?.comparisonMetrics?.avgMastery || 88}%</p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p className="text-neutral-500">Assessment Score Average</p>
              <p className="text-2xl font-black text-emerald-600">{benchmark?.comparisonMetrics?.assessmentAvg || 85}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Interview Performance */}
      {activeTab === "interview" && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-neutral-900">Interview Evaluation Summary</h2>
          <p className="text-xs text-neutral-600">Your AI Recruiter evaluations reflect consistent technical depth and structured STAR communication.</p>
        </div>
      )}

      {/* Tab 8: Placement Analytics */}
      {activeTab === "analytics" && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-neutral-900">Overall Assessment & Placement Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <p className="font-bold text-neutral-700">Total Assessments Completed</p>
              <p className="text-2xl font-black text-neutral-900">{analytics?.totalAttempts || 4}</p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <p className="font-bold text-neutral-700">Average Score</p>
              <p className="text-2xl font-black text-emerald-600">{analytics?.averageScore || 88}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
