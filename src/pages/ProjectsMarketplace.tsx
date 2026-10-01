/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Industry Projects Marketplace Dashboard
 */

import React, { useState, useEffect } from "react";
import {
  FolderKanban, Plus, Briefcase, Award, CheckCircle2, ShieldCheck, Send, Sparkles, UserCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import confetti from "canvas-confetti";

interface IndustryProject {
  id: string;
  title: string;
  company: string;
  description: string;
  techStack: string;
  status: string;
}

interface PortfolioEntry {
  id: string;
  title: string;
  projectUrl?: string;
  description: string;
}

interface Certificate {
  id: string;
  title: string;
  issuedBy: string;
  issuedAt: string;
}

export default function ProjectsMarketplace() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<"projects" | "portfolio" | "certificates" | "teams">("projects");
  const [projects, setProjects] = useState<IndustryProject[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);

  // Create project form
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [desc, setDesc] = useState("");
  const [techStack, setTechStack] = useState("");

  useEffect(() => {
    fetchProjects();
    fetchPortfolio();
    fetchCertificates();
    fetchTeams();
    fetchMentors();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/marketplace/projects");
      const json = await res.json();
      if (json.success) setProjects(json.data);
    } catch {}
  };

  const fetchPortfolio = async () => {
    try {
      const res = await fetch("/api/marketplace/portfolio");
      const json = await res.json();
      if (json.success) setPortfolio(json.data);
    } catch {}
  };

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/marketplace/certificates");
      const json = await res.json();
      if (json.success) setCertificates(json.data);
    } catch {}
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/marketplace/teams");
      const json = await res.json();
      if (json.success) setTeams(json.data);
    } catch {}
  };

  const fetchMentors = async () => {
    try {
      const res = await fetch("/api/marketplace/mentors");
      const json = await res.json();
      if (json.success) setMentors(json.data);
    } catch {}
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const res = await fetch("/api/marketplace/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, company, description: desc, techStack })
      });
      const json = await res.json();
      if (json.success) {
        setTitle("");
        setCompany("");
        setDesc("");
        setTechStack("");
        setShowCreate(false);
        fetchProjects();
        confetti({ particleCount: 50 });
      }
    } catch {}
  };

  const handleApply = async (projectId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const res = await fetch("/api/marketplace/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId })
      });
      const json = await res.json();
      if (json.success) {
        alert("Application submitted! Your team formation request is under review.");
        confetti({ particleCount: 40 });
      }
    } catch {}
  };

  const handleIssueCert = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const res = await fetch("/api/marketplace/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Distributed Banking Ledger Architecture" })
      });
      const json = await res.json();
      if (json.success) {
        fetchCertificates();
        confetti({ particleCount: 60 });
        alert("Certificate successfully issued and verified in your profile!");
      }
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FolderKanban className="w-4 h-4" />
            <span>Industry Projects Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Real Industry Projects & Certificates</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build production-ready corporate projects, collaborate with teams, and earn verified industry certificates.
          </p>
        </div>

        {activeTab === "projects" && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>List Industry Project</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-px">
        {[
          { id: "projects", label: "📂 Project Listings" },
          { id: "portfolio", label: "🌟 Portfolio Vault" },
          { id: "certificates", label: "📜 Verified Certificates" },
          { id: "teams", label: "👥 Teams & Mentors" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition ${
              activeTab === tab.id
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PROJECTS */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          {showCreate && (
            <form onSubmit={handleCreateProject} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 max-w-2xl">
              <h3 className="font-extrabold text-white text-sm">List Corporate Industry Project</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Distributed Ledger Engine"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Partner Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Stripe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tech Stack</label>
                <input
                  type="text"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="e.g. React, Node.js, PostgreSQL, Redis"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Provide detailed engineering requirements..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none h-24"
                  required
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition">
                Publish Project Listing
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div key={proj.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[9px] uppercase font-bold">
                        {proj.company}
                      </span>
                      <h3 className="font-extrabold text-white text-base mt-2">{proj.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">{proj.description}</p>
                  
                  <div className="mt-4 p-2.5 bg-slate-950 rounded-xl border border-slate-900 text-[10px] font-semibold text-indigo-300">
                    Stack: {proj.techStack}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">{proj.status}</span>
                  <button
                    onClick={() => handleApply(proj.id)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition"
                  >
                    Apply & Join Team
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PORTFOLIO */}
      {activeTab === "portfolio" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-xs">
              No portfolio entries yet. Complete industry projects to populate your portfolio vault.
            </div>
          ) : (
            portfolio.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="font-extrabold text-white text-base">{item.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                {item.projectUrl && (
                  <a href={item.projectUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 font-bold hover:underline block">
                    View Live Project →
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: CERTIFICATES */}
      {activeTab === "certificates" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div>
              <h3 className="font-extrabold text-white text-base">Verified Industry Credentials</h3>
              <p className="text-xs text-slate-400 mt-0.5">Certificates are cryptographically timestamped and recognized by partner recruiters.</p>
            </div>
            <button
              onClick={handleIssueCert}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>Generate Sample Certificate</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="p-6 bg-gradient-to-tr from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <Award className="w-8 h-8 text-indigo-400" />
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold">Verified</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-lg">{cert.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">Issued by: {cert.issuedBy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TEAMS & MENTORS */}
      {activeTab === "teams" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <span>Project Team Collaborations</span>
            </h3>
            <div className="space-y-3">
              {teams.length === 0 ? (
                <div className="text-slate-500 text-xs">No active project teams formed.</div>
              ) : (
                teams.map((t) => (
                  <div key={t.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white text-sm">{t.name}</h4>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {Array.isArray(t.membersJson) && t.membersJson.map((m: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-[10px] font-bold">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Assigned Industry Mentors</span>
            </h3>
            <div className="space-y-3">
              {mentors.length === 0 ? (
                <div className="text-slate-500 text-xs">No mentors currently assigned.</div>
              ) : (
                mentors.map((m) => (
                  <div key={m.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Faculty Mentor ID: {m.mentorId.slice(0, 8)}...</h4>
                      <span className="text-[10px] text-slate-400">Assigned to Marketplace Project Team</span>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-bold">Active Oversight</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="register"
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
