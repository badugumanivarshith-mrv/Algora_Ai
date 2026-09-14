import React, { useState } from "react";
import { Edit3, Square, Circle, Type, Trash2, Save } from "lucide-react";

interface WhiteboardProps {
  initialShapes?: any;
  onSave: (shapes: any) => void;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({ initialShapes = [], onSave }) => {
  const [notes, setNotes] = useState<string>(
    typeof initialShapes === "string" ? initialShapes : "### Shared Algorithm Whiteboard\n- Node 1 -> Node 2\n- Binary Search Bounds: [left, right]\n- Space Complexity: O(N)"
  );

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm font-bold text-neutral-900">Collaborative Whiteboard / Notes</h4>
        </div>
        <button
          onClick={() => onSave(notes)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white font-medium text-xs rounded-xl hover:bg-neutral-800"
        >
          <Save className="w-3.5 h-3.5" />
          Sync Notes
        </button>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full h-full min-h-[300px] p-3 font-mono text-xs bg-neutral-50 text-neutral-800 rounded-xl border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
        placeholder="Sketch algorithm diagrams, tree state transitions, or system design notes here..."
      />
    </div>
  );
};
