import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Bug,
  GitPullRequest,
  ShieldAlert,
  Terminal,
  Zap,
} from "lucide-react";
import { useReview } from "../context/ReviewContext";
import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Progress } from "../components/ui/Progress";
import { PageSkeleton } from "../components/ui/Skeleton";
import { ErrorState, EmptyState } from "../components/ui/EmptyState";
import { StatCard } from "../components/review/StatCard";
import { PipelineStages } from "../components/review/PipelineStages";
import { FindingCard } from "../components/review/FindingCard";
import { LangGraphFlow } from "../components/review/LangGraphFlow";
import { RiskTrendChart, SeverityChart } from "../components/charts/ReviewCharts";

export default function Dashboard() {
  const { loading, error, viewModel, resumeLivePolling } = useReview();
  const {
    repoName,
    prNumber,
    prTitle,
    riskReview,
    impactReview,
    patchStatus,
    engineeringStatus,
    pipelineStages,
    completeAgents,
    securityFindings,
    performanceFindings,
    allFindings,
    severityCounts,
    riskTrend,
    riskLevelPercent,
    hasReviews,
    reviewedFiles,
    reviews,
  } = viewModel;

  if (loading && !hasReviews) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <ErrorState
          title="Live review connection issue"
          description={error}
          onRetry={resumeLivePolling}
        />
      )}

      {/* Command strip — distinct from old cinematic hero */}
      <section className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#0a1220]">
        <div className="flex flex-col gap-0 lg:flex-row">
          <div className="min-w-0 flex-1 border-b border-white/10 p-6 lg:border-b-0 lg:border-r">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="live" pulse>
                Ops console
              </Badge>
              <Badge tone={riskReview.level}>{riskReview.level}</Badge>
              <span className="text-xs text-slate-500">
                {hasReviews ? "Latest review payload" : "Waiting for webhook"}
              </span>
            </div>

            <h2 className="mt-4 truncate font-display text-3xl font-bold tracking-tight text-white">
              {repoName}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              PR #{prNumber}
              <span className="mx-2 text-slate-600">·</span>
              {prTitle}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link to="/analyze">
                <Button size="sm">
                  <Zap className="h-3.5 w-3.5" />
                  Analyze repo
                </Button>
              </Link>
              <Link to="/pull-requests">
                <Button size="sm" variant="secondary">
                  Open PR review
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link to="/results">
                <Button size="sm" variant="ghost">
                  Full report
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid w-full shrink-0 grid-cols-2 gap-px bg-white/10 lg:w-[420px] lg:grid-cols-2">
            {[
              {
                label: "Agents",
                value: `${completeAgents}/${pipelineStages.length}`,
                icon: BrainCircuit,
              },
              { label: "Impact", value: engineeringStatus, icon: Activity },
              { label: "Patch", value: patchStatus, icon: Terminal },
              {
                label: "PR status",
                value: hasReviews ? "Posted" : "Awaiting",
                icon: GitPullRequest,
              },
            ].map((cell) => (
              <div
                key={cell.label}
                className="bg-[#0a1220] p-5 transition hover:bg-[#0d1628]"
              >
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  <cell.icon className="h-3.5 w-3.5 text-cyan-400" />
                  {cell.label}
                </div>
                <div className="mt-2 truncate text-lg font-semibold text-white">
                  {cell.value}
                </div>
              </div>
            ))}
          </div>

          <div className="flex w-full shrink-0 flex-col justify-between border-t border-white/10 bg-gradient-to-br from-rose-500/15 to-transparent p-6 lg:w-[220px] lg:border-l lg:border-t-0">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-rose-200/70">
                Deploy risk
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-rose-200">
                {riskReview.level}
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-rose-100/60">
                {riskReview.summary || "RiskAgent summary pending"}
              </p>
            </div>
            <Progress
              className="mt-5"
              value={riskLevelPercent}
              barClassName="bg-gradient-to-r from-rose-400 to-amber-300"
              size="sm"
            />
          </div>
        </div>
      </section>

      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Repository"
          value={repoName}
          note={`PR #${prNumber}`}
          icon={<GitPullRequest className="h-4 w-4" />}
          accent="cyan"
        />
        <StatCard
          title="Findings"
          value={allFindings.length}
          note={`${securityFindings.length} security · ${performanceFindings.length} perf`}
          icon={<Bug className="h-4 w-4" />}
          accent="rose"
        />
        <StatCard
          title="Deployment Risk"
          value={riskReview.level}
          note="RiskAgent classification"
          icon={<ShieldAlert className="h-4 w-4" />}
          accent="amber"
        />
        <StatCard
          title="Files reviewed"
          value={reviewedFiles.length || (hasReviews ? reviews.length : 0)}
          note={hasReviews ? "From latest payload" : "Waiting for review run"}
          icon={<BrainCircuit className="h-4 w-4" />}
          accent="blue"
        />
      </div>

      {/* Charts */}
      <div className="grid min-w-0 gap-4 lg:grid-cols-5">
        <Card className="min-w-0 lg:col-span-3">
          <CardHeader
            title="Risk Timeline"
            description="Trend based on RiskAgent classification."
            action={<Badge tone={riskReview.level}>{riskReview.level}</Badge>}
          />
          <RiskTrendChart points={riskTrend} level={riskReview.level} />
        </Card>
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader
            title="Severity Mix"
            description="Findings by severity level."
          />
          <SeverityChart counts={severityCounts} />
        </Card>
      </div>

      {/* Pipeline + overview — stacked to avoid cramped 3-col overlap */}
      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader
            title="LangGraph pipeline"
            description="Agent completion graph — no overlapping nodes."
            action={
              <span className="text-sm font-semibold text-cyan-300">
                {completeAgents}/{pipelineStages.length}
              </span>
            }
          />
          <LangGraphFlow stages={pipelineStages} />
        </Card>

        <Card className="min-w-0">
          <CardHeader
            title="Repository overview"
            description="Impact and affected systems."
          />
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <div className="text-xs text-slate-500">Criticality</div>
              <div className="mt-1 text-2xl font-semibold text-white">
                {impactReview.criticality}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Affected systems
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(riskReview.affected.length
                  ? riskReview.affected
                  : ["Awaiting systems"]
                ).map((system) => (
                  <Badge key={system} tone="info">
                    {system}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="line-clamp-3 text-sm text-slate-400">
              {impactReview.impact ||
                "Architecture and production impact analysis pending."}
            </p>
            <Link to="/results">
              <Button variant="secondary" className="w-full">
                View full report
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <Card className="min-w-0">
        <CardHeader
          title="AI review status"
          description="Pipeline stage health — stacked layout prevents badge overlap."
        />
        <div className="mt-4">
          <PipelineStages stages={pipelineStages} />
        </div>
      </Card>

      {/* Findings */}
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader
            icon={<Bug className="h-5 w-5" />}
            title="Security findings"
            description="Semgrep + SecurityAgent"
            action={
              <Link to="/pull-requests">
                <Button variant="ghost" size="sm">
                  All
                </Button>
              </Link>
            }
          />
          <div className="mt-5 space-y-3">
            {securityFindings.slice(0, 3).map((f, i) => (
              <FindingCard key={`${f.title}-${i}`} finding={f} />
            ))}
            {!securityFindings.length && (
              <EmptyState
                title="No security findings"
                description="Run an analysis to populate."
              />
            )}
          </div>
        </Card>
        <Card className="min-w-0">
          <CardHeader
            icon={<Activity className="h-5 w-5" />}
            title="Performance findings"
            description="PerformanceAgent"
            action={
              <Link to="/results">
                <Button variant="ghost" size="sm">
                  All
                </Button>
              </Link>
            }
          />
          <div className="mt-5 space-y-3">
            {performanceFindings.slice(0, 3).map((f, i) => (
              <FindingCard key={`${f.title}-${i}`} finding={f} />
            ))}
            {!performanceFindings.length && (
              <EmptyState
                title="No performance findings"
                description="Run an analysis to populate."
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
