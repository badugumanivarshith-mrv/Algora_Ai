import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  FileText,
  Mic,
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  Send,
  Play
} from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';
import { CompanyTrack } from '../../types/career';
import { analyzeResumeATS } from '../../services/gemini';

export const CareerHubPage: React.FC = () => {
  const { companyTracks, setIsMentorDrawerOpen, setMentorMode, setMentorContext } = useLearningStore();

  const [activeTab, setActiveTab] = useState<'tracks' | 'resume' | 'mock'>('tracks');
  const [selectedCompanyId, setSelectedCompanyId] = useState(companyTracks[0]?.id || 'comp-google');

  // Resume builder states
  const [resumeText, setResumeText] = useState(
    `MANI VARSHITH - SOFTWARE DEVELOPMENT ENGINEER
Contact: badugumanivarshith@gmail.com | Portfolio: algora.dev/mani

EXPERIENCE & PROJECTS
- Distributed Online Judge Sandbox (C++ / Python)
  * Architected secure sandboxed code execution engine supporting POSIX resource limits and sub-millisecond diff analysis.
  * Enforced CPU and memory caps with custom Linux cgroups handling 2,000+ simultaneous code submissions.
- Real-Time Chat Engine (Python asyncio / WebSockets)
  * Designed asynchronous pub/sub room registry reducing message broadcast latency by 45%.

SKILLS
- Languages: Python, C++, Java, C, TypeScript
- Core: Data Structures, Algorithms, System Design, Concurrency, Git, Linux`
  );
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);

  // Mock interview state
  const [mockCandidateAnswer, setMockCandidateAnswer] = useState('');
  const [mockTranscript, setMockTranscript] = useState([
    {
      role: 'interviewer',
      text: 'Welcome to your Google SDE Technical Interview. Today we want you to design an algorithm to find the Median of Two Sorted Arrays in O(log(M+N)) time. Walk me through your initial thoughts before coding.'
    }
  ]);

  const activeCompany = companyTracks.find((c) => c.id === selectedCompanyId) || companyTracks[0];

  const handleAnalyzeResume = async () => {
    setIsAnalyzingResume(true);
    try {
      const result = await analyzeResumeATS(resumeText, 'Software Engineer (SDE I)', activeCompany.name);
      setResumeAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  const handleSendMockAnswer = () => {
    if (!mockCandidateAnswer.trim()) return;

    setMockTranscript((prev) => [
      ...prev,
      { role: 'candidate', text: mockCandidateAnswer },
      {
        role: 'interviewer',
        text: 'Solid explanation of the binary search partition. How are you handling the edge case where the left partition index in Array A becomes negative (-infinity sentinel)?'
      }
    ]);
    setMockCandidateAnswer('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Placement & Interview Readiness</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Career Preparation Hub</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Company-specific roadmaps, ATS Resume optimization, and real-time AI Mock Interviews.
          </p>
        </div>

        {/* Module Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {[
            { id: 'tracks', label: 'Company Roadmaps', icon: Building2 },
            { id: 'resume', label: 'AI Resume & ATS Scorer', icon: FileText },
            { id: 'mock', label: 'Mock Interview Arena', icon: Mic },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: COMPANY TRACKS */}
      {activeTab === 'tracks' && (
        <div className="space-y-6">
          {/* Company Selector Pill Buttons */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {companyTracks.map((comp) => {
              const isSelected = comp.id === selectedCompanyId;
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompanyId(comp.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 border-rose-500 text-white shadow-lg shadow-rose-950/20 ring-1 ring-rose-500'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-800 font-mono font-bold text-xs flex items-center justify-center text-rose-300">
                    {comp.logoBadge}
                  </span>
                  <span className="text-xs font-bold">{comp.name} Track</span>
                </button>
              );
            })}
          </div>

          {/* Active Company Track Deep-Dive */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Hiring Focus, Stages, Patterns */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Overview & Hiring Focus */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">{activeCompany.name} SDE Track</h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {activeCompany.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{activeCompany.description}</p>

                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 mb-2">
                    Core Hiring Focus Areas:
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {activeCompany.hiringFocus.map((focus, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{focus}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interview Stages */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Interview Process & Stages</h3>
                <div className="space-y-3">
                  {activeCompany.interviewStages.map((stage, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">{stage.stage}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{stage.format}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div><strong>Focus:</strong> {stage.focusAreas.join(', ')}</div>
                        <div className="text-rose-300/90"><strong>Strategy Tip:</strong> {stage.tips.join(' ')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right 5 cols: Top Coding Patterns & High Frequency Topics */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* High Frequency Topics */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Frequently Asked Topics</h3>
                <div className="space-y-3">
                  {activeCompany.frequentlyAskedTopics.map((topic, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{topic.topic}</span>
                        <span className="font-mono text-rose-400 font-bold">{topic.frequencyPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full"
                          style={{ width: `${topic.frequencyPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature Coding Patterns */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Signature Coding Patterns</h3>
                <div className="space-y-3">
                  {activeCompany.codingPatterns.map((pat, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <h4 className="font-bold text-rose-300">{pat.name}</h4>
                      <p className="text-slate-400 text-[11px]">{pat.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI RESUME & ATS SCORER */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-400" />
                <span>Resume Content Editor (Plain Text / Markdown)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Paste your technical resume text. Our Gemini AI engine evaluates ATS keyword density, metric quantization, and formatting.
              </p>

              <textarea
                rows={14}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
              />

              <button
                onClick={handleAnalyzeResume}
                disabled={isAnalyzingResume}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-md shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzingResume ? 'Evaluating ATS Compatibility...' : 'Run ATS Resume Audit'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            {resumeAnalysis ? (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                      ATS Evaluation Verdict
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">
                      ATS Score: <span className="text-emerald-400 font-mono">{resumeAnalysis.overallScore}/100</span>
                    </h3>
                  </div>

                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl">
                    High ATS Pass Rate
                  </div>
                </div>

                {/* ATS Breakdown bars */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Formatting Compatibility</span>
                    <span className="font-mono text-emerald-400">{resumeAnalysis.atsBreakdown.formattingScore}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Action Verbs Strength</span>
                    <span className="font-mono text-cyan-400">{resumeAnalysis.atsBreakdown.actionVerbsScore}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Quantifiable Metrics</span>
                    <span className="font-mono text-amber-400">{resumeAnalysis.atsBreakdown.impactMetricsScore}%</span>
                  </div>
                </div>

                {/* Missing keywords */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 mb-2">Recommended Keywords to Include:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeAnalysis.missingKeywords.map((kw: string) => (
                      <span key={kw} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-mono">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Improvements */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">Actionable Feedback:</h4>
                  {resumeAnalysis.improvements.map((imp: string, i: number) => (
                    <p key={i} className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                      👉 {imp}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px]">
                <FileText className="w-12 h-12 text-slate-600 mb-3" />
                <h4 className="text-sm font-bold text-white">Click "Run ATS Resume Audit"</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  We will evaluate your bullet points against top tech hiring algorithms and recruiter screens.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MOCK INTERVIEW ARENA */}
      {activeTab === 'mock' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Live Mock Interview Simulation</h3>
                <p className="text-xs text-slate-400">Interviewer: Senior Staff Engineer @ Google</p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Interview in Progress
            </span>
          </div>

          {/* Transcript Box */}
          <div className="space-y-4 max-h-96 overflow-y-auto p-2">
            {mockTranscript.map((msg, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'interviewer'
                    ? 'bg-slate-950 border border-slate-800 text-slate-200'
                    : 'bg-rose-950/30 border border-rose-500/30 text-rose-200 ml-8'
                }`}
              >
                <span className="text-[10px] font-mono font-bold block mb-1 text-slate-400">
                  {msg.role === 'interviewer' ? '👔 INTERVIEWER (GOOGLE)' : '👤 CANDIDATE (YOU)'}
                </span>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Answer Input */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={mockCandidateAnswer}
              onChange={(e) => setMockCandidateAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMockAnswer()}
              placeholder="Speak your approach out loud or type candidate response..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
            <button
              onClick={handleSendMockAnswer}
              className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <span>Respond</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
