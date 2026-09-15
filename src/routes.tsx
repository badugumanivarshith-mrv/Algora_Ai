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
import AdminDashboard from "./pages/admin/AdminDashboard";
import Community from "./pages/Community";
import PlacementHub from "./pages/PlacementHub";
import InterviewHub from "./pages/InterviewHub";
import Certifications from "./pages/Certifications";
import AdaptiveRoadmapV2 from "./pages/AdaptiveRoadmapV2";
import CompanyPrep from "./pages/CompanyPrep";
import VoiceMentor from "./pages/VoiceMentor";
import { CollaborationWorkspace } from "./pages/CollaborationWorkspace";
import { CareerHub } from "./pages/CareerHub";
import { LearningIntelligence } from "./pages/LearningIntelligence";
import { ContestHub } from "./pages/ContestHub";
import { HiringHub } from "./pages/HiringHub";
import EnterpriseHub from "./pages/EnterpriseHub";
import ProjectWorkspaceHub from "./pages/ProjectWorkspaceHub";
import ResearchLab from "./pages/ResearchLab";
import AIOSHub from "./pages/AIOSHub";
import ExecutionCenterPage from "./pages/ExecutionCenter";
import Profile from "./pages/Profile";
import { AIProblemGenerator } from "./pages/ai/AIProblemGenerator";
import { AIQuizGenerator } from "./pages/ai/AIQuizGenerator";
import { AIAssignmentGenerator } from "./pages/ai/AIAssignmentGenerator";
import { AIInterviewGenerator } from "./pages/ai/AIInterviewGenerator";
import { AIContestGenerator } from "./pages/ai/AIContestGenerator";
import { ThemeProvider } from "./components/ThemeContext";

function AppShell() {
  return (
    <ThemeProvider>
      <Layout />
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
      { path: "ai-os", Component: AIOSHub },
      { path: "execution-center", Component: ExecutionCenterPage },
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
]);
