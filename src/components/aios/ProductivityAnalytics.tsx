import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Clock, Zap, Target, ArrowUpRight, ArrowDownRight, Activity, MousePointer2, Timer } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { aiosApi } from '../../services/aiosApi';

const MetricCard = ({ title, value, unit, change, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <span className="text-xs text-gray-400 font-medium">{unit}</span>
        </div>
      </div>
      <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    
    <div className="mt-4 flex items-center gap-2 relative z-10">
      <span className={`flex items-center text-xs font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        {Math.abs(change)}%
      </span>
      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">vs last week</span>
    </div>

    {/* Decorative Background Blob */}
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${color}-50 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity`} />
  </div>
);

const ProductivityAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await aiosApi.getProductivityAnalytics();
      setAnalytics(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
    </div>
  );

  const metrics = analytics?.metrics || [];
  const chartData = [...metrics].reverse().map((m: any) => ({
    date: new Date(m.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
    tasks: m.tasks_completed,
    workflows: m.workflows_executed,
    actions: m.agent_actions
  }));

  const summary = analytics?.summary || { tasksCompleted: 0, workflowsExecuted: 0, timeSavedMinutes: 0 };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Tasks Completed" 
          value={summary.tasksCompleted} 
          unit="Total" 
          change={12.5} 
          icon={Target} 
          color="indigo" 
        />
        <MetricCard 
          title="Workflows Run" 
          value={summary.workflowsExecuted} 
          unit="Total" 
          change={8.2} 
          icon={Zap} 
          color="amber" 
        />
        <MetricCard 
          title="Time Saved" 
          value={summary.timeSavedMinutes} 
          unit="Min" 
          change={15.4} 
          icon={Timer} 
          color="green" 
        />
        <MetricCard 
          title="Avg Success Rate" 
          value="98.5" 
          unit="%" 
          change={0.4} 
          icon={Activity} 
          color="blue" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Productivity Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Activity Trends</h3>
              <p className="text-sm text-gray-500">Task and workflow execution history</p>
            </div>
            <select className="bg-gray-50 border-none text-sm font-bold rounded-lg px-3 py-1.5 focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTasks)" 
                  name="Tasks"
                />
                <Area 
                  type="monotone" 
                  dataKey="workflows" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  fill="transparent"
                  name="Workflows"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Integrations / Agent Activity */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Efficiency Pulse</h3>
          
          <div className="space-y-6 flex-1">
            {[
              { label: 'Integration Sync', value: 92, color: 'indigo' },
              { label: 'Agent Response Time', value: 88, color: 'green' },
              { label: 'Automation Coverage', value: 65, color: 'amber' },
              { label: 'Workflow Reliability', value: 99, color: 'blue' },
            ].map((pulse, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-gray-600">{pulse.label}</span>
                  <span className={`text-${pulse.color}-600`}>{pulse.value}%</span>
                </div>
                <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pulse.value}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className={`h-full bg-${pulse.color}-600 rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-indigo-900">Optimization Tip</h4>
            </div>
            <p className="text-sm text-indigo-700 leading-relaxed">
              Your "GitHub to Project" workflow is failing 15% more than average. Try adjusting the AI condition threshold.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityAnalytics;
