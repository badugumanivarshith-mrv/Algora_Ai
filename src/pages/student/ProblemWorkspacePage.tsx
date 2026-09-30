import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Send,
  BrainCircuit,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  ChevronRight,
  Terminal,
  RotateCcw
} from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';
import { Problem } from '../../types/problem';
import { CodeEditor } from '../../components/common/CodeEditor';
import { executeCodeLocally, ExecutionResult } from '../../services/codeExecution';
import confetti from 'canvas-confetti';

interface ProblemWorkspacePageProps {
  problemId: string;
  onBack: () => void;
}

export const ProblemWorkspacePage: React.FC<ProblemWorkspacePageProps> = ({ problemId, onBack }) => {
  const {
    problems,
    userProblemStates,
    saveProblemCode,
    recordProblemAttempt,
    setIsMentorDrawerOpen,
    setMentorMode,
    setCurrentSocraticStage,
    setMentorContext
  } = useLearningStore();

  const problem = problems.find((p) => p.id === problemId) || problems[0];
  const userState = userProblemStates[problem?.id || ''];

  const [language, setLanguage] = useState<'python' | 'cpp' | 'java' | 'c'>('python');
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'hints' | 'solution' | 'submissions'>('description');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'testcases' | 'output'>('testcases');
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [revealedHintLevels, setRevealedHintLevels] = useState<number[]>([1]);

  useEffect(() => {
    if (problem) {
      const saved = userState?.savedCode?.[language] || problem.starterCode[language];
      setCode(saved);
      // Sync mentor context
      setMentorContext({
        problemId: problem.title,
        problemDescription: problem.description,
        code: saved,
        language
      });
    }
  }, [problem?.id, language]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    saveProblemCode(problem.id, language, newCode);
    setMentorContext((prev) => ({ ...prev, code: newCode }));
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveConsoleTab('output');

    const testCases = problem.examples.map((ex, i) => ({
      id: `tc-${i + 1}`,
      input: ex.input,
      expectedOutput: ex.output
    }));

    const result = await executeCodeLocally(code, language, testCases);
    setExecutionResult(result);
    setIsRunning(false);
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setActiveConsoleTab('output');

    const testCases = problem.examples.map((ex, i) => ({
      id: `tc-${i + 1}`,
      input: ex.input,
      expectedOutput: ex.output
    }));

    const result = await executeCodeLocally(code, language, testCases);
    setExecutionResult(result);
    setIsSubmitting(false);

    // Record submission
    recordProblemAttempt({
      id: `att-${Date.now()}`,
      problemId: problem.id,
      userId: 'usr_algora_demo',
      code,
      language,
      status: result.status,
      passedTests: result.passedTests,
      totalTests: result.totalTests,
      runtimeMs: result.runtimeMs,
      memoryMb: result.memoryMb,
      timestamp: new Date().toISOString()
    });

    if (result.status === 'Accepted') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const handleRequestSocraticHint = (level: number) => {
    if (!revealedHintLevels.includes(level)) {
      setRevealedHintLevels((prev) => [...prev, level]);
    }
    const stageMap: Record<number, any> = {
      1: 'hint',
      2: 'approach',
      3: 'algorithm',
      4: 'pseudocode'
    };
    setCurrentSocraticStage(stageMap[level] || 'hint');
    setMentorMode('practice');
    setMentorContext({
      problemId: problem.title,
      problemDescription: problem.description,
      code,
      language
    });
    setIsMentorDrawerOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Navbar Header */}
      <div className="h-12 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Problem Bank</span>
          </button>
          <span className="text-slate-700">|</span>
          <h2 className="text-xs font-bold text-white flex items-center gap-2">
            <span>{problem.title}</span>
            <span
              className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                problem.difficulty === 'Easy'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : problem.difficulty === 'Medium'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {problem.difficulty}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRequestSocraticHint(1)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Socratic Hint</span>
          </button>
        </div>
      </div>

      {/* Main Split Body: Left Details | Right Editor */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        
        {/* LEFT COLUMN: Problem Details, Tabs, Hints (5 cols) */}
        <div className="lg:col-span-5 flex flex-col border-r border-slate-800 bg-slate-950 overflow-hidden">
          {/* Navigation Tabs */}
          <div className="flex items-center px-4 bg-slate-900/80 border-b border-slate-800 text-xs font-semibold text-slate-400 overflow-x-auto no-scrollbar">
            {[
              { id: 'description', label: 'Description' },
              { id: 'hints', label: 'Socratic Hints' },
              { id: 'solution', label: 'Editorial Approach' },
              { id: 'submissions', label: 'Submissions' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 border-b-2 font-medium whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Viewport */}
          <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-300 space-y-4">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {problem.companies.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] font-mono border border-slate-800">
                      {c}
                    </span>
                  ))}
                  {problem.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px]">
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="whitespace-pre-wrap leading-relaxed">
                  {problem.description}
                </div>

                {/* Examples */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">Examples:</h4>
                  {problem.examples.map((ex, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono text-xs">
                      <div><strong className="text-slate-400 font-sans">Input:</strong> {ex.input}</div>
                      <div><strong className="text-slate-400 font-sans">Output:</strong> {ex.output}</div>
                      {ex.explanation && (
                        <div className="text-[11px] text-slate-400 font-sans pt-1">
                          <strong className="text-slate-400">Explanation:</strong> {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="pt-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">Constraints:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px]">
                    {problem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'hints' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs">
                  💡 Socratic hints reveal subtle ideas progressively without spoiling the code.
                </div>

                {problem.hints.map((hint) => {
                  const isRevealed = revealedHintLevels.includes(hint.level);
                  return (
                    <div key={hint.level} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">
                          Level {hint.level}: {hint.title}
                        </span>
                        {!isRevealed ? (
                          <button
                            onClick={() => handleRequestSocraticHint(hint.level)}
                            className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition"
                          >
                            Reveal Hint {hint.level}
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-mono">Revealed</span>
                        )}
                      </div>

                      {isRevealed && (
                        <div className="text-xs text-slate-300 leading-relaxed pt-1 whitespace-pre-wrap">
                          {hint.content}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'solution' && (
              <div className="space-y-4 text-xs">
                {problem.solutionApproach ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono">
                        <span className="text-slate-400 block text-[10px]">Optimal Time:</span>
                        <span className="text-emerald-400 font-bold">{problem.solutionApproach.optimalTimeComplexity}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono">
                        <span className="text-slate-400 block text-[10px]">Optimal Space:</span>
                        <span className="text-indigo-400 font-bold">{problem.solutionApproach.optimalSpaceComplexity}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <h4 className="font-bold text-white">Intuition</h4>
                      <p className="text-slate-300">{problem.solutionApproach.intuition}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400">Complete an attempt to unlock full editorial notes.</p>
                )}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-3">
                {userState?.status === 'solved' ? (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Accepted
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Best Runtime: {userState.bestRuntimeMs}ms</p>
                    </div>
                    <span className="text-xs font-mono text-indigo-400 font-bold">Solved</span>
                  </div>
                ) : (
                  <p className="text-slate-400">No previous accepted submissions recorded yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Code Editor + Terminal Console (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-950 overflow-hidden">
          {/* Top Half: Code Editor */}
          <div className="flex-1 min-h-[300px] overflow-hidden">
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              language={language}
              onLanguageChange={setLanguage}
              onRun={handleRunCode}
              onSubmit={handleSubmitCode}
              onReset={() => setCode(problem.starterCode[language])}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Bottom Half: Test Runner Console */}
          <div className="h-56 bg-slate-900 border-t border-slate-800 flex flex-col shrink-0">
            {/* Console Bar Tabs */}
            <div className="h-9 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between select-none">
              <div className="flex items-center gap-4 text-xs">
                <button
                  onClick={() => setActiveConsoleTab('testcases')}
                  className={`font-semibold transition ${
                    activeConsoleTab === 'testcases' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Test Cases ({problem.examples.length})
                </button>
                <button
                  onClick={() => setActiveConsoleTab('output')}
                  className={`font-semibold flex items-center gap-1.5 transition ${
                    activeConsoleTab === 'output' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Execution Output</span>
                  {executionResult && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        executionResult.status === 'Accepted' ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                  )}
                </button>
              </div>

              {executionResult && (
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {executionResult.runtimeMs}ms
                  </span>
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-indigo-400" />
                    {executionResult.memoryMb}MB
                  </span>
                </div>
              )}
            </div>

            {/* Console Content */}
            <div className="flex-1 overflow-y-auto p-3 text-xs font-mono text-slate-300">
              {activeConsoleTab === 'testcases' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    {problem.examples.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTestCaseIndex(idx)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          selectedTestCaseIndex === idx
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-sans block">Input:</span>
                      <div className="text-slate-200">{problem.examples[selectedTestCaseIndex]?.input}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-sans block">Expected Output:</span>
                      <div className="text-emerald-400">{problem.examples[selectedTestCaseIndex]?.output}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeConsoleTab === 'output' && (
                <div className="space-y-2">
                  {!executionResult ? (
                    <div className="text-slate-500 py-4 text-center font-sans text-xs">
                      Click "Run Code" or "Submit" to compile and execute against test cases.
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-2 font-sans">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                            executionResult.status === 'Accepted'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {executionResult.status}
                        </span>
                        <span className="text-slate-400 text-xs font-mono">
                          {executionResult.passedTests} / {executionResult.totalTests} Test Cases Passed
                        </span>
                      </div>

                      <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap">
                        {executionResult.stdout || executionResult.stderr}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
