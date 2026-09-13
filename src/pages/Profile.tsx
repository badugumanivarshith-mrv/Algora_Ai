import React, { useState, useEffect } from "react";
import {
  User, Award, Crown, HeartHandshake, Flame, Globe, Github,
  Linkedin, Twitter, Edit3, CheckCircle2, Clock, Zap, BookOpen,
  Calendar, ShieldCheck, Trophy, Sparkles
} from "lucide-react";
import { CommunityService } from "../services/communityService";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingSocials, setEditingSocials] = useState(false);
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    CommunityService.getPublicProfile("u-1")
      .then((res) => {
        setProfile(res.profile);
        setGithub(res.profile.socialLinks?.github || "");
        setLinkedin(res.profile.socialLinks?.linkedin || "");
        setTwitter(res.profile.socialLinks?.twitter || "");
        setWebsite(res.profile.socialLinks?.website || "");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    await CommunityService.updateSocials("u-1", { github, linkedin, twitter, website });
    setEditingSocials(false);
    const updated = await CommunityService.getPublicProfile("u-1");
    setProfile(updated.profile);
  };

  if (loading || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-canvas)] text-xs text-[var(--text-muted)]">
        Loading profile and community reputation...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-canvas)] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Hero Profile Card */}
        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-lg">
                <div className="w-full h-full rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center text-xl font-extrabold text-indigo-400">
                  {profile.username.slice(0, 2).toUpperCase()}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[var(--text-primary)]">{profile.username}</h1>
                  <span className="text-xs text-[var(--text-muted)] font-mono">{profile.handle}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    Grandmaster
                  </span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] font-medium">{profile.headline}</p>
                <p className="text-xs text-[var(--text-muted)]">{profile.institution}</p>
              </div>
            </div>

            {/* Quick stats badges */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border)] text-center">
                <p className="text-[10px] text-[var(--text-muted)] font-semibold">Reputation</p>
                <p className="text-base font-extrabold text-amber-400">⭐ {profile.reputationScore}</p>
              </div>

              <div className="px-4 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border)] text-center">
                <p className="text-[10px] text-[var(--text-muted)] font-semibold">Problems Solved</p>
                <p className="text-base font-extrabold text-emerald-400">{profile.problemsSolved}</p>
              </div>

              <div className="px-4 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border)] text-center">
                <p className="text-[10px] text-[var(--text-muted)] font-semibold">Contest Rating</p>
                <p className="text-base font-extrabold text-indigo-400">{profile.eloRating}</p>
              </div>
            </div>
          </div>

          {/* Social Links & Edit Button */}
          <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile.socialLinks?.github && (
                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-white transition"
                >
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
              {profile.socialLinks?.linkedin && (
                <a
                  href={profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-white transition"
                >
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
              {profile.socialLinks?.website && (
                <a
                  href={profile.socialLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-white transition"
                >
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
            </div>

            <button
              onClick={() => setEditingSocials(!editingSocials)}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Social Links
            </button>
          </div>

          {editingSocials && (
            <form onSubmit={handleSaveSocials} className="mt-4 p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border)] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="GitHub URL"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border)] text-xs text-[var(--text-primary)]"
                />
                <input
                  type="text"
                  placeholder="LinkedIn URL"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border)] text-xs text-[var(--text-primary)]"
                />
                <input
                  type="text"
                  placeholder="Twitter / X URL"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border)] text-xs text-[var(--text-primary)]"
                />
                <input
                  type="text"
                  placeholder="Personal Website URL"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border)] text-xs text-[var(--text-primary)]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSocials(false)}
                  className="px-3 py-1 rounded bg-[var(--bg-subtle)] text-xs text-[var(--text-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-indigo-600 text-white text-xs font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Featured Badges */}
        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
          <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Featured Badges & Recognitions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.featuredBadges?.map((b: any) => (
              <div
                key={b.id}
                className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-amber-500/30 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-primary)]">{b.name}</h3>
                  <span className="text-[10px] uppercase font-bold text-amber-400">{b.tier} Tier</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
          <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Verified Activity & Achievement Timeline
          </h2>

          <div className="space-y-3">
            {profile.timeline?.map((act: any) => (
              <div
                key={act.id}
                className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border)] flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20 capitalize">
                      {act.activityType.replace("_", " ")}
                    </span>
                    <h3 className="text-xs font-bold text-[var(--text-primary)]">{act.title}</h3>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{act.description}</p>
                </div>

                <span className="text-[11px] text-[var(--text-muted)] flex-shrink-0">
                  {new Date(act.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
