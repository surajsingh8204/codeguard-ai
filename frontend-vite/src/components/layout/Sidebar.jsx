import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  GitBranch,
  GitPullRequest,
  FileBarChart2,
  Settings,
  Shield,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyze", label: "Analyze Repo", icon: GitBranch },
  { to: "/pull-requests", label: "PR Review", icon: GitPullRequest },
  { to: "/results", label: "Results", icon: FileBarChart2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ open, onClose }) {
  const { settings, toggleSidebar } = useSettings();
  const location = useLocation();
  const collapsed = settings.sidebarCollapsed;

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          aria-label="Close sidebar"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#080d18] transition-all duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-[72px]" : "lg:w-64"} w-64`}
      >
        <div
          className={`flex h-16 items-center border-b border-white/10 ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          <NavLink
            to="/"
            className={`flex items-center gap-2.5 ${collapsed ? "" : "min-w-0"}`}
            onClick={onClose}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-cyan-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="font-display truncate text-sm font-bold tracking-tight text-white">
                  CODEGUARD
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">
                  AI Security
                </div>
              </div>
            )}
          </NavLink>

          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 lg:hidden"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              location.pathname === item.to ||
              location.pathname.startsWith(`${item.to}/`);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                title={item.label}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-blue-600/25 to-cyan-500/15 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    active
                      ? "text-cyan-300"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className={`hidden w-full items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-slate-400 transition hover:border-cyan-400/30 hover:bg-white/5 hover:text-cyan-200 lg:flex ${
              collapsed ? "justify-center" : ""
            }`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>

          {!collapsed && (
            <div className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3">
              <div className="text-xs font-semibold text-cyan-200">
                Multi-agent pipeline
              </div>
              <p className="mt-1 text-[11px] leading-4 text-slate-400">
                Semgrep → Security → Performance → Risk → Impact → Fix
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
