import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  TrendingUp,
  Sparkles,
  Target,
  Rocket,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Play,
  RefreshCw,
  Compass,
  Zap,
  BarChart3,
  Calendar,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  Sliders
} from 'lucide-react';
import { aiosApi } from '../../services/aiosApi';

export const ExecutionCenter: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'twin' | 'simulations' | 'plans' | 'opportunities' | 'risks' | 'timeline'>('twin');
  const [loading, setLoading] = useState(true);
  const [digitalTwin, setDigitalTwin] = useState<any>(null);
  const [simulationsData, setSimulationsData] = useState<any>(null);
  const [planData, setPlanData] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [adapting, setAdapting] = useState(false);
  const [adaptationResult, setAdaptationResult] = useState<any>(null);

  // Simulation Form State
  const [simTimeframe, setSimTimeframe] = useState('6_months');
  const [simHours, setSimHours] = useState('2.5');
  const [simFocus, setSimFocus] = useState('DSA & Distributed Systems');
  const [simTarget, setSimTarget] = useState('Google');

  useEffect(() => {
    fetchExecutionData();
  }, []);

  const fetchExecutionData = async () => {
    setLoading(true);
    try {
      const [twinRes, simRes, planRes, oppsRes, timelineRes] = await Promise.all([
        aiosApi.getDigitalTwin(),
        aiosApi.getSimulations(),
        aiosApi.getAutonomousPlan(),
        aiosApi.getOpportunities(),
        aiosApi.getExecutionTimeline()
      ]);

      setDigitalTwin(twinRes.data || null);
      setSimulationsData(simRes.data || null);
      setPlanData(planRes.data || null);
      setOpportunities(oppsRes.data || []);
      setTimeline(timelineRes.data || []);
    } catch (e) {
      console.error('Failed to load execution center data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const res = await aiosApi.createSimulation({
        timeframe: simTimeframe,
        dailyStudyHours: parseFloat(simHours),
        focusArea: simFocus,
        targetCompany: simTarget
      });
      setSimulationsData(res.data);
    } catch (e) {
      console.error('Simulation run failed:', e);
    } finally {
      setSimulating(false);
    }
  };

  const handleCompleteAction = async (actionId: string) => {
    try {
      await aiosApi.completePlanAction(actionId, { completedAt: new Date().toISOString() });
      const [planRes, timelineRes] = await Promise.all([
        aiosApi.getAutonomousPlan(),
        aiosApi.getExecutionTimeline()
      ]);
      setPlanData(planRes.data);
      setTimeline(timelineRes.data || []);
    } catch (e) {
      console.error('Failed to complete action:', e);
    }
  };

  const handleTriggerAdaptation = async () => {
    setAdapting(true);
    try {
      const res = await aiosApi.adaptStrategy();
      setAdaptationResult(res.data);
      const [planRes, twinRes] = await Promise.all([
        aiosApi.getAutonomousPlan(),
        aiosApi.getDigitalTwin()
      ]);
      setPlanData(planRes.data);
      setDigitalTwin(twinRes.data);
    } catch (e) {
      console.error('Adaptation failed:', e);
    } finally {
      setAdapting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-emerald-400" size={36} />
          <p className="text-neutral-400 text-sm font-medium">Synchronizing Autonomous Execution Layer & Digital Twin...</p>
        </div>
      </div>
    );
  }

  const twin = digitalTwin || {};
  const forecast = twin.readinessForecast || {};
  const growth = twin.growthModels || {};
  const risks = twin.riskFactors || [];
  const simResults = simulationsData?.results || [];
  const plan = planData?.plan || {};
  const actions: any[] = planData?.actions || [];

  return (
    <div className="space-y-8">
      {/* Top Banner & Autonomous Status */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-cyan-950/40 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Brain size={13} /> Digital Twin Active
              </span>
              <span className="text-xs text-neutral-400">Autonomous Level 4 Execution</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-display">Autonomous Execution Layer & Digital Twin</h2>
            <p className="text-neutral-400 text-sm mt-1 max-w-2xl">
              Continuously simulating future trajectories, predicting readiness, synthesizing high-ROI opportunities, and orchestrating your personalized career path.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerAdaptation}
              disabled={adapting}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            >
              <RefreshCw size={15} className={adapting ? "animate-spin text-emerald-400" : ""} />
              {adapting ? "Recalibrating..." : "Adapt Strategy"}
            </button>
            <button
              onClick={() => setActiveSubTab('simulations')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2"
            >
              <Sliders size={15} /> Run What-If Simulation
            </button>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-800/80">
          <div>
            <span className="text-xs text-neutral-400 uppercase font-medium">Target Company</span>
            <div className="text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
              {forecast.targetCompany || 'Google'}
              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-normal">L4 Level</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-neutral-400 uppercase font-medium">Win Probability</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {forecast.winProbability || 74}%
              <span className="text-xs text-neutral-500 font-normal ml-1.5">(+16% projected)</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-neutral-400 uppercase font-medium">Contest Rating</span>
            <div className="text-lg font-bold text-white mt-0.5">
              {twin.contestRatings?.rating || 1650}
              <span className="text-xs text-neutral-500 font-normal ml-1.5">Top 15%</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-neutral-400 uppercase font-medium">Execution Velocity</span>
            <div className="text-lg font-bold text-cyan-400 mt-0.5">
              {plan.executionVelocity || 88.5} pts/wk
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-neutral-800 space-x-1 overflow-x-auto pb-px">
        {[
          { id: 'twin', label: 'Digital Twin', icon: Brain },
          { id: 'simulations', label: 'Future Simulations', icon: Sliders },
          { id: 'plans', label: 'Autonomous Plans', icon: Target },
          { id: 'opportunities', label: `Opportunities (${opportunities.length})`, icon: Sparkles },
          { id: 'risks', label: `Risks & Adaptation (${risks.length})`, icon: AlertTriangle },
          { id: 'timeline', label: 'Execution Timeline', icon: Clock }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: DIGITAL TWIN */}
      {activeSubTab === 'twin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Multi-Domain Mastery Card */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Brain className="text-emerald-400" size={18} /> Algorithmic & System Profile
                </h3>
                <span className="text-xs text-neutral-400">Synchronized</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>Overall Mastery Score</span>
                    <span className="text-white font-medium">{twin.masteryScores?.overall?.toFixed(1) || 78.5}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${twin.masteryScores?.overall || 78.5}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>Hiring Readiness Benchmark</span>
                    <span className="text-white font-medium">{twin.hiringReadiness?.readinessScore || 82}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${twin.hiringReadiness?.readinessScore || 82}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>Contest Standing (Rating: {twin.contestRatings?.rating || 1650})</span>
                    <span className="text-white font-medium">{twin.contestRatings?.percentile || 84.5}th Percentile</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${twin.contestRatings?.percentile || 84.5}%` }} />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800/80 text-xs text-neutral-400">
                Problems Solved: <span className="text-white font-semibold">{twin.learningProgress?.totalSolved || 142}</span> (Hard: {twin.learningProgress?.hardSolved || 20}, Med: {twin.learningProgress?.mediumSolved || 64})
              </div>
            </div>

            {/* Growth & Forecasting Model */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <TrendingUp className="text-cyan-400" size={18} /> Growth Trajectory Model
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center p-2.5 bg-neutral-800/50 rounded-xl text-xs">
                  <span className="text-neutral-400">Learning Curve Archetype</span>
                  <span className="text-emerald-400 font-semibold">{growth.learningCurveArchetype || 'Exponential Accelerating'}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-neutral-800/50 rounded-xl text-xs">
                  <span className="text-neutral-400">Weekly Active Hours</span>
                  <span className="text-white font-semibold">{growth.weeklyActiveHours || 18.5} hrs/wk</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-neutral-800/50 rounded-xl text-xs">
                  <span className="text-neutral-400">Problem Solving Pace</span>
                  <span className="text-white font-semibold">{growth.problemSolvingPace || '3.2 problems/day'}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-neutral-800/50 rounded-xl text-xs">
                  <span className="text-neutral-400">Time to Ready (Google L4)</span>
                  <span className="text-cyan-400 font-semibold">{forecast.timeToReadyMonths || 3.5} Months</span>
                </div>
              </div>
            </div>

            {/* Next Critical Milestone */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-3">
                  <Rocket className="text-purple-400" size={18} /> Next Key Milestone
                </h3>
                <p className="text-neutral-300 text-sm font-medium bg-purple-950/20 border border-purple-500/20 p-3.5 rounded-xl mb-3">
                  {forecast.nextKeyMilestone || 'Reach 1850 Contest Rating & Build Distributed KV Store'}
                </p>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Confidence Score: <span className="text-emerald-400 font-bold">{forecast.confidenceScore || 89}%</span> based on empirical historical conversion rates for similar engineering profiles.
                </p>
              </div>

              <button
                onClick={() => setActiveSubTab('plans')}
                className="w-full mt-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                View Action Roadmaps <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Rating Progression Visualization */}
          {growth.contestRatingProgression && (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider text-neutral-400">
                Contest Rating & Skill Progression Forecast
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {growth.contestRatingProgression.map((pt: any, i: number) => (
                  <div key={i} className={`p-3 rounded-xl border text-center ${pt.month.includes('Projected') ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-neutral-800/40 border-neutral-800'}`}>
                    <span className="text-xs text-neutral-400 block mb-1">{pt.month}</span>
                    <span className={`text-base font-bold ${pt.month.includes('Projected') ? 'text-emerald-400' : 'text-white'}`}>{pt.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: SIMULATIONS */}
      {activeSubTab === 'simulations' && (
        <div className="space-y-6">
          {/* Scenario Builder */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Sliders className="text-emerald-400" size={18} /> Scenario Builder & Parameter Tuning
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-neutral-400 block mb-1.5 font-medium">Timeframe</label>
                <select
                  value={simTimeframe}
                  onChange={(e) => setSimTimeframe(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="30_days">30 Days</option>
                  <option value="90_days">90 Days (Quarter)</option>
                  <option value="6_months">6 Months</option>
                  <option value="1_year">1 Year</option>
                  <option value="3_years">3 Years (Senior Path)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1.5 font-medium">Daily Study Hours</label>
                <select
                  value={simHours}
                  onChange={(e) => setSimHours(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="1.0">1.0 Hour / Day</option>
                  <option value="2.0">2.0 Hours / Day</option>
                  <option value="2.5">2.5 Hours / Day (Optimal)</option>
                  <option value="4.0">4.0 Hours / Day (Intensive)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1.5 font-medium">Focus Area</label>
                <input
                  type="text"
                  value={simFocus}
                  onChange={(e) => setSimFocus(e.target.value)}
                  placeholder="e.g. Distributed Systems"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleRunSimulation}
                  disabled={simulating}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Play size={15} />
                  {simulating ? "Simulating..." : "Compute Trajectory"}
                </button>
              </div>
            </div>
          </div>

          {/* Simulation 3-Case Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {simResults.map((scenario: any) => {
              const isBest = scenario.scenarioType === 'Best_Case';
              const isExpected = scenario.scenarioType === 'Expected_Case';
              const isWorst = scenario.scenarioType === 'Worst_Case';

              const badgeColor = isBest ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : (isExpected ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30');

              return (
                <div key={scenario.id} className={`bg-neutral-900/60 border rounded-2xl p-6 flex flex-col justify-between ${isBest ? 'border-emerald-500/40 bg-emerald-950/10' : (isExpected ? 'border-blue-500/30 bg-blue-950/10' : 'border-neutral-800')}`}>
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeColor}`}>
                        {scenario.scenarioType.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-neutral-400">{scenario.learningGrowth?.timeframe}</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-xs text-neutral-400 block">Projected Primary Outcome</span>
                        <h4 className="text-base font-bold text-white mt-0.5">{scenario.careerOutcomes?.primaryOutcome}</h4>
                        <span className="text-xs text-emerald-400">{scenario.careerOutcomes?.expectedCompensationTier}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800">
                        <div className="p-2 bg-neutral-800/50 rounded-lg">
                          <span className="text-[10px] text-neutral-400 block uppercase">Contest Rating</span>
                          <span className="text-sm font-bold text-white">{scenario.contestRatings?.projectedRating}</span>
                        </div>
                        <div className="p-2 bg-neutral-800/50 rounded-lg">
                          <span className="text-[10px] text-neutral-400 block uppercase">Hiring Win Prob</span>
                          <span className="text-sm font-bold text-emerald-400">{scenario.hiringProbability?.projectedProbability}%</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-neutral-400 block mb-1">Key Milestones:</span>
                        <ul className="space-y-1.5 text-xs text-neutral-300">
                          {scenario.keyMilestones?.map((m: any, idx: number) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                              <span>{m.milestone}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-neutral-800 text-xs text-neutral-400 flex justify-between items-center">
                    <span>Interview Confidence</span>
                    <span className="text-white font-semibold">{scenario.hiringProbability?.interviewPassConfidence}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: AUTONOMOUS PLANS */}
      {activeSubTab === 'plans' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Active Execution Plan</span>
                <h3 className="text-xl font-bold text-white mt-1">{plan.title || 'Google SWE L4 Autonomous Execution Plan'}</h3>
                <p className="text-neutral-400 text-sm mt-1">{plan.description}</p>
              </div>
              <button
                onClick={() => aiosApi.createAutonomousPlan().then(res => setPlanData(res.data))}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded-xl text-xs font-medium transition-all"
              >
                Regenerate Plan
              </button>
            </div>

            {/* Hierarchical Roadmaps */}
            {plan.roadmaps && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(plan.roadmaps).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-neutral-800/40 border border-neutral-800 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      {key.replace('Roadmap', '').toUpperCase()} TRACK
                    </h4>
                    <span className="text-xs text-neutral-300 block mb-2 font-medium">{value.focus}</span>
                    <ul className="space-y-1 text-xs text-neutral-400">
                      {value.milestones?.map((m: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Immediate Daily Actions Queue */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap className="text-amber-400" size={16} /> Autonomous Action Queue (Priority Ranked)
              </h4>
              <div className="space-y-3">
                {actions.map((act) => {
                  const isCompleted = act.status === 'Completed';
                  return (
                    <div
                      key={act.id}
                      className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                        isCompleted ? 'bg-neutral-900/30 border-neutral-800/50 opacity-60' : 'bg-neutral-800/50 border-neutral-700/80 hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            act.priority === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {act.priority}
                          </span>
                          <span className="text-xs text-neutral-400">{act.actionType.replace('_', ' ')} • {act.estimatedMinutes} mins</span>
                        </div>
                        <h5 className={`text-sm font-bold ${isCompleted ? 'line-through text-neutral-400' : 'text-white'}`}>
                          {act.title}
                        </h5>
                        <p className="text-xs text-neutral-400">{act.description}</p>
                      </div>

                      <div className="shrink-0">
                        {isCompleted ? (
                          <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <CheckCircle2 size={14} /> Completed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCompleteAction(act.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <CheckCircle2 size={14} /> Complete Action
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: OPPORTUNITIES */}
      {activeSubTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-semibold text-white">Proactively Discovered High-ROI Opportunities</h3>
            <span className="text-xs text-neutral-400">Scanned across Career, Contests, Research, & Open Source</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp) => (
              <div key={opp.id} className="bg-neutral-900/60 border border-neutral-800 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-emerald-400 font-semibold uppercase">{opp.opportunityType.replace('_', ' ')} • {opp.sourcePlatform}</span>
                      <h4 className="text-base font-bold text-white mt-0.5">{opp.title}</h4>
                      <span className="text-xs text-neutral-400">{opp.organization}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-neutral-400 block">ROI Score</span>
                      <span className="text-base font-bold text-emerald-400">{opp.roiScore}%</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">{opp.description}</p>

                  <div className="p-3 bg-neutral-800/40 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Time Investment:</span>
                      <span className="text-white font-medium">{opp.timeInvestment}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Strategic Value:</span>
                      <span className="text-emerald-400 font-medium">{opp.strategicValue}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-between items-center">
                  <span className="text-xs text-neutral-400">{opp.recommendedAction}</span>
                  <a
                    href={opp.opportunityUrl || "#"}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    Pursue <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 5: RISKS & ADAPTATION */}
      {activeSubTab === 'risks' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="text-amber-400" size={18} /> Active Risk Detection & Automated Mitigations
              </h3>
              <button
                onClick={handleTriggerAdaptation}
                disabled={adapting}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
              >
                {adapting ? "Recalibrating..." : "Trigger Auto-Recalibration"}
              </button>
            </div>

            {adaptationResult && (
              <div className="mb-4 p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-neutral-200">
                <span className="font-bold text-emerald-400 block mb-1">Strategy Recalibration Completed:</span>
                <p>{adaptationResult.update?.triggerReason || "Recalibrated roadmap difficulty and sprint time-boxes."}</p>
              </div>
            )}

            <div className="space-y-4">
              {risks.map((r: any, idx: number) => (
                <div key={idx} className="p-4 bg-neutral-800/40 border border-neutral-800 rounded-xl flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[10px] font-bold uppercase">
                        {r.severity} Severity
                      </span>
                      <span className="text-xs text-neutral-400">{r.domain}</span>
                    </div>
                    <h5 className="text-sm font-bold text-white">{r.title}</h5>
                    <p className="text-xs text-neutral-400">{r.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-neutral-400 block">Hiring Bar Drag</span>
                    <span className="text-sm font-bold text-red-400">{r.impact}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: EXECUTION TIMELINE */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="text-emerald-400" size={18} /> Strategic Execution Timeline
            </h3>

            <div className="relative border-l-2 border-neutral-800 ml-4 space-y-6">
              {timeline.map((item) => (
                <div key={item.id} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-neutral-900 border-2 border-emerald-500" />
                  <div className="p-4 bg-neutral-800/40 border border-neutral-800 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-emerald-400 uppercase">{item.eventType.replace('_', ' ')}</span>
                      <span className="text-neutral-500">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <h5 className="text-sm font-bold text-white">{item.title}</h5>
                    <p className="text-xs text-neutral-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionCenter;
