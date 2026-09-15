import React, { useState, useEffect } from "react";
import {
  GraduationCap, Building2, BookOpen, Users, Award, Calendar, CheckCircle2,
  TrendingUp, Layers, CheckSquare, Clock, FileText, ChevronRight, Search, Plus, Sparkles, Filter
} from "lucide-react";

export default function EnterpriseHub() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "faculty" | "curriculum" | "assignments" | "attendance" | "placements"
  >("overview");

  const [loading, setLoading] = useState(true);
  const [universityData, setUniversityData] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>(null);
  const [placements, setPlacements] = useState<any[]>([]);

  useEffect(() => {
    fetchEnterpriseData();
  }, []);

  const fetchEnterpriseData = async () => {
    setLoading(true);
    try {
      const [univRes, facRes, crsRes, asgnRes, attRes, pdRes, analyticsRes] = await Promise.all([
        fetch("/api/enterprise/universities"),
        fetch("/api/enterprise/faculty"),
        fetch("/api/enterprise/courses"),
        fetch("/api/enterprise/assignments"),
        fetch("/api/enterprise/attendance"),
        fetch("/api/enterprise/placement-drives"),
        fetch("/api/enterprise/analytics"),
      ]);

      const univs = await univRes.json();
      const facs = await facRes.json();
      const crss = await crsRes.json();
      const asgns = await asgnRes.json();
      const atts = await attRes.json();
      const pds = await pdRes.json();
      const analytics = await analyticsRes.json();

      if (univs.success) setUniversities(univs.data);
      if (facs.success) setFaculty(facs.data);
      if (crss.success) setCourses(crss.data);
      if (asgns.success) setAssignments(asgns.data);
      if (atts.success) setAttendance(atts);
      if (pds.success) setPlacements(pds.data);
      if (analytics.success) setUniversityData(analytics.data);
    } catch (e) {
      console.error("Failed to fetch enterprise data", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] p-6 md:p-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Phase V3.7 Ecosystem
            </span>
            <span className="text-xs text-[var(--text-muted)]">Enterprise LMS & Campus Placement</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-indigo-500" />
            University & Enterprise LMS Hub
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
            Centralized academic intelligence, department management, AI faculty tools, interactive classrooms, live attendance tracking, and campus placement drives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEnterpriseData}
            className="px-4 py-2 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-muted)] border border-[var(--border)] text-sm font-medium transition flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            Refresh Intelligence
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
        {[
          { id: "overview", label: "University Overview", icon: Building2 },
          { id: "faculty", label: "Faculty & Departments", icon: Users },
          { id: "curriculum", label: "Courses & Curriculum", icon: BookOpen },
          { id: "assignments", label: "Assignments & Submissions", icon: CheckSquare },
          { id: "attendance", label: "Attendance Records", icon: Clock },
          { id: "placements", label: "Campus Placement Drives", icon: Award },
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

      {/* Main Content Areas */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-[var(--text-muted)]">
          <Sparkles className="h-6 w-6 animate-spin mr-2 text-indigo-500" />
          Loading Enterprise Ecosystem Data...
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-2">
                  <div className="flex justify-between items-center text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
                    <span>Enrolled Students</span>
                    <Users className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-[var(--text-primary)]">
                    {universityData?.analytics?.total_students || 1450}
                  </div>
                  <p className="text-xs text-emerald-400 font-medium">+12% batch growth this year</p>
                </div>

                <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-2">
                  <div className="flex justify-between items-center text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
                    <span>Placement Rate</span>
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-[var(--text-primary)]">
                    {universityData?.analytics?.average_placement_rate || 94.8}%
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">Across 18 tier-1 campus drives</p>
                </div>

                <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-2">
                  <div className="flex justify-between items-center text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
                    <span>Attendance Rate</span>
                    <Clock className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-[var(--text-primary)]">
                    {attendance?.summary?.percentage || 95.0}%
                  </div>
                  <p className="text-xs text-emerald-400 font-medium">90%+ required for placement eligibility</p>
                </div>

                <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-2">
                  <div className="flex justify-between items-center text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
                    <span>Curriculum Mastery</span>
                    <BookOpen className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-[var(--text-primary)]">
                    {universityData?.curriculum?.curriculumReadinessScore || 88.5}%
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">Semester 5 AI & DSA benchmark</p>
                </div>
              </div>

              {/* Inter-College Rankings & Top Skills */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-400" />
                    Inter-College Competitive Rankings
                  </h3>
                  <div className="space-y-3">
                    {universityData?.interCollege?.map((u: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)]"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? "bg-amber-400 text-slate-950" : "bg-indigo-500/20 text-indigo-400"}`}>
                            #{u.rank}
                          </span>
                          <div>
                            <div className="font-semibold text-sm">{u.university}</div>
                            <div className="text-xs text-[var(--text-muted)]">{u.totalContestants} Active Student Contestants</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-sm text-indigo-400">{u.avgRating} Rating</div>
                          <div className="text-[11px] text-emerald-400">Top 5% League</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Layers className="h-5 w-5 text-indigo-400" />
                    University Top Skill Benchmarks
                  </h3>
                  <div className="space-y-3">
                    {universityData?.curriculum?.subjectMastery?.map((sub: any, idx: number) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-sm font-medium">
                          <span>{sub.subject} ({sub.code})</span>
                          <span className="font-bold text-indigo-400">{sub.masteryScore}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--bg-canvas)] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                            style={{ width: `${sub.masteryScore}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FACULTY */}
          {activeTab === "faculty" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Users className="h-6 w-6 text-indigo-400" />
                  Faculty Members & Department Heads
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {faculty.map((f: any) => (
                  <div key={f.id} className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4 hover:border-indigo-500/50 transition">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-lg">
                        {f.designation.charAt(0)}
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active Faculty
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base">{f.designation}</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{f.email}</p>
                    </div>
                    <div className="pt-3 border-t border-[var(--border)] grid grid-cols-2 gap-2 text-xs text-[var(--text-muted)]">
                      <div>
                        <span className="block text-[var(--text-primary)] font-bold">4 Courses</span>
                        Assigned
                      </div>
                      <div>
                        <span className="block text-[var(--text-primary)] font-bold">180 Students</span>
                        Under Guidance
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CURRICULUM */}
          {activeTab === "curriculum" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-indigo-400" />
                Active Curriculum & Course Modules
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.map((c: any) => (
                  <div key={c.id} className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {c.code}
                      </span>
                      <span className="text-xs font-semibold text-[var(--text-muted)]">
                        Semester {c.semester} • {c.credits} Credits
                      </span>
                    </div>

                    <h4 className="font-bold text-lg text-[var(--text-primary)]">{c.title}</h4>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                      Comprehensive university module covering advanced data structures, AI graph theory, and system design algorithms.
                    </p>

                    <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Module Active
                      </span>
                      <button className="text-indigo-400 font-semibold hover:underline flex items-center gap-1">
                        View Modules <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ASSIGNMENTS */}
          {activeTab === "assignments" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckSquare className="h-6 w-6 text-indigo-400" />
                Classroom Assignments & Grading
              </h3>

              <div className="space-y-4">
                {assignments.map((a: any) => (
                  <div key={a.id} className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-bold text-base text-[var(--text-primary)]">{a.title}</h4>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 self-start sm:self-auto">
                        Due: {new Date(a.due_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{a.description}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                      <span>Max Points: <strong className="text-[var(--text-primary)]">{a.max_points}</strong></span>
                      <span className="text-emerald-400 font-semibold">AI Auto-Grading Enabled</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ATTENDANCE */}
          {activeTab === "attendance" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="h-6 w-6 text-indigo-400" />
                  Live Attendance Register Summary
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)]">
                    <div className="text-xs text-[var(--text-muted)]">Total Conducted Classes</div>
                    <div className="text-2xl font-bold mt-1">{attendance?.summary?.totalClasses || 10}</div>
                  </div>

                  <div className="p-4 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)]">
                    <div className="text-xs text-[var(--text-muted)]">Attended Classes</div>
                    <div className="text-2xl font-bold mt-1 text-emerald-400">{attendance?.summary?.present || 9}</div>
                  </div>

                  <div className="p-4 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)]">
                    <div className="text-xs text-[var(--text-muted)]">Attendance Percentage</div>
                    <div className="text-2xl font-bold mt-1 text-indigo-400">{attendance?.summary?.percentage || 95}%</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <h4 className="font-bold text-sm">Recent Attendance Logs</h4>
                  {attendance?.data?.slice(0, 5).map((att: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs">
                      <span>Date: {new Date(att.date).toLocaleDateString()}</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold ${att.status === "Present" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        {att.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PLACEMENTS */}
          {activeTab === "placements" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Award className="h-6 w-6 text-indigo-400" />
                Upcoming Campus Placement Drives
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {placements.map((pd: any) => (
                  <div key={pd.id} className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4 hover:border-indigo-500/50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {pd.company}
                        </span>
                        <h4 className="font-bold text-lg mt-2 text-[var(--text-primary)]">{pd.title}</h4>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                        Min CGPA: {pd.min_cgpa}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">
                        Drive Date: <strong>{new Date(pd.drive_date).toLocaleDateString()}</strong>
                      </span>
                      <button className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition">
                        Register Student
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
