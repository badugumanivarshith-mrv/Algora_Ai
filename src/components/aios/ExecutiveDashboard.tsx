import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ArrowRight, 
  BrainCircuit, 
  Zap, 
  ShieldAlert, 
  Volume2, 
  Send,
  Building2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { aiosApi } from '../../services/aiosApi';

export const ExecutiveDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [archetypes, setArchetypes] = useState<any>({});
  const [selectedArchetype, setSelectedArchetype] = useState<string>('Google_SWE');
  const [advisorQuestion, setAdvisorQuestion] = useState<string>('');
  const [advisorAnswer, setAdvisorAnswer] = useState<string>('');
  const [askingAdvisor, setAskingAdvisor] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'recommendations' | 'opportunities' | 'risks' | 'advisor'>('overview');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, archRes] = await Promise.all([
        aiosApi.getExecutiveDashboard(),
        aiosApi.getExecutiveArchetypes().catch(() => ({ data: {} }))
      ]);
      if (dashRes.data) {
        setData(dashRes.data);
      }
      if (archRes.data) {
        setArchetypes(archRes.data);
      }
    } catch (err) {
      console.error("Failed to load executive dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleEvaluate = async () => {
    try {
      setEvaluating(true);
      const res = await aiosApi.evaluateStrategicDecisions();
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Evaluation failed:", err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleAction = async (recId: string, action: string) => {
    try {
      await aiosApi.executeDecisionAction(recId, action);
      fetchDashboard();
    } catch (err) {
      console.error("Action execution failed:", err);
    }
  };

  const handleSwitchGoal = async (goalType: string) => {
    try {
      setSelectedArchetype(goalType);
      setEvaluating(true);
      await aiosApi.setStrategicGoal(goalType);
      await fetchDashboard();
    } catch (err) {
      console.error("Goal update failed:", err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleAskAdvisor = async (q?: string) => {
    const questionToAsk = q || advisorQuestion;
    if (!questionToAsk.trim()) return;

    try {
      setAskingAdvisor(true);
      setAdvisorQuestion(questionToAsk);
      const res = await aiosApi.askExecutiveAdvisor(questionToAsk);
      if (res.data?.answer) {
        setAdvisorAnswer(res.data.answer);
      }
    } catch (err) {
      console.error("Advisor query failed:", err);
      setAdvisorAnswer("Error connecting to Executive Advisor. Please try again.");
    } finally {
      setAskingAdvisor(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          Synthesizing cross-domain intelligence into Personal AI Executive view...
        </p>
      </div>
    );
  }

  const profile = data?.profile || {};
  const insights = data?.insights || {};
  const activeGoal = profile.activeGoal || {};
  const recommendations = data?.recommendations || [];
  const opportunities = data?.opportunities || [];
  const risks = data?.risks || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              Autonomous Personal AI Executive
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Strategic Decision Engine
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Synthesizing learning velocity, competitive metrics, hiring models, and research outputs to recommend your highest-ROI daily actions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${evaluating ? 'animate-spin' : ''}`} />
              {evaluating ? 'Running Strategic Synthesis...' : 'Recalibrate Trajectory'}
            </button>
            <button
              onClick={() => setActiveSubTab('advisor')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 shadow transition-all"
            >
              <Volume2 className="w-4 h-4 text-indigo-400" />
              Voice Executive
            </button>
          </div>
        </div>

        {/* Executive Core KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Target Company Goal</div>
            <div className="text-lg font-bold text-white mt-1 truncate">
              {activeGoal.target_company || "Google SWE"}
            </div>
            <div className="text-xs text-indigo-400 mt-0.5">Role: {activeGoal.target_role || "SWE L4"}</div>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Win Probability</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">
              {(profile.probabilityOfSuccess || 72.0).toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Target: &gt;85% Ready</div>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Overall Mastery</div>
            <div className="text-lg font-bold text-white mt-1">
              {(profile.overallMastery || 78.5).toFixed(1)}%
            </div>
            <div className="text-xs text-emerald-400 mt-0.5">Velocity: {(profile.learningVelocity || 84.0).toFixed(0)} pts/wk</div>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Active High-ROI Opportunities</div>
            <div className="text-lg font-bold text-amber-400 mt-1">
              {opportunities.length} Available
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{risks.length} Active Risks</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Executive Briefing
        </button>
        <button
          onClick={() => setActiveSubTab('recommendations')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'recommendations'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          High-Leverage Actions
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-400">
            {recommendations.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('opportunities')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'opportunities'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Opportunity Radar
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400">
            {opportunities.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('risks')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'risks'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Vulnerability Matrix
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-rose-500/20 text-rose-400">
            {risks.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('advisor')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'advisor'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Executive Advisor
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>

      {/* SUB-TAB: OVERVIEW / EXECUTIVE BRIEFING */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Daily Executive Synthesis Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                <BrainCircuit className="w-4 h-4" />
                Executive Synthesis & Today's Directive
              </div>
              <span className="text-xs text-slate-500">Confidence: {insights.confidenceLevel || 88}%</span>
            </div>

            <p className="text-slate-700 dark:text-slate-200 text-base leading-relaxed">
              {insights.executiveSummary || "Your trajectory is stable across core algorithmic fundamentals. High-impact interview readiness requires dedicated focus on complex optimization and portfolio validation."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                <div className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Primary Bottleneck
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
                  {insights.keyBottleneck || "Dynamic Programming under timed conditions."}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40">
                <div className="text-xs font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Today's Execution Focus
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
                  {insights.primaryFocusToday || "Solve 2 Hard DP problems and review distributed consensus."}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Strategic Trade-off
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
                  {insights.strategicTradeoff || "Postpone frontend explorations; focus purely on algorithmic speed."}
                </p>
              </div>
            </div>
          </div>

          {/* Goal Selector Archetypes */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-500" />
                  Select Strategic Career Target
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Switching targets immediately recalibrates all gap analyses, recommendations, and probability models.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(archetypes).map(([key, arch]: [string, any]) => {
                const isSelected = (activeGoal.goal_type === key) || (selectedArchetype === key);
                return (
                  <button
                    key={key}
                    onClick={() => handleSwitchGoal(key)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {arch.targetCompany}
                      </span>
                      {isSelected && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {arch.title}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {arch.targetState}
                    </p>
                    <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
                      <span>Min Rating: <b>{arch.minContestRating}</b></span>
                      <span>Min Mastery: <b>{arch.minMastery}%</b></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Top Recommendations Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Immediate Action Queue
              </h3>
              <button
                onClick={() => setActiveSubTab('recommendations')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View all ({recommendations.length}) <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec: any) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {rec.category}
                      </span>
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        Impact: {rec.impact_score || rec.impactScore}/10
                      </span>
                      <span className="text-xs text-slate-400">
                        {rec.urgency || "High"} Urgency
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {rec.action_title || rec.title}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {rec.reasoning || rec.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(rec.id, 'accept')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                    >
                      Execute
                    </button>
                    <button
                      onClick={() => handleAction(rec.id, 'dismiss')}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: RECOMMENDATIONS */}
      {activeSubTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Prioritized Action Recommendations
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Each decision is ranked by quantified leverage and time-to-impact toward your active goal.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {recommendations.map((rec: any) => (
              <div
                key={rec.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
                      {rec.category}
                    </span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded">
                      ROI Impact: {rec.impact_score || rec.impactScore || 8.5}/10
                    </span>
                    <span className="text-xs text-slate-500">
                      Status: <b>{rec.status}</b>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(rec.id, 'accept')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accept & Commit
                    </button>
                    <button
                      onClick={() => handleAction(rec.id, 'dismiss')}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg transition-all"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {rec.action_title || rec.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {rec.description}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                  <b className="text-slate-900 dark:text-slate-200">Executive Rationale:</b> {rec.reasoning || rec.rationale}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: OPPORTUNITIES */}
      {activeSubTab === 'opportunities' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Strategic Opportunities Radar
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked cross-domain opportunities evaluated against your hiring readiness score and portfolio gap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.map((opp: any) => (
              <div
                key={opp.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                      {opp.opportunity_type}
                    </span>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      ROI: {opp.roi_score}/100
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {opp.title}
                  </h4>
                  <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {opp.organization}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                    {opp.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Match Score</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{opp.match_score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${opp.match_score}%` }}
                    ></div>
                  </div>
                  <button className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all">
                    Pursue Opportunity
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: RISKS */}
      {activeSubTab === 'risks' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Strategic Risk & Vulnerability Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuously monitoring skill decay, interview timeout risks, and learning velocity dips.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {risks.map((risk: any) => (
              <div
                key={risk.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-rose-200/60 dark:border-rose-900/30 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      risk.severity === 'Critical' || risk.severity === 'High'
                        ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                        : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                    }`}>
                      {risk.severity} Risk
                    </span>
                    <span className="text-xs text-slate-400">
                      Domain: {risk.impact_domain || "Career"}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {risk.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {risk.description}
                  </p>
                </div>

                <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl text-xs text-rose-900 dark:text-rose-300 border border-rose-100 dark:border-rose-900/30">
                  <b>Prescribed Mitigation:</b> {risk.mitigation_strategy}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: EXECUTIVE ADVISOR CONSOLE */}
      {activeSubTab === 'advisor' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-indigo-500" />
              Personal AI Executive Advisor
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Query your executive architect on daily priorities, hiring benchmarks, portfolio decisions, or weakness remediations.
            </p>
          </div>

          {/* Quick Starter Prompts */}
          <div className="flex flex-wrap gap-2">
            {[
              "What should I focus on today?",
              "How close am I to Google?",
              "What is my biggest weakness?",
              "Which project should I build next?",
              "What opportunity should I pursue?"
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleAskAdvisor(prompt)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all text-left"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Advisor Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={advisorQuestion}
              onChange={(e) => setAdvisorQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAdvisor()}
              placeholder="Ask your Personal AI Executive anything (e.g. Should I do contests or projects today?)..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleAskAdvisor()}
              disabled={askingAdvisor || !advisorQuestion.trim()}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {askingAdvisor ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Ask
            </button>
          </div>

          {/* Advisor Spoken Synthesis Answer Box */}
          {advisorAnswer && (
            <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Executive Synthesis
                </span>
                <span className="text-xs text-slate-500">Authoritative Advisor</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
                {advisorAnswer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExecutiveDashboard;
