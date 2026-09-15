import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Terminal, 
  Target, 
  Layers, 
  Zap, 
  Activity, 
  History, 
  Settings, 
  Plus, 
  Send,
  Play,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Brain,
  Rocket,
  Shield,
  Search,
  Link2,
  CheckSquare,
  BarChart3,
  Network,
  Compass,
  Building2,
  DollarSign
} from 'lucide-react';
import { aiosApi } from '../services/aiosApi';
import AgentBuilder from '../components/aios/AgentBuilder';
import Marketplace from '../components/aios/Marketplace';
import WorkflowEngine from '../components/aios/WorkflowEngine';
import AgentTeams from '../components/aios/AgentTeams';
import Integrations from '../components/aios/Integrations';
import Automations from '../components/aios/Automations';
import Tasks from '../components/aios/Tasks';
import ProductivityAnalytics from '../components/aios/ProductivityAnalytics';
import OperationsCenter from '../components/aios/OperationsCenter';
import IntelligencePlatform from '../components/aios/IntelligencePlatform';
import ExecutiveDashboard from '../components/aios/ExecutiveDashboard';
import ExecutionCenter from '../components/aios/ExecutionCenter';
import { SimulationCenter } from '../components/aios/SimulationCenter';
import { TalentMarketplace } from '../components/aios/TalentMarketplace';

const AIOSHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('command');
  const [intent, setIntent] = useState('');
  const [agents, setAgents] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [agentsData, goalsData, recsData, analyticsData] = await Promise.all([
        aiosApi.getAgents(),
        aiosApi.getGoals(),
        aiosApi.getRecommendations(),
        aiosApi.getAnalytics()
      ]);
      setAgents(agentsData.data || []);
      setGoals(goalsData.data || []);
      setRecs(recsData.data || []);
      setAnalytics(analyticsData.data || []);
    } catch (e) {
      console.error('Failed to fetch AI OS data', e);
    }
  };

  const handleExecute = async () => {
    if (!intent) return;
    setIsExecuting(true);
    try {
      const res = await aiosApi.executeAgent(intent);
      setExecutionResult(res.data);
      setIntent('');
      fetchData();
    } catch (e) {
      console.error('Execution failed', e);
    } finally {
      setIsExecuting(false);
    }
  };

  const tabs = [
    { id: 'command', label: 'Command Center', icon: Terminal },
    { id: 'talent', label: 'Talent & Reputation', icon: DollarSign },
    { id: 'simulation', label: 'Enterprise Simulation', icon: Building2 },
    { id: 'execution', label: 'Execution Center', icon: Rocket },
    { id: 'executive', label: 'AI Executive', icon: Compass },
    { id: 'ops', label: 'Ops Center', icon: Activity },
    { id: 'intelligence', label: 'Knowledge Fabric', icon: Network },
    { id: 'builder', label: 'Agent Builder', icon: Plus },
    { id: 'agents', label: 'My Agents', icon: Cpu },
    { id: 'marketplace', label: 'Marketplace', icon: Search },
    { id: 'workflows', label: 'Workflows', icon: Layers },
    { id: 'teams', label: 'Agent Teams', icon: Shield },
    { id: 'goals', label: 'Long-term Goals', icon: Target },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'productivity', label: 'Productivity', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
                <Shield size={20} />
              </div>
              <h1 className="text-3xl font-display font-bold tracking-tight">Algora AI OS</h1>
            </div>
            <p className="text-neutral-500">Autonomous planning and multi-agent orchestration ecosystem.</p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl">
              <span className="text-xs text-neutral-500 uppercase font-bold tracking-wider block mb-1">System Health</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-bold">Stable v4.0</span>
              </div>
            </div>
          </div>
        </header>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Active Agents', value: agents.length, icon: Cpu, color: 'text-blue-400' },
            { label: 'Pending Goals', value: goals.filter(g => g.status === 'Active').length, icon: Target, color: 'text-purple-400' },
            { label: 'Completed Tasks', value: analytics?.completedGoals || 0, icon: CheckCircle2, color: 'text-green-400' },
            { label: 'Productivity', value: `${analytics?.productivityScore || 0}%`, icon: TrendingUp, color: 'text-orange-400' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <stat.icon className={stat.color} size={24} />
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold font-mono">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-12 overflow-x-auto pb-4 scrollbar-hide border-b border-neutral-800/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'command' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
                      <div className="flex items-center gap-4 mb-8">
                        <Terminal className="text-blue-400" />
                        <h2 className="text-xl font-bold">OS Terminal</h2>
                      </div>
                      <div className="space-y-6">
                        <div className="relative">
                          <textarea
                            value={intent}
                            onChange={(e) => setIntent(e.target.value)}
                            placeholder="Type a goal or command (e.g., 'Plan my learning path for Next.js and secure an internship')"
                            className="w-full h-40 bg-black/50 border border-neutral-800 rounded-2xl p-6 font-mono text-lg outline-none focus:border-blue-500/50 transition-all resize-none"
                          />
                          <button 
                            onClick={handleExecute}
                            disabled={isExecuting || !intent}
                            className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
                          >
                            {isExecuting ? <Zap className="animate-spin" size={18} /> : <Send size={18} />}
                            Execute
                          </button>
                        </div>

                        {executionResult && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl"
                          >
                            <div className="flex items-center gap-2 mb-4 text-blue-400 font-bold">
                              <Brain size={20} />
                              <span>AI Execution Result</span>
                            </div>
                            <div className="text-neutral-300 leading-relaxed font-mono whitespace-pre-wrap">
                              {executionResult}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
                      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <History size={20} className="text-neutral-500" />
                        Execution History
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-black/30 rounded-xl border border-neutral-800">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="font-mono text-sm">Learning Path Orchestration</span>
                          </div>
                          <span className="text-xs text-neutral-500">2 minutes ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
                      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Rocket size={20} className="text-orange-400" />
                        Next Steps
                      </h3>
                      <div className="space-y-4">
                        {recs.slice(0, 3).map((rec, i) => (
                          <div key={i} className="p-4 bg-black/30 rounded-xl border border-neutral-800 hover:border-orange-500/30 transition-all cursor-pointer group">
                            <div className="text-xs font-bold text-orange-400 uppercase mb-1">{rec.category}</div>
                            <div className="font-bold mb-2 group-hover:text-orange-400 transition-colors">{rec.title}</div>
                            <div className="text-sm text-neutral-500 line-clamp-2">{rec.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-600 rounded-3xl p-8 text-white">
                      <h3 className="text-lg font-bold mb-4">Master AI OS</h3>
                      <p className="text-blue-100 text-sm mb-6">Learn how to configure autonomous workflows and multi-agent systems for maximum efficiency.</p>
                      <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                        Read Docs
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'agents' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agents.map((agent) => (
                    <div key={agent.id} className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl hover:border-blue-500/50 transition-all group">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-neutral-800 text-blue-400 rounded-2xl group-hover:bg-blue-500/20 transition-colors">
                          <Cpu size={24} />
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          {agent.status}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
                      <p className="text-neutral-500 text-sm mb-6">Specialized in autonomous {agent.agent_type.toLowerCase()} orchestration and monitoring.</p>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-bold transition-colors">Configure</button>
                        <button className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"><Settings size={18} /></button>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setActiveTab('builder')}
                    className="border-2 border-dashed border-neutral-800 p-8 rounded-3xl flex flex-col items-center justify-center text-neutral-500 hover:text-white hover:border-neutral-700 transition-all group"
                  >
                    <div className="p-4 bg-neutral-900 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                      <Plus size={32} />
                    </div>
                    <span className="font-bold">Deploy New Agent</span>
                  </button>
                </div>
              )}

              {activeTab === 'builder' && <AgentBuilder onCreated={fetchData} />}
              {activeTab === 'marketplace' && <Marketplace />}
              {activeTab === 'workflows' && <WorkflowEngine />}
              {activeTab === 'teams' && <AgentTeams />}

              {activeTab === 'goals' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {goals.map((goal) => (
                    <div key={goal.id} className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl">
                      <div className="flex items-center gap-2 mb-4 text-purple-400">
                        <Target size={20} />
                        <span className="text-xs font-bold uppercase">{goal.category}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{goal.title}</h3>
                      <p className="text-neutral-500 text-sm mb-6">{goal.description}</p>
                      <div className="w-full bg-neutral-800 h-2 rounded-full mb-2">
                        <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-neutral-500 font-mono">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-8">
                  <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                      <Activity className="text-blue-400" />
                      Agent Execution Analytics
                    </h3>
                    <div className="space-y-6">
                      {analytics.map((stat: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-black/30 rounded-2xl border border-neutral-800">
                          <div>
                            <div className="text-sm font-bold text-neutral-400 mb-1">
                              {stat.agent_id ? `Agent: ${stat.agent_id}` : `Workflow: ${stat.workflow_id}`}
                            </div>
                            <div className="flex gap-4 text-xs font-mono">
                              <span className="text-blue-400">Executions: {stat.execution_count}</span>
                              <span className="text-green-400">Success: {stat.success_count}</span>
                              <span className="text-red-400">Failures: {stat.failure_count}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold font-mono">
                              {((stat.success_count / stat.execution_count) * 100).toFixed(1)}%
                            </div>
                            <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Success Rate</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'talent' && <TalentMarketplace />}
              {activeTab === 'simulation' && <SimulationCenter />}
              {activeTab === 'ops' && <OperationsCenter />}
              {activeTab === 'execution' && <ExecutionCenter />}
              {activeTab === 'executive' && <ExecutiveDashboard />}
              {activeTab === 'intelligence' && <IntelligencePlatform />}
              {activeTab === 'integrations' && <Integrations />}
              {activeTab === 'automations' && <Automations />}
              {activeTab === 'tasks' && <Tasks />}
              {activeTab === 'productivity' && <ProductivityAnalytics />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AIOSHub;
