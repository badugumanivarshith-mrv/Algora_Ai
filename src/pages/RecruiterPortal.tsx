/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Recruiter & Placement Portal Dashboard
 */

import React, { useState, useEffect } from "react";
import {
  Briefcase, Users, Search, Plus, MapPin, DollarSign, FileText,
  TrendingUp, Sparkles, Send, CheckCircle2, AlertTriangle, ShieldCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import confetti from "canvas-confetti";

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  type: string;
  salary?: string;
  requirements: string;
  createdAt: string;
}

interface StudentCandidate {
  id: string;
  name: string;
  email: string;
  college: string;
  xp: number;
  level: number;
  streak: number;
  targetCompany: string;
  reputationScore: number;
  contributionScore: number;
}

interface Application {
  id: string;
  jobId: string;
  studentId: string;
  status: string;
  feedback?: string;
  appliedAt: string;
}

export default function RecruiterPortal() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Tabs: 'jobs', 'candidates', 'applications'
  const [activeTab, setActiveTab] = useState<"jobs" | "candidates" | "applications">("jobs");

  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<StudentCandidate[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Post job form
  const [showPostJob, setShowPostJob] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobLoc, setJobLoc] = useState("Remote");
  const [jobType, setJobType] = useState("Full-Time");
  const [jobSalary, setJobSalary] = useState("");
  const [jobReqs, setJobReqs] = useState("");

  // Pipeline modal / action
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState("Screening");
  const [appFeedback, setAppFeedback] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchCandidates();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/recruiter/jobs");
      const json = await res.json();
      if (json.success) setJobs(json.data);
    } catch {}
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch("/api/recruiter/candidates");
      const json = await res.json();
      if (json.success) setCandidates(json.data);
    } catch {}
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/recruiter/applications");
      const json = await res.json();
      if (json.success) setApps(json.data);
    } catch {}
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch("/api/recruiter/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobTitle,
          company: jobCompany,
          description: jobDesc,
          location: jobLoc,
          type: jobType,
          salary: jobSalary,
          requirements: jobReqs
        })
      });
      const json = await res.json();
      if (json.success) {
        setJobTitle("");
        setJobCompany("");
        setJobDesc("");
        setJobSalary("");
        setJobReqs("");
        setShowPostJob(false);
        fetchJobs();
        confetti({ particleCount: 50 });
      }
    } catch {}
  };

  const handleApply = async (jobId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch("/api/recruiter/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });
      const json = await res.json();
      if (json.success) {
        alert("Application successfully submitted to the recruiter! Monitor updates in your profile notifications.");
        confetti({ particleCount: 40 });
        fetchApplications();
      } else {
        alert(json.error || "Failed to submit application");
      }
    } catch {}
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setIsUpdating(true);
    try {
      const res = await fetch("/api/recruiter/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId: selectedApp.id,
          status: newStatus,
          feedback: appFeedback
        })
      });
      const json = await res.json();
      if (json.success) {
        setSelectedApp(null);
        setAppFeedback("");
        fetchApplications();
        confetti({ particleCount: 50 });
        alert("Candidate application status updated and student notified!");
      }
    } catch {
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredJobs = jobs.filter((j) =>
    !searchQuery ||
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCandidates = candidates.filter((c) =>
    !searchQuery ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.targetCompany.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Placement & Candidate Sourcing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Recruiter & Placement Portal</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Source verified student talents with authenticated learning histories, XP levels, and contest ranks.
          </p>
        </div>

        {activeTab === "jobs" && (
          <button
            onClick={() => setShowPostJob(!showPostJob)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post Job / Internship</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-px overflow-x-auto">
        {[
          { id: "jobs", label: "💼 Job Openings", icon: Briefcase },
          { id: "candidates", label: "👥 Sourcing Candidates", icon: Users },
          { id: "applications", label: "📋 Pipeline Tracking", icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-xs sm:text-sm transition shrink-0 ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SEARCH AND FILTERS */}
      {activeTab !== "applications" && (
        <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === "jobs" ? "Search job titles or companies..." : "Search students by name..."}
            className="bg-transparent text-xs text-slate-200 focus:outline-none w-full placeholder-slate-500"
          />
        </div>
      )}

      {/* ── Tab Content ── */}

      {/* 1. JOBS BOARD */}
      {activeTab === "jobs" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {showPostJob && (
              <form onSubmit={handlePostJob} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <h3 className="font-extrabold text-white text-sm">Post a New Opening</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Frontend Engineer Intern"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={jobCompany}
                      onChange={(e) => setJobCompany(e.target.value)}
                      placeholder="e.g. Google"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                    <input
                      type="text"
                      value={jobLoc}
                      onChange={(e) => setJobLoc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Job Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Salary Range (Optional)</label>
                    <input
                      type="text"
                      value={jobSalary}
                      onChange={(e) => setJobSalary(e.target.value)}
                      placeholder="e.g. $80K - $100K"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Requirements</label>
                  <textarea
                    value={jobReqs}
                    onChange={(e) => setJobReqs(e.target.value)}
                    placeholder="Provide specific prerequisites..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none h-20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Job Description</label>
                  <textarea
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    placeholder="Describe job responsibilities..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none h-24"
                    required
                  />
                </div>

                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition">
                  Post Opportunity
                </button>
              </form>
            )}

            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[9px] uppercase font-bold">
                        {job.type}
                      </span>
                      <h3 className="font-extrabold text-white text-base mt-1.5">{job.title}</h3>
                      <p className="text-xs text-slate-400 font-semibold">{job.company}</p>
                    </div>

                    <button
                      onClick={() => handleApply(job.id)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition"
                    >
                      Apply Now
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{job.description}</p>

                  <div className="grid grid-cols-2 gap-4 p-3 bg-slate-950/60 rounded-xl border border-slate-900 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Location</span>
                      <span className="text-slate-200 mt-0.5 block flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {job.location}
                      </span>
                    </div>
                    {job.salary && (
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Salary Package</span>
                        <span className="text-slate-200 mt-0.5 block flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> {job.salary}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-extrabold text-white text-base mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Placement Guidelines</span>
              </h3>
              <ul className="text-xs text-slate-300 space-y-3 list-disc pl-4">
                <li>Authenticated SDE candidates showcase real test run success stats.</li>
                <li>Hiring criteria matches verified code profiles and problem solving velocities.</li>
                <li>Submit placement application updates directly through pipeline triggers.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. CANDIDATES SOURCING */}
      {activeTab === "candidates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((cand) => (
            <div key={cand.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-white text-sm uppercase">
                    {cand.name.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">{cand.name}</h3>
                    <p className="text-[10px] text-slate-500">{cand.college}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-slate-950/60 rounded-xl border border-slate-900 text-center">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Reputation</span>
                    <span className="block text-sm font-black text-white mt-0.5">{cand.reputationScore}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">XP Level</span>
                    <span className="block text-sm font-black text-indigo-400 mt-0.5">{cand.level}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                  Verified target preparation roadmap matching <strong>{cand.targetCompany}</strong>. Completed active coding challenge sprints.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500">Sourced Talent</span>
                <span className="text-indigo-400 font-bold">Verified Profile</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. PIPELINE APPLICATIONS TRACKING */}
      {activeTab === "applications" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800">
              <h3 className="font-extrabold text-white text-sm">Active Applications Pipeline</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="px-6 py-3">Student Candidate</th>
                    <th className="px-4 py-3">Pipeline Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {apps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-900/40 text-slate-300">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">Student Applicant</div>
                        <div className="text-[10px] text-slate-500">ID: {app.studentId.slice(0, 8)}...</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[9px] uppercase font-black">
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-2.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-bold transition"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-1">
            {selectedApp ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-extrabold text-white text-base mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <span>Update Pipeline Stage</span>
                </h3>

                <form onSubmit={handleUpdateStatus} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Target Pipeline Stage</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="Screening">Screening</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offered">Offered</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Pipeline Feedback / Note</label>
                    <textarea
                      value={appFeedback}
                      onChange={(e) => setAppFeedback(e.target.value)}
                      placeholder="Specify next round timeline or review comments..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none h-24"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Confirm Pipeline Update</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-500 text-xs">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30 animate-bounce" />
                <span>Select any pipeline applicant from the left to configure status or submit next round invites.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal fallback trigger */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="register"
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
