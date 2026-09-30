import React, { useState } from 'react';
import { Play, Send, RotateCcw, Copy, Check, Terminal, Maximize2, Minimize2 } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: 'python' | 'cpp' | 'java' | 'c';
  onLanguageChange?: (lang: 'python' | 'cpp' | 'java' | 'c') => void;
  onRun?: () => void;
  onSubmit?: () => void;
  onReset?: () => void;
  isRunning?: boolean;
  isSubmitting?: boolean;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  onLanguageChange,
  onRun,
  onSubmit,
  onReset,
  isRunning,
  isSubmitting,
  readOnly = false
}) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(13);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const lines = value.split('\n');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      // Insert 4 spaces
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newValue);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden ${
      isFullScreen ? 'fixed inset-4 z-50 bg-slate-950/98' : 'w-full h-full min-h-[420px]'
    }`}>
      {/* Editor Top Bar */}
      <div className="h-11 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 select-none">
        
        {/* Left: Language selector & File tab */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Solution.{language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'c'}</span>
          </div>

          {onLanguageChange && (
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="python">Python 3.11</option>
              <option value="cpp">C++ 20 (GCC)</option>
              <option value="java">Java 17 (OpenJDK)</option>
              <option value="c">C 11 (Clang)</option>
            </select>
          )}
        </div>

        {/* Right: Controls & Font sizing */}
        <div className="flex items-center gap-2">
          
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 mr-2 font-mono">
            <button 
              onClick={() => setFontSize(Math.max(11, fontSize - 1))}
              className="px-1.5 py-0.5 rounded hover:bg-slate-800 hover:text-white"
            >A-</button>
            <span className="text-slate-400">{fontSize}px</span>
            <button 
              onClick={() => setFontSize(Math.min(18, fontSize + 1))}
              className="px-1.5 py-0.5 rounded hover:bg-slate-800 hover:text-white"
            >A+</button>
          </div>

          {onReset && (
            <button
              onClick={onReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Reset starter template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Editor'}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {onRun && (
            <button
              onClick={onRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
            >
              <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>
          )}

          {onSubmit && (
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
            </button>
          )}
        </div>

      </div>

      {/* Editor Body with Line Numbers */}
      <div className="relative flex-1 flex overflow-hidden font-mono bg-slate-950">
        {/* Line Numbers */}
        <div 
          className="w-12 py-3 bg-slate-900/40 text-slate-400 text-right pr-3 select-none border-r border-slate-800/60 font-mono"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
        >
          {lines.map((_, idx) => (
            <div key={idx} className="leading-[1.6]">{idx + 1}</div>
          ))}
        </div>

        {/* Text Area Code Input */}
        <div className="relative flex-1 h-full">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            spellCheck={false}
            className="w-full h-full p-3 bg-transparent text-emerald-300 resize-none font-mono focus:outline-none leading-[1.6] whitespace-pre"
            style={{ fontSize: `${fontSize}px`, tabSize: 4 }}
          />
        </div>
      </div>
    </div>
  );
};
