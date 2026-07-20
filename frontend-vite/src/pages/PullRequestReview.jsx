import { Link } from "react-router-dom";
import {
  Activity,
  Bug,
  GitPullRequest,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import { useReview } from "../context/ReviewContext";
import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Tabs, TabList, Tab, TabPanel } from "../components/ui/Tabs";
import { Timeline } from "../components/ui/Timeline";
import { Progress } from "../components/ui/Progress";
import { PageSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { FindingsList } from "../components/review/FindingCard";
import { PatchPreview } from "../components/review/PatchPreview";
import { StatCard } from "../components/review/StatCard";

export default function PullRequestReview() {
  const { loading, viewModel } = useReview();
  const {
    repoName,
    prNumber,
    prTitle,
    riskReview,
    impactReview,
    patchReview,
    securityFindings,
    performanceFindings,
    pipelineStages,
    riskLevelPercent,
    hasReviews,
    patchStatus,
    patchLineCount,
  } = viewModel;

  if (loading && !hasReviews) {
    return <PageSkeleton />;
  }

  const timelineItems = pipelineStages.map((stage) => ({
    id: stage.key,
    title: stage.name,
    description: stage.detail,
    meta: stage.status,
    status: stage.status,
  }));

  return (
    <div className="space-y-6">
      {/* PR card */}
      <Card accent className="overflow-hidden">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
              <GitPullRequest className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="info">Pull request</Badge>
                <Badge tone={riskReview.level}>{riskReview.level}</Badge>
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold text-white">
                {prTitle}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {repoName} · #{prNumber}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/results">
              <Button variant="secondary" size="sm">
                Full results
              </Button>
            </Link>
            <Link to="/analyze">
              <Button size="sm">Re-analyze</Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <div className="text-xs text-slate-500">Risk score</div>
            <div className="mt-1 text-2xl font-semibold text-rose-200">
              {riskLevelPercent}
            </div>
            <Progress
              className="mt-3"
              value={riskLevelPercent}
              barClassName="bg-gradient-to-r from-rose-400 to-amber-300"
              size="sm"
            />
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <div className="text-xs text-slate-500">Criticality</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              {impactReview.criticality}
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-slate-400">
              {impactReview.productionRisk || "Production risk pending"}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <div className="text-xs text-slate-500">Affected systems</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              {riskReview.affected.length || "—"}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {riskReview.affected.slice(0, 3).map((s) => (
                <Badge key={s} tone="info">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Security"
          value={securityFindings.length}
          note="Findings"
          icon={<Bug className="h-4 w-4" />}
          accent="rose"
        />
        <StatCard
          title="Performance"
          value={performanceFindings.length}
          note="Findings"
          icon={<Activity className="h-4 w-4" />}
          accent="cyan"
        />
        <StatCard
          title="Risk"
          value={riskReview.level}
          note="Deployment risk"
          icon={<ShieldAlert className="h-4 w-4" />}
          accent="amber"
        />
        <StatCard
          title="Patch"
          value={patchStatus}
          note={`${patchLineCount} lines`}
          icon={<Terminal className="h-4 w-4" />}
          accent="emerald"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader
            title="Review timeline"
            description="Agent pipeline execution order."
          />
          <div className="mt-5">
            <Timeline items={timelineItems} />
          </div>
        </Card>

        <Card>
          <Tabs defaultValue="security">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardHeader
                title="Findings"
                description="Security and performance agent output."
                className="!mb-0"
              />
              <TabList>
                <Tab value="security">Security</Tab>
                <Tab value="performance">Performance</Tab>
                <Tab value="impact">Impact</Tab>
                <Tab value="patch">Patch</Tab>
              </TabList>
            </div>

            <TabPanel value="security">
              <FindingsList findings={securityFindings} />
            </TabPanel>
            <TabPanel value="performance">
              <FindingsList findings={performanceFindings} />
            </TabPanel>
            <TabPanel value="impact">
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Architectural impact
                  </div>
                  <p className="mt-2 text-sm text-slate-200">
                    {impactReview.impact || "Pending"}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Production risk
                  </div>
                  <p className="mt-2 text-sm text-slate-200">
                    {impactReview.productionRisk || "Pending"}
                  </p>
                </div>
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-sm text-cyan-100">
                  Recommendation: {impactReview.recommendation || "Pending"}
                </div>
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100">
                  Risk recommendation: {riskReview.recommendation || "Pending"}
                </div>
              </div>
            </TabPanel>
            <TabPanel value="patch">
              {patchReview?.code ? (
                <PatchPreview patchReview={patchReview} />
              ) : (
                <EmptyState
                  title="No patch yet"
                  description="FixAgent output will appear here."
                />
              )}
            </TabPanel>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
