import { Outlet, useLocation } from "react-router";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

const META: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard":    { title: "Dashboard",       subtitle: "Good morning, Arjun 👋" },
  "/":             { title: "Dashboard",       subtitle: "Good morning, Arjun 👋" },
  "/learning":     { title: "Learning",        subtitle: "Structured paths to mastery" },
  "/workspace":    { title: "Coding Workspace",subtitle: "Solve · Learn · Improve" },
  "/ai-mentor":    { title: "AI Mentor",       subtitle: "Your personal coding guide" },
  "/ai-analyst":   { title: "AI Analyst",      subtitle: "Deep insights on your skills" },
  "/daily-review": { title: "Daily Review",    subtitle: "Today's performance breakdown" },
  "/contests":     { title: "Contests",        subtitle: "Compete and rank up" },
  "/leaderboard":  { title: "Leaderboard",     subtitle: "See where you stand" },
  "/faculty":      { title: "Faculty Portal",  subtitle: "Class analytics and management" },
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
