import React, { useState } from 'react';
import {
  BrainCircuit,
  BookOpen,
  Code2,
  FolderGit2,
  Briefcase,
  Send,
  Sparkles,
  Lightbulb,
  MessageSquare,
  Zap,
  RotateCcw,
  Check
} from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';
import { MentorMode, SocraticStage, ChatMessage } from '../../types/mentor';
import { askAiMentor } from '../../services/gemini';

export const MentorHQPage: React.FC = () => {
  const {
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

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
      mode: mentorMode,
      socraticStage: currentSocraticStage
    };

    setMentorMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await askAiMentor({
        mode: mentorMode,
        socraticStage: currentSocraticStage,
        userQuery: textToSend,
        currentCode: mentorContext.code,
        language: mentorContext.language || 'python',
        problemTitle: mentorContext.problemId,
        projectTitle: mentorContext.projectId
      });

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: response.text,
        timestamp: new Date().toISOString(),
        mode: mentorMode,
        socraticStage: currentSocraticStage,
        complexityAnalysis: response.complexity,
        suggestedFollowUps: response.followUps
      };

      setMentorMessages((prev) => [...prev, botMsg]);
      if (response.nextStage) {
        setCurrentSocraticStage(response.nextStage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = {
    learn: [
      'Explain how Python dictionaries handle hash collisions under the hood',
      'What is the difference between shallow copy and deep copy in memory?',
      'How does the Two Pointer technique reduce O(N²) to O(N)?'
    ],
    practice: [
      'I am stuck on Two Sum. Give me a Socratic hint without spoiling code.',
      'How do I handle negative numbers in Sliding Window problems?',
      'Why is binary search on answer space optimal for Koko Eating Bananas?'
    ],
    project: [
      'How should I structure the folder architecture for an Online Judge sandbox?',
      'What unit tests should I write for a Shunting-Yard expression parser?',
      'How do I prevent memory leaks when managing client WebSocket connections?'
    ],
    interview: [
      'Simulate a 45-minute Google technical interview on Trees & Binary Search.',
      'Grill me on the time and space complexity of Dijkstra vs A* search.',
      'Ask me behavioral questions using the Amazon STAR method.'
    ]
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BrainCircuit className="w-4 h-4" />
            <span>Socratic Coaching Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">AI Mentor Headquarters</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dedicated multi-modal coaching: Learn Concepts, Socratic Practice Hints, Project Architecture, and FAANG Mock Interviewer.
          </p>
        </div>

        {/* Clear / Reset Chat */}
        <button
          onClick={() =>
            setMentorMessages([
              {
                id: 'welcome-reset',
                sender: 'assistant',
                content: 'Chat cleared. How can I help coach your coding today?',
                timestamp: new Date().toISOString(),
                mode: mentorMode
              }
            ])
          }
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs flex items-center gap-1.5 transition border border-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* 4 Mode Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: 'learn', label: 'Learn Mode', icon: BookOpen, desc: 'Concepts & Mental Models', color: 'border-blue-500/40 text-blue-400 bg-blue-950/20' },
          { id: 'practice', label: 'Practice Mode', icon: Code2, desc: '5-Tier Socratic Hints', color: 'border-amber-500/40 text-amber-400 bg-amber-950/20' },
          { id: 'project', label: 'Project Architect', icon: FolderGit2, desc: 'Design & Code Reviews', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20' },
          { id: 'interview', label: 'Mock Interviewer', icon: Briefcase, desc: 'FAANG Technical Grilling', color: 'border-rose-500/40 text-rose-400 bg-rose-950/20' }
        ].map((m) => {
          const Icon = m.icon;
          const isSelected = mentorMode === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setMentorMode(m.id as MentorMode)}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                isSelected
                  ? `${m.color} ring-2 ring-indigo-500 shadow-lg`
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon className="w-5 h-5 mb-2" />
              <h3 className="text-xs font-bold text-white">{m.label}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{m.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Recommended {mentorMode.toUpperCase()} Prompts:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {samplePrompts[mentorMode].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-violet-950/30 text-slate-300 hover:text-violet-200 border border-slate-800 hover:border-violet-500/30 text-[11px] text-left transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Full Chat Display Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {mentorMessages.map((msg) => {
            const isBot = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    {isBot ? `🤖 ALGORA AI (${msg.mode.toUpperCase()} MODE)` : '👤 You'}
                  </span>
                  {msg.complexityAnalysis && (
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Time: {msg.complexityAnalysis.time} | Space: {msg.complexityAnalysis.space}
                    </span>
                  )}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                    isBot
                      ? 'bg-slate-950 border border-slate-800 text-slate-100 shadow-md'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Follow ups */}
                {isBot && msg.suggestedFollowUps && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                    {msg.suggestedFollowUps.map((fu, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(fu)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition"
                      >
                        {fu}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl w-fit flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400 animate-spin" />
              <span className="text-xs text-slate-400 font-mono">Generating Socratic coaching response...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything or request Socratic hints..."
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-violet-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs hover:opacity-90 transition disabled:opacity-40 flex items-center gap-2"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
