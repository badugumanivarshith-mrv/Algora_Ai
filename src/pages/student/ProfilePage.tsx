import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Flame,
  Award,
  Trophy,
  Target,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Lock,
  Save
} from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';
import confetti from 'canvas-confetti';

export const ProfilePage: React.FC = () => {
  const { user, setUser, badges, leaderboard, userProblemStates } = useLearningStore();

  const [name, setName] = useState(user.name);
  const [targetCompany, setTargetCompany] = useState(user.targetCompany || 'Google');
  const [targetRole, setTargetRole] = useState(user.targetRole || 'Software Engineer (SDE I)');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(user.dailyGoalMinutes);
  const [savedStatus, setSavedStatus] = useState(false);

  const solvedCount = Object.values(userProblemStates).filter((s) => s.status === 'solved').length;
  const xpForNextLevel = 800;
  const currentLevelXp = user.xp % xpForNextLevel;

  const handleSaveProfile = () => {
    setUser((prev) => ({
      ...prev,
      name,
      targetCompany,
      targetRole,
      dailyGoalMinutes
    }));
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Profile Header Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-lg"
          />
          <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider">
            Lvl {user.level}
          </span>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center md:justify-start">
            <h1 className="text-2xl font-extrabold text-white">{user.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {user.role.toUpperCase()}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">{user.bio}</p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs font-mono">
            <span className="text-slate-400">
              Target: <strong className="text-cyan-400">{user.targetCompany} ({user.targetRole})</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              Streak: <strong className="text-orange-400">{user.streak} Days</strong> (Longest: {user.longestStreak}d)
            </span>
          </div>
        </div>

        {/* Level & XP Gauge */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[160px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Current Tier
          </span>
          <div className="text-2xl font-mono font-extrabold text-cyan-400 mt-0.5">
            Level {user.level}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            {currentLevelXp} / {xpForNextLevel} XP
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-cyan-400 h-full rounded-full"
              style={{ width: `${(currentLevelXp / xpForNextLevel) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges & Achievements Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Badges & Achievements ({badges.filter((b) => b.progress >= b.maxProgress).length}/{badges.length})</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Earned by solving & retaining</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const isUnlocked = badge.progress >= badge.maxProgress;
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-slate-900/80 border-amber-500/30 text-white'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60 text-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                        badge.tier === 'platinum'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : badge.tier === 'gold'
                          ? 'bg-amber-500/20 text-amber-300'
                          : badge.tier === 'silver'
                          ? 'bg-slate-700 text-slate-200'
                          : 'bg-orange-500/20 text-orange-300'
                      }`}
                    >
                      {badge.tier}
                    </span>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-white mt-1">{badge.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{badge.description}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>Progress:</span>
                  <span>{badge.progress} / {badge.maxProgress}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Global Leaderboard + Learning Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Leaderboard (Left 6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Global SDE Placement Leaderboard</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Weekly XP</span>
          </div>

          <div className="divide-y divide-slate-800/70">
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`py-3 flex items-center justify-between ${
                  entry.isCurrentUser ? 'bg-indigo-950/30 px-3 rounded-xl border border-indigo-500/30' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 text-center font-mono font-bold text-xs ${
                    entry.rank === 1 ? 'text-amber-400' : entry.rank === 2 ? 'text-slate-300' : entry.rank === 3 ? 'text-orange-400' : 'text-slate-500'
                  }`}>
                    #{entry.rank}
                  </span>
                  <img src={entry.avatarUrl} alt={entry.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{entry.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{entry.solvedCount} Solved • {entry.streak}d Streak</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-cyan-400">
                  {entry.xp} XP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Preferences & Goals (Right 6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>Target Company & Goal Settings</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Your Full Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Target Tech Company:</label>
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Google">Google (Tier 1)</option>
                <option value="Amazon">Amazon (Tier 1)</option>
                <option value="Microsoft">Microsoft (Tier 1)</option>
                <option value="Adobe">Adobe (Creative Tech)</option>
                <option value="Oracle">Oracle (Cloud / Systems)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Target Engineering Role:</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Daily Commitment Target:</label>
              <select
                value={dailyGoalMinutes}
                onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={30}>30 mins / day (Steady)</option>
                <option value={45}>45 mins / day (Accelerated)</option>
                <option value={60}>60 mins / day (Placement Intensive)</option>
                <option value={90}>90 mins / day (Hardcore FAANG Sprint)</option>
              </select>
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savedStatus ? 'Saved Successfully!' : 'Save Learning Goals'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
