/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Campus Placement Drives, Eligibility & Offer Sourcing Dashboard
 */

import React, { useState, useEffect } from "react";
import {
  Trophy, Users, Calendar, Award, CheckCircle2, AlertTriangle, Send, ShieldAlert, Sparkles, Building
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import confetti from "canvas-confetti";

interface PlacementDrive {
  id: string;
  title: string;
  company: string;
  eligibilityCgpa: number;
  eligibilityXp: number;
  status: string;
  createdAt: string;
}

export default function CampusPlacements() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "eligible" | "registered">("all");
  const [registeredDriveIds, setRegisteredDriveIds] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);

  // Faculty Drive creation state
  const [showCreateDrive, setShowCreateDrive] = useState(false);
  const [driveTitle, setDriveTitle] = useState("");
  const [driveCompany, setDriveCompany] = useState("");
  const [eligCgpa, setEligibilityCgpa] = useState("7.0");
  const [eligXp, setEligibilityXp] = useState("100");

  useEffect(() => {
    fetchDrives();
    fetchRegistrations();
    fetchPartnerships();
  }, []);

  const fetchDrives = async () => {
    try {
      const res = await fetch("/api/placements/drives");
      const json = await res.json();
      if (json.success) setDrives(json.data);
    } catch {}
  };

  const fetchRegistrations = async () => {
    try {
      const res = await fetch("/api/placements/registrations");
      const json = await res.json();
      if (json.success) {
        setRegisteredDriveIds(json.data.map((r: any) => r.driveId));
      }
    } catch {}
  };

  const fetchPartnerships = async () => {
    try {
      const res = await fetch("/api/placements/partnerships");
      const json = await res.json();
      if (json.success) setPartnerships(json.data);
    } catch {}
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch("/api/placements/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: driveTitle,
          company: driveCompany,
          eligibilityCgpa: eligCgpa,
          eligibilityXp: eligXp
        })
      });
      const json = await res.json();
      if (json.success) {
        setDriveTitle("");
        setDriveCompany("");
        setShowCreateDrive(false);
        fetchDrives();
        confetti({ particleCount: 50 });
      }
    } catch {}
  };

  const handleRegister = async (driveId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setIsRegistering(true);
    try {
      const res = await fetch("/api/placements/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driveId })
      });
      const json = await res.json();
      if (json.success) {
        alert("Registration Successful! You have been enrolled in the campus placement pool.");
        confetti({ particleCount: 60 });
        fetchRegistrations();
      } else {
        alert(json.error || "Ineligible for this placement drive due to requirements mismatch.");
      }
    } catch {
    } finally {
      setIsRegistering(false);
    }
  };

  const isUserEligible = (drive: PlacementDrive) => {
    if (!user) return false;
    return user.xp >= drive.eligibilityXp;
  };

  const filteredDrives = drives.filter((d) => {
    if (activeTab === "eligible") return isUserEligible(d);
    if (activeTab === "registered") return registeredDriveIds.includes(d.id);
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Building className="w-4 h-4 animate-pulse" />
            <span>Placement & Hiring Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Campus Recruitment Portal</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track ongoing corporate placement drives, verify your socratic eligibility limits, and secure job offers.
          </p>
        </div>

        {/* Faculty actions banner */}
        {user?.role === "faculty" && (
          <button
            onClick={() => setShowCreateDrive(!showCreateDrive)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Announce Placement Drive</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-px">
        {[
          { id: "all", label: "🏢 All Drives" },
          { id: "eligible", label: "⭐ Eligible Sprints" },
          { id: "registered", label: "✅ Your Registrations" }
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

      {/* DRIVES ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {showCreateDrive && (
            <form onSubmit={handleCreateDrive} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="font-extrabold text-white text-sm">Create New Recruitment Drive</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Drive Title</label>
                  <input
                    type="text"
                    value={driveTitle}
                    onChange={(e) => setDriveTitle(e.target.value)}
                    placeholder="e.g. SDE-1 Hiring Sprint"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hiring Company</label>
                  <input
                    type="text"
                    value={driveCompany}
                    onChange={(e) => setDriveCompany(e.target.value)}
                    placeholder="e.g. Google India"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Eligible CGPA Cutoff</label>
                  <input
                    type="text"
                    value={eligCgpa}
                    onChange={(e) => setEligibilityCgpa(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum XP Required</label>
                  <input
                    type="text"
                    value={eligXp}
                    onChange={(e) => setEligibilityXp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition">
                Publish Campus Placement Drive Announcement
              </button>
            </form>
          )}

          <div className="space-y-4">
            {filteredDrives.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl text-slate-500 text-xs">
                <Building className="w-8 h-8 mx-auto mb-2 opacity-30 animate-pulse" />
                <span>No active placement drives found matching this criteria.</span>
              </div>
            ) : (
              filteredDrives.map((drive) => {
                const eligible = isUserEligible(drive);
                const registered = registeredDriveIds.includes(drive.id);
                return (
                  <div key={drive.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-extrabold text-white text-base">{drive.company}</h3>
                      <p className="text-xs text-indigo-400 font-semibold mt-0.5">{drive.title}</p>
                      
                      <div className="flex gap-3 text-[10px] text-slate-500 mt-2">
                        <span>CGPA: <strong>{drive.eligibilityCgpa}+</strong></span>
                        <span>•</span>
                        <span>Min XP: <strong>{drive.eligibilityXp} PTS</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {registered ? (
                        <span className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Registered</span>
                        </span>
                      ) : eligible ? (
                        <button
                          onClick={() => handleRegister(drive.id)}
                          disabled={isRegistering}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition"
                        >
                          Register Drive
                        </button>
                      ) : (
                        <span className="px-2.5 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Ineligible</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-extrabold text-white text-base mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Recruitment Eligibility</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Algora enforces a verified socratic placement eligibility index. SDE roles are tied directly to your active skill progress XP and SuperMemo memory retention levels.
            </p>
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900">
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Your Verification Status</span>
              <span className="block text-sm font-extrabold text-white mt-1">Verified Scholar</span>
              <span className="block text-xs text-indigo-400 font-semibold mt-0.5">{user?.xp || 0} XP points accumulated</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Building className="w-5 h-5 text-cyan-400" />
              <span>Corporate Partners</span>
            </h3>
            <div className="space-y-2">
              {partnerships.map((p) => (
                <div key={p.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{p.companyName}</span>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[10px] font-bold">
                    {p.partnershipTier}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
export const Plus = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
