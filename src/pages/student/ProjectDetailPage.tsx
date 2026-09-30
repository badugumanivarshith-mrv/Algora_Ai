import React, { useState } from 'react';
import {
  ArrowLeft,
  FolderGit2,
  CheckCircle2,
  Circle,
  BrainCircuit,
  Sparkles,
  ExternalLink,
  Github,
  Award,
  BookOpen,
  Layers,
  FileText,
  Clock,
  ShieldCheck,
  Send
} from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';
import { Project } from '../../types/project';
import confetti from 'canvas-confetti';

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ projectId, onBack }) => {
  const {
    projects,
    userProjectProgress,
    toggleTaskCompletion,
    updateProjectReflection,
    setIsMentorDrawerOpen,
    setMentorMode,
    setMentorContext
  } = useLearningStore();

  const project = projects.find((p) => p.id === projectId) || projects[0];
  const progress = userProjectProgress[project.id] || {
    status: 'not_started',
    completedTaskIds: [],
    reflectionNotes: ''
  };

  const [reflectionInput, setReflectionInput] = useState(progress.reflectionNotes || '');
  const [githubUrl, setGithubUrl] = useState(progress.githubUrl || '');
  const [savedStatus, setSavedStatus] = useState(false);

  // Total tasks count
  const allTasks = project.milestones.flatMap((m) => m.tasks);
  const completedCount = allTasks.filter((t) => progress.completedTaskIds.includes(t.id)).length;
  const progressPercent = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;

  const handleSaveReflection = () => {
    updateProjectReflection(project.id, reflectionInput, githubUrl);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
    if (progressPercent === 100) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleOpenProjectMentor = (milestoneTitle?: string) => {
    setMentorMode('project');
    setMentorContext({
      projectId: project.title,
      projectTitle: project.title,
      projectMilestone: milestoneTitle || 'Architecture Overview'
    });
    setIsMentorDrawerOpen(true);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        <button
          onClick={() => handleOpenProjectMentor()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
        >
          <BrainCircuit className="w-4 h-4 text-emerald-400" />
          <span>Ask Senior Architect AI</span>
        </button>
      </div>

      {/* Project Banner Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950">
                {project.level} Level Project
              </span>
              <span className="text-xs font-mono text-slate-400">
                {project.trackTitle}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{project.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">{project.summary}</p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono font-bold text-emerald-400">
              {progressPercent}% Complete ({completedCount}/{allTasks.length} Tasks)
            </span>
            <div className="w-36 bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Milestones & Tasks (Left 7 cols) | Architecture, Rubric, Reflection (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Milestones & Task Checklist */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <span>Implementation Milestones</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">Step-by-step guidance</span>
            </div>

            {project.milestones.length === 0 ? (
              <p className="text-xs text-slate-400">Milestone tasks are being loaded...</p>
            ) : (
              project.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white">{milestone.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{milestone.description}</p>
                    </div>

                    <button
                      onClick={() => handleOpenProjectMentor(milestone.title)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition shrink-0"
                      title="Get milestone architecture tips"
                    >
                      <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px]">Mentor Tip</span>
                    </button>
                  </div>

                  {/* Task Checklist */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    {milestone.tasks.map((task) => {
                      const isTaskDone = progress.completedTaskIds.includes(task.id);
                      return (
                        <div
                          key={task.id}
                          onClick={() => toggleTaskCompletion(project.id, task.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition flex items-start gap-3 ${
                            isTaskDone
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
                          }`}
                        >
                          <button className="mt-0.5 shrink-0">
                            {isTaskDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-500" />
                            )}
                          </button>

                          <div className="flex-1">
                            <h4 className={`text-xs font-bold ${isTaskDone ? 'line-through text-slate-400' : 'text-white'}`}>
                              {task.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                            <span className="text-[10px] text-emerald-400/80 font-mono mt-1 block">
                              Outcome: {task.learningOutcome}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                    <span>Deliverable: {milestone.deliverable}</span>
                    <span>⏱ ~{milestone.estimatedHours}h</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Architecture, Rubric, Reflection Notes */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Architecture & Data Flow */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              <span>Architecture & Data Flow</span>
            </h3>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {project.architectureDiagramNotes}
            </pre>
          </div>

          {/* Evaluation Rubric */}
          {project.evaluationCriteria.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Evaluation Rubric</span>
              </h3>
              <div className="space-y-2">
                {project.evaluationCriteria.map((rubric, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-bold text-white mb-0.5">
                      <span>{rubric.category}</span>
                      <span className="font-mono text-emerald-400">Max {rubric.maxScore} pts</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{rubric.criteria}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reflection Notes & GitHub Repo URL */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Project Reflection & Portfolio URL</span>
            </h3>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-semibold block">GitHub Repository URL:</label>
              <div className="relative">
                <Github className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="url"
                  placeholder="https://github.com/username/project-repo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-semibold block">
                Engineering Reflection Notes (Challenges, architectural decisions):
              </label>
              <textarea
                rows={4}
                value={reflectionInput}
                onChange={(e) => setReflectionInput(e.target.value)}
                placeholder="What bottlenecks did you encounter? What would you architect differently if scaling to 100k QPS?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
              />
            </div>

            <button
              onClick={handleSaveReflection}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{savedStatus ? 'Saved & Evaluated!' : 'Save Progress & Request Review'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
