import React, { useState, useEffect } from "react";
import {
  Users, BarChart2, ClipboardList, Download, Search, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Plus, Brain, Award, Clock, Building2,
  BookOpen, Megaphone, Key, ShieldCheck, Sparkles, Send, Check, Filter,
  GraduationCap, ChevronRight, FileText
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, PieChart, Pie
} from "recharts";
import {
  EnterpriseService, InstitutionOverviewData, DepartmentData,
  FacultyStaffData, StudentBatchData, ClassroomData, ClassroomAssignmentData,
  ClassroomAnnouncementData, StudentReportData
} from "../services/enterpriseService";

type PortalTab = "overview" | "classrooms" | "departments" | "faculty" | "batches" | "gradebook" | "reports";

export default function Faculty() {
  const [tab, setTab] = useState<PortalTab>("overview");
  const [institution, setInstitution] = useState<InstitutionOverviewData | null>(null);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [facultyStaff, setFacultyStaff] = useState<FacultyStaffData[]>([]);
  const [batches, setBatches] = useState<StudentBatchData[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomData | null>(null);
  const [assignments, setAssignments] = useState<ClassroomAssignmentData[]>([]);
  const [announcements, setAnnouncements] = useState<ClassroomAnnouncementData[]>([]);
  const [reports, setReports] = useState<StudentReportData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [joinCodeModal, setJoinCodeModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [newAssignmentModal, setNewAssignmentModal] = useState(false);
  const [newAnnounceModal, setNewAnnounceModal] = useState(false);
  const [newClassroomModal, setNewClassroomModal] = useState(false);

  // Form states
  const [newAssignment, setNewAssignment] = useState({ title: "", description: "", dueDate: "2026-09-30", totalPoints: 100, problemIds: ["two-sum", "valid-anagram"] });
  const [newAnnounce, setNewAnnounce] = useState({ title: "", content: "", isPinned: false });
  const [newClassroom, setNewClassroom] = useState({ name: "", subjectCode: "", department: "Computer Science & Engineering", semester: "Semester 5" });

  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPortalData();
  }, []);

  const loadPortalData = async () => {
    setLoading(true);
    try {
      const [instRes, deptRes, facRes, batchRes, classRes, repRes] = await Promise.all([
        EnterpriseService.getInstitutionOverview(),
        EnterpriseService.listDepartments(),
        EnterpriseService.listFaculty(),
        EnterpriseService.listBatches(),
        EnterpriseService.listClassrooms(),
        EnterpriseService.listStudentReports(),
      ]);

      setInstitution(instRes.institution);
      setDepartments(deptRes.departments);
      setFacultyStaff(facRes.faculty);
      setBatches(batchRes.batches);
      setClassrooms(classRes.classrooms);
      setReports(repRes.reports);

      if (classRes.classrooms.length > 0) {
        const first = classRes.classrooms[0];
        setSelectedClassroom(first);
        loadClassroomDetails(first.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadClassroomDetails = async (classroomId: string) => {
    try {
      const [assignRes, annRes] = await Promise.all([
        EnterpriseService.listAssignments(classroomId),
        EnterpriseService.listAnnouncements(classroomId),
      ]);
      setAssignments(assignRes.assignments);
      setAnnouncements(annRes.announcements);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassroom) return;
    try {
      await EnterpriseService.createAssignment(selectedClassroom.id, newAssignment);
      setToastMessage("Assignment dispatched to students successfully!");
      setNewAssignmentModal(false);
      loadClassroomDetails(selectedClassroom.id);
      setTimeout(() => setToastMessage(null), 6000);
    } catch (err: any) {
      alert(err.message || "Failed to create assignment");
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassroom) return;
    try {
      await EnterpriseService.postAnnouncement(selectedClassroom.id, {
        ...newAnnounce,
        authorName: "Dr. Arvind Ramesh",
        authorRole: "Course Lead",
      });
      setToastMessage("Classroom announcement broadcasted!");
      setNewAnnounceModal(false);
      loadClassroomDetails(selectedClassroom.id);
      setTimeout(() => setToastMessage(null), 6000);
    } catch (err: any) {
      alert(err.message || "Failed to post announcement");
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await EnterpriseService.joinClassroomByCode(joinCodeInput.trim(), "usr_current");
      setToastMessage(`Enrolled successfully in ${res.classroom.name}!`);
      setJoinCodeModal(false);
      setJoinCodeInput("");
      loadPortalData();
      setTimeout(() => setToastMessage(null), 6000);
    } catch (err: any) {
      alert(err.message || "Invalid classroom code");
    }
  };

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Banner Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
              {institution?.name || "Algora Institute of Technology"}
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 999,
                background: "color-mix(in srgb, var(--blue) 15%, transparent)",
                color: "var(--blue)",
                border: "1px solid color-mix(in srgb, var(--blue) 30%, transparent)",
              }}
            >
              Academic Tier
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
            Autonomous university workspace · Faculty management · Live course rosters · Automated AI diagnostic gradebooks
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setJoinCodeModal(true)} style={{ gap: 5 }}>
            <Key size={13} /> Join by Code
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()} style={{ gap: 5 }}>
            <Download size={13} /> Export Roster
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setNewAssignmentModal(true)} style={{ gap: 5 }}>
            <Plus size={13} /> New Assignment
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            padding: "8px 16px",
            background: "color-mix(in srgb, var(--green) 15%, transparent)",
            border: "1px solid color-mix(in srgb, var(--green) 35%, transparent)",
            borderRadius: "var(--radius-md)",
            color: "var(--green)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Enrolled Students", value: institution?.totalStudents.toString() || "1,240", sub: "Across 4 Departments", icon: Users, color: "var(--blue)" },
          { label: "Active Classrooms", value: classrooms.length.toString(), sub: "In-session Fall 2026", icon: BookOpen, color: "var(--green)" },
          { label: "Average Class Mastery", value: `${institution?.overallAverageScore || 76.8}%`, sub: "↑ 3.4% this semester", icon: BarChart2, color: "var(--brand)" },
          { label: "At-Risk Interventions", value: institution?.atRiskStudentsCount.toString() || "14", sub: "Flagged by Algora AI", icon: AlertTriangle, color: "var(--red)" },
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

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: 3, padding: 4, background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", alignSelf: "flex-start", flexWrap: "wrap" }}>
        {[
          { id: "overview", label: "Cohort Analytics", icon: BarChart2 },
          { id: "classrooms", label: "Classrooms & Feed", icon: BookOpen },
          { id: "departments", label: "Departments", icon: Building2 },
          { id: "faculty", label: "Faculty Roster", icon: GraduationCap },
          { id: "batches", label: "Student Batches", icon: Users },
          { id: "gradebook", label: "Live Gradebook", icon: ClipboardList },
          { id: "reports", label: "AI Student Diagnostic Reports", icon: Brain },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id as PortalTab)}
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
            }}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab 1: Cohort Analytics */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="surface-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>
              Departmental Problem Mastery vs Benchmark
            </h3>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 16px" }}>
              Comparative student code accuracy across algorithmic domains.
            </p>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { topic: "Arrays", classAvg: 82, targetAvg: 70 },
                    { topic: "Trees", classAvg: 68, targetAvg: 65 },
                    { topic: "DP", classAvg: 54, targetAvg: 60 },
                    { topic: "Graphs", classAvg: 73, targetAvg: 65 },
                    { topic: "Strings", classAvg: 76, targetAvg: 65 },
                    { topic: "Heap", classAvg: 61, targetAvg: 60 },
                  ]}
                >
                  <XAxis dataKey="topic" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }} />
                  <Bar dataKey="classAvg" name="Class Average" fill="var(--brand)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="targetAvg" name="ABAC Benchmark" fill="var(--border)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="surface-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>
              Weekly Problem Submissions & Active Learners
            </h3>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 16px" }}>
              Weekly engagement curve across the 8-week semester sprint.
            </p>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { w: "W1", active: 220, submissions: 1420 },
                    { w: "W2", active: 242, submissions: 1680 },
                    { w: "W3", active: 235, submissions: 1540 },
                    { w: "W4", active: 280, submissions: 2190 },
                    { w: "W5", active: 264, submissions: 1975 },
                    { w: "W6", active: 310, submissions: 2610 },
                    { w: "W7", active: 296, submissions: 2495 },
                    { w: "W8", active: 340, submissions: 3128 },
                  ]}
                >
                  <defs>
                    <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--green)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="w" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }} />
                  <Area type="monotone" dataKey="submissions" name="Submissions" stroke="var(--green)" fillOpacity={1} fill="url(#colorSub)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Classrooms & Feed */}
      {tab === "classrooms" && (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
          {/* Classroom List Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {classrooms.map((cls) => {
              const isSelected = selectedClassroom?.id === cls.id;
              return (
                <div
                  key={cls.id}
                  onClick={() => {
                    setSelectedClassroom(cls);
                    loadClassroomDetails(cls.id);
                  }}
                  className="surface-card"
                  style={{
                    padding: 14,
                    cursor: "pointer",
                    border: isSelected ? "1px solid var(--brand)" : "1px solid var(--border)",
                    background: isSelected ? "color-mix(in srgb, var(--brand) 6%, transparent)" : "var(--bg-surface)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{cls.subjectCode} — {cls.name}</span>
                    <span style={{ fontSize: 10, fontFamily: "monospace", padding: "2px 6px", borderRadius: 4, background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--brand)" }}>
                      {cls.joinCode}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{cls.department} · {cls.semester}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-secondary)", marginTop: 8, borderTop: "1px solid var(--border)", paddingTop: 6 }}>
                    <span>Faculty: <strong>{cls.facultyName}</strong></span>
                    <span>{cls.studentCount} Students</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Classroom Feed Right */}
          {selectedClassroom && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Classroom Head Bar */}
              <div className="surface-card" style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    {selectedClassroom.subjectCode} · {selectedClassroom.name}
                  </h2>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    Instructor: <strong>{selectedClassroom.facultyName}</strong> · Join Code: <span style={{ fontFamily: "monospace", color: "var(--brand)", fontWeight: 700 }}>{selectedClassroom.joinCode}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setNewAnnounceModal(true)} style={{ gap: 4 }}>
                    <Megaphone size={13} /> Announcement
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => setNewAssignmentModal(true)} style={{ gap: 4 }}>
                    <Plus size={13} /> Create Assignment
                  </button>
                </div>
              </div>

              {/* Feed: Announcements */}
              <div className="surface-card" style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <Megaphone size={15} style={{ color: "var(--amber)" }} />
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Classroom Announcements</h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {announcements.map((ann) => (
                    <div key={ann.id} style={{ background: "var(--bg-subtle)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{ann.title}</span>
                        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{ann.postedAt}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 6px", lineHeight: 1.5 }}>{ann.content}</p>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Posted by {ann.authorName} ({ann.authorRole})</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feed: Assignments */}
              <div className="surface-card" style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <ClipboardList size={15} style={{ color: "var(--brand)" }} />
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Active Assignments</h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {assignments.map((asg) => (
                    <div key={asg.id} style={{ background: "var(--bg-subtle)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{asg.title}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                          Due Date: <strong>{asg.dueDate}</strong> · Max: {asg.totalPoints} pts · {asg.problemIds.length} Problems
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)" }}>
                          {asg.submittedCount} / {selectedClassroom.studentCount} Submitted
                        </div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Avg Score: {asg.averageScore}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Departments */}
      {tab === "departments" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {departments.map((dept) => (
            <div key={dept.id} className="surface-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--brand)" }}>
                  {dept.code}
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{dept.name}</h3>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Head: {dept.headOfDepartment}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, borderTop: "1px solid var(--border)", paddingTop: 12, fontSize: 11 }}>
                <div>
                  <div style={{ color: "var(--text-muted)" }}>Faculty Staff</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{dept.facultyCount}</div>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)" }}>Enrolled Students</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{dept.studentCount}</div>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)" }}>Active Classrooms</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{dept.activeClassrooms}</div>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)" }}>Avg Placement Rate</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--green)" }}>{dept.placementRate}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Faculty Staff */}
      {tab === "faculty" && (
        <div className="surface-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Faculty Staff Directory</h3>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
              Professors, lecturers, and academic mentors driving course delivery.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Faculty Member</th>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Designation</th>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Department</th>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Classrooms</th>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Students Mentored</th>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {facultyStaff.map((fac) => (
                  <tr key={fac.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{fac.name}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{fac.email}</div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{fac.designation}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{fac.department}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600 }}>{fac.activeClassroomsCount}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{fac.assignedStudentsCount}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--brand)" }}>★ {fac.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Batches */}
      {tab === "batches" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {batches.map((b) => (
            <div key={b.id} className="surface-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{b.name}</h3>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{b.department} · {b.academicYear}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--brand)" }}>
                  {b.semester}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, borderTop: "1px solid var(--border)", paddingTop: 12, fontSize: 11 }}>
                <div>
                  <div style={{ color: "var(--text-muted)" }}>Student Cohort</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{b.studentCount} Students</div>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)" }}>Class Average</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--green)" }}>{b.averageMasteryScore}%</div>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)" }}>Mentor Lead</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{b.facultyMentorName}</div>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)" }}>Placement Status</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)" }}>{b.placementReadiness}% Ready</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 6: Gradebook */}
      {tab === "gradebook" && (
        <div className="surface-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Automated Live Gradebook</h3>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
                Real-time synchronized submission grades and algorithmic problem accuracy.
              </p>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Student</th>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Roll Number</th>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Accuracy</th>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Problems Solved</th>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Streak</th>
                  <th style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Risk Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Priya Patel", id: "21CS001", accuracy: 88, streak: 32, solved: 148, risk: false },
                  { name: "Sneha Reddy", id: "21CS003", accuracy: 91, streak: 28, solved: 172, risk: false },
                  { name: "Arjun Sharma", id: "21CS004", accuracy: 73, streak: 28, solved: 347, risk: false },
                  { name: "Rahul Kumar", id: "21CS002", accuracy: 72, streak: 14, solved: 96, risk: false },
                  { name: "Kavya Singh", id: "21CS005", accuracy: 45, streak: 2, solved: 38, risk: true },
                  { name: "Ananya Iyer", id: "21CS007", accuracy: 36, streak: 0, solved: 22, risk: true },
                ].map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-primary)" }}>{s.name}</td>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", color: "var(--text-muted)" }}>{s.id}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 40, height: 5, borderRadius: 999, background: "var(--bg-subtle)", overflow: "hidden" }}>
                          <div style={{ width: `${s.accuracy}%`, height: "100%", background: s.risk ? "var(--red)" : "var(--green)" }} />
                        </div>
                        <span style={{ fontWeight: 600, color: s.risk ? "var(--red)" : "var(--green)" }}>{s.accuracy}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{s.solved}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{s.streak}d 🔥</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: s.risk ? "color-mix(in srgb, var(--red) 15%, transparent)" : "color-mix(in srgb, var(--green) 15%, transparent)",
                          color: s.risk ? "var(--red)" : "var(--green)",
                        }}
                      >
                        {s.risk ? "At-Risk (Attention Needed)" : "On-Track"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: AI Student Diagnostic Reports */}
      {tab === "reports" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
          {reports.map((rep) => (
            <div key={rep.studentId} className="surface-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{rep.studentName}</h3>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{rep.rollNumber} · Algora AI Diagnostic</div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: rep.riskLevel === "low" ? "color-mix(in srgb, var(--green) 15%, transparent)" : "color-mix(in srgb, var(--red) 15%, transparent)",
                    color: rep.riskLevel === "low" ? "var(--green)" : "var(--red)",
                    textTransform: "uppercase",
                  }}
                >
                  {rep.riskLevel} Risk
                </span>
              </div>

              {/* Strengths & Weaknesses */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12, fontSize: 11 }}>
                <div style={{ background: "color-mix(in srgb, var(--green) 8%, transparent)", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid color-mix(in srgb, var(--green) 20%, transparent)" }}>
                  <div style={{ fontWeight: 700, color: "var(--green)", marginBottom: 4 }}>Key Strengths</div>
                  {rep.strengths.map((s, i) => (
                    <div key={i} style={{ color: "var(--text-secondary)" }}>• {s}</div>
                  ))}
                </div>
                <div style={{ background: "color-mix(in srgb, var(--red) 8%, transparent)", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid color-mix(in srgb, var(--red) 20%, transparent)" }}>
                  <div style={{ fontWeight: 700, color: "var(--red)", marginBottom: 4 }}>Skill Deficits</div>
                  {rep.weaknesses.map((w, i) => (
                    <div key={i} style={{ color: "var(--text-secondary)" }}>• {w}</div>
                  ))}
                </div>
              </div>

              <div style={{ background: "var(--bg-subtle)", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 2 }}>AI Faculty Recommendation</div>
                <div style={{ fontSize: 11, color: "var(--text-primary)", lineHeight: 1.4 }}>{rep.recommendation}</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 10, fontSize: 11 }}>
                <span style={{ color: "var(--text-muted)" }}>Placement Readiness: <strong style={{ color: "var(--brand)" }}>{rep.placementReadiness}%</strong></span>
                <span style={{ color: "var(--text-muted)" }}>Generated: {rep.generatedAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Join Code Modal */}
      {joinCodeModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }} onClick={() => setJoinCodeModal(false)}>
          <div style={{ width: "100%", maxWidth: 420, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px" }}>Join Classroom by Code</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>Enter the 6-character code provided by your course professor.</p>
            <form onSubmit={handleJoinByCode} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                required
                placeholder="e.g. CS301A"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                style={{ width: "100%", padding: "10px 14px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, fontFamily: "monospace", letterSpacing: "0.1em" }}
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setJoinCodeModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Enroll Now</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Assignment Modal */}
      {newAssignmentModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }} onClick={() => setNewAssignmentModal(false)}>
          <div style={{ width: "100%", maxWidth: 480, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px" }}>Create Course Assignment</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>Distribute coding problems with automated test case evaluation.</p>
            <form onSubmit={handleCreateAssignment} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Week 4 — Trees & Binary Search"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Description / Instructions</label>
                <textarea
                  rows={3}
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder="Instructions for students..."
                  style={{ width: "100%", padding: "8px 12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 12 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Due Date</label>
                  <input
                    type="date"
                    required
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Total Points</label>
                  <input
                    type="number"
                    required
                    value={newAssignment.totalPoints}
                    onChange={(e) => setNewAssignment({ ...newAssignment, totalPoints: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 12 }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setNewAssignmentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Publish Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Announcement Modal */}
      {newAnnounceModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }} onClick={() => setNewAnnounceModal(false)}>
          <div style={{ width: "100%", maxWidth: 460, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px" }}>Broadcast Classroom Announcement</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>Post updates, contest schedules, or office hours alerts.</p>
            <form onSubmit={handleCreateAnnouncement} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Mock OA Scheduled"
                  value={newAnnounce.title}
                  onChange={(e) => setNewAnnounce({ ...newAnnounce, title: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Announcement Content</label>
                <textarea
                  rows={4}
                  required
                  value={newAnnounce.content}
                  onChange={(e) => setNewAnnounce({ ...newAnnounce, content: e.target.value })}
                  placeholder="Write message to students..."
                  style={{ width: "100%", padding: "8px 12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 12 }}
                />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setNewAnnounceModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Broadcast</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
