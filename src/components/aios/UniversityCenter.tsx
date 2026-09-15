import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Award,
  Zap,
  Users,
  Compass,
  Globe,
  BookOpen,
  CheckCircle2,
  Lock,
  Sparkles,
  Search,
  ChevronRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  Building2,
  FileCode2,
  RefreshCw,
  Share2,
  Play,
  Layers,
  Flame,
  Star,
  DollarSign,
  Activity,
  AlertCircle
} from 'lucide-react';
import {
  universityApi,
  DegreeProgram,
  StudentDegree,
  GraduationAudit,
  CapabilityGraphSummary,
  CapabilityNode,
  MentorProfile,
  MentorSession,
  LearningMarketplaceSummary,
  CredentialNetworkSummary,
  HumanPotentialSummary,
  GlobalImpactSummary
} from '../../services/universityApi';

export const UniversityCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'degrees' | 'capabilities' | 'mentors' | 'marketplace' | 'credentials' | 'potential_impact'>('degrees');
  const [loading, setLoading] = useState(true);

  // Data states
  const [degrees, setDegrees] = useState<DegreeProgram[]>([]);
  const [studentDegrees, setStudentDegrees] = useState<StudentDegree[]>([]);
  const [audit, setAudit] = useState<GraduationAudit | null>(null);
  const [selectedDegree, setSelectedDegree] = useState<DegreeProgram | null>(null);

  const [capabilities, setCapabilities] = useState<CapabilityGraphSummary | null>(null);
  const [capabilityDomainFilter, setCapabilityDomainFilter] = useState<'All' | 'Technical' | 'Professional' | 'Research' | 'Entrepreneurship'>('All');

  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [mentorSessions, setMentorSessions] = useState<MentorSession[]>([]);
  const [debateTopic, setDebateTopic] = useState('Distributed Raft Storage vs Multi-Agent Reasoning Swarm');
  const [debating, setDebating] = useState(false);

  const [marketplace, setMarketplace] = useState<LearningMarketplaceSummary | null>(null);
  const [credentials, setCredentials] = useState<CredentialNetworkSummary | null>(null);
  const [verifyingHash, setVerifyingHash] = useState<string | null>(null);

  const [potential, setPotential] = useState<HumanPotentialSummary | null>(null);
  const [targetRoleSim, setTargetRoleSim] = useState('Staff AI Engineer (OpenAI / Google)');
  const [simulatingRole, setSimulatingRole] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  const [impact, setImpact] = useState<GlobalImpactSummary | null>(null);
  const [impactEventTitle, setImpactEventTitle] = useState('');
  const [impactArea, setImpactArea] = useState('Open Source');
  const [impactReach, setImpactReach] = useState('1500');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [univRes, capRes, mntRes, mktRes, crdRes, potRes, impRes] = await Promise.all([
        universityApi.getUniversity(),
        universityApi.getCapabilities(),
        universityApi.getMentors(),
        universityApi.getLearningMarketplace(),
        universityApi.getCredentials(),
        universityApi.getPotential(),
        universityApi.getGlobalImpact()
      ]);

      if (univRes.data) {
        setDegrees(univRes.data.degrees || []);
        setStudentDegrees(univRes.data.studentDegrees || []);
        setAudit(univRes.data.audit || null);
        if (univRes.data.degrees && univRes.data.degrees.length > 0) {
          setSelectedDegree(univRes.data.degrees[0]);
        }
      }

      if (capRes.data) setCapabilities(capRes.data);
      if (mntRes.data) {
        setMentors(mntRes.data.mentors || []);
        setMentorSessions(mntRes.data.sessions || []);
      }
      if (mktRes.data) setMarketplace(mktRes.data);
      if (crdRes.data) setCredentials(crdRes.data);
      if (potRes.data) setPotential(potRes.data);
      if (impRes.data) setImpact(impRes.data);
    } catch (err) {
      console.error('Failed to load University & Capability data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (degreeId: string) => {
    try {
      await universityApi.enrollDegree(degreeId);
      await loadAllData();
    } catch (e) {
      console.error('Enroll error:', e);
    }
  };

  const handleRunDebate = async () => {
    if (!debateTopic.trim()) return;
    setDebating(true);
    try {
      const res = await universityApi.conductMentorDebate(debateTopic);
      if (res.data) {
        setMentorSessions([res.data, ...mentorSessions]);
      }
    } catch (e) {
      console.error('Debate error:', e);
    } finally {
      setDebating(false);
    }
  };

  const handleSimulatePotential = async () => {
    if (!targetRoleSim.trim()) return;
    setSimulatingRole(true);
    try {
      const res = await universityApi.simulatePotentialTrajectory(targetRoleSim);
      if (res.data) setSimulationResult(res.data);
    } catch (e) {
      console.error('Potential sim error:', e);
    } finally {
      setSimulatingRole(false);
    }
  };

  const handleVerifyHash = async (hash: string) => {
    setVerifyingHash(hash);
    try {
      const res = await universityApi.verifyCredentialHash(hash);
      alert(`Hash Verification Result:\n${JSON.stringify(res.data, null, 2)}`);
    } catch (e) {
      alert('Verification failed');
    } finally {
      setVerifyingHash(null);
    }
  };

  const handleLogImpact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!impactEventTitle.trim()) return;
    try {
      await universityApi.logImpactEvent({
        impactArea,
        title: impactEventTitle,
        metrics: `${parseInt(impactReach).toLocaleString()} reach verified on Algora Global Network`,
        reachCount: parseInt(impactReach) || 500,
        verificationSource: 'Algora Verification'
      });
      setImpactEventTitle('');
      await loadAllData();
    } catch (err) {
      console.error('Log impact error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400">
        <RefreshCw className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="font-mono text-sm">Initializing Autonomous AI University & Human Capability Graph (V5.0)...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-widest mb-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              Algora V5.0 — Human Capability Operating System (HCOS)
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Autonomous AI University & Capability Network
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Verifiable degree programs, capability graph intelligence, Socratic mentor council debates, and global impact tracking.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/60 backdrop-blur-md border border-indigo-500/30 px-4 py-3 rounded-xl">
            <div className="text-center border-r border-slate-800 pr-4">
              <span className="text-xs text-slate-400 block font-mono">GPA</span>
              <span className="text-xl font-extrabold text-emerald-400">{audit?.currentGpa || 3.92}</span>
            </div>
            <div className="text-center border-r border-slate-800 pr-4">
              <span className="text-xs text-slate-400 block font-mono">CREDITS</span>
              <span className="text-xl font-extrabold text-indigo-400">{audit?.creditsCompleted || 96}</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-slate-400 block font-mono">POTENTIAL INDEX</span>
              <span className="text-xl font-extrabold text-amber-400">{potential?.compositePotentialIndex || 95.8}</span>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto border-t border-slate-800 pt-4">
          {[
            { id: 'degrees', label: 'AI University Degrees', icon: GraduationCap },
            { id: 'capabilities', label: 'Capability Graph', icon: Brain },
            { id: 'mentors', label: 'Mentor Council', icon: Users },
            { id: 'marketplace', label: 'Learning Marketplace', icon: BookOpen },
            { id: 'credentials', label: 'Credential Network', icon: ShieldCheck },
            { id: 'potential_impact', label: 'Human Potential & Impact', icon: Globe }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: AI UNIVERSITY DEGREES */}
      {activeTab === 'degrees' && (
        <div className="space-y-6">
          {/* Graduation Audit Bar */}
          {audit && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Graduation Audit Status: {audit.isEligible ? 'Eligible for Graduation' : 'In Progress'}
                  </div>
                  <h3 className="text-lg font-bold text-white">{audit.degreeTitle}</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Estimated Graduation: {audit.estimatedGraduationSemesters} Semesters • Required GPA: {audit.minGpaRequired} (Current: {audit.currentGpa})
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-40">
                    <div className="flex justify-between text-xs text-slate-300 font-mono mb-1">
                      <span>Readiness</span>
                      <span className="text-indigo-400 font-bold">{audit.careerReadinessScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full" style={{ width: `${audit.careerReadinessScore}%` }} />
                    </div>
                  </div>

                  <button
                    onClick={() => universityApi.recalculateUniversity().then(loadAllData)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Audit Progress
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Degree Programs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Degree Selector List */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                8 Canonical AI Degree Paths
              </h3>
              <div className="space-y-2">
                {degrees.map((deg) => {
                  const isEnrolled = studentDegrees.some(sd => sd.degreeId === deg.id);
                  const isSelected = selectedDegree?.id === deg.id;
                  return (
                    <div
                      key={deg.id}
                      onClick={() => setSelectedDegree(deg)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-900 border-indigo-500/80 shadow-md'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                            {deg.degreeType}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1.5">{deg.title}</h4>
                        </div>
                        {isEnrolled && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono rounded-full whitespace-nowrap">
                            Enrolled
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 font-mono">
                        <span>{deg.totalCredits} Credits</span>
                        <span>•</span>
                        <span>{deg.totalSemesters} Semesters</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Degree Detail & Syllabus */}
            {selectedDegree && (
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">{selectedDegree.domain} Domain</span>
                    <h2 className="text-xl font-extrabold text-white mt-1">{selectedDegree.title}</h2>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">{selectedDegree.description}</p>
                  </div>
                  <button
                    onClick={() => handleEnroll(selectedDegree.id)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition whitespace-nowrap"
                  >
                    Enroll in Degree Path
                  </button>
                </div>

                {/* Capstone Requirement */}
                <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                    <Zap className="w-4 h-4" />
                    Required Graduation Capstone
                  </div>
                  <h4 className="text-sm font-bold text-white">{selectedDegree.capstoneRequirement.title}</h4>
                  <p className="text-slate-300 text-xs leading-relaxed">{selectedDegree.capstoneRequirement.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedDegree.capstoneRequirement.deliverables.map((d, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-900 text-slate-300 border border-slate-800 text-[11px] rounded-lg font-mono">
                        ✓ {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Courses List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Curriculum Syllabus & Course Units</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedDegree.courses?.map((course) => (
                      <div key={course.id} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {course.courseCode} • Sem {course.semester}
                          </span>
                          <span className="text-xs font-mono text-slate-400">{course.credits} Credits</span>
                        </div>
                        <h5 className="text-xs font-bold text-white">{course.courseName}</h5>
                        <p className="text-slate-400 text-[11px] line-clamp-2">{course.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CAPABILITY GRAPH */}
      {activeTab === 'capabilities' && capabilities && (
        <div className="space-y-6">
          {/* Overview Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['Technical', 'Professional', 'Research', 'Entrepreneurship'] as const).map((domain) => (
              <div key={domain} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
                <span className="text-xs font-mono text-slate-400">{domain} Mastery</span>
                <div className="text-2xl font-extrabold text-white">
                  {capabilities.domainAverages[domain]}%
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${
                      domain === 'Technical' ? 'bg-indigo-500' : domain === 'Professional' ? 'bg-emerald-500' : domain === 'Research' ? 'bg-purple-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${capabilities.domainAverages[domain]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider pl-2">Domain Filter:</span>
              {(['All', 'Technical', 'Professional', 'Research', 'Entrepreneurship'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setCapabilityDomainFilter(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    capabilityDomainFilter === d ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <span className="text-xs font-mono text-indigo-400 pr-2">Total Nodes: {capabilities.totalCapabilities}</span>
          </div>

          {/* Capability Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.capabilityNodes
              .filter(c => capabilityDomainFilter === 'All' || c.domain === capabilityDomainFilter)
              .map((cap) => (
                <div key={cap.id} className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 space-y-3 relative overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md">
                        {cap.domain} • {cap.category}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">{cap.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">{cap.masteryScore}%</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{cap.description}</p>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${cap.masteryScore}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: MENTOR COUNCIL */}
      {activeTab === 'mentors' && (
        <div className="space-y-6">
          {/* Debate Simulator Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-wider">
              <Users className="w-4 h-4 text-amber-400" />
              Socratic Multi-Mentor Debate Simulator
            </div>
            <h3 className="text-lg font-bold text-white">Trigger Multi-Mentor Strategic Debate</h3>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={debateTopic}
                onChange={(e) => setDebateTopic(e.target.value)}
                placeholder="Enter strategic topic for multi-mentor debate..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleRunDebate}
                disabled={debating}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-lg transition flex items-center gap-2 whitespace-nowrap"
              >
                {debating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {debating ? 'Debating...' : 'Convene Debate'}
              </button>
            </div>
          </div>

          {/* Mentors Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentors.map((mnt) => (
              <div key={mnt.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${mnt.avatarColor} flex items-center justify-center font-bold text-white text-sm shadow-md`}>
                    {mnt.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{mnt.name}</h4>
                    <span className="text-[11px] text-indigo-400 font-mono block">{mnt.role}</span>
                  </div>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{mnt.bio}</p>
                <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800 text-[11px] text-slate-400">
                  <strong className="text-slate-200 block mb-1">Debate Personality:</strong>
                  {mnt.debatePersonality}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Debates Transcript */}
          {mentorSessions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Council Debate Transcripts</h3>
              {mentorSessions.map((session) => (
                <div key={session.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-base font-bold text-white">Topic: "{session.topic}"</h4>
                    <span className="text-xs font-mono text-slate-400">{new Date(session.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {session.transcript.map((stmt, idx) => (
                      <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-400">{stmt.mentorName}</span>
                          <span className="text-[10px] font-mono text-emerald-400">{stmt.confidence}% Confidence</span>
                        </div>
                        <p className="text-slate-300 text-xs italic">"{stmt.statement}"</p>
                        <span className="text-[10px] font-mono text-slate-500 block">Stance: {stmt.stance}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">Council Consensus Decision</span>
                    <p className="text-slate-200 text-xs font-medium">{session.consensusDecision}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LEARNING MARKETPLACE */}
      {activeTab === 'marketplace' && marketplace && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketplace.offerings.map((offering) => (
              <div key={offering.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                      {offering.offeringType} • {offering.durationWeeks} Weeks
                    </span>
                    <h4 className="text-base font-bold text-white mt-2">{offering.title}</h4>
                    <span className="text-xs text-slate-400 font-mono">Provider: {offering.provider}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-amber-400">{offering.roiScore}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">ROI SCORE</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Completion</span>
                    <span className="text-xs font-bold text-emerald-400">{offering.completionProbability}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Hiring Impact</span>
                    <span className="text-xs font-bold text-indigo-400">{offering.hiringImpactPct}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Skill Gain</span>
                    <span className="text-xs font-bold text-amber-400">{offering.skillGainEstimate}</span>
                  </div>
                </div>

                <button
                  onClick={() => universityApi.enrollDegree('deg_swe').then(() => alert('Enrolled in marketplace program!'))}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-md transition"
                >
                  Apply & Enroll
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CREDENTIAL NETWORK */}
      {activeTab === 'credentials' && credentials && (
        <div className="space-y-6">
          {/* Stackable Badges Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Verifiable Stackable Badges & Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {credentials.stackableBadges.map((badge, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${badge.unlocked ? 'bg-indigo-950/40 border-indigo-500/50' : 'bg-slate-950/60 border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <ShieldCheck className={`w-5 h-5 ${badge.unlocked ? 'text-amber-400' : 'text-slate-600'}`} />
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${badge.unlocked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      {badge.unlocked ? 'UNLOCKED' : 'LOCKED'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{badge.tierTitle}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Credentials List */}
          <div className="space-y-3">
            {credentials.credentials.map((cred) => (
              <div key={cred.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded">
                      {cred.credentialType}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Issued by {cred.issuer}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{cred.title}</h4>
                  <p className="text-xs font-mono text-slate-500 mt-1 truncate max-w-xl">Proof Hash: {cred.verificationHash}</p>
                </div>
                <button
                  onClick={() => handleVerifyHash(cred.verificationHash)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verify On-Chain Hash
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: HUMAN POTENTIAL & GLOBAL IMPACT */}
      {activeTab === 'potential_impact' && (
        <div className="space-y-6">
          {/* Human Potential Forecast Simulator */}
          {potential && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">Human Potential Intelligence</span>
                  <h3 className="text-lg font-bold text-white mt-1">Composite Potential Index: {potential.compositePotentialIndex} / 100</h3>
                  <p className="text-slate-400 text-xs mt-1">{potential.aiSynthesisInsight}</p>
                </div>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono rounded-full">
                  {potential.trajectoryClass} Trajectory
                </span>
              </div>

              {/* Simulation Input */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="text"
                  value={targetRoleSim}
                  onChange={(e) => setTargetRoleSim(e.target.value)}
                  placeholder="Target Role for 5-Yr Trajectory Simulation..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
                />
                <button
                  onClick={handleSimulatePotential}
                  disabled={simulatingRole}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition"
                >
                  {simulatingRole ? 'Simulating...' : 'Simulate Trajectory'}
                </button>
              </div>

              {simulationResult && (
                <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-4 space-y-3 mt-4">
                  <h4 className="text-xs font-bold text-indigo-400 font-mono">Simulation Outcome for {simulationResult.targetRole}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {simulationResult.milestones?.map((m: any, idx: number) => (
                      <div key={idx} className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                        <span className="text-amber-400 font-mono font-bold">Year {m.year}: {m.tier}</span>
                        <p className="text-slate-300 text-[11px] mt-1">{m.focus}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Global Impact Dashboard */}
          {impact && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Global Impact Reach</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">{impact.profile.totalPeopleImpacted.toLocaleString()} People Impacted</h3>
                  <p className="text-slate-400 text-xs mt-1">Impact Score: {impact.impactScoreScaled1000} / 1000 (Top {impact.globalRankPercentile}% Globally)</p>
                </div>
              </div>

              {/* Log New Impact Event Form */}
              <form onSubmit={handleLogImpact} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white font-mono uppercase">Log Verified Impact Event</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={impactEventTitle}
                    onChange={(e) => setImpactEventTitle(e.target.value)}
                    placeholder="Impact Event Title (e.g., OSS Raft Release)"
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                  <select
                    value={impactArea}
                    onChange={(e) => setImpactArea(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {['Open Source', 'Research', 'Education', 'Mentorship', 'Community Building', 'Entrepreneurship'].map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={impactReach}
                    onChange={(e) => setImpactReach(e.target.value)}
                    placeholder="Reach Count (e.g., 1500)"
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition">
                  Log & Verify Impact
                </button>
              </form>

              {/* Impact Events History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 font-mono uppercase">Recent Verified Impact Events</h4>
                {impact.events.map((ev) => (
                  <div key={ev.id} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                        {ev.impactArea}
                      </span>
                      <h5 className="text-sm font-bold text-white mt-1">{ev.title}</h5>
                      <p className="text-slate-400 text-xs mt-0.5">{ev.metrics}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 whitespace-nowrap">
                      +{ev.reachCount.toLocaleString()} Reach
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
