import React, { useState, useEffect } from "react";
import {
  ContestApi,
  Contest,
  ContestProblem,
  ContestLeaderboardItem,
  ContestAnalytics,
  ContestPrediction,
  CoachAdvice,
} from "../services/contestApi";
import {
  Trophy,
  Flame,
  Calendar,
  Clock,
  Users,
  Brain,
  TrendingUp,
  Award,
  Play,
  Sparkles,
  Send,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";

export const ContestHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "contests" | "coach" | "analytics" | "team" | "replay"
  >("contests");

  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [problems, setProblems] = useState<ContestProblem[]>([]);
  const [leaderboard, setLeaderboard] = useState<ContestLeaderboardItem[]>([]);
  const [analytics, setAnalytics] = useState<ContestAnalytics | null>(null);
  const [predictions, setPredictions] = useState<ContestPrediction[]>([]);
  const [coachAdvice, setCoachAdvice] = useState<CoachAdvice | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContestData();
  }, []);

  const loadContestData = async () => {
    setLoading(true);
    try {
      const contestRes = await ContestApi.getContests();
      if (contestRes.success && contestRes.contests.length > 0) {
        setContests(contestRes.contests);
        selectContestDetails(contestRes.contests[0].id);
      }

      const analyticsRes = await ContestApi.getAnalytics();
      if (analyticsRes.success) {
        setAnalytics(analyticsRes.analytics);
        setPredictions(analyticsRes.predictions);
      }
    } catch (e) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const selectContestDetails = async (id: string) => {
    try {
      const details = await ContestApi.getContestById(id);
      if (details.success) {
        setSelectedContest(details.contest);
        setProblems(details.problems);
        setLeaderboard(details.leaderboard);
      }
    } catch (e) {
      // Fallback
    }
  };

  const requestCoachAdvice = async (requestType: string) => {
    if (!selectedContest) return;
    setCoachLoading(true);
    try {
      const res = await ContestApi.getCoachAdvice({
        contestId: selectedContest.id,
        problemTitle: problems[0]?.id || "Problem A",
        userCode,
        requestType,
      });
      if (res.success) {
        setCoachAdvice(res.advice);
      }
    } catch (e) {
      // Fallback
    } finally {
      setCoachLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!selectedContest || !teamName) return;
    try {
      await ContestApi.createTeam(selectedContest.id, teamName);
      alert(`Team "${teamName}" created successfully!`);
      setTeamName("");
    } catch (e) {
      // Fallback
    }
  };

  const handleSimulateSubmission = async (verdict: string) => {
    if (!selectedContest) return;
    try {
      await ContestApi.submitSolution({
        contestId: selectedContest.id,
        problemId: problems[0]?.id || "p_sw_1",
        verdict,
      });
      selectContestDetails(selectedContest.id);
      const analyticsRes = await ContestApi.getAnalytics();
      if (analyticsRes.success) {
        setAnalytics(analyticsRes.analytics);
      }
    } catch (e) {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Competitive Programming & AI Contest Arena (V3.5)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Algora Competitive Contest Platform
            </h1>
            <p className="text-neutral-400 text-sm max-w-2xl">
              Participate in Daily Speed Sprints, Weekly Rated Contests, Company Hiring OA Sprints, and AI Coach Socratic Mentoring.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-neutral-900/80 p-4 rounded-2xl border border-neutral-700/60 font-mono">
            <div>
              <p className="text-[10px] text-neutral-400 uppercase font-bold">Contest Rating</p>
              <p className="text-2xl font-black text-amber-400">{analytics?.rating || 1820}</p>
            </div>
            <div className="h-8 w-px bg-neutral-700" />
            <div>
              <p className="text-[10px] text-neutral-400 uppercase font-bold">Global Rank</p>
              <p className="text-2xl font-black text-indigo-400">#142</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-neutral-200 text-xs font-bold scrollbar-none">
        {[
          { id: "contests", label: "Active & Upcoming Contests", icon: Flame },
          { id: "coach", label: "AI Contest Coach", icon: Brain },
          { id: "analytics", label: "Contest Rating & Analytics", icon: TrendingUp },
          { id: "team", label: "Team Contests", icon: Users },
          { id: "replay", label: "Virtual Replay & Practice", icon: Play },
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
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-neutral-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Contests List & Arena */}
      {activeTab === "contests" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contests Selector */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-neutral-900">Live & Scheduled Contests</h2>
            <div className="space-y-3">
              {contests.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectContestDetails(c.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selectedContest?.id === c.id
                      ? "bg-indigo-900 text-white border-indigo-700 shadow-md"
                      : "bg-white text-neutral-900 border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                      selectedContest?.id === c.id ? "bg-amber-400 text-neutral-950" : "bg-neutral-100 text-neutral-800"
                    }`}>
                      {c.contest_type}
                    </span>
                    <span className="text-[11px] opacity-80 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {c.duration_minutes} mins
                    </span>
                  </div>
                  <h3 className="font-bold text-sm">{c.title}</h3>
                  <p className="text-xs opacity-75 line-clamp-2">{c.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Contest Detail & Submissions */}
          <div className="lg:col-span-2 space-y-6">
            {selectedContest && (
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">{selectedContest.title}</h2>
                    <p className="text-xs text-neutral-500">{selectedContest.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSimulateSubmission("Accepted")}
                      className="px-3 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Submit Accepted
                    </button>
                    <button
                      onClick={() => handleSimulateSubmission("Wrong Answer")}
                      className="px-3 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Submit Wrong Answer
                    </button>
                  </div>
                </div>

                {/* Problems List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase text-neutral-400">Contest Problem Set</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {problems.map((p, idx) => (
                      <div key={p.id} className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                        <span className="font-bold text-indigo-600">Problem {String.fromCharCode(65 + idx)}</span>
                        <p className="font-medium text-neutral-900">Point Score: {p.points}</p>
                        <p className="text-[10px] text-neutral-500">ID: {p.problem_id}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Leaderboard */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-extrabold uppercase text-neutral-400">Live Contest Leaderboard</h3>
                  <div className="space-y-2 text-xs">
                    {leaderboard.map((item) => (
                      <div key={item.rank} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            item.rank === 1 ? "bg-amber-400 text-neutral-950" : "bg-neutral-200 text-neutral-800"
                          }`}>
                            #{item.rank}
                          </span>
                          <span className="font-bold text-neutral-900">{item.userId}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-neutral-600">{item.score} pts</span>
                          <span className="font-bold text-indigo-600">{item.ratingAfter} Rating</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: AI Contest Coach */}
      {activeTab === "coach" && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">AI Contest Socratic Coach & Strategy Mentor</h2>
              <p className="text-xs text-neutral-500">
                Socratic hint generation, time management strategy, and post-contest analysis without revealing full code solutions.
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700">Paste Your Code / Attempt:</label>
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder="function solve() { ... }"
                  className="w-full h-36 p-3 bg-neutral-900 text-amber-300 font-mono text-xs rounded-xl border border-neutral-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => requestCoachAdvice("hint")}
                  disabled={coachLoading}
                  className="p-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 text-xs"
                >
                  Request Socratic Hint
                </button>
                <button
                  onClick={() => requestCoachAdvice("strategy")}
                  disabled={coachLoading}
                  className="p-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 text-xs"
                >
                  Contest Strategy Advice
                </button>
              </div>
            </div>

            {/* Coach Output */}
            <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200/80 space-y-4">
              <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-600" /> AI Coach Feedback
              </h3>

              {coachLoading ? (
                <p className="text-neutral-500 italic">Asking AI Contest Coach...</p>
              ) : coachAdvice ? (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
                    <p className="font-bold text-indigo-900">Socratic Hint:</p>
                    <p className="text-neutral-800 leading-relaxed">{coachAdvice.socraticHint}</p>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl space-y-1">
                    <p className="font-bold text-amber-900">Strategy Recommendation:</p>
                    <p className="text-neutral-800">{coachAdvice.strategyRecommendation}</p>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
                    <p className="font-bold text-emerald-900">Recommended Time Allocation:</p>
                    <p className="text-neutral-800">{coachAdvice.recommendedTimeAllocation}</p>
                  </div>
                </div>
              ) : (
                <p className="text-neutral-500 text-xs">Request advice above to view AI Socratic coaching.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Contest Analytics & Predictions */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Rating</p>
              <p className="text-3xl font-black text-amber-500">{analytics?.rating || 1820}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Contests Joined</p>
              <p className="text-3xl font-black text-indigo-600">{analytics?.contests_joined || 12}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Contests Won</p>
              <p className="text-3xl font-black text-emerald-600">{analytics?.contests_won || 2}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Average Rank</p>
              <p className="text-3xl font-black text-neutral-900">{analytics?.average_rank || 14.2}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-neutral-900">Predictive Rating & Placement Trend</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {predictions.map((p) => (
                <div key={p.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <p className="font-bold text-neutral-900">Next Contest Prediction</p>
                  <div className="flex justify-between text-neutral-700">
                    <span>Predicted Rank: #{p.predicted_rank}</span>
                    <span>Predicted Rating: {p.predicted_rating}</span>
                  </div>
                  <p className="text-emerald-700 font-bold">Predicted Company Readiness: {p.predicted_company_readiness}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Team Contests */}
      {activeTab === "team" && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Collaborative Team Contests</h2>
              <p className="text-xs text-neutral-500">Create a 3-member team for multi-developer hackathons and synchronized code submissions.</p>
            </div>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter Team Name (e.g. Algora Titans)"
              className="px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl w-72 focus:outline-none"
            />
            <button
              onClick={handleCreateTeam}
              className="px-4 py-2.5 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800"
            >
              Create Team
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Virtual Replay */}
      {activeTab === "replay" && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Contest Timeline Virtual Replay</h2>
              <p className="text-xs text-neutral-500">Step-by-step submission timeline replay for post-contest analysis.</p>
            </div>
            <Play className="w-5 h-5 text-indigo-600" />
          </div>

          <p className="text-xs text-neutral-600">Replaying submission timesteps for {selectedContest?.title || "Weekly Contest #42"}...</p>
        </div>
      )}
    </div>
  );
};
