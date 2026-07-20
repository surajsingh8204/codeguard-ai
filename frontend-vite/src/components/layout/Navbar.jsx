import { Link } from "react-router-dom";
import { Bell, Menu, PanelLeftClose, PanelLeftOpen, Radio } from "lucide-react";
import { useReview } from "../../context/ReviewContext";
import { useSettings } from "../../context/SettingsContext";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export function Navbar({ title, onMenuClick, breadcrumbs }) {
  const { loading, error, manualMode, viewModel } = useReview();
  const { settings, toggleSidebar } = useSettings();
  const collapsed = settings.sidebarCollapsed;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/10 bg-slate-950/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-cyan-300 lg:inline-flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        <div className="min-w-0">
          {breadcrumbs?.length > 0 && (
            <div className="mb-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.label} className="flex items-center gap-1.5">
                  {i > 0 && <span>/</span>}
                  {crumb.to ? (
                    <Link to={crumb.to} className="hover:text-cyan-300">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
          <h1 className="truncate font-display text-lg font-bold tracking-tight text-white">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {!error && !manualMode && (
          <Badge tone="live" pulse className="hidden sm:inline-flex">
            {loading ? "Syncing" : "Live"}
          </Badge>
        )}
        {manualMode && (
          <Badge tone="info" className="hidden sm:inline-flex">
            Manual scan
          </Badge>
        )}
        {viewModel.hasReviews && (
          <Badge tone={viewModel.riskReview.level} className="hidden md:inline-flex">
            {viewModel.riskReview.level}
          </Badge>
        )}

        <Button variant="ghost" size="sm" className="relative !px-2" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {viewModel.allFindings.length > 0 && (
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
          )}
        </Button>

        <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 sm:flex">
          <Radio className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-xs text-slate-400">
            {viewModel.completeAgents}/{viewModel.pipelineStages.length} agents
          </span>
        </div>
      </div>
    </header>
  );
}
