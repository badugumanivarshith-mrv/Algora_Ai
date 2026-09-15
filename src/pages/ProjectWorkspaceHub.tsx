import React, { useState, useEffect } from "react";
import {
  Briefcase, Code2, LayoutDashboard, CheckSquare, Calendar, Sparkles, TrendingUp,
  Award, Layers, Plus, ChevronRight, Search, Filter, Clock, CheckCircle2,
  AlertCircle, Github, ExternalLink, MessageSquare, BookOpen, Brain, Terminal
} from "lucide-react";
import { ProjectWorkspaceApi } from "../services/projectWorkspaceApi";
import { motion, AnimatePresence } from "motion/react";

export default function ProjectWorkspaceHub() {
  const [activeTab, setActiveTab] = useState<
    "workspaces" | "planner" | "tasks" | "milestones" | "review" | "skills" | "internships" | "analytics"
  >("workspaces");

  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "workspaces") {
        const res = await ProjectWorkspaceApi.getWorkspaces();
        if (res.success) setWorkspaces(res.data);
        const recs = await ProjectWorkspaceApi.getRecommendations();
        if (recs.success) setRecommendations(recs.data);
      } else if (activeTab === "skills") {
        const res = await ProjectWorkspaceApi.getSkills();
        if (res.success) setSkills(res.data);
      } else if (activeTab === "internships") {
        const res = await ProjectWorkspaceApi.getInternships();
        if (res.success) setInternships(res.data);
      } else if (activeTab === "analytics") {
        const res = await ProjectWorkspaceApi.getAnalytics();
        if (res.success) setAnalytics(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWorkspace = async (w: any) => {
    setSelectedWorkspace(w);
    try {
      const tRes = await ProjectWorkspaceApi.getAnalytics(w.id); // Reusing analytics call for tasks for now
      const mRes = await ProjectWorkspaceApi.getMilestones(w.id);
      if (mRes.success) setMilestones(mRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Phase V3.8 Ecosystem
            </span>
            <span className="text-xs text-[var(--text-muted)]">AI Project Workspace & Internship Hub</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-indigo-500" />
            Project & Internship Experience
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
            Build real-world software, manage teams, track project-based skills, and land elite internships with AI-guided mentoring and reviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition shadow-sm flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Workspace
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
        {[
          { id: "workspaces", label: "Workspaces", icon: LayoutDashboard },
          { id: "planner", label: "Sprint Planner", icon: Calendar },
          { id: "tasks", label: "Tasks", icon: CheckSquare },
          { id: "milestones", label: "Milestones", icon: Layers },
          { id: "review", label: "AI Project Review", icon: Sparkles },
          { id: "skills", label: "Skill Tracking", icon: Award },
          { id: "internships", label: "Internship Hub", icon: Briefcase },
          { id: "analytics", label: "Experience Analytics", icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] border border-[var(--border)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20 text-[var(--text-muted)]">
              <Sparkles className="h-6 w-6 animate-spin mr-2 text-indigo-500" />
              Syncing Project Intelligence...
            </div>
          ) : (
            <>
              {/* TAB 1: WORKSPACES */}
              {activeTab === "workspaces" && (
                <div className="space-y-8">
                  {/* Recommended Projects */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Brain className="h-5 w-5 text-amber-400" />
                      AI Recommended Projects (Based on Gaps)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recommendations.map((rec, idx) => (
                        <div key={idx} className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-3 border-l-4 border-l-amber-400">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm">{rec.title}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 uppercase tracking-wider">
                              {rec.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] line-clamp-2">{rec.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {rec.targetSkills.map((s: string) => (
                              <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-canvas)] text-[var(--text-muted)]">
                                {s}
                              </span>
                            ))}
                          </div>
                          <button className="w-full py-2 rounded-lg bg-[var(--bg-canvas)] hover:bg-[var(--bg-muted)] text-[11px] font-bold transition flex items-center justify-center gap-1">
                            Bootstrap Project <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Workspaces */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">Your Active Workspaces</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {workspaces.map((w) => (
                        <div
                          key={w.id}
                          onClick={() => handleSelectWorkspace(w)}
                          className={`p-6 rounded-xl bg-[var(--bg-surface)] border transition cursor-pointer group ${
                            selectedWorkspace?.id === w.id ? "border-indigo-500 ring-1 ring-indigo-500" : "border-[var(--border)] hover:border-indigo-500/50"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                              <Terminal className="h-5 w-5" />
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {w.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-lg group-hover:text-indigo-400 transition">{w.name}</h4>
                          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 mb-4">
                            {w.description || "No description provided for this workspace."}
                          </p>
                          <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
                            {w.repository_url && (
                              <a href={w.repository_url} target="_blank" rel="noreferrer" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1">
                                <Github className="h-3.5 w-3.5" /> Repo
                              </a>
                            )}
                            {w.live_demo_url && (
                              <a href={w.live_demo_url} target="_blank" rel="noreferrer" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1">
                                <ExternalLink className="h-3.5 w-3.5" /> Demo
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SKILLS */}
              {activeTab === "skills" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Award className="h-5 w-5 text-indigo-400" />
                      Project-Based Skill Progression
                    </h3>
                    <div className="space-y-4">
                      {skills.map((s, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold">{s.skill_name}</span>
                            <span className="text-indigo-400 font-bold">+{s.total_gain} XP</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[var(--bg-canvas)] overflow-hidden">
                            <div
                              className="h-full bg-indigo-500"
                              style={{ width: `${Math.min(100, s.total_gain * 5)}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{s.category}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Layers className="h-10 w-10" />
                    </div>
                    <h4 className="text-xl font-bold">Hiring Readiness Boost</h4>
                    <p className="text-sm text-[var(--text-muted)] max-w-sm">
                      Your project work has contributed to a <strong className="text-emerald-400">+12.5% increase</strong> in your overall hiring readiness score.
                    </p>
                    <div className="grid grid-cols-3 gap-4 w-full pt-6 border-t border-[var(--border)]">
                      <div>
                        <div className="text-lg font-bold">8</div>
                        <div className="text-[10px] text-[var(--text-muted)] uppercase">Milestones</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">24</div>
                        <div className="text-[10px] text-[var(--text-muted)] uppercase">Tasks</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">120</div>
                        <div className="text-[10px] text-[var(--text-muted)] uppercase">Total XP</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: INTERNSHIPS */}
              {activeTab === "internships" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-indigo-400" />
                    Elite Internship Programs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {internships.map((int) => (
                      <div key={int.id} className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4 hover:border-indigo-500/50 transition relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 -mr-16 -mt-16 rounded-full" />
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 uppercase tracking-wider">
                              {int.company_name}
                            </span>
                            <h4 className="font-bold text-lg mt-2">{int.title}</h4>
                          </div>
                          <span className="text-xs font-semibold text-emerald-400">{int.stipend}</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">{int.description}</p>
                        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {int.duration}</span>
                          <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {int.location}</span>
                        </div>
                        <div className="pt-4 border-t border-[var(--border)] flex gap-2">
                          <button className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition">
                            Apply Now
                          </button>
                          <button className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs hover:bg-[var(--bg-muted)] transition">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ANALYTICS */}
              {activeTab === "analytics" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                      <div className="text-xs text-[var(--text-muted)] font-bold uppercase mb-1">Total Workspaces</div>
                      <div className="text-3xl font-extrabold">{analytics?.totalWorkspaces || 0}</div>
                    </div>
                    <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                      <div className="text-xs text-[var(--text-muted)] font-bold uppercase mb-1">Avg Completion</div>
                      <div className="text-3xl font-extrabold text-emerald-400">{Math.round(analytics?.avgCompletion || 0)}%</div>
                    </div>
                    <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                      <div className="text-xs text-[var(--text-muted)] font-bold uppercase mb-1">Skills Tracked</div>
                      <div className="text-3xl font-extrabold text-indigo-400">{analytics?.totalSkills || 0}</div>
                    </div>
                    <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                      <div className="text-xs text-[var(--text-muted)] font-bold uppercase mb-1">Milestone Performance</div>
                      <div className="text-3xl font-extrabold text-amber-400">92%</div>
                    </div>
                  </div>

                  <div className="p-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] border-t-4 border-t-indigo-500">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h3 className="text-xl font-bold">Experience Growth Curve</h3>
                        <p className="text-sm text-[var(--text-muted)]">Visualizing your journey from learning to production readiness.</p>
                      </div>
                      <button className="text-xs text-indigo-400 font-bold hover:underline">Download Report</button>
                    </div>
                    <div className="h-64 flex items-end gap-2">
                      {[40, 55, 45, 70, 65, 85, 95].map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                          <div
                            className="w-full bg-gradient-to-t from-indigo-600/80 to-indigo-400 rounded-t-lg transition-all group-hover:from-indigo-500 group-hover:to-indigo-300"
                            style={{ height: `${val}%` }}
                          />
                          <span className="text-[10px] text-[var(--text-muted)]">Batch {idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Placeholder for others */}
              {!['workspaces', 'skills', 'internships', 'analytics'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">Phase 3.8 Module Active</h3>
                  <p className="text-sm text-[var(--text-muted)] max-w-xs">
                    Please select an active workspace to enable {activeTab} orchestration.
                  </p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
