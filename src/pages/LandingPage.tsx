import React from 'react';
import { 
  Terminal, 
  BrainCircuit, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Briefcase, 
  ArrowRight, 
  Code2, 
  FolderGit2, 
  Layers, 
  Star,
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onStartLearning: () => void;
  onExploreTracks: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartLearning, onExploreTracks }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[2px]">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-mono font-bold text-base text-cyan-400">
                ⟁
              </div>
            </div>
            <span className="font-extrabold text-xl tracking-wider text-white font-mono">ALGORA</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#journey" className="hover:text-cyan-400 transition">Learning Journey</a>
            <a href="#tracks" className="hover:text-cyan-400 transition">Tracks</a>
            <a href="#mentor" className="hover:text-cyan-400 transition">Socratic AI</a>
            <a href="#projects" className="hover:text-cyan-400 transition">Guided Projects</a>
            <a href="#career" className="hover:text-cyan-400 transition">Placement Hub</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onStartLearning}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 flex flex-col items-center text-center">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/20 to-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />

        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>The Next Evolution of Coding Education</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
          Master Coding with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400">
            Socratic AI & Guided Milestones
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
          From your first variable to placement at top tech companies. 
          ALGORA gives you an adaptive roadmap, real-world project builds, spaced repetition memory retention, and a 24/7 AI mentor that coaches rather than spoils.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onStartLearning}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-90 text-white shadow-xl shadow-indigo-500/25 transition flex items-center justify-center gap-2"
          >
            <span>Start Learning Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onExploreTracks}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          >
            Explore Curriculum & Tracks
          </button>
        </div>

        {/* Quick Trust Badges */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl text-left">
          {[
            { label: 'Socratic AI Guidance', desc: 'Hint → Approach → Algorithm', icon: BrainCircuit, color: 'text-violet-400' },
            { label: 'Guided Real Projects', desc: 'Calculator to Online Judge', icon: FolderGit2, color: 'text-emerald-400' },
            { label: 'Spaced Repetition', desc: 'SM-2 Active Recall Flashcards', icon: Sparkles, color: 'text-amber-400' },
            { label: 'FAANG Career Tracks', desc: 'Amazon, Google, Microsoft Prep', icon: Briefcase, color: 'text-cyan-400' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
                <Icon className={`w-5 h-5 ${item.color} mb-2`} />
                <h4 className="text-xs font-bold text-white">{item.label}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Learning Journey Section */}
      <section id="journey" className="py-16 bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400">The ALGORA Methodology</h2>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1">The 7-Stage Learning Engine</p>
            <p className="text-xs text-slate-400 mt-2">Every topic enforces sequential mastery. Never get stuck, never forget what you studied.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { step: '01', title: 'Learn', desc: 'Concept & syntax deep-dive', color: 'border-blue-500/40 bg-blue-950/20 text-blue-400' },
              { step: '02', title: 'Practice', desc: 'Targeted coding challenges', color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-400' },
              { step: '03', title: 'Assignment', desc: 'Evaluate edge cases', color: 'border-indigo-500/40 bg-indigo-950/20 text-indigo-400' },
              { step: '04', title: 'Project', desc: 'Real architecture milestones', color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400' },
              { step: '05', title: 'Revision', desc: 'Spaced repetition flashcards', color: 'border-amber-500/40 bg-amber-950/20 text-amber-400' },
              { step: '06', title: 'Interview', desc: 'FAANG mock grilling', color: 'border-rose-500/40 bg-rose-950/20 text-rose-400' },
              { step: '07', title: 'Ready', desc: 'Placement readiness score', color: 'border-teal-500/40 bg-teal-950/20 text-teal-300' }
            ].map((st, i) => (
              <div key={i} className={`p-3.5 rounded-xl border ${st.color} flex flex-col justify-between`}>
                <div>
                  <span className="font-mono text-xs font-extrabold opacity-60">STAGE {st.step}</span>
                  <h4 className="text-sm font-bold text-white mt-1">{st.title}</h4>
                </div>
                <p className="text-[11px] text-slate-300 mt-2">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Socratic AI Differentiator Section */}
      <section id="mentor" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-4">
              <BrainCircuit className="w-4 h-4 text-violet-400" />
              <span>AI That Teaches, Not Solves</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              A Senior Mentor in Your Pocket. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                Socratic Scaffolding
              </span>
            </h2>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Standard AI chatbots hand you code, ruining your problem-solving intuition. ALGORA AI Mentor uses Socratic scaffolding: offering subtle conceptual nudges, high-level algorithms, and skeleton scaffolds before ever showing a full solution.
            </p>

            <div className="mt-6 space-y-3">
              {[
                { title: 'Learn Mode', text: 'Mental models, visual execution traces, and syntax breakdowns.' },
                { title: 'Practice Mode', text: '5-tier Socratic ladder (Hint → Approach → Algorithm → Pseudocode → Partial Code).' },
                { title: 'Project Mode', text: 'Staff engineer architecture guidance, clean code review, and unit tests.' },
                { title: 'Interview Mode', text: 'Simulates strict FAANG interviewers with complexity grilling.' }
              ].map((m, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white">{m.title}</h5>
                    <p className="text-[11px] text-slate-400">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive AI Preview Mock */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="text-xs font-mono text-slate-400 ml-2">ALGORA Socratic Engine</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                STAGE 1: HINT
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 text-slate-300">
                <span className="text-slate-400 text-[10px] block mb-1">👤 STUDENT</span>
                "I'm getting O(N²) on Two Sum with nested loops. How can I optimize it?"
              </div>

              <div className="p-3.5 rounded-xl bg-violet-950/40 border border-violet-500/30 text-slate-200">
                <span className="text-violet-400 text-[10px] font-bold block mb-1">🤖 AI MENTOR (SOCRATIC HINT)</span>
                "Think about what you're searching for in the inner loop. For each number <code className="text-cyan-300">x</code>, you need <code className="text-cyan-300">target - x</code>.
                <br /><br />
                Instead of searching forward through the rest of the array, what data structure lets you record elements you've <strong>already seen</strong> for instantaneous O(1) lookup?"
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Ready for Stage 2?</span>
              <button 
                onClick={onStartLearning}
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-semibold flex items-center gap-1 transition text-xs"
              >
                <span>Request Approach</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white">ALGORA</span>
            <span>— AI-Powered Coding Education Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Built for Placement Excellence</span>
            <span>•</span>
            <button onClick={onStartLearning} className="text-indigo-400 hover:underline">
              Enter Platform
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
