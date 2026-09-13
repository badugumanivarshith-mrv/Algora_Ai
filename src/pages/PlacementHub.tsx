import React, { useState, useEffect } from "react";
import {
  Briefcase, Building2, TrendingUp, CheckCircle2, Search, Filter,
  ExternalLink, Calendar, Users, Award, ChevronRight, Zap, Target,
  FileCheck, ShieldAlert, Sparkles, ArrowUpRight, Clock
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import {
  EnterpriseService, CompanyProfileData, PlacementDriveData,
  CandidateShortlistData, PlacementAnalyticsData
} from "../services/enterpriseService";

type HubTab = "drives" | "companies" | "shortlists" | "analytics";

export default function PlacementHub() {
  const [tab, setTab] = useState<HubTab>("drives");
  const [drives, setDrives] = useState<PlacementDriveData[]>([]);
  const [companies, setCompanies] = useState<CompanyProfileData[]>([]);
  const [shortlists, setShortlists] = useState<CandidateShortlistData[]>([]);
  const [analytics, setAnalytics] = useState<PlacementAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrive, setSelectedDrive] = useState<PlacementDriveData | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({ name: "Arjun Sharma", email: "arjun@ait.edu", collegeName: "Algora Institute of Tech", readinessScore: 94 });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [drvRes, compRes, shortRes, anaRes] = await Promise.all([
        EnterpriseService.listDrives(),
        EnterpriseService.listCompanies(),
        EnterpriseService.listShortlists(),
        EnterpriseService.getPlacementAnalytics(),
      ]);
      setDrives(drvRes.drives);
      setCompanies(compRes.companies);
      setShortlists(shortRes.shortlists);
      setAnalytics(anaRes.analytics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrive) return;
    try {
      const res = await EnterpriseService.applyDrive(selectedDrive.id, applyForm);
      setStatusMessage(res.message);
      setApplyModalOpen(false);
      loadData();
      setTimeout(() => setStatusMessage(null), 8000);
    } catch (err: any) {
      alert(err.message || "Failed to submit application");
    }
  };

  const filteredDrives = drives.filter(
    (d) =>
      !searchQuery ||
      d.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompanies = companies.filter(
    (c) =>
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredShortlists = shortlists.filter(
    (s) =>
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.appliedDriveTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
              Recruitment & Placement Hub
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 999,
                background: "color-mix(in srgb, var(--brand) 15%, transparent)",
                color: "var(--brand)",
                border: "1px solid color-mix(in srgb, var(--brand) 30%, transparent)",
              }}
            >
              Enterprise Tier
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
            Direct company recruitment drives, automated algorithmic shortlisting, and cohort readiness analytics.
          </p>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            style={{
              padding: "8px 16px",
              background: "color-mix(in srgb, var(--green) 15%, transparent)",
              border: "1px solid color-mix(in srgb, var(--green) 35%, transparent)",
              borderRadius: "var(--radius-md)",
              color: "var(--green)",
              fontSize: 12,
              fontWeight: 600,
              maxWidth: 500,
            }}
          >
            {statusMessage}
          </div>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {[
          { label: "Active Placement Drives", value: drives.length.toString(), sub: "Tier 1 & Product Tech", icon: Briefcase, color: "var(--blue)" },
          { label: "Batch Average Readiness", value: `${analytics?.overallBatchReadiness || 81.4}%`, sub: "Assessed via Algora AI", icon: Zap, color: "var(--brand)" },
          { label: "Shortlisted Candidates", value: shortlists.length.toString(), sub: "Passed OA Benchmark", icon: CheckCircle2, color: "var(--green)" },
          { label: "Highest CTC Package", value: "₹112.0 LPA", sub: "Citadel Quantitative Drive", icon: Award, color: "var(--amber)" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="surface-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
              <div style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", background: `color-mix(in srgb, ${color} 12%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>{value}</div>
            <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 600 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs & Search */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
          {[
            { id: "drives", label: "Placement Drives", icon: Briefcase },
            { id: "companies", label: "Company Profiles", icon: Building2 },
            { id: "shortlists", label: "Candidate Shortlists", icon: Users },
            { id: "analytics", label: "Placement Analytics", icon: TrendingUp },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id as HubTab)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: tab === id ? "var(--bg-surface)" : "transparent",
                color: tab === id ? "var(--text-primary)" : "var(--text-muted)",
                fontWeight: tab === id ? 700 : 500,
                fontSize: 12,
                cursor: "pointer",
                boxShadow: tab === id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {tab !== "analytics" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "6px 12px", minWidth: 260 }}>
            <Search size={14} style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder={`Search ${tab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: "transparent", border: "none", outline: "none", fontSize: 12, color: "var(--text-primary)", width: "100%" }}
            />
          </div>
        )}
      </div>

      {/* Tab 1: Drives */}
      {tab === "drives" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
          {filteredDrives.map((drive) => (
            <div key={drive.id} className="surface-card" style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 24, width: 42, height: 42, borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                      {drive.companyLogo}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{drive.roleTitle}</h3>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{drive.companyName}</div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 999,
                      background: "color-mix(in srgb, var(--green) 15%, transparent)",
                      color: "var(--green)",
                      border: "1px solid color-mix(in srgb, var(--green) 30%, transparent)",
                      textTransform: "uppercase",
                    }}
                  >
                    {drive.status.replace("_", " ")}
                  </span>
                </div>

                <div style={{ background: "var(--bg-subtle)", padding: "10px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--brand)" }}>{drive.packageDescription}</div>
                  <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                    <span>Min CGPA: <strong>{drive.eligibilityCgpa}</strong></span>
                    <span>Min Readiness: <strong>{drive.eligibilityReadiness}%</strong></span>
                  </div>
                </div>

                {/* Interview Rounds */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Evaluation Pipeline
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {drive.rounds.map((round, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
                        <div style={{ width: 14, height: 14, borderRadius: 999, background: "var(--bg-canvas)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>
                          {idx + 1}
                        </div>
                        {round}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  <div>Candidates: <strong>{drive.registeredCandidates}</strong> registered</div>
                  <div style={{ color: "var(--green)", fontWeight: 600 }}>{drive.shortlistedCount} auto-shortlisted</div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setSelectedDrive(drive);
                    setApplyModalOpen(true);
                  }}
                  style={{ gap: 4 }}
                >
                  Apply Now <ChevronRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Companies */}
      {tab === "companies" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filteredCompanies.map((comp) => (
            <div key={comp.id} className="surface-card" style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 26, width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                    {comp.logo}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{comp.name}</h3>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{comp.industry} · {comp.location}</div>
                  </div>
                </div>

                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 14px" }}>
                  {comp.description}
                </p>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>Key Tech Focus:</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {comp.requiredSkills.map((s, i) => (
                      <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-primary)", fontWeight: 600 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11 }}>
                <div>
                  <div style={{ color: "var(--text-muted)" }}>Avg Package: <strong style={{ color: "var(--text-primary)" }}>{comp.avgPackageLpa}</strong></div>
                  <div style={{ color: "var(--brand)", fontWeight: 600 }}>Min Readiness: {comp.minReadinessScore}%</div>
                </div>
                <span style={{ fontWeight: 700, color: comp.hiringStatus === "actively_hiring" ? "var(--green)" : "var(--amber)" }}>
                  {comp.openRolesCount} Openings
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Shortlists */}
      {tab === "shortlists" && (
        <div className="surface-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Recruitment Shortlist Roster</h3>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
                Candidates meeting strict algorithmic speed, contest ratings, and AI readiness benchmarks.
              </p>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Candidate</th>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Target Drive</th>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Readiness Score</th>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Algora Rating</th>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Solved</th>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredShortlists.map((cand) => (
                  <tr key={cand.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{cand.name}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{cand.rollNumber} · {cand.collegeName}</div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-primary)", fontWeight: 600 }}>
                      {cand.appliedDriveTitle}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 44, height: 6, borderRadius: 999, background: "var(--bg-subtle)", overflow: "hidden" }}>
                          <div style={{ width: `${cand.readinessScore}%`, height: "100%", background: "var(--brand)" }} />
                        </div>
                        <strong style={{ color: "var(--brand)" }}>{cand.readinessScore}%</strong>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {cand.algoraRating}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>
                      {cand.problemsSolved}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: cand.status === "interview_scheduled" ? "color-mix(in srgb, var(--green) 15%, transparent)" : "color-mix(in srgb, var(--blue) 15%, transparent)",
                          color: cand.status === "interview_scheduled" ? "var(--green)" : "var(--blue)",
                          textTransform: "capitalize",
                        }}
                      >
                        {cand.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Placement Analytics */}
      {tab === "analytics" && analytics && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="surface-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>
              Cohort Placement Readiness Distribution
            </h3>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 16px" }}>
              Breakdown of 336 graduating engineering candidates across readiness brackets.
            </p>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.cohortReadinessDistribution} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis type="category" dataKey="bucket" stroke="var(--text-muted)" fontSize={10} width={130} />
                  <Tooltip contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }} />
                  <Bar dataKey="count" fill="var(--brand)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="surface-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>
              Top Tech Hiring Domains
            </h3>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 16px" }}>
              Distribution of incoming placement drive openings by specialization.
            </p>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.topRecruitingDomains}
                    dataKey="percentage"
                    nameKey="domain"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.domain.split(" ")[0]} (${entry.percentage}%)`}
                    style={{ fontSize: 10 }}
                  >
                    {analytics.topRecruitingDomains.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {applyModalOpen && selectedDrive && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: 16,
          }}
          onClick={() => setApplyModalOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px" }}>
              Apply for {selectedDrive.companyName}
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>
              Role: <strong>{selectedDrive.roleTitle}</strong> · Eligibility: {selectedDrive.eligibilityReadiness}% Readiness
            </p>

            <form onSubmit={handleApply} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Candidate Name</label>
                <input
                  type="text"
                  required
                  value={applyForm.name}
                  onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Institutional Email</label>
                <input
                  type="email"
                  required
                  value={applyForm.email}
                  onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>College / Institution</label>
                <input
                  type="text"
                  required
                  value={applyForm.collegeName}
                  onChange={(e) => setApplyForm({ ...applyForm, collegeName: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Current Algora Placement Readiness Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={applyForm.readinessScore}
                  onChange={(e) => setApplyForm({ ...applyForm, readinessScore: Number(e.target.value) })}
                  style={{ width: "100%", padding: "8px 12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 12 }}
                />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setApplyModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
