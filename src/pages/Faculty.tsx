/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Faculty & Academic Intelligence Suite
 */

import { useState, useEffect } from "react";
import {
  Users, BarChart2, ClipboardList, Download, Search, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Plus, Brain, Award, Clock, Send
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell,
} from "recharts";
import confetti from "canvas-confetti";

type Tab = "students" | "analytics" | "assignments";

interface Student {
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

interface RiskAlert {
  id: string;
  name: string;
  reason: string;
  riskLevel: string;
}

export default function Faculty() {
  const [tab, setTab] = useState<Tab>("students");
  const [q, setQ] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [stagnationAlerts, setStagnationAlerts] = useState<RiskAlert[]>([]);
  const [readinessAlerts, setReadinessAlerts] = useState<RiskAlert[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [interventionText, setInterventionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats from backend
  const [enrolledCount, setEnrolledCount] = useState(52);
  const [activeStreakAvg, setActiveStreakAvg] = useState(12);

  useEffect(() => {
    fetchFacultyData();
    fetchRiskAlerts();
  }, []);

  const fetchFacultyData = async () => {
    try {
      const res = await fetch("/api/faculty/overview");
      const json = await res.json();
      if (json.success && json.data) {
        setStudents(json.data.students);
        setEnrolledCount(json.data.departmentStats.enrolledCount);
        setActiveStreakAvg(json.data.departmentStats.activeStreakAvg);
      }
    } catch (err) {
      console.error("Error loading faculty overview:", err);
    }
  };

  const fetchRiskAlerts = async () => {
    try {
      const res = await fetch("/api/faculty/risk");
      const json = await res.json();
      if (json.success && json.data) {
        setRiskAlerts(json.data.atRiskStudents);
        setStagnationAlerts(json.data.stagnationAlerts);
        setReadinessAlerts(json.data.readinessAlerts);
      }
    } catch (err) {
      console.error("Error loading risk alerts:", err);
    }
  };

  const handleInterventionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !interventionText) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/faculty/intervention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          recommendation: interventionText
        })
      });
      const json = await res.json();
      if (json.success) {
        setInterventionText("");
        setSelectedStudent(null);
        confetti({ particleCount: 60 });
        alert(`Mentoring guidance recommendation successfully sent to ${selectedStudent.name}!`);
      }
    } catch (err) {
      console.error("Error submitting intervention recommendation:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = students.filter(
    (s) =>
      !q ||
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.email.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">CS301 — Data Structures Command Center</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Faculty Command Center · Automated Risk Intelligence · Real-time Student Mentoring
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition">
            <Download size={13} />
            <span>Export Roster</span>
          </button>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: enrolledCount, sub: "Active this week: 100%", icon: Users, color: "var(--blue)" },
          { label: "Class Avg Acc.", value: "78%", sub: "Meeting Target", icon: BarChart2, color: "var(--green)" },
          { label: "Average Streak", value: `${activeStreakAvg} Days`, sub: "Solved per student", icon: Brain, color: "var(--violet)" },
          { label: "At-Risk Alerts", value: riskAlerts.length, sub: "Action Required", icon: AlertTriangle, color: "var(--red)" }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{card.label}</span>
                <Icon className="w-4 h-4 text-slate-500" />
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-white">{card.value}</span>
                <span className="block text-[11px] text-slate-500 mt-1">{card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs switcher */}
      <div className="flex gap-2 border-b border-slate-800 pb-px">
        {[
          { id: "students", label: "👤 Student Roster" },
          { id: "analytics", label: "📊 Academic Analytics" },
          { id: "assignments", label: "📋 Course Assignments" }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition ${
              tab === t.id
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* STUDENTS TAB */}
      {tab === "students" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-extrabold text-white text-sm">Student Roster</h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl max-w-xs w-full">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search student or email..."
                    className="bg-transparent text-xs text-slate-200 focus:outline-none w-full placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                      <th className="px-6 py-3">Student</th>
                      <th className="px-4 py-3 text-right">Reputation</th>
                      <th className="px-4 py-3 text-right">Contribution</th>
                      <th className="px-4 py-3 text-right">Streak</th>
                      <th className="px-4 py-3 text-right">Goal</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-900/40 text-slate-300">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-white text-xs uppercase shrink-0">
                              {s.name.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-white">{s.name}</div>
                              <div className="text-[10px] text-slate-500">{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-white">{s.reputationScore}</td>
                        <td className="px-4 py-4 text-right font-semibold text-slate-400">{s.contributionScore}</td>
                        <td className="px-4 py-4 text-right text-amber-400 font-bold">{s.streak}d</td>
                        <td className="px-4 py-4 text-right text-slate-400 font-semibold">{s.targetCompany}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="px-2.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-bold transition"
                          >
                            Mentor Intervention
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Intervention Pane */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-extrabold text-white text-base mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                <span>Mentoring Workshop</span>
              </h3>

              {selectedStudent ? (
                <form onSubmit={handleInterventionSubmit} className="space-y-4">
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Selected Student</span>
                    <span className="block font-extrabold text-white text-sm mt-1">{selectedStudent.name}</span>
                    <span className="block text-xs text-indigo-400 font-semibold mt-0.5">{selectedStudent.targetCompany} Target Track</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Advisor Guidance & Recommendation</label>
                    <textarea
                      value={interventionText}
                      onChange={(e) => setInterventionText(e.target.value)}
                      placeholder="e.g. Schedule a 1-on-1 DP review session. Practice Knapsack subset structures first."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none h-28"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Guidance Intervention (+25 Rep)</span>
                  </button>
                </form>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  <Plus className="w-8 h-8 mx-auto mb-2 opacity-30 animate-bounce" />
                  <span>Select any student from the roster list on the left to issue an immediate learning nudge.</span>
                </div>
              )}
            </div>

            {/* Risk Intelligence Alerts Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Risk Intelligence Alerts</span>
              </h3>

              <div className="space-y-3">
                {riskAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-white text-xs">{alert.name}</span>
                      <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[9px] uppercase font-black">High Risk</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">{alert.reason}</p>
                  </div>
                ))}

                {stagnationAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-white text-xs">{alert.name}</span>
                      <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[9px] uppercase font-black">Stagnation</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">{alert.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {tab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <h3 className="font-extrabold text-white text-sm mb-4">CS301 Topic Mastery Average</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { topic: "Arrays", classAvg: 78, targetAvg: 70 },
                  { topic: "Trees", classAvg: 65, targetAvg: 65 },
                  { topic: "DP", classAvg: 52, targetAvg: 60 },
                  { topic: "Graphs", classAvg: 71, targetAvg: 65 },
                  { topic: "Strings", classAvg: 68, targetAvg: 65 },
                  { topic: "Math", classAvg: 74, targetAvg: 70 }
                ]}>
                  <XAxis dataKey="topic" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="classAvg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <h3 className="font-extrabold text-white text-sm mb-4">CS301 Course Weekly Submissions</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { w: "W1", submissions: 142 },
                  { w: "W2", submissions: 168 },
                  { w: "W3", submissions: 124 },
                  { w: "W4", submissions: 190 },
                  { w: "W5", submissions: 175 },
                  { w: "W6", submissions: 210 }
                ]}>
                  <XAxis dataKey="w" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="submissions" stroke="#8b5cf6" fill="rgba(139,92,246,0.15)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {tab === "assignments" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-extrabold text-white text-sm mb-4">Assignments List</h3>
          <div className="divide-y divide-slate-800/60">
            {[
              { title: "Week 3 — Arrays & Hashing", dueDate: "Oct 15", submitted: 45, total: 52, avgScore: 82 },
              { title: "Week 4 — Two Pointers Invariants", dueDate: "Oct 22", submitted: 38, total: 52, avgScore: 74 },
              { title: "Week 5 — Binary Search Boundaries", dueDate: "Oct 29", submitted: 12, total: 52, avgScore: 68 }
            ].map((a, idx) => (
              <div key={idx} className="py-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white text-sm">{a.title}</h4>
                  <span className="block text-[11px] text-slate-500 mt-0.5">Due {a.dueDate} • {a.submitted}/{a.total} submitted</span>
                </div>
                <span className="text-sm font-extrabold text-indigo-400">{a.avgScore}% Avg Score</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
