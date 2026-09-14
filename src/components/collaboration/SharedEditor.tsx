import React, { useState } from "react";
import { Code, Play, CheckCircle, Copy } from "lucide-react";

interface SharedEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
}

export const SharedEditor: React.FC<SharedEditorProps> = ({ code, language, onChange, readOnly = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col h-full min-h-[450px]">
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-950 border-b border-neutral-800 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-emerald-400" />
          <span className="uppercase text-neutral-300 font-semibold">{language}</span>
          {readOnly && (
            <span className="px-2 py-0.5 bg-amber-950 text-amber-400 rounded-md text-[10px] border border-amber-800 font-sans">
              Navigator (Read Only)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="flex-1 relative p-4 font-mono text-sm">
        <textarea
          value={code}
          onChange={(e) => !readOnly && onChange(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          className="w-full h-full bg-transparent text-neutral-200 resize-none focus:outline-hidden font-mono leading-relaxed"
          placeholder="// Type your collaborative code here..."
        />
      </div>
    </div>
  );
};
