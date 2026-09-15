import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Learning from "./pages/Learning";
import Workspace from "./pages/Workspace";
import AIMentor from "./pages/AIMentor";
import AIAnalyst from "./pages/AIAnalyst";
import DailyReview from "./pages/DailyReview";
import Contest from "./pages/Contest";
import Leaderboard from "./pages/Leaderboard";
import Faculty from "./pages/Faculty";
import Community from "./pages/Community";
import PlacementHub from "./pages/PlacementHub";
import InterviewHub from "./pages/InterviewHub";
import Certifications from "./pages/Certifications";
import AdaptiveRoadmapV2 from "./pages/AdaptiveRoadmapV2";
import CompanyPrep from "./pages/CompanyPrep";
import VoiceMentor from "./pages/VoiceMentor";
import Profile from "./pages/Profile";
import { AIProblemGenerator } from "./pages/ai/AIProblemGenerator";
import { AIQuizGenerator } from "./pages/ai/AIQuizGenerator";
import { AIAssignmentGenerator } from "./pages/ai/AIAssignmentGenerator";
import { AIInterviewGenerator } from "./pages/ai/AIInterviewGenerator";
import { AIContestGenerator } from "./pages/ai/AIContestGenerator";
import { ThemeProvider } from "./components/ThemeContext";

// Lazy-loaded heavy hubs for bundle size optimization & performance
const AIOSHub = lazy(() => import("./pages/AIOSHub"));
const ResearchLab = lazy(() => import("./pages/ResearchLab"));
const SimulationHub = lazy(() => import("./pages/SimulationHub"));
const EnterpriseHub = lazy(() => import("./pages/EnterpriseHub"));
const UniversityHub = lazy(() => import("./pages/UniversityHub"));
const CognitiveHub = lazy(() => import("./pages/CognitiveHub"));
const TalentMarketplaceHub = lazy(() => import("./pages/TalentMarketplaceHub"));
const ProjectWorkspaceHub = lazy(() => import("./pages/ProjectWorkspaceHub"));
const ExecutionCenterPage = lazy(() => import("./pages/ExecutionCenter"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const CollaborationWorkspace = lazy(() => import("./pages/CollaborationWorkspace").then((m) => ({ default: m.CollaborationWorkspace })));
const CareerHub = lazy(() => import("./pages/CareerHub").then((m) => ({ default: m.CareerHub })));
const LearningIntelligence = lazy(() => import("./pages/LearningIntelligence").then((m) => ({ default: m.LearningIntelligence })));
const ContestHub = lazy(() => import("./pages/ContestHub").then((m) => ({ default: m.ContestHub })));
const HiringHub = lazy(() => import("./pages/HiringHub").then((m) => ({ default: m.HiringHub })));

function PageFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-sm font-medium">Loading section...</span>
    </div>
  );
}

function AppShell() {
  return (
    <ThemeProvider>
      <Suspense fallback={<PageFallback />}>
        <Layout />
      </Suspense>
    </ThemeProvider>
  );
}

function LandingWrapper() {
  return (
    <ThemeProvider>
      <Landing />
    </ThemeProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingWrapper,
  },
  {
    path: "/app",
    Component: AppShell,
    children: [
      { index: true, Component: Dashboard },
      { path: "dashboard", Component: Dashboard },
      { path: "learning", Component: Learning },
      { path: "workspace", Component: Workspace },
      { path: "ai-mentor", Component: AIMentor },
      { path: "ai-analyst", Component: AIAnalyst },
      { path: "daily-review", Component: DailyReview },
      { path: "adaptive-roadmap", Component: AdaptiveRoadmapV2 },
      { path: "company-prep", Component: CompanyPrep },
      { path: "voice-mentor", Component: VoiceMentor },
      { path: "collaboration", Component: CollaborationWorkspace },
      { path: "career", Component: CareerHub },
      { path: "learning-intelligence", Component: LearningIntelligence },
      { path: "contests-v2", Component: ContestHub },
      { path: "hiring", Component: HiringHub },
      { path: "enterprise", Component: EnterpriseHub },
      { path: "projects", Component: ProjectWorkspaceHub },
      { path: "research", Component: ResearchLab },
      { path: "cognitive-hub", Component: CognitiveHub },
      { path: "ai-os", Component: AIOSHub },
      { path: "execution-center", Component: ExecutionCenterPage },
      { path: "simulation", Component: SimulationHub },
      { path: "enterprise-simulation", Component: SimulationHub },
      { path: "talent-marketplace", Component: TalentMarketplaceHub },
      { path: "skill-economy", Component: TalentMarketplaceHub },
      { path: "contests", Component: Contest },
      { path: "leaderboard", Component: Leaderboard },
      { path: "community", Component: Community },
      { path: "interviews", Component: InterviewHub },
      { path: "placements", Component: PlacementHub },
      { path: "certifications", Component: Certifications },
      { path: "faculty", Component: Faculty },
      { path: "admin", Component: AdminDashboard },
      { path: "profile", Component: Profile },
      { path: "ai-generator/problem", Component: AIProblemGenerator },
      { path: "ai-generator/quiz", Component: AIQuizGenerator },
      { path: "ai-generator/assignment", Component: AIAssignmentGenerator },
      { path: "ai-generator/interview", Component: AIInterviewGenerator },
      { path: "ai-generator/contest", Component: AIContestGenerator },
    ],
  },
  // Direct paths for sidebar navigation and deep links
  {
    path: "/dashboard",
    Component: AppShell,
    children: [{ index: true, Component: Dashboard }],
  },
  {
    path: "/learning",
    Component: AppShell,
    children: [{ index: true, Component: Learning }],
  },
  {
    path: "/workspace",
    Component: AppShell,
    children: [{ index: true, Component: Workspace }],
  },
  {
    path: "/ai-mentor",
    Component: AppShell,
    children: [{ index: true, Component: AIMentor }],
  },
  {
    path: "/ai-analyst",
    Component: AppShell,
    children: [{ index: true, Component: AIAnalyst }],
  },
  {
    path: "/daily-review",
    Component: AppShell,
    children: [{ index: true, Component: DailyReview }],
  },
  {
    path: "/adaptive-roadmap",
    Component: AppShell,
    children: [{ index: true, Component: AdaptiveRoadmapV2 }],
  },
  {
    path: "/contests",
    Component: AppShell,
    children: [{ index: true, Component: Contest }],
  },
  {
    path: "/leaderboard",
    Component: AppShell,
    children: [{ index: true, Component: Leaderboard }],
  },
  {
    path: "/community",
    Component: AppShell,
    children: [{ index: true, Component: Community }],
  },
  {
    path: "/interviews",
    Component: AppShell,
    children: [{ index: true, Component: InterviewHub }],
  },
  {
    path: "/placements",
    Component: AppShell,
    children: [{ index: true, Component: PlacementHub }],
  },
  {
    path: "/certifications",
    Component: AppShell,
    children: [{ index: true, Component: Certifications }],
  },
  {
    path: "/faculty",
    Component: AppShell,
    children: [{ index: true, Component: Faculty }],
  },
  {
    path: "/admin",
    Component: AppShell,
    children: [{ index: true, Component: AdminDashboard }],
  },
  {
    path: "/profile",
    Component: AppShell,
    children: [{ index: true, Component: Profile }],
  },
  {
    path: "/collaboration",
    Component: AppShell,
    children: [{ index: true, Component: CollaborationWorkspace }],
  },
  {
    path: "/career",
    Component: AppShell,
    children: [{ index: true, Component: CareerHub }],
  },
  {
    path: "/learning-intelligence",
    Component: AppShell,
    children: [{ index: true, Component: LearningIntelligence }],
  },
  {
    path: "/contests-v2",
    Component: AppShell,
    children: [{ index: true, Component: ContestHub }],
  },
  {
    path: "/hiring",
    Component: AppShell,
    children: [{ index: true, Component: HiringHub }],
  },
  {
    path: "/enterprise",
    Component: AppShell,
    children: [{ index: true, Component: EnterpriseHub }],
  },
  {
    path: "/projects",
    Component: AppShell,
    children: [{ index: true, Component: ProjectWorkspaceHub }],
  },
  {
    path: "/research",
    Component: AppShell,
    children: [{ index: true, Component: ResearchLab }],
  },
  {
    path: "/ai-os",
    Component: AppShell,
    children: [{ index: true, Component: AIOSHub }],
  },
  {
    path: "/execution-center",
    Component: AppShell,
    children: [{ index: true, Component: ExecutionCenterPage }],
  },
  {
    path: "/simulation",
    Component: AppShell,
    children: [{ index: true, Component: SimulationHub }],
  },
  {
    path: "/enterprise-simulation",
    Component: AppShell,
    children: [{ index: true, Component: SimulationHub }],
  },
  {
    path: "/university",
    Component: AppShell,
    children: [{ index: true, Component: UniversityHub }],
  },
  {
    path: "/cognitive-hub",
    Component: AppShell,
    children: [{ index: true, Component: CognitiveHub }],
  },
]);
