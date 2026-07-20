import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Bug,
  FileBarChart2,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import { useReview } from "../context/ReviewContext";
import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { PageSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { FindingsList } from "../components/review/FindingCard";
import { PatchPreview } from "../components/review/PatchPreview";
import { StatCard } from "../components/review/StatCard";
import { PipelineStages } from "../components/review/PipelineStages";
import { RiskTrendChart, SeverityChart } from "../components/charts/ReviewCharts";

export default function Results() {
  const navigate = useNavigate();
  const { loading, viewModel } = useReview();
  const {
    hasReviews,
    repoName,
    prNumber,
    prTitle,
    riskReview,
    impactReview,
    patchReview,
    securityFindings,
    performanceFindings,
    allFindings,
    severityCounts,
    riskTrend,
    pipelineStages,
    completeAgents,
  } = viewModel;

  if (loading && !hasReviews) {
    return <PageSkeleton />;
  }

  if (!hasReviews && !loading) {
    return (
      <EmptyState
        icon={FileBarChart2}
        title="No results yet"
        description="Run a repository analysis or wait for a PR webhook payload to generate a report."
        action={() => navigate("/analyze")}
        actionLabel="Go to analyze"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="info">Report</Badge>
              <Badge tone={riskReview.level}>{riskReview.level}</Badge>
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold text-white">
              Analysis results
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {repoName} · PR #{prNumber} · {prTitle}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/pull-requests">
              <Button variant="secondary" size="sm">
                PR view
              </Button>
            </Link>
            <Link to="/analyze">
              <Button size="sm">New analysis</Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total findings"
          value={allFindings.length}
          note="Security + performance"
          icon={<FileBarChart2 className="h-4 w-4" />}
          accent="blue"
        />
        <StatCard
          title="Security"
          value={securityFindings.length}
          note="Open issues"
          icon={<Bug className="h-4 w-4" />}
          accent="rose"
        />
        <StatCard
          title="Performance"
          value={performanceFindings.length}
          note="Open issues"
          icon={<Activity className="h-4 w-4" />}
          accent="cyan"
        />
        <StatCard
          title="Agents complete"
          value={`${completeAgents}/${pipelineStages.length}`}
          note="Pipeline"
          icon={<Terminal className="h-4 w-4" />}
          accent="emerald"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Risk trend"
            description="Score trajectory for this review."
            action={<Badge tone={riskReview.level}>{riskReview.level}</Badge>}
          />
          <RiskTrendChart points={riskTrend} level={riskReview.level} />
        </Card>
        <Card>
          <CardHeader
            title="Severity distribution"
            description="Findings grouped by severity badge."
          />
          <SeverityChart counts={severityCounts} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            icon={<ShieldAlert className="h-5 w-5" />}
            title="Risk review"
            description="RiskAgent aggregation"
          />
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3">
              <span className="text-slate-400">Classification</span>
              <Badge tone={riskReview.level}>{riskReview.level}</Badge>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Summary
              </div>
              <p className="mt-2 text-slate-200">{riskReview.summary}</p>
            </div>
            <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-amber-100">
              Recommendation: {riskReview.recommendation}
            </div>
            <div className="flex flex-wrap gap-2">
              {riskReview.affected.map((system) => (
                <Badge key={system} tone="info">
                  {system}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            icon={<Activity className="h-5 w-5" />}
            title="Impact analysis"
            description="ImpactAgent summary"
          />
          <div className="mt-5 space-y-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Criticality
              </div>
              <div className="mt-1 text-lg font-semibold text-white">
                {impactReview.criticality}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Architectural impact
              </div>
              <p className="mt-2 text-slate-200">{impactReview.impact}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Production risk
              </div>
              <p className="mt-2 text-slate-200">{impactReview.productionRisk}</p>
            </div>
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-cyan-100">
              Recommendation: {impactReview.recommendation}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            icon={<Bug className="h-5 w-5" />}
            title="Security findings"
            description="Expandable report items"
          />
          <div className="mt-5">
            <FindingsList findings={securityFindings} />
          </div>
        </Card>
        <Card>
          <CardHeader
            icon={<Activity className="h-5 w-5" />}
            title="Performance findings"
            description="Expandable report items"
          />
          <div className="mt-5">
            <FindingsList findings={performanceFindings} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          icon={<Terminal className="h-5 w-5" />}
          title="AI patch suggestions"
          description="FixAgent synthesis with syntax-highlighted diff"
        />
        <div className="mt-5">
          <PatchPreview patchReview={patchReview} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Pipeline stages" description="Full agent completion report." />
        <div className="mt-4">
          <PipelineStages stages={pipelineStages} />
        </div>
      </Card>
    </div>
  );
}
