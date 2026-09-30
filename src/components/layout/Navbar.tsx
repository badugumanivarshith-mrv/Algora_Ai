import React from 'react';
import { 
  Flame, 
  Sparkles, 
  BrainCircuit, 
  ShieldAlert, 
  User as UserIcon,
  Bell,
  Search,
  BookOpenCheck
} from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { 
    user, 
    toggleUserRole, 
    flashcards, 
    setIsMentorDrawerOpen, 
    isMentorDrawerOpen 
  } = useLearningStore();

  const dueFlashcardsCount = flashcards.filter(
    (c) => new Date(c.dueDate).getTime() <= Date.now() + 3600000
  ).length;

  const xpProgress = (user.xp % 800) / 800 * 100;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[2px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-mono font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              ⟁
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white font-mono">ALGORA</span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded">
                AI Powered
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">Personalized Coding Engine</span>
          </div>
        </div>

        {/* Center: Global Search & Quick Status */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search problems, topics, algorithms, companies..."
              onClick={() => onNavigate('practice')}
              className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-lg pl-10 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">⌘K</kbd>
            </div>
          </div>
        </div>

        {/* Right: Gamification & Action Center */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Daily Review Reminder Badge */}
          {dueFlashcardsCount > 0 && (
            <button
              onClick={() => onNavigate('daily-review')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition animate-pulse"
              title="Spaced repetition cards due today"
            >
              <BookOpenCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{dueFlashcardsCount} Due</span>
            </button>
          )}

          {/* Streak Indicator */}
          <div 
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 text-xs font-bold cursor-pointer hover:bg-orange-500/20 transition"
            title={`${user.streak} Day Learning Streak`}
          >
            <Flame className="w-4 h-4 text-orange-400 fill-orange-500" />
            <span>{user.streak}d</span>
          </div>

          {/* XP & Level Badge */}
          <div 
            onClick={() => onNavigate('profile')}
            className="hidden sm:flex flex-col items-end cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Level {user.level}</span>
              <span className="text-[11px] text-slate-400 font-mono">({user.xp} XP)</span>
            </div>
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>

          {/* AI Mentor Floating Drawer Toggle */}
          <button
            onClick={() => setIsMentorDrawerOpen(!isMentorDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm ${
              isMentorDrawerOpen 
                ? 'bg-violet-600 text-white shadow-violet-500/30' 
                : 'bg-violet-500/10 text-violet-300 border border-violet-500/30 hover:bg-violet-500/20'
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-violet-400" />
            <span className="hidden sm:inline">AI Mentor</span>
          </button>

          {/* Role Switcher Pill */}
          <button
            onClick={toggleUserRole}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider transition ${
              user.role === 'admin'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
            title="Toggle between Student and Admin viewpoints"
          >
            {user.role}
          </button>

          {/* Profile Avatar */}
          <div 
            onClick={() => onNavigate('profile')}
            className="relative cursor-pointer ring-2 ring-slate-700 hover:ring-indigo-500 rounded-full transition"
          >
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-8 h-8 rounded-full object-cover" 
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>

        </div>

      </div>
    </header>
  );
};
