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
  ChevronRight,
  Users,
  MessageSquare,
  Flame,
  Clock,
  Calendar,
  Layers,
  BookOpen,
  Briefcase,
  Trophy,
  GitBranch,
  FileCode2,
  Lightbulb,
  CheckSquare,
  Shield,
  BarChart2,
  DollarSign
} from 'lucide-react';
import { aiosApi } from '../../services/aiosApi';

export const ExecutiveDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [recalculating, setRecalculating] = useState<boolean>(false);
  const [debating, setDebating] = useState<boolean>(false);
  
  // Core V4.7 State
  const [councilData, setCouncilData] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [lifePlans, setLifePlans] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [forecastModel, setForecastModel] = useState<any>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [activeDebate, setActiveDebate] = useState<any>(null);

  // Sub-tab Navigation
  const [activeTab, setActiveTab] = useState<
    'council' | 'campaigns' | 'life_os' | 'opportunities' | 'forecast' | 'memory' | 'advisor'
  >('council');

  // Horizon for Life OS
  const [selectedHorizon, setSelectedHorizon] = useState<string>('Daily');
  // Category for Opportunities
  const [selectedOppCategory, setSelectedOppCategory] = useState<string>('All');
  // Advisor State
  const [advisorQuestion, setAdvisorQuestion] = useState<string>('');
  const [advisorAnswer, setAdvisorAnswer] = useState<string>('');
  const [askingAdvisor, setAskingAdvisor] = useState<boolean>(false);

  const fetchAllCouncilData = async () => {
    try {
      setLoading(true);
      const [councilRes, campaignsRes, plansRes, oppsRes, forecastRes, memRes] = await Promise.all([
        aiosApi.getExecutiveCouncil().catch(() => ({ data: null })),
        aiosApi.getStrategicCampaigns().catch(() => ({ data: [] })),
        aiosApi.getLifePlans().catch(() => ({ data: [] })),
        aiosApi.getExecutiveOpportunities().catch(() => ({ data: [] })),
        aiosApi.getExecutiveForecastModel().catch(() => ({ data: null })),
        aiosApi.getExecutiveMemories().catch(() => ({ data: [] }))
      ]);

      if (councilRes?.data) setCouncilData(councilRes.data);
      if (campaignsRes?.data) setCampaigns(campaignsRes.data);
      if (plansRes?.data) setLifePlans(plansRes.data);
      if (oppsRes?.data) setOpportunities(oppsRes.data);
      if (forecastRes?.data) setForecastModel(forecastRes.data);
      if (memRes?.data) setMemories(memRes.data);
    } catch (err) {
      console.error("Failed to load Executive Council data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCouncilData();
  }, []);

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      await aiosApi.recalculateExecutiveCouncil();
      await fetchAllCouncilData();
    } catch (err) {
      console.error("Recalculation failed:", err);
    } finally {
      setRecalculating(false);
    }
  };

  const handleRunDebate = async (topic?: string, agentAId?: string, agentBId?: string) => {
    try {
      setDebating(true);
      const res = await aiosApi.runExecutiveDebate({ topic, agentAId, agentBId });
      if (res?.data) {
        setActiveDebate(res.data);
        setActiveTab('council');
      }
    } catch (err) {
      console.error("Debate execution failed:", err);
    } finally {
      setDebating(false);
    }
  };

  const handleAskAdvisor = async (q?: string) => {
    const questionToAsk = q || advisorQuestion;
    if (!questionToAsk.trim()) return;

    try {
      setAskingAdvisor(true);
      setAdvisorQuestion(questionToAsk);
      const res = await aiosApi.askExecutiveAdvisor(questionToAsk);
      if (res?.data?.answer) {
        setAdvisorAnswer(res.data.answer);
      }
    } catch (err) {
      console.error("Advisor query failed:", err);
      setAdvisorAnswer("Executive Council is temporarily reconciling background nodes. Please retry.");
    } finally {
      setAskingAdvisor(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium">
          Convening Multi-Agent Executive Council & Synthesizing Life OS...
        </p>
      </div>
    );
  }

  const council = councilData?.council || {};
  const agents = councilData?.agents || [];
  const activePlan = lifePlans.find((p) => p.horizon === selectedHorizon) || lifePlans[0];
  const filteredOpps = selectedOppCategory === 'All' 
    ? opportunities 
    : opportunities.filter(o => (o.metadata?.category || o.opportunityType) === selectedOppCategory);

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Command Header */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Multi-Agent Executive Council & Life OS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Autonomous Career Operating System
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              6 specialized AI leaders governing your Learning, Career, Contests, Projects, Research, and Venture tracks with predictive simulation and autonomous life planning.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
              {recalculating ? 'Convening Council...' : 'Convene Council'}
            </button>
            <button
              onClick={() => handleRunDebate('Contests vs Projects: Optimal Time Allocation')}
              disabled={debating}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl shadow transition-all disabled:opacity-50"
            >
              <Flame className="w-4 h-4 text-purple-200" />
              {debating ? 'Debating...' : 'Trigger Council Debate'}
            </button>
          </div>
        </div>

        {/* Council Consensus KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Council Consensus</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {(council.consensusScore || 94.0).toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400 mt-0.5">High Alignment</div>
          </div>

          <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Dominant Strategy</div>
            <div className="text-lg font-bold text-white mt-1 truncate">
              {council.dominantTheme || "Dual-Cadence Big Tech Sprint"}
            </div>
            <div className="text-xs text-indigo-400 mt-0.5">Focus: L4 Systems Track</div>
          </div>

          <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Active Life Plans</div>
            <div className="text-2xl font-bold text-white mt-1">
              {lifePlans.length} Horizons
            </div>
            <div className="text-xs text-emerald-400 mt-0.5">Daily to Annual Active</div>
          </div>

          <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Strategic Campaigns</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {campaigns.length} Offensive
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Google / Amazon / AI Labs</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto">
        {[
          { id: 'council', label: 'Executive Council', icon: Users },
          { id: 'campaigns', label: 'Strategic Campaigns', icon: Target },
          { id: 'life_os', label: 'Life Operating System', icon: Calendar },
          { id: 'opportunities', label: 'Opportunity Radar', icon: Sparkles },
          { id: 'forecast', label: 'Strategic Forecast & Impact', icon: TrendingUp },
          { id: 'memory', label: 'Executive Memory & Audit', icon: Layers },
          { id: 'advisor', label: 'Voice Advisor', icon: Volume2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE COUNCIL */}
      {activeTab === 'council' && (
        <div className="space-y-6">
          {/* Active Debate Result Modal/Card if Present */}
          {activeDebate && (
            <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm uppercase tracking-wider">
                  <Flame className="w-4 h-4" />
                  Resolved Executive Debate: {activeDebate.topic}
                </div>
                <span className="text-xs font-mono px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                  Consensus: {activeDebate.outcome}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-neutral-800">
                  <div className="text-xs font-bold text-slate-400 uppercase">Agent A Perspective</div>
                  <div className="text-sm font-bold text-white mt-1">{activeDebate.agentAId}</div>
                  <p className="text-xs text-slate-300 mt-2 italic">"{activeDebate.argumentsA?.[0] || 'Maximum speed drills necessary to eliminate screening bottlenecks.'}"</p>
                </div>
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-neutral-800">
                  <div className="text-xs font-bold text-slate-400 uppercase">Agent B Perspective</div>
                  <div className="text-sm font-bold text-white mt-1">{activeDebate.agentBId}</div>
                  <p className="text-xs text-slate-300 mt-2 italic">"{activeDebate.argumentsB?.[0] || 'High-throughput concurrency proof-of-work is the highest-weight onsite differentiator.'}"</p>
                </div>
              </div>

              <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">Council Final Recommendation & Tradeoff Analysis</div>
                <p className="text-sm text-slate-200 mt-1 font-medium">{activeDebate.justification}</p>
                <div className="text-xs text-slate-400 mt-2 font-mono">Strategic ROI: {activeDebate.tradeoffAnalysis?.strategicROI} | Time Horizon: {activeDebate.tradeoffAnalysis?.timeHorizon}</div>
              </div>
            </div>
          )}

          {/* Council Deliberation & Prioritized Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-wider">
                  <BrainCircuit className="w-4 h-4" />
                  Consolidated Council Action Directives
                </div>
                <span className="text-xs text-neutral-400">Recalibrated: {new Date(council.concludedAt || Date.now()).toLocaleTimeString()}</span>
              </div>

              <div className="space-y-3">
                {(council.prioritizedActions || [
                  { priority: 1, executive: "Career Executive", action: "Complete 45-min timed Google L4 OA mock simulation", urgency: "Immediate" },
                  { priority: 2, executive: "Project Executive", action: "Implement AppendEntries RPC handler for Raft KV Store", urgency: "High" },
                  { priority: 3, executive: "Contest Executive", action: "Warm up with 2 speed drills before Saturday Grand Prix", urgency: "Medium" }
                ]).map((action: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-neutral-800 hover:border-indigo-500/40 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {action.priority || idx + 1}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{action.action}</div>
                        <div className="text-xs text-slate-400">{action.executive}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {action.urgency || "High"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Council Quick Debate Launcher */}
            <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                Strategic Debate Triggers
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pit two specialized AI Executives against each other to calculate Pareto-optimal time allocation.
              </p>

              <div className="space-y-2">
                {[
                  { topic: "Contests vs Projects: Time Allocation", a: "Contest Executive", b: "Project Executive" },
                  { topic: "Research Paper vs Direct Big Tech Applications", a: "Research Executive", b: "Career Executive" },
                  { topic: "Startup MVP Launch vs Full-Time Offer Hunt", a: "Startup Executive", b: "Career Executive" }
                ].map((d, i) => (
                  <button
                    key={i}
                    onClick={() => handleRunDebate(d.topic, d.a, d.b)}
                    disabled={debating}
                    className="w-full text-left p-3 rounded-2xl bg-black/40 border border-neutral-800 hover:border-purple-500/50 hover:bg-purple-950/20 transition-all text-xs"
                  >
                    <div className="font-bold text-white truncate">{d.topic}</div>
                    <div className="text-slate-400 mt-1 flex items-center justify-between">
                      <span>{d.a} vs {d.b}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 6 Specialized AI Executives Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              The 6 Executive Council Leaders
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent: any) => (
                <div key={agent.id} className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {agent.role}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">Weight: {(agent.influenceWeight || 0.85) * 100}%</span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white">{agent.name}</h4>
                      <p className="text-xs text-indigo-400 font-medium mt-0.5">{agent.title}</p>
                    </div>

                    <p className="text-xs text-slate-300 italic border-l-2 border-indigo-500/40 pl-3">
                      "{agent.corePhilosophy}"
                    </p>

                    <div className="pt-2 border-t border-neutral-800/80">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pillar Domains</div>
                      <div className="flex flex-wrap gap-1.5">
                        {(agent.focusDomains || []).map((dom: string, dIdx: number) => (
                          <span key={dIdx} className="px-2 py-0.5 text-xs rounded-md bg-black/40 text-slate-300 border border-neutral-800">
                            {dom}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-800">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Active Mandate</div>
                    <div className="text-xs text-white bg-black/50 p-2.5 rounded-xl border border-neutral-800">
                      {agent.activeRecommendations?.[0]?.action || "Execute targeted daily drills and maintain benchmark mastery."}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STRATEGIC CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => (
              <div key={camp.id} className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {camp.targetCompany || "Tier-1 Track"}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      Win Prob: {(camp.successProbability || 75).toFixed(0)}%
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{camp.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{camp.description}</p>
                  </div>

                  {/* Weekly Objectives */}
                  <div className="space-y-2 pt-2 border-t border-neutral-800">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Milestone Progress</div>
                    {(camp.weeklyObjectives || []).slice(0, 3).map((obj: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        {obj.status === 'Completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : obj.status === 'In_Progress' ? (
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-neutral-700 shrink-0" />
                        )}
                        <span className={`truncate ${obj.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                          W{obj.week}: {obj.objective}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Critical Blocker */}
                  {camp.criticalBlockers?.[0] && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3" />
                        Blocker: {camp.criticalBlockers[0].title}
                      </div>
                      <div className="text-slate-300 mt-1 text-xs">{camp.criticalBlockers[0].mitigation}</div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-800">
                  <div className="text-xs text-slate-400 font-mono">Recovery Trigger: {camp.recoveryPlans?.[0]?.triggerCondition || "OA score <80%"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIFE OPERATING SYSTEM */}
      {activeTab === 'life_os' && (
        <div className="space-y-6">
          {/* Horizon Selector */}
          <div className="flex items-center gap-2 bg-neutral-900/60 p-1.5 rounded-2xl border border-neutral-800 w-fit">
            {['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'].map((hz) => (
              <button
                key={hz}
                onClick={() => setSelectedHorizon(hz)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedHorizon === hz
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {hz} Plan
              </button>
            ))}
          </div>

          {activePlan && (
            <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{activePlan.horizon} Tactical Cadence</span>
                  <h3 className="text-xl font-bold text-white mt-1">{activePlan.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Completion Target</div>
                    <div className="text-lg font-bold text-emerald-400">{(activePlan.completionRate || 45).toFixed(0)}%</div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
                    {activePlan.status || "Active"}
                  </span>
                </div>
              </div>

              {/* 6 Pillars Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Learning Pillar */}
                <div className="p-5 bg-black/40 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <BookOpen className="w-4 h-4" />
                      Learning Pillar
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{activePlan.pillars?.learning?.hours || 2} hrs</span>
                  </div>
                  <div className="text-sm font-bold text-white">{activePlan.pillars?.learning?.focus}</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(activePlan.pillars?.learning?.targets || []).map((t: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Career Pillar */}
                <div className="p-5 bg-black/40 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                      <Briefcase className="w-4 h-4" />
                      Career Pillar
                    </div>
                    <span className="text-xs text-slate-400 font-mono">Target: {activePlan.pillars?.career?.targetCompanies?.[0] || 'Google'}</span>
                  </div>
                  <div className="text-sm font-bold text-white">{activePlan.pillars?.career?.focus}</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(activePlan.pillars?.career?.targets || []).map((t: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Contests Pillar */}
                <div className="p-5 bg-black/40 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <Trophy className="w-4 h-4" />
                      Contest Pillar
                    </div>
                    <span className="text-xs text-amber-400 font-bold font-mono">{activePlan.pillars?.contests?.targetRating || 1850}+ Target</span>
                  </div>
                  <div className="text-sm font-bold text-white">Competitive Velocity</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(activePlan.pillars?.contests?.events || []).map((t: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4. Projects Pillar */}
                <div className="p-5 bg-black/40 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <GitBranch className="w-4 h-4" />
                      Project Pillar
                    </div>
                    <span className="text-xs text-emerald-400 font-mono">Proof-of-Work</span>
                  </div>
                  <div className="text-sm font-bold text-white">{activePlan.pillars?.projects?.focus}</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(activePlan.pillars?.projects?.repoGoals || []).map((t: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 5. Research Pillar */}
                <div className="p-5 bg-black/40 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                      <FileCode2 className="w-4 h-4" />
                      Research Pillar
                    </div>
                    <span className="text-xs text-cyan-400 font-mono">Preprint/Pub</span>
                  </div>
                  <div className="text-sm font-bold text-white">{activePlan.pillars?.research?.focus}</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(activePlan.pillars?.research?.deliverables || []).map((t: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 6. Innovation Pillar */}
                <div className="p-5 bg-black/40 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                      <Lightbulb className="w-4 h-4" />
                      Innovation Pillar
                    </div>
                    <span className="text-xs text-rose-400 font-mono">Grant/MVP</span>
                  </div>
                  <div className="text-sm font-bold text-white">{activePlan.pillars?.innovation?.focus}</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(activePlan.pillars?.innovation?.mvpGoals || []).map((t: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: OPPORTUNITY RADAR */}
      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['All', 'Hiring', 'Competitive', 'Research', 'Open_Source', 'Startup'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedOppCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedOppCategory === cat
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpps.map((opp) => (
              <div key={opp.id} className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {opp.metadata?.category || opp.opportunityType}
                    </span>
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      ROI: {(opp.roiScore || 90).toFixed(0)}%
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{opp.title}</h4>
                    <p className="text-xs text-indigo-400 font-medium mt-0.5">{opp.organization}</p>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{opp.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800 text-xs">
                    <div className="p-2 bg-black/40 rounded-xl">
                      <span className="text-slate-500 block text-[10px] uppercase">Match Score</span>
                      <span className="font-bold text-white">{(opp.matchScore || 90).toFixed(0)}%</span>
                    </div>
                    <div className="p-2 bg-black/40 rounded-xl">
                      <span className="text-slate-500 block text-[10px] uppercase">Time Cost</span>
                      <span className="font-bold text-white truncate block">{opp.timeInvestment || "2 hrs"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800 space-y-2">
                  <div className="text-xs text-slate-300">
                    <span className="font-bold text-indigo-400">Action:</span> {opp.recommendedAction}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: STRATEGIC FORECAST & IMPACT */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          {forecastModel && (
            <div className="space-y-6">
              {/* Consensus Banner */}
              <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 rounded-3xl space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Executive Consensus Recommendation</div>
                <h3 className="text-lg font-bold text-white">{forecastModel.executiveConsensusRecommendation?.recommendedStrategy}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                  <div>Expected Offer Timeline: <span className="font-bold text-white">{forecastModel.executiveConsensusRecommendation?.expectedOfferMonth}</span></div>
                  <div>Starting Compensation: <span className="font-bold text-emerald-400">{forecastModel.executiveConsensusRecommendation?.expectedStartingComp}</span></div>
                  <div>Primary Target: <span className="font-bold text-white">{forecastModel.executiveConsensusRecommendation?.topTargetCompany}</span></div>
                </div>
              </div>

              {/* 4 Focus Domain Scenarios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(forecastModel.scenarios || []).map((sc: any, idx: number) => (
                  <div key={idx} className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-4 hover:border-indigo-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{sc.focusDomain}</span>
                      <span className="text-xs font-mono px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-full">
                        {sc.timeToTargetMonths} Months
                      </span>
                    </div>

                    <div className="text-xs text-indigo-400 font-medium">Championed by {sc.leadExecutive}</div>
                    <p className="text-xs text-slate-300 leading-relaxed">{sc.description}</p>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-800 text-xs">
                      <div className="p-3 bg-black/40 rounded-xl">
                        <span className="text-slate-500 block text-[10px] uppercase">Hiring Readiness</span>
                        <span className="text-sm font-bold text-emerald-400">{(sc.projectedMetrics?.hiringReadiness || 90).toFixed(1)}%</span>
                      </div>
                      <div className="p-3 bg-black/40 rounded-xl">
                        <span className="text-slate-500 block text-[10px] uppercase">Rating Growth</span>
                        <span className="text-sm font-bold text-amber-400">{sc.projectedMetrics?.contestRating || 2050}+</span>
                      </div>
                      <div className="col-span-2 p-3 bg-black/40 rounded-xl">
                        <span className="text-slate-500 block text-[10px] uppercase">Salary Trajectory</span>
                        <span className="text-xs font-bold text-white">{sc.projectedMetrics?.salaryTrajectory}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-500/10 rounded-xl text-xs text-slate-300 border border-indigo-500/20">
                      <span className="font-bold text-indigo-300">Tradeoff:</span> {sc.strategicTradeoff}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: EXECUTIVE MEMORY & AUDIT */}
      {activeTab === 'memory' && (
        <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Executive Decision History & Knowledge Fabric Link</h3>
              <p className="text-xs text-slate-400 mt-0.5">Immutable audit log of all council resolutions and strategic pivots.</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-bold">{memories.length} Stored Decisions</span>
          </div>

          <div className="space-y-4">
            {memories.map((mem) => (
              <div key={mem.id} className="p-5 bg-black/40 rounded-2xl border border-neutral-800 space-y-2 hover:border-indigo-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {mem.memoryType}
                    </span>
                    <span className="text-xs font-bold text-indigo-400">{mem.category}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{new Date(mem.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="text-sm font-bold text-white">{mem.summary}</div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{mem.details}</p>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs text-slate-400">
                  <span>Confidence: <strong className="text-emerald-400">{mem.confidenceScore || 92}%</strong></span>
                  <span>Fabric Node: <strong className="text-indigo-400 font-mono">Linked</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: VOICE ADVISOR */}
      {activeTab === 'advisor' && (
        <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Volume2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Voice Executive Advisor</h3>
              <p className="text-xs text-slate-400">Ask strategic questions directly to your 6-agent Executive Council.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={advisorQuestion}
              onChange={(e) => setAdvisorQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAdvisor()}
              placeholder="e.g., What is my fastest path to Google? or Should I focus on contests or projects?"
              className="flex-1 bg-black/50 border border-neutral-800 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
            />
            <button
              onClick={() => handleAskAdvisor()}
              disabled={askingAdvisor || !advisorQuestion.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-2xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Send size={16} />
              {askingAdvisor ? 'Synthesizing...' : 'Ask Council'}
            </button>
          </div>

          {/* Preset Questions */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              "What should my executive council prioritize?",
              "What is my biggest blocker right now?",
              "Should I focus on contests or projects?",
              "What is my fastest path to Google L4?",
              "What high-yield opportunity should I pursue next?"
            ].map((preset, i) => (
              <button
                key={i}
                onClick={() => handleAskAdvisor(preset)}
                className="px-3 py-1.5 bg-black/40 hover:bg-indigo-950/30 text-slate-300 hover:text-indigo-300 rounded-xl text-xs border border-neutral-800 hover:border-indigo-500/40 transition-all"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Advisor Answer */}
          {advisorAnswer && (
            <div className="p-6 bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border border-indigo-500/30 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Executive Council Consensus Answer
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
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
