import React from 'react';
import { FolderGit2, Plus, Edit2, Trash2 } from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';

export const AdminProjectsPage: React.FC = () => {
  const { projects } = useLearningStore();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Project Studio</h1>
          <p className="text-xs text-slate-400 mt-0.5">Author multi-milestone real-world engineering project blueprints.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj) => (
          <div key={proj.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400">
                {proj.level}
              </span>
              <span className="text-xs font-mono text-cyan-400">+{proj.xpReward} XP</span>
            </div>

            <h3 className="text-sm font-bold text-white">{proj.title}</h3>
            <p className="text-xs text-slate-400 line-clamp-2">{proj.summary}</p>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
              <span>{proj.milestones.length} Milestones Configured</span>
              <span>~{proj.estimatedHours}h Estimated</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
