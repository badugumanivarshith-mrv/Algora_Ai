import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  BookOpenCheck,
  TrendingUp,
  BrainCircuit,
  Target,
  Clock,
  Play,
  Award,
  ChevronRight,
  AlertTriangle,
  FolderGit2,
  Code2
} from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';

interface DashboardPageProps {
  onNavigate: (tab: string, contextId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const {
    user,
    tracks,
    problems,
    projects,
    flashcards,
    userProblemStates,
    userProjectProgress,
    userTopicProgress,
    setIsMentorDrawerOpen,
    setMentorMode
  } = useLearningStore();

  const dueCards = flashcards.filter(
    (c) => new Date(c.dueDate).getTime() <= Date.now() + 3600000
  );

  const solvedCount = Object.values(userProblemStates).filter((p) => p.status === 'solved').length;
  const attemptedCount = Object.values(userProblemStates).filter((p) => p.status === 'attempted').length;

  // Next Adaptive Recommendation:
  const activeTrack = tracks.find((t) => t.id === 'track-python') || tracks[0];
  const nextTopic = activeTrack.topics.find((t) => (userTopicProgress[t.id]?.masteryScore || 0) < 80) || activeTrack.topics[0];

  const inProgressProject = projects.find((p) => userProjectProgress[p.id]?.status === 'in_progress') || projects[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner: Welcome & Adaptive Next Action */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Adaptive Learning Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user.name.split(' ')[0]}! 🚀
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              You are currently on a <strong className="text-orange-400">{user.streak}-day streak</strong> aiming for{' '}
              <strong className="text-cyan-400">{user.targetCompany || 'Tier-1 Tech'} ({user.targetRole || 'SDE I'})</strong>.
            </p>

            {/* Next Recommended Step Card */}
            <div className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mt-0.5">
                  <Play className="w-5 h-5 fill-indigo-400" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Recommended Next Step
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{nextTopic.title}</h3>
                  <p className="text-xs text-slate-400">{nextTopic.summary}</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('learn-topic', nextTopic.id)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold whitespace-nowrap shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-1.5"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Readiness Radar / Gauge */}
          <div className="shrink-0 p-5 rounded-xl bg-slate-950/90 border border-slate-800 text-center flex flex-col items-center justify-center min-w-[200px]">
            <div className="relative w-24 h-24 flex items-center justify-center mb-2">
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
                  strokeDasharray="78, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-white font-mono">78%</span>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-200">Placement Ready</span>
            <span className="text-[10px] text-emerald-400 font-medium mt-0.5">Top 15% Candidate</span>
            <button
              onClick={() => onNavigate('analytics')}
              className="mt-3 text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View Diagnostics</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Due Alert Bar */}
      {dueCards.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
              <BookOpenCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-200">
                {dueCards.length} Knowledge Flashcards Due for Spaced Review Today
              </h4>
              <p className="text-[11px] text-slate-400">
                Active recall review prevents the Ebbinghaus forgetting curve. Keep your mastery fresh.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('daily-review')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shrink-0"
          >
            Review Now
          </button>
        </div>
      )}

      {/* 4 Metrics Highlight Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Problems Solved', val: `${solvedCount} / ${problems.length}`, sub: `${attemptedCount} attempted`, icon: Code2, color: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-500/20' },
          { label: 'XP Accumulated', val: `${user.xp} XP`, sub: `Level ${user.level} Engineer`, icon: Sparkles, color: 'text-cyan-400', bg: 'bg-cyan-950/20 border-cyan-500/20' },
          { label: 'Learning Streak', val: `${user.streak} Days`, sub: `Max: ${user.longestStreak} days`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-950/20 border-orange-500/20' },
          { label: 'Project Milestones', val: '2 Completed', sub: 'Scientific Calculator', icon: FolderGit2, color: 'text-indigo-400', bg: 'bg-indigo-950/20 border-indigo-500/20' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`p-4 rounded-xl border ${stat.bg} bg-slate-900/50 backdrop-blur-sm`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-400 font-medium">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-xl font-bold text-white font-mono">{stat.val}</div>
              <div className="text-[10px] text-slate-400 mt-1">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Learning Tracks + AI Analyst Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Active Tracks & Recent Practice */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Learning Tracks */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Your Learning Tracks</h3>
                <p className="text-[11px] text-slate-400">Sequential curriculum with prerequisite locks</p>
              </div>
              <button
                onClick={() => onNavigate('learn')}
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View All Tracks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {tracks.slice(0, 3).map((track) => (
                <div
                  key={track.id}
                  onClick={() => onNavigate('learn')}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                          {track.title}
                        </h4>
                        <span className="px-1.5 py-0.2 text-[9px] rounded bg-slate-800 text-slate-400">
                          {track.difficulty}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{track.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {track.completedTopics}/{track.totalTopics} Topics
                    </span>
                    <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-cyan-400 h-full rounded-full"
                        style={{ width: `${(track.completedTopics / track.totalTopics) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Project Build Spotlight */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Real-World Project
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{inProgressProject.title}</h3>
              </div>
              <button
                onClick={() => onNavigate('project-detail', inProgressProject.id)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-1"
              >
                <span>Open Project Workbench</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4">{inProgressProject.summary}</p>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-300">
                  Milestone 1 completed: <strong>Lexical Tokenizer</strong>
                </span>
              </div>
              <span className="text-xs font-mono text-indigo-400 font-bold">+250 XP Reward</span>
            </div>
          </div>

        </div>

        {/* Right 1 Col: AI Learning Analyst Diagnostics & Socratic Prompts */}
        <div className="space-y-6">
          
          {/* AI Learning Analyst Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300">
                AI Learning Analyst
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Weak Topic Diagnostic</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  You took 3 attempts on <em>Container With Most Water</em>. Recommend revisiting greedy pointer convergence invariants.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                <div className="flex items-center gap-1.5 text-indigo-300 font-bold mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Learning Velocity Forecast</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  At your current 45 min/day pace, you will reach full Google Interview Readiness in <strong>4.2 weeks</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setMentorMode('learn');
                setIsMentorDrawerOpen(true);
              }}
              className="mt-4 w-full py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Ask AI Mentor for Diagnostic Tips</span>
            </button>
          </div>

          {/* Quick Company Track Spotlight */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white">Target Company Focus</h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Google Track
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Google interviews weigh Tree/Graph traversals and Binary Search predicates heavily.
            </p>
            <button
              onClick={() => onNavigate('career')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              Explore Company Tracks & Mock Arena
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
