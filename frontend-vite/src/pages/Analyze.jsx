import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GitBranch,
  FolderGit2,
  FileCode2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useReview } from "../context/ReviewContext";
import { useToast } from "../context/ToastContext";
import { Card, CardHeader } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { StatCard } from "../components/review/StatCard";
import { PipelineStages } from "../components/review/PipelineStages";
import { LangGraphFlow } from "../components/review/LangGraphFlow";

const BRANCHES = ["main", "master", "develop", "staging"];

export default function Analyze() {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    repoUrl,
    setRepoUrl,
    repoLoading,
    repoError,
    setRepoError,
    analyzeRepo,
    viewModel,
    lastAnalyzedAt,
  } = useReview();

  const [branch, setBranch] = useState("main");

  const fileStats = useMemo(() => {
    const files = viewModel.reviewedFiles;
    return {
      files: files.length || viewModel.reviews.length || 0,
      security: viewModel.securityFindings.length,
      performance: viewModel.performanceFindings.length,
      agents: `${viewModel.completeAgents}/${viewModel.pipelineStages.length}`,
    };
  }, [viewModel]);

  const progressPct = repoLoading
    ? 55
    : viewModel.hasReviews
      ? (viewModel.completeAgents / viewModel.pipelineStages.length) * 100
      : 0;

  const handleAnalyze = async () => {
    const result = await analyzeRepo();
    if (result.ok) {
      toast.success("Repository analysis complete.");
      navigate("/results");
    } else {
      toast.error(result.error || "Repository analysis failed.");
    }
  };

  return (
    <div className="space-y-6">
      <Card accent>
        <CardHeader
          icon={<FolderGit2 className="h-5 w-5" />}
          title="Repository analysis"
          description="Paste a public GitHub URL to run a quick multi-agent scan. Uses the existing /api/v1/analyze-repo endpoint."
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.6fr_auto]">
          <Input
            label="Repository URL"
            placeholder="https://github.com/org/repo"
            value={repoUrl}
            onChange={(e) => {
              setRepoUrl(e.target.value);
              if (repoError) setRepoError("");
            }}
            error={repoError || undefined}
          />
          <Select
            label="Branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            {BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
          <div className="flex items-end">
            <Button
              className="w-full lg:w-auto"
              size="lg"
              onClick={handleAnalyze}
              loading={repoLoading}
              disabled={repoLoading}
            >
              {repoLoading ? "Analyzing…" : "Analyze"}
              {!repoLoading && <Sparkles className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <Progress
            value={progressPct}
            label={
              repoLoading
                ? "Running multi-agent pipeline…"
                : viewModel.hasReviews
                  ? "Latest scan progress"
                  : "Waiting to start"
            }
            barClassName="bg-gradient-to-r from-blue-500 to-cyan-400"
          />
          {repoLoading && (
            <div className="mt-3 flex items-center gap-2 text-sm text-cyan-200">
              <Loader2 className="h-4 w-4 animate-spin" />
              Contacting analyze-repo · this may take a moment
            </div>
          )}
          {lastAnalyzedAt && !repoLoading && (
            <div className="mt-3 text-xs text-slate-500">
              Last analyzed {new Date(lastAnalyzedAt).toLocaleString()}
              {branch ? ` · preferred branch ${branch}` : ""}
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Repository"
          value={viewModel.hasReviews ? viewModel.repoName : "—"}
          note="Target repo"
          icon={<GitBranch className="h-4 w-4" />}
          accent="cyan"
        />
        <StatCard
          title="Files"
          value={fileStats.files}
          note="Reviewable units"
          icon={<FileCode2 className="h-4 w-4" />}
          accent="blue"
        />
        <StatCard
          title="Security hits"
          value={fileStats.security}
          note="SecurityAgent findings"
          icon={<FolderGit2 className="h-4 w-4" />}
          accent="rose"
        />
        <StatCard
          title="Agents"
          value={fileStats.agents}
          note="Pipeline completion"
          icon={<Sparkles className="h-4 w-4" />}
          accent="emerald"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Repository metadata"
            description="Normalized from the latest review payload."
          />
          <dl className="mt-5 space-y-3">
            {[
              { label: "Repo", value: viewModel.repoName },
              { label: "PR / Scan", value: String(viewModel.prNumber) },
              { label: "Title", value: viewModel.prTitle },
              { label: "Risk", value: viewModel.riskReview.level },
              {
                label: "Files",
                value: viewModel.reviewedFiles.length
                  ? viewModel.reviewedFiles.join(", ")
                  : "—",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {row.label}
                </dt>
                <dd className="truncate text-sm font-medium text-slate-200">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <CardHeader
            title="Analysis visualization"
            description="Live LangGraph node status for this scan."
            action={
              <Badge tone={viewModel.hasReviews ? "success" : "neutral"}>
                {viewModel.hasReviews ? "Ready" : "Idle"}
              </Badge>
            }
          />
          <LangGraphFlow stages={viewModel.pipelineStages} />
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Progress indicator"
          description="Agent stages for the current analysis run."
        />
        <div className="mt-4">
          <PipelineStages stages={viewModel.pipelineStages} />
        </div>
      </Card>
    </div>
  );
}
