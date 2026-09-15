import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Play, Plus, Clock, Settings, Brain, ArrowRight } from 'lucide-react';

const WorkflowEngine: React.FC = () => {
  const [workflows] = useState<any[]>([
    { id: 'wf1', name: 'Research-to-Project Pipeline', status: 'Active', steps: 4, lastRun: '1 hour ago' },
    { id: 'wf2', name: 'Career Prep Auto-Sync', status: 'Idle', steps: 3, lastRun: 'Yesterday' }
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Multi-Agent Workflows</h2>
          <p className="text-neutral-500">Chain multiple agents together for complex autonomous task execution.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]">
          <Plus size={20} />
          Create Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workflows.map((wf) => (
          <div key={wf.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-blue-500/30 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                <Layers size={24} />
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                wf.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-neutral-800 text-neutral-500 border-neutral-700'
              }`}>
                {wf.status}
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{wf.name}</h3>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-neutral-900 flex items-center justify-center text-[10px] font-bold">
                    A{i}
                  </div>
                ))}
              </div>
              <div className="text-sm text-neutral-500 font-medium">
                {wf.steps} Sequential Steps
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-neutral-800">
              <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                <Clock size={14} />
                Last: {wf.lastRun}
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">
                  <Settings size={18} />
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all">
                  <Play size={16} />
                  Execute
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-blue-600/5 border border-dashed border-blue-600/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
          <Brain size={40} className="text-blue-400 mb-4 opacity-50" />
          <h3 className="font-bold text-blue-400 mb-2">Smart Workflow Suggestion</h3>
          <p className="text-sm text-neutral-500 mb-6">Let Gemini analyze your current goals and suggest an optimized workflow.</p>
          <button className="flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors">
            Analyze My Goals <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
        <h3 className="text-lg font-bold mb-6">Workflow Designer Visualizer</h3>
        <div className="h-64 bg-black/50 border border-neutral-800 rounded-2xl flex items-center justify-center text-neutral-600 font-mono italic">
          [ Visual Workflow Graph Editor Initializing... ]
        </div>
      </div>
    </div>
  );
};

export default WorkflowEngine;
