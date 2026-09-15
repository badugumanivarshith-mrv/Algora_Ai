import React, { useState, useEffect } from "react";
import {
  CareerApi,
  CareerProfile,
  ResumeVersion,
  ResumeReview,
  JobMatch,
  CareerRoadmap,
  PortfolioAnalysis,
  CareerAnalyticsData,
  InterviewHistoryItem,
  PlacementPrediction,
} from "../services/careerApi";
import {
  Briefcase,
  FileText,
  CheckCircle2,
  Target,
  Compass,
  UserCheck,
  Building2,
  Code2,
  TrendingUp,
  History,
  Sparkles,
  Award,
  AlertTriangle,
  Send,
  Bot,
  RefreshCw,
  Search,
  BookOpen,
} from "lucide-react";

export const CareerHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | "profile"
    | "resume"
    | "review"
    | "jobs"
    | "roadmap"
    | "recruiter"
    | "insights"
    | "portfolio"
    | "analytics"
    | "history"
    | "predictor"
    | "coach"
  >("profile");

  // State
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [selectedResumeText, setSelectedResumeText] = useState("");
  const [review, setReview] = useState<ResumeReview | null>(null);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioAnalysis | null>(null);
  const [analytics, setAnalytics] = useState<CareerAnalyticsData | null>(null);
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [prediction, setPrediction] = useState<PlacementPrediction | null>(null);

  // Recruiter State
  const [selectedCompany, setSelectedCompany] = useState("Amazon");
  const [interviewType, setInterviewType] = useState<"HR" | "Technical" | "Behavioral" | "Managerial" | "Leadership">("Technical");
  const [recruiterQuestion, setRecruiterQuestion] = useState("Click 'Start Recruiter Interview' to begin.");
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [transcript, setTranscript] = useState<{ candidate?: string; recruiter?: string }[]>([]);
  const [recruiterEvaluation, setRecruiterEvaluation] = useState<any>(null);
  const [recruiterLoading, setRecruiterLoading] = useState(false);

  // Resume Builder Form State
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [resumeTitle, setResumeTitle] = useState("Full Stack Resume");
  const [builderLoading, setBuilderLoading] = useState(false);

  // Portfolio Analyzer Form State
  const [githubUser, setGithubUser] = useState("");
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  // Coach State
  const [coachQuery, setCoachQuery] = useState("");
  const [coachTopic, setCoachTopic] = useState("career");
  const [coachAdvice, setCoachAdvice] = useState<any>(null);
  const [coachLoading, setCoachLoading] = useState(false);

  useEffect(() => {
    loadProfile();
    loadResumes();
    loadJobs();
    loadRoadmap();
    loadAnalytics();
    loadInterviews();
    loadPredictions();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await CareerApi.getProfile();
      if (res.success) setProfile(res.profile);
    } catch (e) {
      // Fallback
    }
  };

  const loadResumes = async () => {
    try {
      const res = await CareerApi.getResumes();
      if (res.success) setResumes(res.resumes);
    } catch (e) {
      // Fallback
    }
  };

  const loadJobs = async () => {
    try {
      const res = await CareerApi.getJobs();
      if (res.success) setJobMatches(res.matches);
    } catch (e) {
      // Fallback
    }
  };

  const loadRoadmap = async () => {
    try {
      const res = await CareerApi.getRoadmap();
      if (res.success) setRoadmap(res.roadmap);
    } catch (e) {
      // Fallback
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await CareerApi.getAnalytics();
      if (res.success) setAnalytics(res.analytics);
    } catch (e) {
      // Fallback
    }
  };

  const loadInterviews = async () => {
    try {
      const res = await CareerApi.getInterviews();
      if (res.success) setInterviews(res.interviews);
    } catch (e) {
      // Fallback
    }
  };

  const loadPredictions = async () => {
    try {
      const res = await CareerApi.getPredictions();
      if (res.success) setPrediction(res.prediction);
    } catch (e) {
      // Fallback
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const res = await CareerApi.updateProfile(profile);
      if (res.success) setProfile(res.profile);
    } catch (e) {
      // Fallback
    }
  };

  const handleGenerateResume = async () => {
    setBuilderLoading(true);
    try {
      const res = await CareerApi.generateResume({
        title: resumeTitle,
        targetRole,
        existingSkills: profile?.preferred_tech_stack || ["TypeScript", "Node.js", "React", "PostgreSQL"],
      });
      if (res.success) {
        setResumes((prev) => [res.resume, ...prev]);
        setSelectedResumeText(JSON.stringify(res.resume.content_json, null, 2));
      }
    } catch (e) {
      // Fallback
    } finally {
      setBuilderLoading(false);
    }
  };

  const handleReviewResume = async () => {
    try {
      const res = await CareerApi.reviewResume({
        resumeText: selectedResumeText || "Experienced Full Stack Engineer with TypeScript and React background.",
        targetRole,
      });
      if (res.success) setReview(res.review);
    } catch (e) {
      // Fallback
    }
  };

  const handleStartRecruiter = async () => {
    setRecruiterLoading(true);
    try {
      const res = await CareerApi.simulateRecruiter({
        company: selectedCompany,
        interviewType,
      });
      if (res.success) {
        setRecruiterQuestion(res.aiQuestion);
        setTranscript([{ recruiter: res.aiQuestion }]);
      }
    } catch (e) {
      // Fallback
    } finally {
      setRecruiterLoading(false);
    }
  };

  const handleSendAnswer = async () => {
    if (!candidateAnswer.trim()) return;
    setRecruiterLoading(true);
    const updatedTranscript = [...transcript, { candidate: candidateAnswer }];
    setTranscript(updatedTranscript);
    try {
      const res = await CareerApi.simulateRecruiter({
        company: selectedCompany,
        interviewType,
        candidateAnswer,
        transcript: updatedTranscript,
      });
      if (res.success) {
        setRecruiterQuestion(res.aiQuestion);
        setTranscript([...updatedTranscript, { recruiter: res.aiQuestion }]);
        setCandidateAnswer("");
        if (res.evaluation) setRecruiterEvaluation(res.evaluation);
      }
    } catch (e) {
      // Fallback
    } finally {
      setRecruiterLoading(false);
    }
  };

  const handleAnalyzePortfolio = async () => {
    setPortfolioLoading(true);
    try {
      const res = await CareerApi.analyzePortfolio({ githubUsername: githubUser });
      if (res.success) setPortfolio(res.analysis);
    } catch (e) {
      // Fallback
    } finally {
      setPortfolioLoading(false);
    }
  };

  const handleAskCoach = async () => {
    if (!coachQuery.trim()) return;
    setCoachLoading(true);
    try {
      const res = await CareerApi.askCoach({
        userQuery: coachQuery,
        topic: coachTopic,
        targetCompany: selectedCompany,
        targetRole,
      });
      if (res.success) setCoachAdvice(res);
    } catch (e) {
      // Fallback
    } finally {
      setCoachLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Career & Placement Acceleration Platform (V3.3)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Recruiter & Placement Intelligence
            </h1>
            <p className="text-neutral-400 text-sm max-w-2xl">
              Transform your coding preparation into guaranteed placement offers with real-time AI recruiter simulations, ATS resume optimization, automated portfolio audits, and predictive company readiness.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-neutral-900/80 p-4 rounded-2xl border border-neutral-700/60 font-mono">
            <div>
              <p className="text-[10px] text-neutral-400 uppercase font-bold">Placement Probability</p>
              <p className="text-2xl font-black text-emerald-400">{prediction?.hiring_probability || 89}%</p>
            </div>
            <div className="h-8 w-px bg-neutral-700" />
            <div>
              <p className="text-[10px] text-neutral-400 uppercase font-bold">Target Role</p>
              <p className="text-sm font-bold text-neutral-200">{profile?.target_role || "Backend Engineer"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-neutral-200 text-xs font-bold scrollbar-none">
        {[
          { id: "profile", label: "Career Profile", icon: Briefcase },
          { id: "resume", label: "Resume Builder", icon: FileText },
          { id: "review", label: "Resume Reviewer", icon: CheckCircle2 },
          { id: "jobs", label: "Job Matching", icon: Target },
          { id: "roadmap", label: "Career Roadmap", icon: Compass },
          { id: "recruiter", label: "Recruiter Simulator", icon: UserCheck },
          { id: "insights", label: "Company Insights", icon: Building2 },
          { id: "portfolio", label: "Portfolio Analyzer", icon: Code2 },
          { id: "analytics", label: "Career Analytics", icon: TrendingUp },
          { id: "history", label: "Interview History", icon: History },
          { id: "predictor", label: "Placement Predictor", icon: Award },
          { id: "coach", label: "AI Career Coach", icon: Bot },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-200/80"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-neutral-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Career Profile */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Career Goal & Preferences</h2>
              <p className="text-xs text-neutral-500">Define target roles, companies, tech stack, and experience goals.</p>
            </div>
            <button
              onClick={handleUpdateProfile}
              className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Save Profile Changes
            </button>
          </div>

          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Career Goal</label>
              <input
                type="text"
                value={profile?.career_goal || ""}
                onChange={(e) => profile && setProfile({ ...profile, career_goal: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden font-medium"
                placeholder="e.g. Become a Senior Staff Software Engineer at Tier 1 Tech"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Target Role</label>
              <select
                value={profile?.target_role || "Backend Engineer"}
                onChange={(e) => profile && setProfile({ ...profile, target_role: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden font-medium"
              >
                {[
                  "Software Engineer",
                  "Backend Developer",
                  "Frontend Developer",
                  "Full Stack Developer",
                  "AI Engineer",
                  "Data Engineer",
                  "ML Engineer",
                ].map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Experience Level</label>
              <select
                value={profile?.experience_level || "Mid-Level"}
                onChange={(e) => profile && setProfile({ ...profile, experience_level: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden font-medium"
              >
                {["Entry Level / New Grad", "Junior (1-2 yrs)", "Mid-Level (2-5 yrs)", "Senior (5+ yrs)", "Staff / Lead"].map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Preferred Tech Stack (Comma Separated)</label>
              <input
                type="text"
                value={profile?.preferred_tech_stack?.join(", ") || ""}
                onChange={(e) =>
                  profile &&
                  setProfile({
                    ...profile,
                    preferred_tech_stack: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-neutral-700 mb-1">Target Companies</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {["Amazon", "Google", "Microsoft", "Meta", "Netflix", "Adobe", "Uber", "Atlassian", "TCS", "Infosys", "Wipro", "Accenture", "Cognizant"].map((comp) => {
                  const isSelected = profile?.target_companies?.includes(comp);
                  return (
                    <button
                      type="button"
                      key={comp}
                      onClick={() => {
                        if (!profile) return;
                        const curr = profile.target_companies || [];
                        const updated = isSelected ? curr.filter((c) => c !== comp) : [...curr, comp];
                        setProfile({ ...profile, target_companies: updated });
                      }}
                      className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition-colors ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                          : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                      }`}
                    >
                      {comp}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Resume Builder */}
      {activeTab === "resume" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-neutral-900">AI Professional Resume Generator</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Resume Title</label>
                <input
                  type="text"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Target Role Specialization</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
                >
                  {[
                    "Software Engineer",
                    "Backend Developer",
                    "Frontend Developer",
                    "Full Stack Developer",
                    "AI Engineer",
                    "Data Engineer",
                    "ML Engineer",
                  ].map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateResume}
                  disabled={builderLoading}
                  className="w-full py-2.5 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  {builderLoading ? "Generating Resume..." : "Generate AI Resume"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-neutral-900">Saved Resume Versions</h3>
              {resumes.length === 0 ? (
                <p className="text-xs text-neutral-500">No resumes generated yet.</p>
              ) : (
                resumes.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedResumeText(JSON.stringify(r.content_json, null, 2))}
                    className="p-3 bg-neutral-50 hover:bg-indigo-50/50 border border-neutral-200 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-neutral-900">{r.title}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                        ATS {r.ats_score}%
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">{r.target_role}</p>
                  </div>
                ))
              )}
            </div>

            <div className="lg:col-span-2 bg-neutral-900 text-neutral-200 rounded-2xl border border-neutral-800 p-5 font-mono text-xs overflow-auto max-h-[500px]">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                <span className="text-neutral-400 font-bold uppercase text-[10px]">Resume JSON Preview</span>
                <button
                  onClick={() => navigator.clipboard.writeText(selectedResumeText)}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-[10px]"
                >
                  Copy JSON
                </button>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed">{selectedResumeText || "// Click or generate a resume to view raw JSON"}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Resume Reviewer */}
      {activeTab === "review" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-neutral-900">AI Resume Reviewer & ATS Optimizer</h2>
            <p className="text-xs text-neutral-500">Paste your raw resume text to execute an in-depth FAANG ATS evaluation.</p>
            <textarea
              value={selectedResumeText}
              onChange={(e) => setSelectedResumeText(e.target.value)}
              rows={5}
              className="w-full p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono focus:outline-hidden"
              placeholder="Paste raw text of your resume here..."
            />
            <button
              onClick={handleReviewResume}
              className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Audit & Evaluate Resume
            </button>
          </div>

          {review && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
                <p className="text-xs text-neutral-500 font-bold uppercase">ATS Audit Score</p>
                <p className="text-4xl font-black text-emerald-600">{review.ats_score}%</p>
                <div className="text-xs space-y-1 text-neutral-600">
                  <p>Formatting Score: <span className="font-bold">{review.formatting_score}%</span></p>
                  <p>Achievements Metric: <span className="font-bold">{review.achievements_score}%</span></p>
                  <p>Experience Quality: <span className="font-bold text-indigo-600">{review.experience_quality}</span></p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
                <p className="text-xs text-neutral-500 font-bold uppercase">Skill Gaps & Keyword Matches</p>
                <div>
                  <p className="text-[11px] font-bold text-red-600 mb-1">Identified Gaps:</p>
                  <div className="flex flex-wrap gap-1">
                    {review.skill_gaps.map((sg) => (
                      <span key={sg} className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-md text-[10px] font-semibold">{sg}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-emerald-600 mb-1">Keywords Matched:</p>
                  <div className="flex flex-wrap gap-1">
                    {review.keyword_matches.map((km) => (
                      <span key={km} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-semibold">{km}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
                <p className="text-xs text-neutral-500 font-bold uppercase">Actionable Improvement Plan</p>
                <p className="text-xs text-neutral-800 leading-relaxed font-medium">{review.improvement_plan}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Job Matching */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">Target Company Job Matches</h2>
            <button onClick={loadJobs} className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold hover:bg-neutral-50 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Matches
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobMatches.map((jm) => (
              <div key={jm.id} className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md font-bold text-[10px] uppercase">
                      {jm.company}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900 mt-1">{jm.role}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-600">{jm.match_percentage}%</span>
                    <p className="text-[10px] text-neutral-400 font-bold">MATCH</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <p className="font-bold text-neutral-700 mb-1">Recommended Topics:</p>
                    <div className="flex flex-wrap gap-1">
                      {jm.recommended_topics.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md text-[10px]">{t}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-neutral-700 mb-1">Target Problems:</p>
                    <div className="flex flex-wrap gap-1">
                      {jm.recommended_problems.map((p) => (
                        <span key={p} className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[10px] font-mono">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Career Roadmap */}
      {activeTab === "roadmap" && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Placement Preparation Roadmap</h2>
              <p className="text-xs text-neutral-500">Structured daily, weekly, and monthly milestones tailored to {roadmap?.target_company || "Amazon"}.</p>
            </div>
          </div>

          {roadmap && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                <h3 className="font-bold text-neutral-900 text-sm border-b pb-2">Daily Schedule</h3>
                {roadmap.daily_plan.map((d: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-neutral-200/80">
                    <p className="font-bold text-indigo-600">Day {d.day}: {d.topic}</p>
                    <p className="text-neutral-500 mt-0.5">Problems: {Array.isArray(d.problems) ? d.problems.join(", ") : d.problems}</p>
                  </div>
                ))}
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                <h3 className="font-bold text-neutral-900 text-sm border-b pb-2">Weekly Milestones</h3>
                {roadmap.weekly_plan.map((w: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-neutral-200/80">
                    <p className="font-bold text-neutral-900">Week {w.week}: {w.focus}</p>
                  </div>
                ))}
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                <h3 className="font-bold text-neutral-900 text-sm border-b pb-2">Mock & Revision Schedule</h3>
                {roadmap.mock_schedule.map((m: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-neutral-200/80">
                    <p className="font-bold text-emerald-700">Day {m.day}: {m.type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Recruiter Simulator */}
      {activeTab === "recruiter" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <h2 className="font-bold text-sm text-neutral-900">AI Recruiter Setup</h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Company</label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                >
                  {["Amazon", "Google", "Microsoft", "Meta", "Netflix", "Adobe", "Uber", "Atlassian", "TCS", "Infosys"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Interview Round Type</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value as any)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                >
                  {["HR", "Technical", "Behavioral", "Managerial", "Leadership"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleStartRecruiter}
                disabled={recruiterLoading}
                className="w-full py-2.5 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-colors"
              >
                {recruiterLoading ? "Starting..." : "Start Recruiter Round"}
              </button>
            </div>

            {recruiterEvaluation && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                <p className="font-bold text-emerald-900">Round Evaluation</p>
                <p>Recommendation: <span className="font-extrabold text-emerald-700">{recruiterEvaluation.hiringRecommendation}</span></p>
                <p>Confidence Score: <span className="font-extrabold">{recruiterEvaluation.confidenceScore}%</span></p>
                <p className="text-neutral-700 text-[11px] mt-1">{recruiterEvaluation.communicationFeedback}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col min-h-[450px]">
            <h3 className="font-bold text-sm text-neutral-900 mb-3 pb-2 border-b">Live Recruiter Chat</h3>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px] p-2">
              {transcript.map((t, idx) => (
                <div key={idx} className="space-y-2 text-xs">
                  {t.recruiter && (
                    <div className="p-3 bg-neutral-100 text-neutral-900 rounded-2xl rounded-tl-xs max-w-[85%] font-medium">
                      <span className="font-bold text-indigo-600 block text-[10px] mb-0.5">Gemini Recruiter ({selectedCompany})</span>
                      {t.recruiter}
                    </div>
                  )}
                  {t.candidate && (
                    <div className="p-3 bg-indigo-600 text-white rounded-2xl rounded-tr-xs max-w-[85%] ml-auto font-medium">
                      {t.candidate}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t flex items-center gap-2">
              <input
                type="text"
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendAnswer()}
                placeholder="Type your response using STAR framework..."
                className="flex-1 p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-hidden"
              />
              <button
                onClick={handleSendAnswer}
                disabled={recruiterLoading}
                className="p-2.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Company Hiring Insights */}
      {activeTab === "insights" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { company: "Amazon", rounds: "Online Assessment -> Technical Phone -> 4x Onsite Bar Raiser", priority: "Leadership Principles + Trees & Graphs", difficulty: "High" },
            { company: "Google", rounds: "Technical Phone -> 5x Onsite Coding & System Design", priority: "Graph Traversals + Dynamic Programming", difficulty: "Very High" },
            { company: "Microsoft", rounds: "Online Assessment -> 3x Technical Rounds", priority: "Arrays, Linked Lists & System Architecture", difficulty: "Moderate-High" },
            { company: "Meta", rounds: "Phone Screen -> 2x Speed Coding + System Design", priority: "Speed & Accuracy on Medium-Hard DSA", difficulty: "Very High" },
            { company: "Adobe", rounds: "Technical Screening -> 3x Deep Algorithmic Rounds", priority: "Pointers, Strings & Memory Management", difficulty: "Moderate-High" },
            { company: "TCS / Infosys", rounds: "National Qualifier Test -> Technical & HR Interview", priority: "Aptitude, Core Java/C++, SQL Basics", difficulty: "Moderate" },
          ].map((ci) => (
            <div key={ci.company} className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-neutral-900">{ci.company}</span>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md">{ci.difficulty}</span>
              </div>
              <p><span className="font-bold text-neutral-700">Interview Rounds:</span> {ci.rounds}</p>
              <p><span className="font-bold text-neutral-700">Preparation Priority:</span> {ci.priority}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 8: Portfolio Analyzer */}
      {activeTab === "portfolio" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-neutral-900">GitHub & Project Portfolio Audit</h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
                placeholder="Enter GitHub Username (e.g. torvalds)"
                className="flex-1 p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
              />
              <button
                onClick={handleAnalyzePortfolio}
                disabled={portfolioLoading}
                className="px-4 py-2.5 bg-neutral-900 text-white font-bold text-xs rounded-xl hover:bg-neutral-800"
              >
                {portfolioLoading ? "Auditing..." : "Audit Portfolio"}
              </button>
            </div>
          </div>

          {portfolio && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2 text-xs">
                <p className="font-bold text-neutral-500 uppercase text-[10px]">Portfolio Score</p>
                <p className="text-4xl font-black text-indigo-600">{portfolio.portfolio_score}%</p>
                <p className="font-bold text-neutral-800">{portfolio.complexity_rating}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2 text-xs">
                <p className="font-bold text-neutral-500 uppercase text-[10px]">Detected Tech Stack</p>
                <div className="flex flex-wrap gap-1">
                  {portfolio.tech_stack_detected.map((ts) => (
                    <span key={ts} className="px-2 py-0.5 bg-neutral-100 font-mono text-[10px] rounded-md">{ts}</span>
                  ))}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2 text-xs">
                <p className="font-bold text-neutral-500 uppercase text-[10px]">Recommendations</p>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  {portfolio.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 9: Career Analytics */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
            <p className="text-[10px] font-bold text-neutral-400 uppercase">Learning Velocity</p>
            <p className="text-3xl font-black text-indigo-600">{analytics?.learning_velocity || 1.35}x</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
            <p className="text-[10px] font-bold text-neutral-400 uppercase">Placement Probability</p>
            <p className="text-3xl font-black text-emerald-600">{analytics?.placement_probability || 89}%</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
            <p className="text-[10px] font-bold text-neutral-400 uppercase">Total Interviews Conducted</p>
            <p className="text-3xl font-black text-neutral-900">{analytics?.interview_performance?.totalInterviews || 12}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
            <p className="text-[10px] font-bold text-neutral-400 uppercase">Contest Rating</p>
            <p className="text-3xl font-black text-amber-600">{analytics?.contest_performance?.currentRating || 1720}</p>
          </div>
        </div>
      )}

      {/* Tab 10: Interview History */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-neutral-900">Historical Interview Logs</h2>
          <div className="space-y-3 text-xs">
            {interviews.map((item) => (
              <div key={item.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 text-sm">{item.company} — {item.round_type}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-neutral-700">{item.feedback_text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 11: Placement Predictor */}
      {activeTab === "predictor" && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Company Placement Readiness Predictor</h2>
              <p className="text-xs text-neutral-500">Multimodal prediction combining adaptive learning, memory, contests, and mock interviews.</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-600">{prediction?.placement_confidence || 91}%</span>
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Placement Confidence</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
              <h3 className="font-bold text-neutral-900">Company Hiring Breakdown</h3>
              {Object.entries(prediction?.company_breakdown || {}).map(([comp, prob]: any) => (
                <div key={comp} className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                  <span className="font-bold text-neutral-700">{comp}</span>
                  <span className="font-black text-indigo-600">{prob}%</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-red-50/50 border border-red-200 rounded-xl space-y-2">
              <h3 className="font-bold text-red-900">Risk Areas & Required Actions</h3>
              <ul className="list-disc list-inside space-y-1 text-red-800">
                {(prediction?.risk_areas || []).map((ra, i) => (
                  <li key={i}>{ra}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 12: AI Career Coach */}
      {activeTab === "coach" && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-neutral-900">AI Career Coach & Negotiation Assistant</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={coachQuery}
              onChange={(e) => setCoachQuery(e.target.value)}
              placeholder="Ask anything (e.g. How to prepare for Amazon Bar Raiser or negotiate TC?)"
              className="flex-1 p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
            />
            <button
              onClick={handleAskCoach}
              disabled={coachLoading}
              className="px-4 py-2.5 bg-neutral-900 text-white font-bold text-xs rounded-xl hover:bg-neutral-800"
            >
              {coachLoading ? "Consulting..." : "Ask Coach"}
            </button>
          </div>

          {coachAdvice && (
            <div className="p-5 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-3 text-xs">
              <p className="font-bold text-indigo-900 text-sm">Coach Strategic Guidance</p>
              <p className="text-neutral-800 leading-relaxed font-medium">{coachAdvice.advice}</p>

              <div>
                <p className="font-bold text-indigo-950 mb-1">Actionable Steps:</p>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  {coachAdvice.actionableSteps?.map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
