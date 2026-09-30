/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Application Routes & Security Route Guards
 */

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
import Projects from "./pages/Projects";
import CompanyPrep from "./pages/CompanyPrep";
import VoiceMentor from "./pages/VoiceMentor";
import { ThemeProvider } from "./components/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function AppShell() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Layout />
      </ThemeProvider>
    </AuthProvider>
  );
}

function LandingWrapper() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Landing />
      </ThemeProvider>
    </AuthProvider>
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
      { index: true, Component: () => <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: "dashboard", Component: () => <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: "learning", Component: () => <ProtectedRoute><Learning /></ProtectedRoute> },
      { path: "workspace", Component: () => <ProtectedRoute><Workspace /></ProtectedRoute> },
      { path: "ai-mentor", Component: () => <ProtectedRoute><AIMentor /></ProtectedRoute> },
      { path: "ai-analyst", Component: () => <ProtectedRoute requireAuthUser><AIAnalyst /></ProtectedRoute> },
      { path: "daily-review", Component: () => <ProtectedRoute requireAuthUser><DailyReview /></ProtectedRoute> },
      { path: "contests", Component: () => <ProtectedRoute requireAuthUser><Contest /></ProtectedRoute> },
      { path: "leaderboard", Component: () => <ProtectedRoute requireAuthUser><Leaderboard /></ProtectedRoute> },
      { path: "projects", Component: () => <ProtectedRoute><Projects /></ProtectedRoute> },
      { path: "company-prep", Component: () => <ProtectedRoute><CompanyPrep /></ProtectedRoute> },
      { path: "voice-mentor", Component: () => <ProtectedRoute><VoiceMentor /></ProtectedRoute> },
      { path: "faculty", Component: () => <ProtectedRoute requireAuthUser><Faculty /></ProtectedRoute> },
    ],
  },
  // Direct paths for sidebar navigation with route protection
  {
    path: "/dashboard",
    Component: AppShell,
    children: [{ index: true, Component: () => <ProtectedRoute><Dashboard /></ProtectedRoute> }],
  },
  {
    path: "/learning",
    Component: AppShell,
    children: [{ index: true, Component: () => <ProtectedRoute><Learning /></ProtectedRoute> }],
  },
  {
    path: "/workspace",
    Component: AppShell,
    children: [{ index: true, Component: () => <ProtectedRoute><Workspace /></ProtectedRoute> }],
  },
  {
    path: "/ai-mentor",
    Component: AppShell,
    children: [{ index: true, Component: () => <ProtectedRoute><AIMentor /></ProtectedRoute> }],
  },
  {
    path: "/ai-analyst",
    Component: AppShell,
    children: [{ index: true, Component: () => <ProtectedRoute requireAuthUser><AIAnalyst /></ProtectedRoute> }],
  },
  {
    path: "/daily-review",
    Component: AppShell,
    children: [{ index: true, Component: () => <ProtectedRoute requireAuthUser><DailyReview /></ProtectedRoute> }],
  },
  {
    path: "/contests",
    Component: AppShell,
    children: [{ index: true, Component: () => <ProtectedRoute requireAuthUser><Contest /></ProtectedRoute> }],
  },
  {
    path: "/leaderboard",
    Component: AppShell,
    children: [{ index: true, Component: () => <ProtectedRoute requireAuthUser><Leaderboard /></ProtectedRoute> }],
  },
  {
    path: "/projects",
    Component: AppShell,
    children: [{ index: true, Component: () => <ProtectedRoute><Projects /></ProtectedRoute> }],
  },
  {
    path: "/company-prep",
    Component: AppShell,
    children: [{ index: true, Component: () => <ProtectedRoute><CompanyPrep /></ProtectedRoute> }],
  },
  {
    path: "/voice-mentor",
    Component: AppShell,
    children: [{ index: true, Component: () => <ProtectedRoute><VoiceMentor /></ProtectedRoute> }],
  },
  {
    path: "/faculty",
    Component: AppShell,
    children: [{ index: true, Component: () => <ProtectedRoute requireAuthUser><Faculty /></ProtectedRoute> }],
  },
]);
