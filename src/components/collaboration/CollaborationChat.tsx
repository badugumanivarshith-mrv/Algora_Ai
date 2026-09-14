import React, { useState } from "react";
import { ChatMessage } from "../../services/collaborationApi";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface CollaborationChatProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string, isAiRequested?: boolean) => void;
}

export const CollaborationChat: React.FC<CollaborationChatProps> = ({ messages, onSendMessage }) => {
  const [text, setText] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText("");
  };

  const handleAskAI = () => {
    if (!text.trim()) return;
    onSendMessage(text, true);
    setText("");
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 flex flex-col h-full min-h-[450px]">
      <div className="pb-3 mb-3 border-b border-neutral-100 flex items-center justify-between">
        <h4 className="text-sm font-bold text-neutral-900">Room Chat & AI Co-Pilot</h4>
        <span className="text-xs text-neutral-400">Type @AI for hints</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[280px] max-h-[350px]">
        {messages.length === 0 ? (
          <p className="text-xs text-neutral-400 text-center py-8">No messages yet. Say hello or ask @AI for guidance!</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-xl text-xs ${
                m.message_type === "ai"
                  ? "bg-purple-50 border border-purple-100 text-purple-900"
                  : m.message_type === "system"
                  ? "bg-amber-50 border border-amber-100 text-amber-900 font-medium"
                  : "bg-neutral-50 border border-neutral-100 text-neutral-800"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold flex items-center gap-1">
                  {m.message_type === "ai" ? <Bot className="w-3.5 h-3.5 text-purple-600" /> : <User className="w-3.5 h-3.5 text-neutral-500" />}
                  {m.user_name}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="mt-3 pt-3 border-t border-neutral-100 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message or question..."
          className="flex-1 px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
        />
        <button
          type="button"
          onClick={handleAskAI}
          title="Ask AI Collaborator"
          className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <button
          type="submit"
          className="p-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
