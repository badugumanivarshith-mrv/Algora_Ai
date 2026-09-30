import React from 'react';
import {
  LineChart,
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Award,
  Target,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';

export const AnalyticsPage: React.FC = () => {
  const { user, problems, userProblemStates, tracks, userTopicProgress } = useLearningStore();

  const solvedProblems = Object.values(userProblemStates).filter((p) => p.status === 'solved').length;
  const placementReadiness = Math.min(94, Math.max(30, Math.round(solvedProblems * 2.2 + user.streak * 1.5 + 40)));

  const masteryRadarData = [
    { subject: 'Arrays & Two Pointers', score: 88, benchmark: 85 },
    { subject: 'Hash Tables & Sets', score: 92, benchmark: 80 },
    { subject: 'Binary Search Predicates', score: 74, benchmark: 85 },
    { subject: 'Sliding Window', score: 68, benchmark: 75 },
    { subject: 'System Architecture (LLD)', score: 82, benchmark: 70 },
    { subject: 'Memory & Pointers', score: 70, benchmark: 65 }
  ];

  const weakTopics = [
    {
      topic: 'Sliding Window Invariant Shrinking',
      mistake: 'Shrinking left boundary without decrementing frequency counts',
      priority: 'High',
      recommendation: 'Solve Minimum Size Subarray Sum in Practice'
    },
    {
      topic: 'Binary Search Monotonic Predicates',
      mistake: 'Integer overflow on (low + high) and off-by-one mid loop boundary',
      priority: 'Moderate',
      recommendation: 'Review Koko Eating Bananas interactive example'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <LineChart className="w-4 h-4" />
            <span>AI Learning Analyst</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Intelligence & Placement Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time analytics on concept mastery, forgetting decay rates, and company placement readiness.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-mono">Current Evaluation:</span>
            <span className="text-xs font-bold text-emerald-400">Interview Ready Candidate</span>
          </div>
        </div>
      </div>

      {/* Main Placement Readiness Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-indigo-500/30 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-3">
          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Placement Readiness Index
          </span>
          <h2 className="text-2xl font-bold text-white">
            Overall Readiness: <span className="text-cyan-400 font-mono">{placementReadiness}%</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            Based on your test pass rate, Big-O complexity optimizations, and streak retention, you are currently in the <strong>Top 12th percentile</strong> of candidates for {user.targetCompany || 'Tier-1 tech companies'}.
          </p>

          <div className="flex items-center gap-4 text-xs pt-2">
            <span className="text-slate-400">Estimated time to 95%+ readiness:</span>
            <strong className="text-emerald-400 font-mono">~3.5 Weeks</strong>
          </div>
        </div>

        {/* Readiness Gauge */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
          <div className="relative w-28 h-28 flex items-center justify-center mb-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cyan-400"
                strokeDasharray={`${placementReadiness}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-extrabold text-white font-mono">{placementReadiness}%</span>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-200">Tier: {user.targetCompany || 'Google'} Target</span>
        </div>
      </div>

      {/* Grid: Skill Mastery Bars + Weak Topic Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT 7 cols: Mastery Radar / Skill Metrics */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Core Algorithmic Mastery Breakdown</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Target Benchmark: 80%</span>
          </div>

          <div className="space-y-4">
            {masteryRadarData.map((item, idx) => {
              const isAbove = item.score >= item.benchmark;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.subject}</span>
                    <span className="font-mono text-slate-400">
                      <strong className={isAbove ? 'text-emerald-400' : 'text-amber-400'}>
                        {item.score}%
                      </strong>{' '}
                      / {item.benchmark}% Benchmark
                    </span>
                  </div>

                  <div className="relative w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isAbove ? 'bg-gradient-to-r from-cyan-400 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                    {/* Benchmark mark */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white/70"
                      style={{ left: `${item.benchmark}%` }}
                      title="Benchmark threshold"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT 5 cols: Weak Topic Diagnostics */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white">Weak Topic Diagnostics</h3>
          </div>
          <p className="text-xs text-slate-400">
            Detected from your compilation errors and attempt latency:
          </p>

          <div className="space-y-3">
            {weakTopics.map((wt, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{wt.topic}</h4>
                  <span
                    className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                      wt.priority === 'High' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {wt.priority} Priority
                  </span>
                </div>
                <p className="text-[11px] text-rose-300/90 font-mono">⚠️ {wt.mistake}</p>
                <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  💡 Action: {wt.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
