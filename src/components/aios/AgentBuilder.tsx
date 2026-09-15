import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Save, Settings, Brain, Zap, Cpu } from 'lucide-react';
import { aiosApi } from '../../services/aiosApi';

interface AgentBuilderProps {
  onCreated: () => void;
}

const AgentBuilder: React.FC<AgentBuilderProps> = ({ onCreated }) => {
  const [config, setConfig] = useState({
    name: '',
    description: '',
    agentType: 'Custom',
    instructions: '',
    personality: { tone: 'Professional', level: 'Expert' },
    memoryMode: 'standard'
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!config.name) return;
    setIsSaving(true);
    try {
      await aiosApi.createAgent(config);
      onCreated();
      setConfig({
        name: '',
        description: '',
        agentType: 'Custom',
        instructions: '',
        personality: { tone: 'Professional', level: 'Expert' },
        memoryMode: 'standard'
      });
    } catch (e) {
      console.error('Failed to create agent', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
          <Settings className="text-blue-400" />
          Agent Configuration
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-neutral-500 uppercase mb-2">Agent Name</label>
            <input 
              type="text"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              className="w-full bg-black/50 border border-neutral-800 rounded-xl p-4 outline-none focus:border-blue-500/50 transition-all"
              placeholder="e.g., Code Auditor"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-500 uppercase mb-2">Instructions (System Prompt)</label>
            <textarea 
              value={config.instructions}
              onChange={(e) => setConfig({ ...config, instructions: e.target.value })}
              className="w-full h-40 bg-black/50 border border-neutral-800 rounded-xl p-4 outline-none focus:border-blue-500/50 transition-all resize-none"
              placeholder="Define how the agent should behave..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-neutral-500 uppercase mb-2">Agent Type</label>
              <select 
                value={config.agentType}
                onChange={(e) => setConfig({ ...config, agentType: e.target.value })}
                className="w-full bg-black/50 border border-neutral-800 rounded-xl p-4 outline-none focus:border-blue-500/50 transition-all"
              >
                <option>Learning</option>
                <option>Career</option>
                <option>Research</option>
                <option>Project</option>
                <option>Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-500 uppercase mb-2">Memory Mode</label>
              <select 
                value={config.memoryMode}
                onChange={(e) => setConfig({ ...config, memoryMode: e.target.value })}
                className="w-full bg-black/50 border border-neutral-800 rounded-xl p-4 outline-none focus:border-blue-500/50 transition-all"
              >
                <option value="standard">Standard</option>
                <option value="long-term">Long-term (Persistent)</option>
                <option value="ephemeral">Ephemeral (Session only)</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving || !config.name}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]"
          >
            {isSaving ? <Zap className="animate-spin" size={18} /> : <Save size={18} />}
            Deploy Autonomous Agent
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Brain size={20} className="text-purple-400" />
            Live Preview
          </h2>
          <div className="p-6 bg-black/50 rounded-2xl border border-neutral-800 border-dashed">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                <Cpu size={24} />
              </div>
              <div>
                <div className="font-bold">{config.name || 'Agent Name'}</div>
                <div className="text-xs text-neutral-500 uppercase">{config.agentType} Agent</div>
              </div>
            </div>
            <div className="text-sm text-neutral-400 font-mono italic">
              "{config.instructions || 'Awaiting system instructions...'}"
            </div>
          </div>
        </div>

        <div className="bg-blue-600/10 border border-blue-600/20 rounded-3xl p-8">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Zap size={20} className="text-blue-400" />
            AI Optimization
          </h3>
          <p className="text-neutral-400 text-sm mb-6">Let Gemini analyze your instructions and suggest optimizations for better autonomy and accuracy.</p>
          <button className="w-full py-3 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-xl font-bold hover:bg-blue-600/30 transition-all">
            Analyze with Gemini
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentBuilder;
