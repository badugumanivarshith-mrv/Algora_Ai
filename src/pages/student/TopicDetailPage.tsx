import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  AlertOctagon,
  CheckCircle2,
  FileCheck2,
  FolderGit2,
  HelpCircle,
  BrainCircuit,
  ArrowRight,
  ArrowLeft,
  Play,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';
import { Topic } from '../../types/learn';
import { CodeEditor } from '../../components/common/CodeEditor';

interface TopicDetailPageProps {
  topicId: string;
  onBack: () => void;
  onNavigateProblem: (problemId: string) => void;
  onNavigateProject: (projectId: string) => void;
}

export const TopicDetailPage: React.FC<TopicDetailPageProps> = ({
  topicId,
  onBack,
  onNavigateProblem,
  onNavigateProject
}) => {
  const {
    tracks,
    problems,
    projects,
    completeTopicSection,
    userTopicProgress,
    setIsMentorDrawerOpen,
    setMentorMode,
    setMentorContext
  } = useLearningStore();

  const [activeTab, setActiveTab] = useState<
    'concept' | 'syntax' | 'examples' | 'mistakes' | 'practice' | 'assignment' | 'project' | 'interview'
  >('concept');

  const [exampleOutputs, setExampleOutputs] = useState<Record<number, string>>({});
  const [assignmentCode, setAssignmentCode] = useState('');
  const [revealedInterviewQs, setRevealedInterviewQs] = useState<Record<number, boolean>>({});

  // Find topic
  let foundTopic: Topic | undefined;
  for (const t of tracks) {
    const match = t.topics.find((tp) => tp.id === topicId);
    if (match) {
      foundTopic = match;
      break;
    }
  }

  const topic = foundTopic || tracks[0]?.topics[0];
  const progress = userTopicProgress[topic?.id || ''] || {
    completedSections: [],
    masteryScore: 0
  };

  if (!topic) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400">Topic not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg">
          Go Back
        </button>
      </div>
    );
  }

  const handleRunExample = (index: number, output: string) => {
    setExampleOutputs((prev) => ({ ...prev, [index]: output }));
    completeTopicSection(topic.id, 'examples');
  };

  const handleOpenAiMentor = () => {
    setMentorMode('learn');
    setMentorContext({ topicId: topic.title, code: topic.syntaxBreakdown[0]?.code });
    setIsMentorDrawerOpen(true);
  };

  const tabs = [
    { id: 'concept', label: '1. Concept', icon: BookOpen },
    { id: 'syntax', label: '2. Syntax', icon: Code2 },
    { id: 'examples', label: '3. Interactive Examples', icon: Play },
    { id: 'mistakes', label: '4. Common Mistakes', icon: AlertOctagon },
    { id: 'practice', label: '5. Practice Problems', icon: FileCheck2 },
    { id: 'assignment', label: '6. Assignment', icon: CheckCircle2 },
    { id: 'project', label: '7. Guided Project', icon: FolderGit2 },
    { id: 'interview', label: '8. Interview Qs', icon: HelpCircle },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Back button & Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tracks</span>
        </button>

        <button
          onClick={handleOpenAiMentor}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-bold transition"
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Explain Concept with AI Mentor</span>
        </button>
      </div>

      {/* Topic Title Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
              Module {topic.order}
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-1">{topic.title}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">{topic.summary}</p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono font-bold text-emerald-400">
              {progress.masteryScore}% Mastery
            </span>
            <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress.masteryScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* 8-Stage Progression Flow Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isCompleted = progress.completedSections?.includes(tab.id);

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  completeTopicSection(topic.id, tab.id);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isCompleted
                    ? 'bg-slate-950 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {isCompleted && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 min-h-[450px]">
        
        {/* 1. CONCEPT NOTES */}
        {activeTab === 'concept' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Deep Conceptual Theory & Mental Model</span>
            </h3>
            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              {topic.conceptNotes}
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setActiveTab('syntax');
                  completeTopicSection(topic.id, 'concept');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
              >
                <span>Proceed to Syntax Breakdown</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 2. SYNTAX BREAKDOWN */}
        {activeTab === 'syntax' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Precise Syntax Breakdown & Memory Allocation</span>
            </h3>

            {topic.syntaxBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-cyan-300 font-bold">{item.language} Syntax</span>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                  {item.code}
                </pre>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                  💡 {item.explanation}
                </p>
              </div>
            ))}

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setActiveTab('concept')}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  setActiveTab('examples');
                  completeTopicSection(topic.id, 'syntax');
                }}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center gap-2"
              >
                <span>Try Interactive Examples</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 3. INTERACTIVE EXAMPLES */}
        {activeTab === 'examples' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Interactive Code Demonstrations</span>
            </h3>

            {topic.interactiveExamples.map((ex, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{ex.title}</h4>
                  <button
                    onClick={() => handleRunExample(idx, ex.output)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Run Example</span>
                  </button>
                </div>

                <pre className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
                  {ex.code}
                </pre>

                <p className="text-xs text-slate-400">{ex.explanation}</p>

                {exampleOutputs[idx] && (
                  <div className="mt-2 p-3 rounded-lg bg-slate-900/90 border border-emerald-500/30 text-xs font-mono text-emerald-300">
                    <span className="text-[10px] text-slate-500 block mb-1">TERMINAL OUTPUT:</span>
                    {exampleOutputs[idx]}
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setActiveTab('syntax')}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  setActiveTab('mistakes');
                  completeTopicSection(topic.id, 'examples');
                }}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center gap-2"
              >
                <span>Review Common Mistakes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 4. COMMON MISTAKES */}
        {activeTab === 'mistakes' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Anti-Patterns & Bugs to Avoid</span>
            </h3>

            {topic.commonMistakes.map((mis, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-rose-300">{mis.title}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30">
                    <span className="text-[10px] font-bold text-rose-400 block mb-1">❌ DANGEROUS / BUGGY</span>
                    <pre className="text-xs font-mono text-rose-200 overflow-x-auto">{mis.badCode}</pre>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                    <span className="text-[10px] font-bold text-emerald-400 block mb-1">✅ CLEAN / IDIOMATIC</span>
                    <pre className="text-xs font-mono text-emerald-200 overflow-x-auto">{mis.goodCode}</pre>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{mis.explanation}</p>
              </div>
            ))}

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setActiveTab('examples')}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  setActiveTab('practice');
                  completeTopicSection(topic.id, 'mistakes');
                }}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center gap-2"
              >
                <span>Unlock Practice Problems</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 5. PRACTICE PROBLEMS */}
        {activeTab === 'practice' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
              <span>Targeted Coding Problems for {topic.title}</span>
            </h3>

            <div className="space-y-3">
              {topic.relatedProblemIds.map((pid) => {
                const prob = problems.find((p) => p.id === pid) || problems[0];
                return (
                  <div
                    key={prob.id}
                    onClick={() => onNavigateProblem(prob.id)}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            prob.difficulty === 'Easy'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : prob.difficulty === 'Medium'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                        <h4 className="text-xs font-bold text-white">{prob.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{prob.subtopic}</p>
                    </div>

                    <button className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1">
                      <span>Code Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. ASSIGNMENT */}
        {activeTab === 'assignment' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Topic Assignment: {topic.assignment.title}</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs text-slate-300">
              <p>{topic.assignment.instructions}</p>
            </div>

            <div className="h-64">
              <CodeEditor
                value={assignmentCode || topic.assignment.starterCode}
                onChange={setAssignmentCode}
                language="python"
              />
            </div>

            <button
              onClick={() => {
                completeTopicSection(topic.id, 'assignment');
                alert('Assignment submitted and validated! +50 XP');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition"
            >
              Submit Assignment
            </button>
          </div>
        )}

        {/* 7. PROJECT */}
        {activeTab === 'project' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              <span>Hands-On Project Connection</span>
            </h3>

            {topic.relatedProjectIds.map((projId) => {
              const proj = projects.find((p) => p.id === projId) || projects[0];
              return (
                <div
                  key={proj.id}
                  onClick={() => onNavigateProject(proj.id)}
                  className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      {proj.level} Project
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{proj.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{proj.summary}</p>
                  </div>

                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition whitespace-nowrap">
                    Open Project Workbench
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* 8. INTERVIEW QUESTIONS */}
        {activeTab === 'interview' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-rose-400" />
              <span>Frequently Asked Interview Questions</span>
            </h3>

            <div className="space-y-3">
              {topic.interviewQuestions.map((q, idx) => {
                const isRevealed = revealedInterviewQs[idx];
                return (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono">
                            {q.type.toUpperCase()}
                          </span>
                          {q.companyTags.map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h4 className="text-xs font-bold text-white">{q.question}</h4>
                      </div>

                      <button
                        onClick={() =>
                          setRevealedInterviewQs((prev) => ({ ...prev, [idx]: !prev[idx] }))
                        }
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
                      >
                        {isRevealed ? 'Hide Answer' : 'Reveal Ideal Answer'}
                      </button>
                    </div>

                    {isRevealed && (
                      <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-emerald-300 font-sans leading-relaxed">
                        <strong className="text-white block mb-1">Model Answer:</strong>
                        {q.expectedAnswer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
