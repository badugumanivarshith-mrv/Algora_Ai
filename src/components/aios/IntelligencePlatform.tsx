import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Network, 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Search, 
  RefreshCw,
  Cpu,
  BookOpen,
  Briefcase,
  Zap,
  ChevronRight,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { aiosApi } from '../../services/aiosApi';

const IntelligencePlatform: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [graph, setGraph] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, graphRes] = await Promise.all([
        aiosApi.getIntelligenceProfile(),
        aiosApi.getGlobalGraph()
      ]);
      setProfile(profileRes.data.profile);
      setInsights(profileRes.data.insights);
      setGraph(graphRes.data);
    } catch (e) {
      console.error('Failed to fetch intelligence data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await aiosApi.syncKnowledge();
      await fetchData();
    } catch (e) {
      console.error('Sync failed', e);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Brain className="animate-pulse text-purple-500" /></div>;

  return (
    <div className="space-y-8">
      {/* Header with Sync */}
      <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-6 rounded-3xl">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="text-purple-400" />
            Knowledge Fabric
          </h2>
          <p className="text-neutral-500 text-sm mt-1">Unified intelligence layer across all OS domains</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-neutral-800 text-white rounded-xl font-bold transition-all"
        >
          {syncing ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          {syncing ? 'Syncing...' : 'Sync Knowledge'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Intelligence Profile */}
        <div className="space-y-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Cpu size={20} className="text-blue-400" />
              Intelligence Profile
            </h3>
            
            <div className="space-y-6">
              {[
                { label: 'Overall Mastery', value: profile?.overall_mastery || 0, color: 'bg-blue-500' },
                { label: 'Hiring Readiness', value: profile?.hiring_readiness || 0, color: 'bg-green-500' },
                { label: 'Learning Velocity', value: profile?.learning_velocity || 0, color: 'bg-purple-500' },
                { label: 'Research Impact', value: profile?.research_impact || 0, color: 'bg-orange-500' },
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-neutral-500">
                    <span>{stat.label}</span>
                    <span>{stat.value.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      className={`h-full rounded-full ${stat.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-neutral-800">
              <h4 className="text-sm font-bold text-neutral-400 mb-4 uppercase tracking-widest">Top Skills</h4>
              <div className="flex flex-wrap gap-2">
                {profile?.top_skills?.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-green-400" />
              Skill Distribution
            </h3>
            <div className="space-y-4">
              {profile?.skill_distribution && Object.entries(profile.skill_distribution).map(([skill, val]: any, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-xs font-mono w-24 text-neutral-400 truncate">{skill}</div>
                  <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-600" style={{ width: `${val}%` }} />
                  </div>
                  <div className="text-xs font-mono w-8 text-right">{val}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Insights Center */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-black/20">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Lightbulb size={20} className="text-yellow-400" />
                Cross-Domain Insights
              </h3>
              <Info size={16} className="text-neutral-600" />
            </div>
            <div className="divide-y divide-neutral-800">
              {insights.map((insight) => (
                <div key={insight.id} className="p-6 hover:bg-white/[0.01] transition-colors group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                        insight.insight_type === 'Gap' ? 'bg-red-500/10 text-red-400' : 
                        insight.insight_type === 'Readiness' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {insight.insight_type}
                      </span>
                      <h4 className="font-bold">{insight.title}</h4>
                    </div>
                    <span className="text-[10px] text-neutral-600 font-mono">
                      {new Date(insight.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed mb-4">{insight.description}</p>
                  {insight.recommendation && (
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-start gap-3">
                      <Zap size={14} className="text-yellow-500 mt-0.5" />
                      <div className="text-xs text-neutral-300">
                        <span className="font-bold text-neutral-200">Recommendation:</span> {insight.recommendation}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {insights.length === 0 && (
                <div className="p-12 text-center text-neutral-500">
                  Sync your knowledge to generate intelligence insights.
                </div>
              )}
            </div>
          </div>

          {/* Global Memory Graph (Visual Representation) */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Network size={20} className="text-blue-400" />
                Memory Graph Explorer
              </h3>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Topic</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500" /> Skill</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /> Target</div>
              </div>
            </div>
            
            <div className="flex-1 relative bg-black/40 rounded-2xl border border-neutral-800 overflow-hidden group">
              {/* Mock visualization placeholder - In a real app we'd use D3 or Recharts */}
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <Network size={120} className="text-neutral-800 animate-pulse" />
              </div>
              
              <div className="absolute inset-0 p-8 flex flex-wrap gap-4 overflow-auto content-start">
                {graph?.entities?.map((entity: any, i: number) => (
                  <motion.div 
                    key={entity.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer hover:scale-105 transition-transform flex items-center gap-2 ${
                      entity.entity_type === 'Topic' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                      entity.entity_type === 'Skill' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                      'bg-green-500/10 border-green-500/20 text-green-400'
                    }`}
                  >
                    {entity.entity_type === 'Topic' ? <BookOpen size={12} /> :
                     entity.entity_type === 'Skill' ? <Target size={12} /> :
                     <Briefcase size={12} />}
                    {entity.name}
                  </motion.div>
                ))}
              </div>

              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex items-center gap-1 text-xs text-blue-400 hover:underline">
                  Open Interactive Graph <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligencePlatform;
