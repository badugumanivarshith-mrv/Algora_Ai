import React, { useState, useRef, useEffect } from 'react';
import {
  BrainCircuit,
  X,
  Send,
  Sparkles,
  ChevronRight,
  Maximize2,
  Minimize2,
  BookOpen,
  Code2,
  FolderGit2,
  Briefcase,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';
import { MentorMode, SocraticStage, ChatMessage } from '../../types/mentor';
import { askAiMentor } from '../../services/gemini';

export const MentorChatDrawer: React.FC = () => {
  const {
    isMentorDrawerOpen,
    setIsMentorDrawerOpen,
    mentorMode,
    setMentorMode,
    mentorMessages,
    setMentorMessages,
    currentSocraticStage,
    setCurrentSocraticStage,
    mentorContext
  } = useLearningStore();

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMentorDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mentorMessages, isMentorDrawerOpen]);

  if (!isMentorDrawerOpen) return null;

  const handleSendMessage = async (customText?: string, targetStage?: SocraticStage) => {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim() && !targetStage) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: textToSend || `Requesting next guidance stage: ${(targetStage || currentSocraticStage).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      mode: mentorMode,
      socraticStage: targetStage || currentSocraticStage
    };

    setMentorMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    const activeStage = targetStage || currentSocraticStage;

    try {
      const aiResponse = await askAiMentor({
        mode: mentorMode,
        socraticStage: activeStage,
        userQuery: textToSend,
        currentCode: mentorContext.code,
        language: mentorContext.language || 'python',
        problemTitle: mentorContext.problemId,
        projectTitle: mentorContext.projectId,
        topicTitle: mentorContext.topicId
      });

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: aiResponse.text,
        timestamp: new Date().toISOString(),
        mode: mentorMode,
        socraticStage: activeStage,
        complexityAnalysis: aiResponse.complexity,
        suggestedFollowUps: aiResponse.followUps
      };

      setMentorMessages((prev) => [...prev, botMsg]);
      if (aiResponse.nextStage) {
        setCurrentSocraticStage(aiResponse.nextStage);
      }
    } catch (error) {
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: 'Let’s look at the current problem step by step. What are your initial thoughts on the brute-force approach versus an optimal data structure?',
        timestamp: new Date().toISOString(),
        mode: mentorMode
      };
      setMentorMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const modes: { id: MentorMode; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'learn', label: 'Learn', icon: BookOpen, color: 'text-blue-400' },
    { id: 'practice', label: 'Practice (Hints)', icon: Code2, color: 'text-amber-400' },
    { id: 'project', label: 'Project Architect', icon: FolderGit2, color: 'text-emerald-400' },
    { id: 'interview', label: 'Interviewer', icon: Briefcase, color: 'text-rose-400' }
  ];

  const socraticStages: { id: SocraticStage; label: string; num: number }[] = [
    { id: 'hint', label: 'Hint', num: 1 },
    { id: 'approach', label: 'Approach', num: 2 },
    { id: 'algorithm', label: 'Algorithm', num: 3 },
    { id: 'pseudocode', label: 'Pseudocode', num: 4 },
    { id: 'partial_code', label: 'Partial Code', num: 5 },
    { id: 'solution', label: 'Solution', num: 6 }
  ];

  return (
    <div
      className={`fixed z-50 right-0 top-16 bottom-0 flex flex-col bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl transition-all duration-300 ${
        isExpanded ? 'w-full md:w-[700px]' : 'w-full sm:w-[460px]'
      }`}
    >
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800/90 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-mono">ALGORA AI Mentor</h3>
              <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Socratic guidance engine & coach</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title={isExpanded ? 'Collapse width' : 'Expand width'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMentorDrawerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title="Close AI Mentor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="px-3 pt-2 pb-1 bg-slate-950/40 border-b border-slate-800/60 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mentorMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMentorMode(m.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${m.color}`} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Socratic Ladder Bar (in Practice Mode) */}
      {mentorMode === 'practice' && (
        <div className="px-3 py-2 bg-amber-950/20 border-b border-amber-500/20">
          <div className="flex items-center justify-between text-[11px] font-semibold text-amber-300 mb-1.5">
            <span className="flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Socratic Progression Ladder
            </span>
            <span className="text-[10px] text-amber-400/80">Step-by-step unblocking</span>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {socraticStages.map((st) => {
              const isPassed = socraticStages.findIndex(s => s.id === currentSocraticStage) >= socraticStages.findIndex(s => s.id === st.id);
              const isCurrent = currentSocraticStage === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => handleSendMessage(undefined, st.id)}
                  className={`py-1 rounded text-[10px] font-medium text-center transition ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : isPassed
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                  }`}
                  title={`Request ${st.label}`}
                >
                  {st.num}. {st.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mentorMessages.map((msg) => {
          const isBot = msg.sender === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[10px] font-mono text-slate-400">
                  {isBot ? '🤖 AI Mentor' : '👤 You'}
                </span>
                {msg.complexityAnalysis && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Time: {msg.complexityAnalysis.time} | Space: {msg.complexityAnalysis.space}
                  </span>
                )}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[90%] whitespace-pre-wrap ${
                  isBot
                    ? 'bg-slate-800/80 border border-slate-700/70 text-slate-100 shadow-sm'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                }`}
              >
                {msg.content}

                {/* Quick Copy Snippet if contained in response */}
                {msg.content.includes('```') && (
                  <div className="mt-2 pt-2 border-t border-slate-700/50 flex justify-end">
                    <button
                      onClick={() => handleCopyCode(msg.content, msg.id)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/60 hover:bg-slate-900 text-slate-300 text-[10px] transition"
                    >
                      {copiedCodeId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Suggested Follow-ups */}
              {isBot && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                  {msg.suggestedFollowUps.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] bg-slate-800/60 hover:bg-violet-600/20 text-slate-300 hover:text-violet-300 border border-slate-700/60 hover:border-violet-500/30 transition text-left"
                    >
                      <Sparkles className="w-3 h-3 text-violet-400 shrink-0" />
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl w-fit">
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></div>
            <span className="text-[11px] text-slate-400 font-mono">Thinking Socratic steps...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              mentorMode === 'practice'
                ? "Ask a question about the approach, or type 'hint'..."
                : mentorMode === 'project'
                ? 'Ask about project design, tests, or architecture...'
                : mentorMode === 'interview'
                ? 'State your algorithm & time complexity to the interviewer...'
                : 'Ask anything about syntax, memory, or concepts...'
            }
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md shadow-violet-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
