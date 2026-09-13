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
import Profile from "./pages/Profile";
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
      { path: "contests", Component: Contest },
      { path: "leaderboard", Component: Leaderboard },
      { path: "community", Component: Community },
      { path: "interviews", Component: InterviewHub },
      { path: "placements", Component: PlacementHub },
      { path: "certifications", Component: Certifications },
      { path: "faculty", Component: Faculty },
      { path: "admin", Component: AdminDashboard },
      { path: "profile", Component: Profile },
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
]);
