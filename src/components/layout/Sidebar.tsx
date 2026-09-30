import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Code2,
  FolderGit2,
  BrainCircuit,
  RotateCw,
  LineChart,
  Briefcase,
  User,
  ShieldCheck,
  FileCode,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate }) => {
  const { user, flashcards } = useLearningStore();

  const dueCardsCount = flashcards.filter(
    (c) => new Date(c.dueDate).getTime() <= Date.now() + 3600000
  ).length;

  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'learn', label: 'Learn Tracks', icon: GraduationCap, badge: null },
    { id: 'practice', label: 'Practice Problems', icon: Code2, badge: '20+' },
    { id: 'projects', label: 'Projects', icon: FolderGit2, badge: 'Guided' },
    { id: 'mentor', label: 'AI Mentor HQ', icon: BrainCircuit, badge: 'Socratic' },
    { id: 'daily-review', label: 'Daily Review', icon: RotateCw, badge: dueCardsCount > 0 ? `${dueCardsCount}` : null, badgeColor: 'bg-amber-500/20 text-amber-300' },
    { id: 'analytics', label: 'Learning Intelligence', icon: LineChart, badge: null },
    { id: 'career', label: 'Career Prep', icon: Briefcase, badge: 'FAANG' },
    { id: 'profile', label: 'My Profile & XP', icon: User, badge: null },
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Admin Overview', icon: ShieldCheck },
    { id: 'admin-content', label: 'Topic Curriculum', icon: Layers },
    { id: 'admin-problems', label: 'Problem Studio', icon: FileCode },
    { id: 'admin-projects', label: 'Project Studio', icon: FolderGit2 },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col bg-slate-900/60 border-r border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 text-slate-300">
      {/* Learning Journey Step Tracker */}
      <div className="mb-6 p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-950 border border-indigo-500/20 shadow-sm">
        <div className="flex items-center justify-between text-xs mb-1.5 font-semibold text-indigo-300">
          <span>Target Readiness</span>
          <span className="font-mono text-cyan-400">78%</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full w-[78%] rounded-full" />
        </div>
        <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
          <span>Target: <strong className="text-slate-200">{user.targetCompany || 'Google'}</strong></span>
          <span className="text-emerald-400 font-medium">On Track</span>
        </p>
      </div>

      {/* Main Student Navigation */}
      <div className="space-y-1 mb-6">
        <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
          Learning System
        </div>
        {studentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                    item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-indigo-300 border border-indigo-500/20')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Admin Section (Always accessible for easy testing or role toggle) */}
      {user.role === 'admin' && (
        <div className="pt-4 border-t border-slate-800/80 space-y-1 mb-4">
          <div className="px-3 text-[10px] font-bold tracking-wider text-rose-400 uppercase mb-2 flex items-center justify-between">
            <span>Admin Console</span>
            <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 text-[9px] rounded">Staff</span>
          </div>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
                    : 'text-slate-400 hover:text-rose-300 hover:bg-rose-950/20'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            );
          })}
        </div>
      )}

      {/* Footer Info Box */}
      <div className="mt-auto pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="font-mono">ALGORA v2.5</span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          AI Engine Online
        </span>
      </div>
    </aside>
  );
};
