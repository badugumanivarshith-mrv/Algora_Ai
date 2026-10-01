/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA AI Career Operating System Dashboard
 */

import React, { useState, useEffect } from "react";
import {
  Compass, Target, Award, CheckCircle2, TrendingUp, Sparkles, ShieldCheck, Briefcase, Plus
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import confetti from "canvas-confetti";

interface CareerProfile {
  id: string;
  targetRoleId: string;
  resumeScore: number;
  interviewReadinessScore: number;
  placementProbability: number;
}

interface Milestone {
  id: string;
  title: string;
  status: string;
  targetDate: string;
}

const ROLE_PATHS = [
  "Software Engineer",
  "Data Engineer",
  "AI Engineer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Cybersecurity Engineer"
];

export default function CareerOS() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedRole, setSelectedRole] = useState("Software Engineer");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newTargetDate, setNewTargetDate] = useState("Next 30 Days");

  useEffect(() => {
    fetchProfile();
    fetchMilestones();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/career/profile");
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        if (json.data.targetRoleId) setSelectedRole(json.data.targetRoleId);
      }
    } catch {}
  };

  const fetchMilestones = async () => {
    try {
      const res = await fetch("/api/career/milestones");
      const json = await res.json();
      if (json.success) setMilestones(json.data);
    } catch {}
  };

  const handleUpdateRole = async (role: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setSelectedRole(role);
    try {
      const res = await fetch("/api/career/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRoleId: role })
      });
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        confetti({ particleCount: 40 });
      }
    } catch {}
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const res = await fetch("/api/career/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newMilestoneTitle, targetDate: newTargetDate })
      });
      const json = await res.json();
      if (json.success) {
        setNewMilestoneTitle("");
        fetchMilestones();
        confetti({ particleCount: 50 });
      }
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 animate-spin" />
            <span>AI Career Operating System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Career OS & Roadmap Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personalized role pathways, resume readiness scores, and placement probability analytics.
          </p>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase">Resume Readiness Score</span>
            <span className="text-2xl font-black text-white mt-0.5 block">{profile?.resumeScore || 85}%</span>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase">Interview Readiness</span>
            <span className="text-2xl font-black text-white mt-0.5 block">{profile?.interviewReadinessScore || 78}%</span>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase">Placement Probability</span>
            <span className="text-2xl font-black text-emerald-400 mt-0.5 block">{profile?.placementProbability || 91}%</span>
          </div>
        </div>
      </div>

      {/* ROLE PATHS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-extrabold text-white text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>Select Target Career Role Path</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ROLE_PATHS.map((role) => {
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                onClick={() => handleUpdateRole(role)}
                className={`p-4 rounded-xl border text-xs font-bold transition text-left flex flex-col justify-between ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Briefcase className={`w-5 h-5 mb-3 ${isSelected ? "text-indigo-400" : "text-slate-600"}`} />
                <span>{role}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MILESTONES & ROADMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="font-extrabold text-white text-base">Career Milestones & Objectives</h3>
          
          <form onSubmit={handleCreateMilestone} className="flex gap-2">
            <input
              type="text"
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              placeholder="e.g. Complete System Design Mock Interview"
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none flex-1"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Milestone</span>
            </button>
          </form>

          <div className="space-y-3">
            {milestones.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">No active career milestones created yet.</div>
            ) : (
              milestones.map((m) => (
                <div key={m.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="font-bold text-white text-xs">{m.title}</h4>
                      <span className="text-[10px] text-slate-500">Target: {m.targetDate}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded text-[10px] font-bold uppercase">
                    {m.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-extrabold text-white text-base">AI Career Intelligence</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your career profile is continuously evaluated against real recruiter demands. High placement probability unlocks direct corporate referral fast-tracks.
          </p>
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 text-xs text-slate-400 space-y-2">
            <div className="flex justify-between">
              <span>Verified SDE Track:</span>
              <span className="text-emerald-400 font-bold">Active</span>
            </div>
            <div className="flex justify-between">
              <span>Skill Gaps Identified:</span>
              <span className="text-indigo-400 font-bold">0 Critical</span>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="register"
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
