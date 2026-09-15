import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Terminal, 
  AlertTriangle, 
  Flame, 
  TrendingUp, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ArrowRight, 
  Zap, 
  Send,
  Users,
  MessageSquare,
  Shield,
  Layers,
  FileCode2,
  DollarSign,
  Briefcase,
  Play,
  GitPullRequest,
  CheckSquare,
  Cpu,
  GraduationCap,
  Rocket
} from 'lucide-react';
import { aiosApi } from '../../services/aiosApi';

export const SimulationCenter: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'enterprise' | 'production' | 'startup' | 'research' | 'sandbox'
  >('enterprise');

  // Simulation Data
  const [overviewData, setOverviewData] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('google');
  
  // Interactive Modals / Forms
  const [actionContent, setActionContent] = useState<string>('');
  const [actionReasoning, setActionReasoning] = useState<string>('');
  const [actionTradeoffs, setActionTradeoffs] = useState<string>('');
  const [activeEvent, setActiveEvent] = useState<any>(null);

  // Incident Console State
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [incidentMitigationText, setIncidentMitigationText] = useState<string>('');
  const [incidentResult, setIncidentResult] = useState<any>(null);

  // Startup Pitch State
  const [pitchForm, setPitchForm] = useState({
    tagline: 'Autonomous AI Operating System & Multi-Agent Infrastructure for Enterprise Engineers',
    problem: 'Engineers lack realistic, end-to-end simulation environments for high-throughput distributed systems & production incidents before entering top-tier tech.',
    solution: 'Algora Autonomous Career OS: multi-agent virtual teams, real-time live incident command, and career sandboxes.',
    moat: 'Proprietary developer interaction graphs and multi-agent consensus scoring engines.',
    traction: '$14.5k MRR, 12 enterprise pilot pipelines, 92% retention.',
    ask: '$1.5M Seed round at $15M valuation cap.'
  });
  const [pitchResult, setPitchResult] = useState<any>(null);

  // Research Rebuttal State
  const [rebuttalText, setRebuttalText] = useState<string>(
    'We thank Reviewer #1 and Reviewer #2 for their insightful feedback. In response to concerns regarding batch sizes >128, we conducted additional ablation studies on 8x H100 nodes confirming sub-linear memory scaling under PagedAttention with speculative asynchronous prefetching.'
  );
  const [rebuttalResult, setRebuttalResult] = useState<any>(null);

  // Career Sandbox Promotion
  const [promotionResult, setPromotionResult] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await aiosApi.getSimulationOverview();
      if (res?.data) {
        setOverviewData(res.data);
        if (res.data.incidents?.length > 0) {
          setSelectedIncident(res.data.incidents[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load simulation overview:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartCompany = async (slug: string) => {
    setActionLoading(true);
    try {
      await aiosApi.startCompanySimulation({ companySlug: slug, role: 'SDE_2' });
      setSelectedCompany(slug);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitAction = async (actionType: any) => {
    if (!overviewData?.activeSession || !activeEvent) return;
    setActionLoading(true);
    try {
      await aiosApi.submitSimulationAction({
        sessionId: overviewData.activeSession.id,
        eventId: activeEvent.id,
        actionPayload: {
          actionType,
          content: actionContent,
          reasoning: actionReasoning,
          tradeoffs: actionTradeoffs
        }
      });
      setActiveEvent(null);
      setActionContent('');
      setActionReasoning('');
      setActionTradeoffs('');
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMitigateIncident = async () => {
    if (!selectedIncident) return;
    setActionLoading(true);
    try {
      const res = await aiosApi.mitigateIncident({
        incidentId: selectedIncident.id,
        userMitigation: incidentMitigationText
      });
      setIncidentResult(res.data);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePitchStartup = async () => {
    setActionLoading(true);
    try {
      const res = await aiosApi.pitchStartupInvestors({ pitchDeck: pitchForm });
      setPitchResult(res.data);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResearchRebuttal = async () => {
    setActionLoading(true);
    try {
      const res = await aiosApi.submitResearchRebuttal({ rebuttalText });
      setRebuttalResult(res.data);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulatePromotion = async (pathSlug: string) => {
    setActionLoading(true);
    try {
      const res = await aiosApi.simulatePromotion({ pathSlug });
      setPromotionResult(res.data);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div id="sim-loading" className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Bootstrapping Multi-Agent Enterprise Simulation Hub...</p>
        </div>
      </div>
    );
  }

  const session = overviewData?.activeSession;
  const company = overviewData?.currentCompany;
  const sprintEvents = overviewData?.sprintEvents || [];
  const score = overviewData?.simulationScore || {};
  const feedback = overviewData?.sessionFeedback || [];
  const incidents = overviewData?.incidents || [];
  const startup = overviewData?.startup || {};
  const research = overviewData?.research || {};
  const sandboxes = overviewData?.sandboxes || [];

  return (
    <div id="simulation-center-root" className="w-full space-y-6">
      {/* Simulation Header Banner */}
      <div id="sim-header-banner" className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                V4.8 Enterprise Simulation Engine
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                High-Fidelity AI Actors Active
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Autonomous Enterprise Simulation & Career Sandbox
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Experience real-world Software Engineering, AI Systems, Production Incident Commander roles, Startup Founder fundraising, and Research Lab publication pipelines with live AI team actors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-refresh-sim"
              onClick={loadData}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
              Refresh Sandbox
            </button>
          </div>
        </div>

        {/* Global Performance HUD */}
        <div id="sim-performance-hud" className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Overall Score</p>
            <p className="text-xl font-bold text-indigo-400 mt-0.5">{score.overallScore || 88}/100</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">System Design</p>
            <p className="text-xl font-bold text-cyan-400 mt-0.5">{score.architectureScore || 89}%</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Incident Command</p>
            <p className="text-xl font-bold text-amber-400 mt-0.5">{score.incidentManagementScore || 86}%</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Problem Solving</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{score.problemSolvingScore || 92}%</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Current Role</p>
            <p className="text-sm font-bold text-slate-200 mt-1 truncate">{session?.role || 'SDE II'} @ {company?.companyName || 'Google'}</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Sprint Cadence</p>
            <p className="text-sm font-bold text-purple-300 mt-1">Sprint {session?.currentSprint || 1} (Active)</p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div id="sim-main-tabs" className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          id="tab-enterprise"
          onClick={() => setActiveTab('enterprise')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'enterprise'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Enterprise SDE Simulator ({company?.companyName || 'Google'})
        </button>

        <button
          id="tab-production"
          onClick={() => setActiveTab('production')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'production'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          Production Incident Command & Systems Design
        </button>

        <button
          id="tab-startup"
          onClick={() => setActiveTab('startup')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'startup'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Rocket className="w-4 h-4" />
          Startup Founder & VC Simulator
        </button>

        <button
          id="tab-research"
          onClick={() => setActiveTab('research')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'research'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Research Lab & NeurIPS Publication
        </button>

        <button
          id="tab-sandbox"
          onClick={() => setActiveTab('sandbox')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'sandbox'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Career Sandbox & Promotion Engine
        </button>
      </div>

      {/* TAB 1: ENTERPRISE SDE SIMULATOR */}
      {activeTab === 'enterprise' && (
        <div id="sim-tab-enterprise-content" className="space-y-6">
          {/* Company Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Select Enterprise Simulation Target:</p>
              <p className="text-xs text-slate-500 mt-0.5">Switch company to simulate authentic engineering culture, tech stacks, and team roles.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['google', 'amazon', 'meta', 'netflix', 'stripe', 'openai'].map((slug) => (
                <button
                  key={slug}
                  id={`btn-company-${slug}`}
                  onClick={() => handleStartCompany(slug)}
                  disabled={actionLoading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition ${
                    company?.slug === slug
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {slug}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Virtual Team Roster & Tech Stack */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Virtual Team: {session?.teamName}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                    {company?.domain?.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {company?.teamStructure?.map((member: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-850 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 text-xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{member.name}</p>
                          <p className="text-slate-400 text-2xs">{member.role}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-2xs">
                        {member.level}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <p className="text-xs font-semibold text-slate-400 mb-2">Enterprise Tech Stack:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {company?.techStack?.map((tech: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-2xs font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-900/40 text-xs text-indigo-300 space-y-1">
                  <p className="font-semibold text-indigo-200">Engineering Culture & Rigor:</p>
                  <p className="text-2xs text-indigo-300/80 leading-relaxed">{company?.engineeringCulture}</p>
                </div>
              </div>

              {/* Peer Feedback & Tech Lead Reviews */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  Live AI Peer & Manager Feedback
                </h3>
                {feedback.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No feedback yet. Submit sprint tickets to receive AI code reviews.</p>
                ) : (
                  <div className="space-y-3">
                    {feedback.map((fb: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-850 border border-slate-800 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">{fb.reviewerName} ({fb.reviewerRole})</span>
                          <span className="text-amber-400 font-bold">★ {fb.rating}/5.0</span>
                        </div>
                        <p className="text-slate-300 text-2xs leading-relaxed italic">"{fb.comments}"</p>
                        {fb.actionableItems?.length > 0 && (
                          <div className="pt-2 border-t border-slate-800 text-2xs text-indigo-300">
                            <span className="font-semibold">Action Items: </span>
                            {fb.actionableItems.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Active Sprint Board & Event Stream */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <GitPullRequest className="w-4 h-4 text-indigo-400" />
                      Active Sprint Work Items (Sprint {session?.currentSprint || 1})
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Interact with tasks, code review requests, architecture RFCs, and live incident alarms.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                    {sprintEvents.length} Active Items
                  </span>
                </div>

                <div className="space-y-3">
                  {sprintEvents.map((ev: any) => (
                    <div 
                      key={ev.id}
                      className={`p-4 rounded-xl border transition ${
                        ev.eventType === 'production_incident'
                          ? 'bg-red-950/20 border-red-900/60 hover:border-red-700'
                          : ev.eventType === 'design_review'
                          ? 'bg-purple-950/20 border-purple-900/60 hover:border-purple-700'
                          : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-2xs font-bold uppercase tracking-wider ${
                            ev.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            ev.severity === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          }`}>
                            {ev.eventType.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">Scope: {ev.impactScope}</span>
                        </div>
                        <span className="text-2xs text-slate-400">{ev.status}</span>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1">{ev.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">{ev.description}</p>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                        <div className="text-2xs text-slate-400">
                          {ev.payload?.estimatedPoints ? `Story Points: ${ev.payload.estimatedPoints}` : `Assignee: You`}
                        </div>
                        <button
                          id={`btn-act-${ev.id}`}
                          onClick={() => {
                            setActiveEvent(ev);
                            setActionContent(
                              ev.eventType === 'code_review' 
                                ? 'I reviewed the PR thoroughly. The Raft snapshotting logic is solid, but please ensure we release the read-lock before flushing chunk buffers to avoid blocking ingress RPCs.'
                                : ev.eventType === 'design_review'
                                ? 'I propose a multi-region Saga orchestrator with idempotent compensating transactions and Redis-backed state machine for sub-50ms order placements.'
                                : 'Implemented concurrency-safe partition rebalancing with exponential backoff retries and atomic CAS version checks.'
                            );
                            setActionReasoning('Optimized for zero data loss and minimal P99 latency overhead.');
                            setActionTradeoffs('Slightly higher memory overhead in exchange for instantaneous failover resilience.');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Play className="w-3 h-3" />
                          Execute Engineering Action
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Drawer/Modal */}
              {activeEvent && (
                <div id="sim-action-drawer" className="bg-slate-900 border border-indigo-800/80 rounded-xl p-5 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-indigo-400" />
                        Execute Action: {activeEvent.title}
                      </h4>
                      <p className="text-2xs text-slate-400">Your proposal will be evaluated by the AI Tech Lead and recorded in your Digital Twin & Knowledge Fabric.</p>
                    </div>
                    <button 
                      onClick={() => setActiveEvent(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-2xs font-semibold text-slate-300 mb-1">Code Solution / Engineering Proposal:</label>
                      <textarea
                        rows={4}
                        value={actionContent}
                        onChange={(e) => setActionContent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                        placeholder="Write your implementation details, PR comments, or architecture proposal..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-2xs font-semibold text-slate-300 mb-1">Architectural Reasoning:</label>
                        <input
                          type="text"
                          value={actionReasoning}
                          onChange={(e) => setActionReasoning(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-2xs font-semibold text-slate-300 mb-1">Key Trade-offs:</label>
                        <input
                          type="text"
                          value={actionTradeoffs}
                          onChange={(e) => setActionTradeoffs(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setActiveEvent(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        id="btn-submit-action"
                        onClick={() => handleSubmitAction(activeEvent.eventType === 'code_review' ? 'code_review' : 'code_submit')}
                        disabled={actionLoading || !actionContent.trim()}
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {actionLoading ? 'Evaluating with AI Tech Lead...' : 'Submit Engineering Review'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTION INCIDENT COMMAND & SYSTEM DESIGN */}
      {activeTab === 'production' && (
        <div id="sim-tab-production-content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Incident Scenario Selector */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Real-World Sev-1/Sev-2 Incident Scenarios
              </h3>
              <div className="space-y-2">
                {incidents.map((inc: any) => (
                  <div
                    key={inc.id}
                    id={`inc-card-${inc.id}`}
                    onClick={() => {
                      setSelectedIncident(inc);
                      setIncidentResult(null);
                      setIncidentMitigationText(
                        `1. Immediate Containment: Execute redis-cli CONFIG SET maxmemory-policy volatile-lru to evict unpinned cache buffers.\n2. Isolate traffic to read replica.\n3. Deploy hotfix patch enforcing 3600s TTL across all batch session writers.`
                      );
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      selectedIncident?.id === inc.id
                        ? 'bg-red-950/40 border-red-500/80 shadow-lg shadow-red-950/50'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-2xs font-bold uppercase">
                        {inc.severity} Incident
                      </span>
                      <span className="text-2xs text-slate-400">SLA: {inc.expectedSlaMinutes} mins</span>
                    </div>
                    <h4 className="text-xs font-bold text-white mt-1">{inc.title}</h4>
                    <p className="text-2xs text-slate-400 mt-1">{inc.scenarioType}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Interactive Incident Command Terminal */}
            <div className="lg:col-span-2 space-y-5">
              {selectedIncident && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-red-400" />
                        Live Incident Terminal: {selectedIncident.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Root Cause: {selectedIncident.rootCause}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-300 text-xs font-mono font-bold">
                      {selectedIncident.severity} ACTIVE
                    </span>
                  </div>

                  {/* Architecture Diagram */}
                  {selectedIncident.architectureDiagram && (
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                      <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Architecture Topology & Failure Point:</p>
                      <pre className="text-2xs text-emerald-400 font-mono overflow-x-auto leading-tight">
                        {selectedIncident.architectureDiagram}
                      </pre>
                    </div>
                  )}

                  {/* Initial Server Logs */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Live Telemetry & Ingestion Logs:</p>
                    <pre className="text-2xs text-red-400 font-mono overflow-x-auto leading-tight">
                      {selectedIncident.initialLogs}
                    </pre>
                  </div>

                  {/* Mitigation Steps Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-200">
                      Enter Your Production Mitigation & Rollback Command:
                    </label>
                    <textarea
                      rows={4}
                      value={incidentMitigationText}
                      onChange={(e) => setIncidentMitigationText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500"
                      placeholder="Specify your incident containment actions, configuration commands, and post-mortem guards..."
                    />

                    <button
                      id="btn-mitigate-incident"
                      onClick={handleMitigateIncident}
                      disabled={actionLoading || !incidentMitigationText.trim()}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-2 transition"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      {actionLoading ? 'AI Incident Commander Evaluating...' : 'Execute Production Mitigation & Resolve Alert'}
                    </button>
                  </div>

                  {/* Evaluation Result */}
                  {incidentResult && (
                    <div className="p-4 rounded-xl bg-slate-850 border border-indigo-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Incident Commander Evaluation Result: {incidentResult.score}/100
                        </span>
                        <span className={`px-2 py-0.5 rounded text-2xs font-bold ${incidentResult.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                          {incidentResult.passed ? 'SLA MET / RESOLVED' : 'SLA BREACHED'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{incidentResult.analysis}</p>
                      {incidentResult.strengths?.length > 0 && (
                        <div className="text-2xs text-emerald-300">
                          <span className="font-semibold">Strengths: </span>{incidentResult.strengths.join(' | ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STARTUP FOUNDER & VC SIMULATOR */}
      {activeTab === 'startup' && (
        <div id="sim-tab-startup-content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Startup Stage</p>
              <p className="text-lg font-bold text-amber-400 mt-0.5">{startup.stage || 'Seed Stage'}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Capital Raised</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">${(startup.capitalRaised || 750000).toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Monthly Recurring Revenue</p>
              <p className="text-lg font-bold text-indigo-400 mt-0.5">${(startup.mrr || 14500).toLocaleString()} / mo</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Runway Remaining</p>
              <p className="text-lg font-bold text-purple-400 mt-0.5">{startup.runwayMonths || 16} Months</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pitch Deck Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-amber-400" />
                Interactive VC Pitch Deck & Term Sheet Simulator
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Company Tagline:</label>
                  <input
                    type="text"
                    value={pitchForm.tagline}
                    onChange={(e) => setPitchForm({ ...pitchForm, tagline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Defensible Moat & Technology:</label>
                  <input
                    type="text"
                    value={pitchForm.moat}
                    onChange={(e) => setPitchForm({ ...pitchForm, moat: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Traction & Commercial Metrics:</label>
                  <input
                    type="text"
                    value={pitchForm.traction}
                    onChange={(e) => setPitchForm({ ...pitchForm, traction: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Capital Ask & Valuation Target:</label>
                  <input
                    type="text"
                    value={pitchForm.ask}
                    onChange={(e) => setPitchForm({ ...pitchForm, ask: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <button
                  id="btn-pitch-investors"
                  onClick={handlePitchStartup}
                  disabled={actionLoading}
                  className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  {actionLoading ? 'Pitching Silicon Valley VCs...' : 'Pitch AI Investors (Marc Andreessen & Elad Gil)'}
                </button>
              </div>

              {pitchResult && (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">Term Sheet Offer: {pitchResult.valuationOffer}</span>
                    <span className="font-bold text-white">Score: {pitchResult.score}/100</span>
                  </div>
                  <p className="text-slate-300 text-2xs">{pitchResult.nextMilestone}</p>
                </div>
              )}
            </div>

            {/* Investor Feedback & Board Opinions */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Venture Capital Partner Reviews
              </h3>

              <div className="space-y-3">
                {startup.investorFeedback?.map((inv: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{inv.partner}</p>
                        <p className="text-slate-400 text-2xs">{inv.firm} • {inv.valuationCap}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-2xs">
                        {inv.verdict} ({inv.score}/100)
                      </span>
                    </div>
                    <p className="text-slate-300 text-2xs italic leading-relaxed">"{inv.quote}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RESEARCH LAB & NEURIPS SIMULATOR */}
      {activeTab === 'research' && (
        <div id="sim-tab-research-content" className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase">
                  {research.labName || 'Berkeley AI Systems Lab'}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{research.researchTopic}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Target: {research.conferenceTarget} • Status: {research.currentPhase}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                {research.grantStatus}
              </span>
            </div>

            {/* Peer Reviews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {research.peerReviews?.map((rev: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-850 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{rev.reviewerId}</span>
                    <span className="font-bold text-white">{rev.rating}</span>
                  </div>
                  <p className="text-slate-300 text-2xs">{rev.summary}</p>
                  <div className="text-2xs text-emerald-300"><span className="font-semibold">Strengths: </span>{rev.strengths?.join(', ')}</div>
                  <div className="text-2xs text-amber-300"><span className="font-semibold">Concerns: </span>{rev.concerns?.join(', ')}</div>
                </div>
              ))}
            </div>

            {/* Rebuttal Simulator */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-200">
                Author Conference Rebuttal & Defense:
              </label>
              <textarea
                rows={3}
                value={rebuttalText}
                onChange={(e) => setRebuttalText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono"
              />
              <button
                id="btn-submit-rebuttal"
                onClick={handleResearchRebuttal}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
              >
                {actionLoading ? 'Evaluating with Meta-Reviewer...' : 'Submit Rebuttal for Spotlight Oral Acceptance'}
              </button>

              {rebuttalResult && (
                <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-900/50 text-xs text-cyan-300">
                  <p className="font-bold text-white">{rebuttalResult.decisionVerdict}</p>
                  <p className="text-2xs mt-1">{rebuttalResult.metaReviewerComments}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CAREER SANDBOX & PROMOTION ENGINE */}
      {activeTab === 'sandbox' && (
        <div id="sim-tab-sandbox-content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {sandboxes.map((sb: any) => (
              <div key={sb.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-2xs font-semibold">
                    {sb.targetCompany}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1">{sb.pathTitle}</h3>
                  <div className="flex items-center justify-between text-2xs text-slate-400 mt-1">
                    <span>{sb.currentLevel}</span>
                    <ArrowRight className="w-3 h-3 text-indigo-400" />
                    <span className="text-emerald-400 font-bold">{sb.targetLevel}</span>
                  </div>
                </div>

                {/* Salary Trajectory */}
                <div className="space-y-1.5 p-3 rounded-lg bg-slate-850 border border-slate-800 text-2xs">
                  <p className="font-semibold text-slate-400 uppercase tracking-wider text-3xs">Projected Total Comp Trajectory:</p>
                  {sb.projectedSalaryTrajectory?.map((sal: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-slate-300 font-mono">
                      <span>{sal.year}</span>
                      <span className="font-bold text-emerald-400">{sal.total}</span>
                    </div>
                  ))}
                </div>

                {/* Milestones */}
                <div className="space-y-2">
                  <p className="font-semibold text-slate-400 text-2xs">Promotion Milestones:</p>
                  {sb.milestoneProgress?.map((m: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-2xs text-slate-300">
                      {m.status === 'Completed' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0 mt-0.5" />
                      )}
                      <span>{m.milestone}</span>
                    </div>
                  ))}
                </div>

                <button
                  id={`btn-promo-${sb.pathSlug}`}
                  onClick={() => handleSimulatePromotion(sb.pathSlug)}
                  disabled={actionLoading}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  Simulate Staff Promotion Review
                </button>
              </div>
            ))}
          </div>

          {promotionResult && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-300 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm">🎉 Promotion Calibration Approved!</p>
                <p className="text-xs text-emerald-200 mt-0.5">{promotionResult.promotionDelta}</p>
              </div>
              <span className="text-base font-bold text-emerald-400">{promotionResult.newComp}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
