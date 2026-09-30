import React from 'react';
import {
  ShieldCheck,
  Users,
  Code2,
  FolderGit2,
  BookOpen,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { tracks, problems, projects } = useLearningStore();

  const totalTopics = tracks.reduce((acc, t) => acc + t.totalTopics, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Staff Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Platform Overview</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Curriculum authoring, problem bank studio, and project milestone management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('admin-problems')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-rose-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Problem</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Tracks', count: tracks.length, icon: BookOpen, color: 'text-indigo-400' },
          { label: 'Curriculum Topics', count: totalTopics, icon: Activity, color: 'text-cyan-400' },
          { label: 'Practice Problems', count: problems.length, icon: Code2, color: 'text-emerald-400' },
          { label: 'Guided Projects', count: projects.length, icon: FolderGit2, color: 'text-amber-400' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{item.count}</div>
            </div>
          );
        })}
      </div>

      {/* Admin Quick Action Hubs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigate('admin-content')}
          className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition space-y-3 group"
        >
          <div className="p-3 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
            Curriculum & Track Management
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Add topics, edit 8-stage pedagogical notes, write interactive examples, and configure prerequisite trees.
          </p>
          <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1 pt-2">
            <span>Manage Tracks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => onNavigate('admin-problems')}
          className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition space-y-3 group"
        >
          <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Code2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
            Problem Bank Studio
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Author coding challenges with test cases, Socratic hint ladders (Level 1-4), starter templates, and company tags.
          </p>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 pt-2">
            <span>Manage Problems</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => onNavigate('admin-projects')}
          className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition space-y-3 group"
        >
          <div className="p-3 w-fit rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
            Project Architecture Studio
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Create milestone blueprints, evaluation rubrics, task checklists, and architecture diagrams.
          </p>
          <span className="text-xs text-amber-400 font-semibold flex items-center gap-1 pt-2">
            <span>Manage Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
