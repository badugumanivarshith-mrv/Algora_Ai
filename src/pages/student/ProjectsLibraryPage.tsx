import React, { useState } from 'react';
import {
  FolderGit2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Code2,
  Star
} from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';
import { ProjectLevel, Project } from '../../types/project';

interface ProjectsLibraryProps {
  onSelectProject: (projectId: string) => void;
}

export const ProjectsLibraryPage: React.FC<ProjectsLibraryProps> = ({ onSelectProject }) => {
  const { projects, userProjectProgress } = useLearningStore();
  const [selectedLevel, setSelectedLevel] = useState<'All' | ProjectLevel>('All');

  const filteredProjects = selectedLevel === 'All'
    ? projects
    : projects.filter((p) => p.level === selectedLevel);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FolderGit2 className="w-4 h-4" />
            <span>Practical Engineering</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Guided Project Builds</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build real systems from scratch with milestone task verification and Senior Architect AI coaching.
          </p>
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedLevel === lvl
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const progress = userProjectProgress[project.id];
          const isCompleted = progress?.status === 'completed';
          const isInProgress = progress?.status === 'in_progress';

          return (
            <div
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="group bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col shadow-lg hover:shadow-emerald-950/20"
            >
              {/* Banner Image */}
              <div className="relative h-44 overflow-hidden bg-slate-950">
                <img
                  src={project.bannerImage}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      project.level === 'Beginner'
                        ? 'bg-emerald-500/90 text-slate-950'
                        : project.level === 'Intermediate'
                        ? 'bg-amber-500/90 text-slate-950'
                        : 'bg-rose-500/90 text-white'
                    }`}
                  >
                    {project.level}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-900/90 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-slate-700">
                    {project.trackTitle}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3">
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 backdrop-blur-md text-emerald-300 text-xs font-mono font-bold border border-emerald-500/40">
                    +{project.xpReward} XP
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {project.summary}
                  </p>
                </div>

                {/* Tech Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Footer Progress & Trigger */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </span>
                    ) : isInProgress ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Clock className="w-4 h-4" /> In Progress
                      </span>
                    ) : (
                      <span className="text-slate-400">~{project.estimatedHours}h Estimated</span>
                    )}
                  </div>

                  <span className="text-emerald-400 font-semibold group-hover:translate-x-1 transition flex items-center gap-1">
                    <span>Workbench</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
