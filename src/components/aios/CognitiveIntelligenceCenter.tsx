import React, { useState, useEffect } from "react";
import {
  Brain,
  Dna,
  Zap,
  Target,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Microscope,
  Compass,
  Layers,
  Award,
  Cpu,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  BarChart3,
  Network
} from "lucide-react";
import {
  cognitiveApi,
  CognitiveProfileResponse,
  LearningDNAResponse,
  AGIResearchResponse,
  SuperintelligenceResponse,
  CognitiveBottleneckResponse,
  KnowledgeCompoundingResponse
} from "../../services/cognitiveApi";

export const CognitiveIntelligenceCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"architecture" | "dna" | "bottlenecks" | "research" | "superintelligence">("architecture");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [cognitiveProfile, setCognitiveProfile] = useState<CognitiveProfileResponse | null>(null);
  const [learningDNA, setLearningDNA] = useState<LearningDNAResponse | null>(null);
  const [agiResearch, setAGIResearch] = useState<AGIResearchResponse | null>(null);
  const [superintel, setSuperintel] = useState<SuperintelligenceResponse | null>(null);
  const [bottlenecks, setBottlenecks] = useState<CognitiveBottleneckResponse | null>(null);
  const [compounding, setCompounding] = useState<KnowledgeCompoundingResponse | null>(null);

  // Form states for AGI project creation and simulation
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDomain, setNewProjectDomain] = useState("Reasoning Systems");
  const [newProjectObj, setNewProjectObj] = useState("");
  const [isGeneratingProject, setIsGeneratingProject] = useState(false);

  const [simName, setSimName] = useState("");
  const [simYears, setSimYears] = useState(5);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cog, dna, agi, sim, btn, cmp] = await Promise.all([
        cognitiveApi.getCognitiveProfile(),
        cognitiveApi.getLearningDNA(),
        cognitiveApi.getAGIResearch(),
        cognitiveApi.getSuperintelligence(),
        cognitiveApi.getCognitiveBottlenecks(),
        cognitiveApi.getKnowledgeCompounding()
      ]);
      setCognitiveProfile(cog);
      setLearningDNA(dna);
      setAGIResearch(agi);
      setSuperintel(sim);
      setBottlenecks(btn);
      setCompounding(cmp);
    } catch (err: any) {
      console.error("Error loading cognitive intelligence data:", err);
      setError("Failed to load cognitive intelligence profile. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateResearchPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    setIsGeneratingProject(true);
    try {
      await cognitiveApi.generateResearchPlan(
        newProjectTitle,
        newProjectDomain,
        newProjectObj || "Empirical performance verification and sub-linear complexity benchmark."
      );
      setNewProjectTitle("");
      setNewProjectObj("");
      const updatedAGI = await cognitiveApi.getAGIResearch();
      setAGIResearch(updatedAGI);
    } catch (err) {
      console.error("Error creating research plan:", err);
    } finally {
      setIsGeneratingProject(false);
    }
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    try {
      await cognitiveApi.simulateSuperintelligence(
        simName || `${simYears}-Year Personal Superintelligence Forecast`,
        simYears
      );
      setSimName("");
      const updatedSim = await cognitiveApi.getSuperintelligence();
      setSuperintel(updatedSim);
    } catch (err) {
      console.error("Error running simulation:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400">
        <RefreshCw className="w-10 h-10 animate-spin text-purple-500 mb-4" />
        <p className="text-lg font-medium text-slate-300">Synthesizing Cognitive Architecture & Superintelligence Model...</p>
        <p className="text-sm text-slate-500 mt-1">Analyzing memory, reasoning velocity, learning DNA, and AGI research projects...</p>
      </div>
    );
  }

  if (error || !cognitiveProfile) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center max-w-lg mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">Cognitive Intelligence Error</h3>
        <p className="text-slate-300 text-sm mb-4">{error || "Failed to load data"}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition"
        >
          Retry Calibration
        </button>
      </div>
    );
  }

  const p = cognitiveProfile.profile;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/80 border border-purple-500/20 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-400" /> Phase V5.1 Cognitive OS
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-full uppercase tracking-wider">
                Personal Superintelligence Platform
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Cognitive Architecture & AGI Research Lab
            </h1>
            <p className="text-slate-300 mt-2 max-w-2xl text-base">
              Modeling cognitive bandwidth, working memory, reasoning velocity, learning DNA, and 10-year superintelligence trajectory forecasts.
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl min-w-[220px]">
            <div className="text-left md:text-right">
              <div className="text-xs text-slate-400 font-medium">Composite Cognitive Index</div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                {cognitiveProfile.compositeCognitiveIndex} <span className="text-xs text-slate-500 font-normal">/ 100</span>
              </div>
            </div>
            <div className="text-left md:text-right">
              <div className="text-xs text-slate-400 font-medium">Compounding Multiplier</div>
              <div className="text-lg font-bold text-emerald-400">
                {compounding?.overallCompoundingMultiplier || 1.85}x Velocity
              </div>
            </div>
          </div>
        </div>

        {/* System Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 overflow-x-auto border-t border-slate-800/80 pt-6">
          <button
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === "architecture"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Brain className="w-4 h-4" /> Cognitive Architecture
          </button>
          <button
            onClick={() => setActiveTab("dna")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === "dna"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Dna className="w-4 h-4" /> Learning DNA
          </button>
          <button
            onClick={() => setActiveTab("bottlenecks")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === "bottlenecks"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Cognitive Bottlenecks
            {bottlenecks && bottlenecks.activeCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-bold">
                {bottlenecks.activeCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("research")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === "research"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Microscope className="w-4 h-4" /> AGI Research Lab
          </button>
          <button
            onClick={() => setActiveTab("superintelligence")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === "superintelligence"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" /> Superintelligence Simulator
          </button>
        </div>
      </div>

      {/* Tab 1: Cognitive Architecture */}
      {activeTab === "architecture" && (
        <div className="space-y-6">
          {/* Cognitive Core Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-sm">
                <span>Working Memory</span>
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{p.workingMemoryScore} / 100</div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${p.workingMemoryScore}%` }} />
              </div>
              <p className="text-xs text-slate-500">Sub-second context switching bandwidth</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-sm">
                <span>Reasoning Velocity</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{p.reasoningScore} / 100</div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${p.reasoningScore}%` }} />
              </div>
              <p className="text-xs text-slate-500">First-principles logical deduction speed</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-sm">
                <span>Pattern Recognition</span>
                <Network className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">{p.patternRecognitionScore} / 100</div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${p.patternRecognitionScore}%` }} />
              </div>
              <p className="text-xs text-slate-500">Cross-domain schema extraction</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-sm">
                <span>Abstraction Depth</span>
                <Layers className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{p.abstractionScore} / 100</div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${p.abstractionScore}%` }} />
              </div>
              <p className="text-xs text-slate-500">System architecture mental modeling</p>
            </div>
          </div>

          {/* Secondary Cognitive Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" /> Problem-Solving Profile
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl">
                  <span className="text-sm text-slate-300">Dominant Strategy</span>
                  <span className="text-sm font-semibold text-purple-300">{cognitiveProfile.problemSolvingProfile.dominantStrategy}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl">
                  <span className="text-sm text-slate-300">Decomposition Speed</span>
                  <span className="text-sm font-bold text-emerald-400">{cognitiveProfile.problemSolvingProfile.decompositionSpeedScore} / 100</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl">
                  <span className="text-sm text-slate-300">First-Principles Depth</span>
                  <span className="text-sm font-bold text-indigo-400">{cognitiveProfile.problemSolvingProfile.firstPrinciplesDepth} / 100</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl">
                  <span className="text-sm text-slate-300">Creative Synthesis</span>
                  <span className="text-sm font-bold text-amber-400">{cognitiveProfile.problemSolvingProfile.creativeSynthesesScore} / 100</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" /> Learning & Focus Dynamics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl">
                  <span className="text-sm text-slate-300">Optimal Deep Work Window</span>
                  <span className="text-sm font-semibold text-indigo-300">{cognitiveProfile.learningProfile.focusOptimalMinutes} Minutes</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl">
                  <span className="text-sm text-slate-300">Recommended Recovery Interval</span>
                  <span className="text-sm font-semibold text-slate-300">{cognitiveProfile.learningProfile.recommendedBreakIntervalMinutes} Minutes</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl">
                  <span className="text-sm text-slate-300">Stress Resilience Index</span>
                  <span className="text-sm font-bold text-emerald-400">{cognitiveProfile.learningProfile.stressResilienceIndex} / 100</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl">
                  <span className="text-sm text-slate-300">Knowledge Transfer Ability</span>
                  <span className="text-sm font-bold text-purple-400">{cognitiveProfile.knowledgeTransferScore} / 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Synthesis Box */}
          <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/20 p-6 rounded-2xl">
            <h4 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Cognitive Architecture Synthesis
            </h4>
            <p className="text-slate-200 text-sm leading-relaxed">{cognitiveProfile.aiSynthesis}</p>
          </div>
        </div>
      )}

      {/* Tab 2: Learning DNA */}
      {activeTab === "dna" && learningDNA && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-full uppercase">
                  Archetype Identified
                </span>
                <h2 className="text-2xl font-black text-white mt-1">{learningDNA.archetypeDetails.title}</h2>
                <p className="text-slate-400 text-sm mt-1">{learningDNA.archetypeDetails.description}</p>
              </div>

              <div className="bg-purple-950/40 border border-purple-500/30 p-4 rounded-xl text-center min-w-[180px]">
                <div className="text-xs text-purple-300">1-Week Retention Rate</div>
                <div className="text-3xl font-black text-white">{learningDNA.profile.retentionRatePct}%</div>
              </div>
            </div>

            {/* Dominant Traits & Superpowers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Dominant Cognitive Traits
                </h4>
                <div className="space-y-2">
                  {learningDNA.profile.dominantTraits.map((trait, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-800/60 p-3 rounded-xl text-sm font-medium text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {trait}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Learning Superpowers
                </h4>
                <div className="space-y-2">
                  {learningDNA.profile.learningSuperpowers.map((power, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-800/60 p-3 rounded-xl text-sm font-medium text-slate-200">
                      <StarIcon className="w-4 h-4 text-amber-400 shrink-0" /> {power}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Learning Mode Breakdown */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Learning Mode Effectiveness & Allocation</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {learningDNA.learningModeBreakdown.map((mode, idx) => (
                  <div key={idx} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl space-y-2">
                    <div className="text-sm font-medium text-slate-300">{mode.mode}</div>
                    <div className="text-2xl font-bold text-white">{mode.effectivenessScore} / 100</div>
                    <div className="text-xs text-purple-400 font-semibold">Rec. Share: {mode.recommendedSharePct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cognitive Bottlenecks */}
      {activeTab === "bottlenecks" && bottlenecks && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" /> Cognitive Bottleneck Diagnostics
                </h2>
                <p className="text-slate-400 text-sm mt-1">Automated detection of memory gaps, retrieval bottlenecks, and reasoning ceilings.</p>
              </div>
              <div className="bg-slate-800 px-4 py-2 rounded-xl text-right">
                <div className="text-xs text-slate-400">Cognitive Health Score</div>
                <div className="text-xl font-bold text-emerald-400">{bottlenecks.overallCognitiveHealthScore} / 100</div>
              </div>
            </div>

            {/* Bottlenecks List */}
            <div className="space-y-4">
              {bottlenecks.bottlenecks.map((btn) => (
                <div key={btn.id} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${
                        btn.severity === 'Critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        btn.severity === 'High' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {btn.severity} Severity
                      </span>
                      <h3 className="text-base font-bold text-white">{btn.title}</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                      Impact: {btn.impactArea}
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm">{btn.description}</p>

                  <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">AI Recovery Plan</div>
                    <ul className="space-y-1">
                      {btn.recoveryPlan.map((step, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <ArrowRight className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AGI Research Lab */}
      {activeTab === "research" && agiResearch && (
        <div className="space-y-6">
          {/* Create Research Plan Form */}
          <div className="bg-slate-900/80 border border-purple-500/20 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Microscope className="w-5 h-5 text-purple-400" /> Initiate AGI Research Project
            </h3>
            <form onSubmit={handleCreateResearchPlan} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Research Title</label>
                <input
                  type="text"
                  placeholder="e.g., Hierarchical Sub-linear Context Memory"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Research Domain</label>
                <select
                  value={newProjectDomain}
                  onChange={(e) => setNewProjectDomain(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Reasoning Systems">Reasoning Systems</option>
                  <option value="Multi-Agent Systems">Multi-Agent Systems</option>
                  <option value="LLM Systems">LLM Systems</option>
                  <option value="RAG">RAG & Knowledge Graphs</option>
                  <option value="AI Safety & Alignment">AI Safety & Alignment</option>
                  <option value="AI Evaluation">AI Evaluation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Objective</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Benchmarking sub-linear vector retrieval"
                    value={newProjectObj}
                    onChange={(e) => setNewProjectObj(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={isGeneratingProject || !newProjectTitle.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition whitespace-nowrap disabled:opacity-50"
                  >
                    {isGeneratingProject ? "Generating..." : "Generate Plan"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Active Research Projects */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Frontier Research Projects ({agiResearch.projects.length})
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {agiResearch.projects.map((prj) => (
                <div key={prj.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
                      {prj.domain}
                    </span>
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      {prj.status}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white">{prj.title}</h4>
                  <p className="text-slate-300 text-sm">{prj.objective}</p>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-xs font-semibold text-slate-400 uppercase">Structured Research Plan</div>
                    <ul className="space-y-1">
                      {prj.researchPlan.map((planStep, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                          <span>{planStep}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7 Benchmark Environments */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" /> 7 Frontier Research Benchmark Environments
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {agiResearch.environments.map((env, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-white">{env.domain}</span>
                    <span className="text-xs text-purple-400 font-bold">{env.maturityScore}% Mastery</span>
                  </div>
                  <p className="text-xs text-slate-400">{env.description}</p>
                  <div className="text-xs font-semibold text-slate-300 bg-slate-800/80 p-2 rounded-lg">
                    Benchmark: {env.activeBenchmark}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Personal Superintelligence Simulator */}
      {activeTab === "superintelligence" && superintel && (
        <div className="space-y-6">
          {/* Trigger Simulation Form */}
          <div className="bg-slate-900/80 border border-indigo-500/20 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> Run Personal Superintelligence Forecast Simulation
            </h3>
            <form onSubmit={handleRunSimulation} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Simulation Name (e.g., 5-Year Frontier Founder Trajectory)"
                value={simName}
                onChange={(e) => setSimName(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <select
                value={simYears}
                onChange={(e) => setSimYears(parseInt(e.target.value, 10))}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={1}>1 Year Horizon</option>
                <option value={3}>3 Year Horizon</option>
                <option value={5}>5 Year Horizon</option>
                <option value={10}>10 Year Horizon</option>
              </select>
              <button
                type="submit"
                disabled={isSimulating}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
              >
                {isSimulating ? "Simulating..." : "Run Forecast"}
              </button>
            </form>
          </div>

          {/* Active 10-Year Horizon Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-400" /> Superintelligence Trajectory Forecast
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-purple-400 uppercase">1-Year Horizon</div>
                <div className="text-lg font-bold text-white">{superintel.activeForecast.oneYear.careerTier}</div>
                <div className="text-xs text-slate-400">Cognitive Index: {superintel.activeForecast.oneYear.cognitiveIndex}</div>
                <div className="text-xs text-slate-400">Papers: {superintel.activeForecast.oneYear.researchImpactPapers}</div>
                <div className="text-xs font-semibold text-emerald-400">Startup Prob: {superintel.activeForecast.oneYear.startupProbabilityPct}%</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-indigo-400 uppercase">3-Year Horizon</div>
                <div className="text-lg font-bold text-white">{superintel.activeForecast.threeYear.careerTier}</div>
                <div className="text-xs text-slate-400">Cognitive Index: {superintel.activeForecast.threeYear.cognitiveIndex}</div>
                <div className="text-xs text-slate-400">Papers: {superintel.activeForecast.threeYear.researchImpactPapers}</div>
                <div className="text-xs font-semibold text-emerald-400">Startup Prob: {superintel.activeForecast.threeYear.startupProbabilityPct}%</div>
              </div>

              <div className="bg-slate-900/80 border border-purple-500/30 p-5 rounded-2xl space-y-3 bg-purple-950/20">
                <div className="text-xs font-bold text-amber-400 uppercase">5-Year Horizon</div>
                <div className="text-lg font-bold text-white">{superintel.activeForecast.fiveYear.careerTier}</div>
                <div className="text-xs text-slate-400">Cognitive Index: {superintel.activeForecast.fiveYear.cognitiveIndex}</div>
                <div className="text-xs text-slate-400">Papers: {superintel.activeForecast.fiveYear.researchImpactPapers}</div>
                <div className="text-xs font-semibold text-emerald-400">Startup Prob: {superintel.activeForecast.fiveYear.startupProbabilityPct}%</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-emerald-400 uppercase">10-Year Horizon</div>
                <div className="text-lg font-bold text-white">{superintel.activeForecast.tenYear.careerTier}</div>
                <div className="text-xs text-slate-400">Cognitive Index: {superintel.activeForecast.tenYear.cognitiveIndex}</div>
                <div className="text-xs text-slate-400">Papers: {superintel.activeForecast.tenYear.researchImpactPapers}</div>
                <div className="text-xs font-semibold text-emerald-400">Startup Prob: {superintel.activeForecast.tenYear.startupProbabilityPct}%</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function StarIcon(props: any) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
