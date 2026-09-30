import React, { useState } from 'react';
import {
  Code2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';
import { ProblemDifficulty, Problem } from '../../types/problem';

interface PracticeLibraryProps {
  onSelectProblem: (problemId: string) => void;
}

export const PracticeLibraryPage: React.FC<PracticeLibraryProps> = ({ onSelectProblem }) => {
  const { problems, userProblemStates } = useLearningStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | ProblemDifficulty>('All');
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'solved' | 'attempted' | 'unsolved'>('All');

  const allCompanies = Array.from(
    new Set(problems.flatMap((p) => p.companies))
  );

  const filteredProblems = problems.filter((p) => {
    const state = userProblemStates[p.id];
    const status = state?.status || 'unsolved';

    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.subtopic.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
    const matchesCompany = selectedCompany === 'All' || p.companies.includes(selectedCompany);
    const matchesStatus = selectedStatus === 'All' || status === selectedStatus;

    return matchesSearch && matchesDiff && matchesCompany && matchesStatus;
  });

  const solvedCount = Object.values(userProblemStates).filter((s) => s.status === 'solved').length;
  const attemptedCount = Object.values(userProblemStates).filter((s) => s.status === 'attempted').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Code2 className="w-4 h-4" />
            <span>Curated Problem Bank</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Practice Challenges</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Filtered by Company, Algorithmic Patterns, and Difficulty. Powered by Socratic hints.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3 text-xs">
            <span className="text-slate-400">Progress:</span>
            <span className="font-mono font-bold text-emerald-400">{solvedCount} Solved</span>
            <span className="text-slate-600">/</span>
            <span className="font-mono text-amber-400">{attemptedCount} In Progress</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search problems, pattern tags (e.g. Two Pointers, DP, Hash Table)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          {/* Difficulty Dropdown */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as any)}
            className="w-full md:w-40 bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy (Green)</option>
            <option value="Medium">Medium (Yellow)</option>
            <option value="Hard">Hard (Red)</option>
          </select>

          {/* Company Filter Dropdown */}
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full md:w-44 bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Companies</option>
            {allCompanies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="w-full md:w-36 bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="solved">Solved</option>
            <option value="attempted">Attempted</option>
            <option value="unsolved">Unsolved</option>
          </select>
        </div>
      </div>

      {/* Problems Table / List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="divide-y divide-slate-800/70">
          {filteredProblems.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Code2 className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs">No problems match your active filter criteria.</p>
            </div>
          ) : (
            filteredProblems.map((problem) => {
              const state = userProblemStates[problem.id];
              const isSolved = state?.status === 'solved';
              const isAttempted = state?.status === 'attempted';

              return (
                <div
                  key={problem.id}
                  onClick={() => onSelectProblem(problem.id)}
                  className="p-4 sm:px-6 hover:bg-slate-800/40 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="shrink-0 mt-0.5 sm:mt-0">
                      {isSolved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isAttempted ? (
                        <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                          {problem.title}
                        </h3>

                        <span
                          className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                            problem.difficulty === 'Easy'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : problem.difficulty === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {problem.difficulty}
                        </span>

                        <span className="text-[10px] text-slate-500 font-mono">
                          {problem.subtopic}
                        </span>
                      </div>

                      {/* Tags & Company Pills */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {problem.companies.slice(0, 3).map((comp) => (
                          <span
                            key={comp}
                            className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px] font-medium"
                          >
                            {comp}
                          </span>
                        ))}
                        {problem.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 text-[9px]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end text-xs">
                    <div className="text-right font-mono text-[11px] text-slate-400 hidden md:block">
                      <span>{problem.acceptanceRate}% Acceptance</span>
                    </div>

                    <span className="px-2 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 text-[11px] font-mono font-bold">
                      +{problem.xpReward} XP
                    </span>

                    <button className="p-2 rounded-xl bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white text-slate-300 transition">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
