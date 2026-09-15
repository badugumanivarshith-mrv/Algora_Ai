import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  TrendingUp,
  DollarSign,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Zap,
  Target,
  FileText,
  BarChart2,
  RefreshCw,
  Globe,
  Share2,
  Lock,
  Flame,
  Search,
  Building,
  GraduationCap,
  Code2,
  Cpu,
  BookOpen,
  Send,
  SlidersHorizontal,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import {
  talentMarketplaceApi,
  ReputationProfile,
  ReputationEvent,
  SkillAsset,
  SkillValuation,
  Opportunity,
  OpportunityMatch,
  TalentProfile,
  TeamRecommendation,
  CollaborationProfile,
  PortfolioSnapshot,
  IndustryBenchmark
} from '../../services/talentMarketplaceApi';

export const TalentMarketplace: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'reputation' | 'skills' | 'marketplace' | 'collaboration' | 'portfolio' | 'benchmarks'>('reputation');
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [selectedOppFilter, setSelectedOppFilter] = useState<string>('All');
  const [selectedBenchmark, setSelectedBenchmark] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Data states
  const [reputation, setReputation] = useState<ReputationProfile | null>(null);
  const [repEvents, setRepEvents] = useState<ReputationEvent[]>([]);
  const [skillAssets, setSkillAssets] = useState<SkillAsset[]>([]);
  const [skillValuations, setSkillValuations] = useState<SkillValuation[]>([]);
  const [skillSummary, setSkillSummary] = useState<any>(null);
  const [talentProfile, setTalentProfile] = useState<TalentProfile | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [oppMatches, setOppMatches] = useState<OpportunityMatch[]>([]);
  const [marketAnalytics, setMarketAnalytics] = useState<any>(null);
  const [collabProfile, setCollabProfile] = useState<CollaborationProfile | null>(null);
  const [teamRecs, setTeamRecs] = useState<TeamRecommendation[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot | null>(null);
  const [benchmarks, setBenchmarks] = useState<IndustryBenchmark[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [repRes, skillRes, marketRes, oppRes, portRes, benchRes, collabRes] = await Promise.all([
        talentMarketplaceApi.getReputation(),
        talentMarketplaceApi.getSkills(),
        talentMarketplaceApi.getMarketplace(),
        talentMarketplaceApi.getOpportunities(),
        talentMarketplaceApi.getPortfolio(),
        talentMarketplaceApi.getBenchmarks(),
        talentMarketplaceApi.getCollaborators()
      ]);

      if (repRes.data) {
        setReputation(repRes.data.profile);
        setRepEvents(repRes.data.events || []);
      }
      if (skillRes.data) {
        setSkillAssets(skillRes.data.assets || []);
        setSkillValuations(skillRes.data.valuations || []);
        setSkillSummary(skillRes.data.summary);
      }
      if (marketRes.data) {
        setTalentProfile(marketRes.data.profile);
        setOpportunities(marketRes.data.opportunities || []);
        setMarketAnalytics(marketRes.data.analytics);
      }
      if (oppRes.data) {
        setOppMatches(oppRes.data.matches || []);
      }
      if (portRes.data) {
        setPortfolio(portRes.data.portfolio);
      }
      if (benchRes.data) {
        setBenchmarks(benchRes.data.benchmarks || []);
      }
      if (collabRes.data) {
        setCollabProfile(collabRes.data.profile);
        setTeamRecs(collabRes.data.recommendations || []);
      }
    } catch (e) {
      console.error('Failed to load Talent Marketplace data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await talentMarketplaceApi.recalculateReputation();
      if (res.data) {
        setReputation(res.data.profile);
        setRepEvents(res.data.events || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRecalculating(false);
    }
  };

  const handleCopyPortfolioSlug = () => {
    if (portfolio?.shareableSlug) {
      navigator.clipboard.writeText(`https://algora.io/u/${portfolio.shareableSlug}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const filteredOpportunities = opportunities.filter(o => {
    if (selectedOppFilter === 'All') return true;
    return o.opportunityType.toLowerCase().includes(selectedOppFilter.toLowerCase());
  });

  if (loading && !reputation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-400">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-sm font-medium">Synchronizing Global Skill Economy & Reputation Network...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Globe className="w-64 h-64 text-blue-400" />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Algora Consensus Protocol Verified
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Top {reputation ? Math.max(1, parseFloat((100 - reputation.percentileRank).toFixed(1))) : '1.0'}% Global Tier
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold font-display text-white tracking-tight">
              Skill Economy, Reputation & Talent Marketplace
            </h2>
            <p className="text-sm text-neutral-300 mt-1 max-w-2xl">
              Verifiable cryptographic proof of technical mastery powering high-yield opportunities, co-founder discovery, and instant algorithmic talent matching.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition shadow-lg shadow-blue-900/30"
            >
              <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
              {recalculating ? 'Consensus Auditing...' : 'Recalculate Reputation'}
            </button>
            <button
              onClick={handleCopyPortfolioSlug}
              className="px-4 py-2 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-sm font-semibold rounded-xl flex items-center gap-2 transition"
            >
              <Share2 className="w-4 h-4 text-neutral-400" />
              {copiedLink ? 'Copied Link!' : 'Share Portfolio'}
            </button>
          </div>
        </div>

        {/* Global Key Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-800/80">
          <div className="bg-black/30 border border-neutral-800 rounded-xl p-3.5">
            <div className="text-xs text-neutral-400 font-medium">Reputation Score</div>
            <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
              {reputation?.reputationScore || 845}<span className="text-xs text-neutral-500 font-normal"> / 1000</span>
            </div>
            <div className="text-[11px] text-green-400 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Top {reputation?.percentileRank || 98.5}% Percentile
            </div>
          </div>

          <div className="bg-black/30 border border-neutral-800 rounded-xl p-3.5">
            <div className="text-xs text-neutral-400 font-medium">Tokenized Skill Assets</div>
            <div className="text-2xl font-bold font-mono text-purple-300 mt-1">
              ${skillSummary?.totalValuation ? (skillSummary.totalValuation / 1000).toFixed(0) : '506'}k
            </div>
            <div className="text-[11px] text-purple-400 mt-0.5">
              +{skillSummary?.annualAppreciationRate || 19.8}% Annual Yield
            </div>
          </div>

          <div className="bg-black/30 border border-neutral-800 rounded-xl p-3.5">
            <div className="text-xs text-neutral-400 font-medium">Active Opportunities</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {opportunities.length || 7}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">
              {oppMatches.filter(m => m.matchPercentage >= 85).length} High Match Roles
            </div>
          </div>

          <div className="bg-black/30 border border-neutral-800 rounded-xl p-3.5">
            <div className="text-xs text-neutral-400 font-medium">Trust Proof Index</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {reputation?.trustScore || 92.5}%
            </div>
            <div className="text-[11px] text-amber-400 mt-0.5">
              {reputation?.verifiedCredentials?.length || 3} Cryptographic Badges
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-800">
        {[
          { id: 'reputation', label: 'Global Reputation Matrix', icon: Award },
          { id: 'skills', label: 'Autonomous Skill Economy', icon: DollarSign },
          { id: 'marketplace', label: 'Talent Marketplace', icon: Briefcase },
          { id: 'collaboration', label: 'Collaboration Network', icon: Users },
          { id: 'portfolio', label: 'Dynamic Portfolio', icon: FileText },
          { id: 'benchmarks', label: 'Industry Benchmarks', icon: BarChart2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/70 border border-transparent hover:border-neutral-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-Tab 1: Global Reputation Matrix */}
      {activeSubTab === 'reputation' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: 8 Component Pillars */}
            <div className="lg:col-span-2 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-400" />
                    Multi-Dimensional Reputation Pillars
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Calculated in real time across 8 verified ecosystem activity channels.
                  </p>
                </div>
                <span className="text-xs font-mono text-neutral-400 bg-neutral-800/80 px-2.5 py-1 rounded-lg">
                  Total Weight: 100%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'Learning & Mastery', score: reputation?.learningReputation || 88.5, weight: '15%', color: 'from-blue-500 to-indigo-500' },
                  { name: 'Contests & Speed Drills', score: reputation?.contestReputation || 84.5, weight: '15%', color: 'from-amber-500 to-orange-500' },
                  { name: 'Open Source Contributions', score: reputation?.openSourceReputation || 88.0, weight: '15%', color: 'from-emerald-500 to-teal-500' },
                  { name: 'Production Project Systems', score: reputation?.projectReputation || 92.5, weight: '15%', color: 'from-purple-500 to-pink-500' },
                  { name: 'Enterprise Hiring Clearance', score: reputation?.hiringReputation || 89.0, weight: '12%', color: 'from-cyan-500 to-blue-500' },
                  { name: 'Research & Formal Proofs', score: reputation?.researchReputation || 84.5, weight: '10%', color: 'from-rose-500 to-red-500' },
                  { name: 'Team Collaboration Synergy', score: reputation?.collaborationReputation || 89.2, weight: '10%', color: 'from-teal-500 to-emerald-500' },
                  { name: 'Strategic Leadership Growth', score: reputation?.leadershipReputation || 83.0, weight: '8%', color: 'from-indigo-500 to-violet-500' }
                ].map((pillar, idx) => (
                  <div key={idx} className="bg-black/40 border border-neutral-800/80 rounded-xl p-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-300 mb-2">
                      <span>{pillar.name}</span>
                      <span className="text-neutral-400 font-mono">{pillar.weight} wt</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-bold font-mono text-white">{pillar.score.toFixed(1)}</span>
                      <span className="text-[11px] text-neutral-400">Score / 100</span>
                    </div>
                    <div className="w-full bg-neutral-800/90 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${pillar.color} rounded-full transition-all duration-700`}
                        style={{ width: `${pillar.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1 Col: Trust & Credentials */}
            <div className="space-y-6">
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  Verified Credentials
                </h3>

                <div className="space-y-3">
                  {(reputation?.verifiedCredentials || []).map((cred) => (
                    <div key={cred.id} className="p-3.5 bg-black/40 border border-neutral-800/90 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{cred.name}</span>
                        <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {cred.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between">
                        <span>Issuer: {cred.issuer}</span>
                      </div>
                      <div className="text-[10px] font-mono text-neutral-500 mt-2 truncate bg-neutral-950 px-2 py-1 rounded">
                        Hash: {cred.verificationHash}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-green-400" />
                  Reputation Delta Stream
                </h3>
                <div className="space-y-3">
                  {repEvents.map((evt) => (
                    <div key={evt.id} className="flex items-start justify-between p-3 bg-black/40 border border-neutral-800/80 rounded-xl">
                      <div>
                        <div className="text-xs font-semibold text-neutral-200">{evt.title}</div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">{evt.verificationSource}</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-green-400 whitespace-nowrap ml-2">
                        +{evt.delta.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sub-Tab 2: Autonomous Skill Economy */}
      {activeSubTab === 'skills' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Top Overview Cards */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
                <div className="text-xs text-neutral-400 font-medium">Total Tokenized Human Capital</div>
                <div className="text-3xl font-bold font-mono text-white mt-1">
                  ${skillSummary?.totalValuation ? skillSummary.totalValuation.toLocaleString() : '506,000'}
                </div>
                <p className="text-xs text-neutral-400 mt-1">Based on verifiable production deliverables & benchmark yields</p>
              </div>

              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
                <div className="text-xs text-neutral-400 font-medium">Highest Valued Asset</div>
                <div className="text-xl font-bold text-purple-300 mt-1 truncate">
                  {skillSummary?.highestValuedSkill || 'AI Engineering & Speculative Decoding'}
                </div>
                <p className="text-xs text-emerald-400 mt-1">Market Scarcity: 94.0 / 100</p>
              </div>

              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
                <div className="text-xs text-neutral-400 font-medium">Market Liquidity Index</div>
                <div className="text-3xl font-bold font-mono text-blue-400 mt-1">
                  94.2%
                </div>
                <p className="text-xs text-neutral-400 mt-1">Surging employer demand across FAANG & AI Frontier labs</p>
              </div>
            </div>

            {/* Main Skill Assets Table */}
            <div className="lg:col-span-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    Verified Skill Assets & Real-Time Valuations
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Every skill is backed by cryptographic proof-of-work and dynamic market demand indices.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-neutral-400 border-b border-neutral-800 font-mono uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="pb-3">Skill Asset</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Proficiency</th>
                      <th className="pb-3">Mastery</th>
                      <th className="pb-3">Market Demand</th>
                      <th className="pb-3">Scarcity</th>
                      <th className="pb-3">Estimated Asset Value</th>
                      <th className="pb-3">Annual Growth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {skillAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-neutral-800/30 transition">
                        <td className="py-3.5 pr-4">
                          <div className="font-semibold text-white">{asset.skillName}</div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">
                            {asset.verifiedProofs?.length || 2} proofs linked
                          </div>
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                            {asset.skillCategory}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 text-neutral-300 font-medium">
                          {asset.proficiencyLevel}
                        </td>
                        <td className="py-3.5 pr-4 font-mono font-bold text-blue-400">
                          {asset.masteryScore.toFixed(1)}%
                        </td>
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-purple-300 font-semibold">{asset.marketDemandScore.toFixed(0)}</span>
                            <div className="w-16 bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${asset.marketDemandScore}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 font-mono text-amber-400">
                          {asset.scarcityIndex.toFixed(0)}/100
                        </td>
                        <td className="py-3.5 pr-4 font-mono font-bold text-emerald-400">
                          ${asset.estimatedAssetValue.toLocaleString()}
                        </td>
                        <td className="py-3.5 pr-4 font-mono text-green-400">
                          +{asset.growthRatePct.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Global Skill Valuations Market Feed */}
            <div className="lg:col-span-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-400" />
                Global Skill Compensation Premiums
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {skillValuations.map((val) => (
                  <div key={val.id} className="p-4 bg-black/40 border border-neutral-800 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{val.skillName}</span>
                      <span className="text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                        {val.trendDirection}
                      </span>
                    </div>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-2">
                      +${val.averageCompPremium.toLocaleString()}
                      <span className="text-[10px] text-neutral-400 font-normal"> / yr premium</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-2">
                      Top Employers: {val.topEmployers.slice(0, 3).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sub-Tab 3: Talent Marketplace & AI Matching */}
      {activeSubTab === 'marketplace' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Filter Chips */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['All', 'Full-Time', 'Internships', 'Startup', 'Research', 'Open Source', 'Freelance'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedOppFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedOppFilter === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              Showing {filteredOpportunities.length} Verified Opportunities
            </div>
          </div>

          {/* Opportunities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOpportunities.map((opp) => {
              const match = oppMatches.find(m => m.opportunityId === opp.id);
              const matchPct = match?.matchPercentage || 91.5;

              return (
                <div
                  key={opp.id}
                  className="bg-neutral-900/60 border border-neutral-800 hover:border-blue-500/40 rounded-2xl p-6 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                            {opp.opportunityType}
                          </span>
                          <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {opp.urgency}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white">{opp.title}</h4>
                        <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-blue-400" />
                          {opp.organization} • {opp.location}
                        </div>
                      </div>

                      {/* AI Match Badge */}
                      <div className="text-right">
                        <div className="text-lg font-bold font-mono text-emerald-400">
                          {matchPct}%
                        </div>
                        <div className="text-[10px] text-neutral-400 uppercase font-semibold">AI Match</div>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 line-clamp-2 mb-4">{opp.description}</p>

                    <div className="p-3 bg-black/40 border border-neutral-800/80 rounded-xl mb-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400">Compensation</span>
                        <span className="font-semibold text-emerald-400">{opp.compensationRange}</span>
                      </div>
                      {opp.equityRange && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-400">Equity Offer</span>
                          <span className="font-semibold text-purple-300">{opp.equityRange}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400">Min. Reputation</span>
                        <span className="font-mono text-neutral-200">{opp.minimumReputation} pts</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {opp.requiredSkills.map((sk, i) => (
                        <span key={i} className="px-2 py-0.5 bg-neutral-800 text-[10px] text-neutral-300 rounded font-mono">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                    <div className="text-[11px] text-neutral-400">
                      Success Prob: <span className="text-green-400 font-semibold">{match?.successProbability || 84}%</span>
                    </div>
                    <a
                      href={opp.applicationUrl}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                    >
                      Instant Apply <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Sub-Tab 4: Collaboration Network */}
      {activeSubTab === 'collaboration' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: User Collaboration Profile */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-400" />
                Team Synergy Profile
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-black/40 border border-neutral-800 rounded-xl">
                  <div className="text-xs text-neutral-400">Team Effectiveness Score</div>
                  <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
                    {collabProfile?.teamEffectivenessScore || 91.4}%
                  </div>
                </div>

                <div className="p-4 bg-black/40 border border-neutral-800 rounded-xl">
                  <div className="text-xs text-neutral-400 mb-1">Communication Style</div>
                  <div className="text-xs font-medium text-neutral-200">
                    {collabProfile?.communicationStyle}
                  </div>
                </div>

                <div className="p-4 bg-black/40 border border-neutral-800 rounded-xl">
                  <div className="text-xs text-neutral-400 mb-2">Collaboration Strengths</div>
                  <ul className="space-y-1.5 text-xs text-neutral-300">
                    {collabProfile?.collaborationStrengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right 2 Cols: High-Synergy Recommendations across 4 archetypes */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    AI-Recommended Collaborators & Co-Founders
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Matched based on complementary skill graphs and verified reputation proofs.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {teamRecs.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 hover:border-purple-500/40 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {rec.recommendationType}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            Reputation: {rec.candidateReputation} pts
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white">{rec.candidateName}</h4>
                        <div className="text-xs text-neutral-300">{rec.candidateHeadline}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold font-mono text-purple-400">
                          {rec.synergyScore}%
                        </div>
                        <div className="text-[10px] text-neutral-400 uppercase font-semibold">Synergy</div>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-black/40 border border-neutral-800/80 rounded-xl text-xs space-y-2">
                      <div className="text-neutral-300">
                        <span className="text-neutral-400 font-medium">Why Matched: </span>
                        {rec.whyMatched}
                      </div>
                      <div className="text-neutral-300">
                        <span className="text-neutral-400 font-medium">Target Topic: </span>
                        <span className="text-blue-400 font-medium">{rec.recommendedProjectTopic}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-neutral-800">
                      <div className="flex flex-wrap gap-1.5">
                        {rec.complementarySkills.map((sk, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-neutral-800 text-[10px] text-neutral-300 rounded font-mono">
                            {sk}
                          </span>
                        ))}
                      </div>
                      <button className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition">
                        Connect <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sub-Tab 5: Dynamic Portfolio */}
      {activeSubTab === 'portfolio' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-neutral-800">
              <div>
                <h3 className="text-xl font-bold text-white">{portfolio?.portfolioTitle || 'Algora Verified Portfolio'}</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Publicly auditable, cryptographic dynamic portfolio snapshot
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                  {portfolio?.verifiedProofCount || 14} Verifiable Proofs
                </span>
                <button
                  onClick={handleCopyPortfolioSlug}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copiedLink ? 'Copied Link' : 'Copy Public URL'}
                </button>
              </div>
            </div>

            {/* Narrative & Executive Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-black/40 border border-neutral-800 rounded-xl">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Career Narrative</div>
                <p className="text-xs text-neutral-200 leading-relaxed">{portfolio?.careerNarrative}</p>
              </div>

              <div className="p-4 bg-black/40 border border-neutral-800 rounded-xl">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Executive Summary</div>
                <div className="text-xs text-neutral-300 space-y-1.5 whitespace-pre-line">
                  {portfolio?.executiveSummary}
                </div>
              </div>
            </div>

            {/* Aggregated Projects */}
            <div className="space-y-4 mb-8">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" />
                Verified Production Projects
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {portfolio?.aggregatedProjects.map((p) => (
                  <div key={p.id} className="p-4 bg-black/40 border border-neutral-800 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-semibold text-blue-400 uppercase">{p.category}</div>
                      <div className="text-sm font-bold text-white mt-1">{p.title}</div>
                      <div className="text-xs text-neutral-400 mt-1">{p.role}</div>
                      <div className="text-xs text-emerald-400 font-medium mt-2">{p.metrics}</div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">{p.status}</span>
                      <a href={p.verifiedUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                        View Code <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Timeline */}
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Verified Milestone Timeline
              </h4>
              <div className="space-y-3">
                {portfolio?.achievementTimeline.map((ach, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-black/40 border border-neutral-800/80 rounded-xl text-xs">
                    <span className="text-neutral-400 font-mono w-28 shrink-0">{ach.date}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700 w-24 text-center shrink-0">
                      {ach.type}
                    </span>
                    <span className="text-neutral-200">{ach.event}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sub-Tab 6: Industry Benchmarks */}
      {activeSubTab === 'benchmarks' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roles List */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white mb-2">Target Roles</h3>
              {benchmarks.map((b, idx) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBenchmark(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    selectedBenchmark === idx
                      ? 'bg-blue-600/10 border-blue-500 text-white'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{b.targetRole}</span>
                    <span className="text-xs font-mono font-bold text-blue-400">{b.overallReadinessPct}%</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Ranking: <span className="text-emerald-400 font-semibold">{b.rankingPercentile}th percentile</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Benchmark Detail */}
            {benchmarks[selectedBenchmark] && (
              <div className="lg:col-span-2 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{benchmarks[selectedBenchmark].targetRole}</h3>
                    <div className="text-xs text-neutral-400 mt-1">
                      Expected Comp: <span className="text-emerald-400 font-semibold">{benchmarks[selectedBenchmark].benchmarkData.totalComp}</span> • Interview Pass Rate: <span className="text-purple-300 font-semibold">{benchmarks[selectedBenchmark].benchmarkData.interviewPassRate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono text-emerald-400">
                      {benchmarks[selectedBenchmark].estimatedTimeToHireWeeks} wks
                    </div>
                    <div className="text-[10px] text-neutral-400 uppercase font-semibold">Est. Time To Offer</div>
                  </div>
                </div>

                {/* Gap Analysis Bars */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Skill Gap Analysis</div>
                  {benchmarks[selectedBenchmark].skillGapAnalysis.map((gap, i) => (
                    <div key={i} className="p-3 bg-black/40 border border-neutral-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-white">{gap.dimension}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          gap.status === 'Surpasses Bar'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {gap.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
                        <span>User: {gap.userScore}</span>
                        <div className="flex-1 bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${gap.userScore}%` }} />
                        </div>
                        <span>Target: {gap.targetScore}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Improvement Paths */}
                <div className="p-4 bg-black/40 border border-neutral-800 rounded-xl">
                  <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">Recommended Improvement Path</div>
                  <ul className="space-y-1.5 text-xs text-neutral-300">
                    {benchmarks[selectedBenchmark].improvementPaths.map((path, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                        <span>{path}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TalentMarketplace;
