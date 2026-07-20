import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import PullRequestReview from "./pages/PullRequestReview";
import Results from "./pages/Results";
import Settings from "./pages/Settings";

const shellMeta = {
  "/dashboard": { title: "Dashboard" },
  "/analyze": { title: "Repository Analysis" },
  "/pull-requests": { title: "Pull Request Review" },
  "/results": { title: "Results" },
  "/settings": { title: "Settings" },
};

function ShellLayout() {
  const { pathname } = useLocation();
  const meta = shellMeta[pathname] || { title: "CODEGUARD AI" };

  return (
    <AppShell
      title={meta.title}
      breadcrumbs={[
        { label: "App", to: "/dashboard" },
        { label: meta.title },
      ]}
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<ShellLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/pull-requests" element={<PullRequestReview />} />
        <Route path="/results" element={<Results />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
