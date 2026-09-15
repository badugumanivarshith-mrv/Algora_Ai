import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Plus, Users, MessageSquare, Zap, Cpu, Settings } from 'lucide-react';

const AgentTeams: React.FC = () => {
  const [teams] = useState<any[]>([
    { id: 't1', name: 'Strategic R&D Team', description: 'Combines Research and Project agents for autonomous innovation.', memberCount: 2, status: 'Active' },
    { id: 't2', name: 'Career Growth Taskforce', description: 'Learning and Career agents working together on placement success.', memberCount: 2, status: 'Active' }
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Collaborative Agent Teams</h2>
          <p className="text-neutral-500">Group multiple agents with shared memory and cooperative goals.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]">
          <Plus size={20} />
          Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-blue-500/30 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                <Shield size={24} />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {team.status}
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{team.name}</h3>
            <p className="text-neutral-500 text-sm mb-8 line-clamp-2">{team.description}</p>
            
            <div className="space-y-4 mb-8">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Active Members</div>
              <div className="flex flex-wrap gap-3">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-neutral-800 rounded-xl">
                    <Cpu size={14} className="text-blue-400" />
                    <span className="text-xs font-medium">Agent {i}</span>
                  </div>
                ))}
                <button className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-500 hover:text-white transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-neutral-800">
              <div className="flex items-center gap-4 text-neutral-500">
                <div className="flex items-center gap-1 text-xs">
                  <MessageSquare size={14} />
                  Shared Memory
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Zap size={14} />
                  Co-op Mode
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">
                  <Settings size={18} />
                </button>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all">
                  Manage
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="border-2 border-dashed border-neutral-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-neutral-700 transition-all">
          <div className="p-4 bg-neutral-900 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
            <Users size={32} className="text-neutral-600" />
          </div>
          <h3 className="font-bold text-neutral-400 mb-1">Assemble Agent Team</h3>
          <p className="text-sm text-neutral-500">Select agents to work together on shared long-term objectives.</p>
        </div>
      </div>
    </div>
  );
};

export default AgentTeams;
