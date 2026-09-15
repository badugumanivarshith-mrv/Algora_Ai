import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  Terminal, 
  AlertTriangle, 
  Heart, 
  History, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { aiosApi } from '../../services/aiosApi';

const OperationsCenter: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpsData();
    const interval = setInterval(fetchOpsData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchOpsData = async () => {
    try {
      const [metricsRes, historyRes, alertsRes] = await Promise.all([
        aiosApi.getOpsMetrics(),
        aiosApi.getExecutionHistory(),
        aiosApi.getAlerts()
      ]);
      setMetrics(metricsRes.data);
      setHistory(historyRes.data);
      setAlerts(alertsRes.data);
    } catch (e) {
      console.error('Failed to fetch operational data', e);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (id: string) => {
    try {
      await aiosApi.resolveAlert(id);
      fetchOpsData();
    } catch (e) {
      console.error('Failed to resolve alert', e);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Zap className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-8">
      {/* System Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Activity size={20} />
            </div>
            <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">System Load</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold font-mono">{metrics?.cpu_load?.toFixed(1)}%</span>
            <div className="flex-1 h-2 bg-neutral-800 rounded-full mb-2">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: `${metrics?.cpu_load}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <Database size={20} />
            </div>
            <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Memory Usage</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold font-mono">{metrics?.memory_usage?.toFixed(1)}%</span>
            <div className="flex-1 h-2 bg-neutral-800 rounded-full mb-2">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                style={{ width: `${metrics?.memory_usage}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg">
              <AlertTriangle size={20} />
            </div>
            <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Active Alerts</span>
          </div>
          <div className="text-3xl font-bold font-mono text-orange-400">{alerts.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Execution Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-black/20">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <History size={20} className="text-blue-400" />
                Real-time Execution Timeline
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-neutral-500 uppercase font-bold tracking-widest">Live</span>
              </div>
            </div>
            <div className="divide-y divide-neutral-800/50">
              {history.map((exec) => (
                <div key={exec.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        exec.status === 'Success' ? 'bg-green-500/10 text-green-400' : 
                        exec.status === 'Failed' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {exec.agent_id ? <Cpu size={18} /> : <Zap size={18} />}
                      </div>
                      <div>
                        <div className="font-bold">{exec.agent_name || 'System Orchestration'}</div>
                        <div className="text-xs text-neutral-500 font-mono">{exec.id}</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      exec.status === 'Success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      exec.status === 'Failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      {exec.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-neutral-500 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} />
                      {new Date(exec.started_at).toLocaleTimeString()}
                    </div>
                    {exec.duration_ms && (
                      <div className="flex items-center gap-1.5">
                        <Terminal size={12} />
                        {exec.duration_ms}ms
                      </div>
                    )}
                    {exec.agent_type && (
                      <div className="px-2 py-0.5 bg-neutral-800 rounded text-neutral-400">
                        {exec.agent_type}
                      </div>
                    )}
                    <button className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1 text-blue-400 hover:underline transition-opacity">
                      Inspect <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="p-12 text-center text-neutral-500">
                  No execution history found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Alerts & Health */}
        <div className="space-y-8">
          {/* Active Alerts */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-400" />
              Active Alerts
            </h3>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-xl border ${
                  alert.severity === 'Critical' ? 'bg-red-500/5 border-red-500/20' : 'bg-orange-500/5 border-orange-500/20'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      alert.severity === 'Critical' ? 'text-red-400' : 'text-orange-400'
                    }`}>
                      {alert.severity}
                    </span>
                    <button 
                      onClick={() => resolveAlert(alert.id)}
                      className="text-neutral-500 hover:text-white"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-neutral-200 mb-3 leading-snug">{alert.message}</p>
                  <div className="text-[10px] text-neutral-500 font-mono">
                    {new Date(alert.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="text-green-500" size={24} />
                  </div>
                  <p className="text-sm text-neutral-500 font-medium">All systems normal</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Health Monitor */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Heart size={20} className="text-red-400" />
              Agent Health Score
            </h3>
            <div className="space-y-6">
              {[
                { name: 'Research Agent', score: 98, trend: 'up' },
                { name: 'Learning Agent', score: 94, trend: 'stable' },
                { name: 'Career Agent', score: 82, trend: 'down' },
              ].map((agent, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold">{agent.name}</span>
                    <span className={`font-mono ${
                      agent.score > 90 ? 'text-green-400' : agent.score > 80 ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      {agent.score}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${agent.score}%` }}
                      className={`h-full rounded-full ${
                        agent.score > 90 ? 'bg-green-500' : agent.score > 80 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
              Detailed Health Report
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationsCenter;
