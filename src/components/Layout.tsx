import { Outlet, useLocation } from "react-router";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

const META: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard":        { title: "Dashboard",        subtitle: "Good morning, Arjun 👋" },
  "/":                 { title: "Dashboard",        subtitle: "Good morning, Arjun 👋" },
  "/learning":         { title: "Learning",         subtitle: "Structured paths to mastery" },
  "/workspace":        { title: "Coding Workspace", subtitle: "Solve · Learn · Improve" },
  "/ai-mentor":        { title: "AI Mentor",        subtitle: "Your personal coding guide" },
  "/ai-analyst":       { title: "AI Analyst",       subtitle: "Deep insights on your skills" },
  "/daily-review":     { title: "Daily Review",     subtitle: "Today's performance breakdown" },
  "/adaptive-roadmap": { title: "Adaptive Roadmap", subtitle: "Targeted skill mastery & decay mitigation" },
  "/contests":         { title: "Contests",         subtitle: "Compete and rank up" },
  "/leaderboard":      { title: "Leaderboard",      subtitle: "See where you stand" },
  "/community":        { title: "Community Hub",    subtitle: "Peer learning, discussions & study groups" },
  "/interviews":       { title: "AI Mock Interviews", subtitle: "FAANG & Big Tech interview simulator" },
  "/placements":       { title: "Placement Portal", subtitle: "Campus drives, shortlists & company readiness" },
  "/certifications":   { title: "Certifications",   subtitle: "Cryptographically verified credentials" },
  "/faculty":          { title: "Faculty Portal",   subtitle: "Class analytics and management" },
  "/admin":            { title: "Admin CMS",        subtitle: "Platform governance & curriculum control" },
  "/profile":          { title: "Profile & Badges", subtitle: "Your developer identity & stats" },
};

export default function Layout() {
  const { pathname } = useLocation();
  const meta = META[pathname] ?? { title: "Algora" };

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        background: "var(--bg)",
        color: "var(--text-primary)",
        overflow: "hidden",
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100%" }}>
        <TopNav title={meta.title} subtitle={meta.subtitle} />
        <main style={{ flex: 1, overflowY: "auto", background: "var(--bg)" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
