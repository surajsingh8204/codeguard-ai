import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  Activity,
  BrainCircuit,
  GitPullRequest,
  Bug,
  Terminal,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const fallbackSecurityFindings = [
  {
    severity: "CRITICAL",
    title: "Command Injection",
    impact: "User input reaches subprocess with shell enabled.",
    fix: "Use subprocess.run with shell=False and a safe argv list.",
    source: "Semgrep + SecurityAgent",
  },
  {
    severity: "HIGH",
    title: "SQL Injection",
    impact: "Raw string interpolation into query builder.",
    fix: "Use parameterized queries and strict input validation.",
    source: "SecurityAgent",
  },
];

const fallbackPerformanceFindings = [
  {
    severity: "HIGH",
    title: "Nested loop on PR files",
    impact: "O(n^2) on large diffs causes review delays.",
    fix: "Batch lookups and short-circuit repeated scans.",
  },
  {
    severity: "MEDIUM",
    title: "Repeated API calls",
    impact: "Multiple GitHub calls per file increase latency.",
    fix: "Cache PR metadata per review run.",
  },
];

const pipelineStageDefinitions = [
  {
    key: "semgrep",
    name: "Semgrep Analyzer",
    detail: "Static scan (auto rules)",
  },
  {
    key: "security",
    name: "SecurityAgent",
    detail: "Groq Llama 3.3 70B",
  },
  {
    key: "performance",
    name: "PerformanceAgent",
    detail: "Complexity review",
  },
  {
    key: "risk",
    name: "RiskAgent",
    detail: "Deploy risk scoring",
  },
  {
    key: "impact",
    name: "ImpactAgent",
    detail: "Architecture impact",
  },
  {
    key: "fix",
    name: "FixAgent",
    detail: "Patch synthesis",
  },
];

const fallbackRiskReview = {
  level: "CRITICAL",
  summary: "Active exploit path and cross-service impact detected.",
  recommendation: "Hold release, rotate secrets, and re-run security scan.",
  affected: ["Auth Service", "API Gateway", "Database Layer"],
};

const fallbackImpactReview = {
  criticality: "HIGH",
  impact: "Shared auth library updated with unsafe subprocess call.",
  productionRisk: "High blast radius across all gateway deployments.",
  recommendation: "Isolate deploy to staging and gate on Semgrep pass.",
};

const fallbackPatchReview = {
  summary: "Replace unsafe subprocess call and validate argv inputs.",
  code: `- subprocess.run(user_input, shell=True)

+ subprocess.run(
+     ["python", "safe_script.py"],
+     shell=False
+ )`,
  explanation: "Removes shell execution and enforces explicit command list.",
};

const riskLevelWeights = {
  CRITICAL: 100,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25,
  UNKNOWN: 12,
};

const severityLevels = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"];

const normalizeRiskLevel = (value) => {
  const level = String(value || "UNKNOWN").toUpperCase();
  return riskLevelWeights[level] ? level : "UNKNOWN";
};

const buildRiskTrend = (level) => {
  const current = riskLevelWeights[level] || riskLevelWeights.UNKNOWN;
  const offsets = [-22, -15, -8, -12, -4, 0];

  return ["T-25m", "T-20m", "T-15m", "T-10m", "T-5m", "Now"].map(
    (label, index) => ({
      label,
      value: Math.min(Math.max(current + offsets[index], 8), 100),
    })
  );
};

export default function Dashboard() {
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadLatest = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/reviews/latest`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!active) return;

        const latestPayload = data?.latest || null;
        const storePayload = data?.data || null;
        const reviews = Array.isArray(storePayload)
          ? storePayload
          : storePayload?.reviews || latestPayload?.reviews || data?.reviews || [];
        const basePayload = latestPayload || (
          Array.isArray(storePayload) ? {} : storePayload
        ) || data || {};

        if (reviews.length > 0) {
          setReviewData({
            ...basePayload,
            reviews,
          });
          setError("");
        } else {
          setReviewData(null);
        }
      } catch (err) {
        if (!active) return;
        setError(err.message || "Review service unavailable");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadLatest();
    const timer = setInterval(loadLatest, 15000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const reviews = reviewData?.reviews || [];
  const primaryReview = reviews[0] || {};
  const hasReviews = reviews.length > 0;
  const hasData = (obj) => obj && Object.keys(obj).length > 0;

  const prMeta = reviewData?.pr || {};
  const repoName = prMeta.repo || "Awaiting PR";
  const prNumber = prMeta.number ?? "--";
  const prTitle = prMeta.title || "Waiting for webhook payload";
  const securityFindingsRaw = reviews.flatMap((review) =>
    (review.security_review?.findings || []).map((finding) => ({
      severity: finding.severity || "UNKNOWN",
      title: finding.issue || "Security issue",
      impact: finding.impact || "",
      fix: finding.fix || "",
      source: review.file ? `File: ${review.file}` : undefined,
    }))
  );

  const performanceFindingsRaw = reviews.flatMap((review) =>
    (review.performance_review?.findings || []).map((finding) => ({
      severity: finding.severity || "UNKNOWN",
      title: finding.issue || "Performance issue",
      impact: finding.impact || "",
      fix: finding.fix || "",
    }))
  );

  const securityFindings = securityFindingsRaw.length
    ? securityFindingsRaw
    : fallbackSecurityFindings;

  const performanceFindings = performanceFindingsRaw.length
    ? performanceFindingsRaw
    : fallbackPerformanceFindings;

  const riskData = primaryReview.risk_review || {};
  const riskReview = hasData(riskData)
    ? {
        level: normalizeRiskLevel(riskData.deployment_risk),
        summary: riskData.summary || "",
        recommendation: riskData.recommendation || "",
        affected: riskData.affected_systems || [],
      }
    : fallbackRiskReview;

  const impactData = primaryReview.impact_review || {};
  const impactReview = hasData(impactData)
    ? {
        criticality: impactData.criticality || "UNKNOWN",
        impact: impactData.architectural_impact || "",
        productionRisk: impactData.production_risk || "",
        recommendation: impactData.recommendation || "",
      }
    : fallbackImpactReview;

  const fixData = primaryReview.fix_review || {};
  const patchReview = hasData(fixData)
    ? {
        summary: fixData.patch_summary || "Patch generation failed",
        code: fixData.fixed_code || "No patch generated yet.",
        explanation: fixData.explanation || "",
      }
    : fallbackPatchReview;

  const riskLevelPercent = riskLevelWeights[riskReview.level] || riskLevelWeights.UNKNOWN;
  const pipelineStages = pipelineStageDefinitions.map((stage) => {
    if (!hasReviews) {
      return { ...stage, status: "queued" };
    }

    const statusMap = {
      semgrep: hasData(primaryReview.security_review) ? "complete" : "queued",
      security: hasData(primaryReview.security_review) ? "complete" : "queued",
      performance: hasData(primaryReview.performance_review) ? "complete" : "queued",
      risk: hasData(primaryReview.risk_review) ? "complete" : "queued",
      impact: hasData(primaryReview.impact_review) ? "complete" : "queued",
      fix: hasData(primaryReview.fix_review) ? "complete" : "queued",
    };

    return {
      ...stage,
      status: statusMap[stage.key] || "queued",
    };
  });
  const allFindings = [...securityFindings, ...performanceFindings];
  const severityCounts = severityLevels.map((level) => ({
    level,
    count: allFindings.filter((finding) => finding.severity === level).length,
  }));
  const maxSeverityCount = Math.max(
    ...severityCounts.map((item) => item.count),
    1
  );
  const completeAgents = pipelineStages.filter(
    (stage) => stage.status === "complete"
  ).length;
  const riskTrend = buildRiskTrend(riskReview.level);
  const patchLineCount = patchReview.code
    ? patchReview.code.split("\n").filter(Boolean).length
    : 0;
  const patchStatus = hasData(fixData) ? "Patch ready" : "Awaiting patch";
  const engineeringStatus = hasData(impactData)
    ? impactReview.criticality
    : "Pending";

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_0%,rgba(56,189,248,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:36px_36px] opacity-30" />
      <div className="pointer-events-none absolute -top-40 right-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <header className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-cyan-200">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              live signal
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              CodeGuard AI
            </h1>

            <p className="mt-3 max-w-xl text-sm text-slate-300 md:text-base">
              Reviewing {repoName} · PR #{prNumber}
            </p>
            <p className="mt-2 max-w-xl text-xs text-slate-400">
              {prTitle}
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <MetricChip
                icon={<BrainCircuit className="h-4 w-4 text-cyan-300" />}
                label="Multi-Agent"
                value={`${pipelineStages.length} agents active`}
              />
              <MetricChip
                icon={<Activity className="h-4 w-4 text-fuchsia-300" />}
                label="Engineer Review"
                value={`${engineeringStatus} impact`}
              />
              <MetricChip
                icon={<Terminal className="h-4 w-4 text-emerald-300" />}
                label="Code Patch"
                value={patchStatus}
              />
              <MetricChip
                icon={<ShieldAlert className="h-4 w-4 text-amber-300" />}
                label="Risk Engine"
                value={`${riskReview.level} risk`}
              />
              <MetricChip
                icon={<GitPullRequest className="h-4 w-4 text-emerald-300" />}
                label="PR Automation"
                value={hasReviews ? "Comment posted" : "Awaiting PR"}
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-rose-400/30 bg-gradient-to-br from-rose-500/20 via-slate-900 to-slate-950 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.6)]">
            <div className="text-xs uppercase tracking-[0.35em] text-rose-200/80">
              deployment risk
            </div>
            <div className="mt-4 text-4xl font-semibold text-rose-200">
              {riskReview.level}
            </div>
            <p className="mt-2 text-sm text-rose-200/70">
              {riskReview.summary || "RiskAgent summary pending"}
            </p>
            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-rose-500/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-400 to-amber-300"
                style={{ width: `${riskLevelPercent}%` }}
              />
            </div>
          </div>
        </header>

        {error && (
          <div className="mt-8 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            Live review connection issue: {error}
          </div>
        )}
        {!error && loading && (
          <div className="mt-8 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
            Waiting for the first review payload from the webhook...
          </div>
        )}

        <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            title="Repository"
            value={repoName}
            note={`PR #${prNumber}`}
            icon={<GitPullRequest className="h-5 w-5" />}
            accent="#38BDF8"
          />
          <StatCard
            title="Deployment Risk"
            value={riskReview.level}
            note="RiskAgent classification"
            icon={<ShieldAlert className="h-5 w-5" />}
            accent="#F97316"
          />
          <StatCard
            title="Agents"
            value={`${pipelineStages.length} active`}
            note={hasReviews ? "LangGraph sequential run" : "Waiting for review run"}
            icon={<BrainCircuit className="h-5 w-5" />}
            accent="#A855F7"
          />
        </section>

        <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <CapabilityCard
            icon={<BrainCircuit className="h-5 w-5 text-cyan-200" />}
            title="Multi-Agent Review"
            value={`${completeAgents}/${pipelineStages.length} complete`}
            detail="Security, performance, risk, impact, and fix agents run in sequence."
          />
          <CapabilityCard
            icon={<Activity className="h-5 w-5 text-fuchsia-200" />}
            title="Engineering Review"
            value={engineeringStatus}
            detail={
              impactReview.impact ||
              "Architecture and production impact analysis pending."
            }
          />
          <CapabilityCard
            icon={<Terminal className="h-5 w-5 text-emerald-200" />}
            title="Code Patch"
            value={patchStatus}
            detail={
              patchLineCount
                ? `${patchLineCount} patch lines generated by FixAgent.`
                : "FixAgent patch synthesis pending."
            }
          />
          <CapabilityCard
            icon={<GitPullRequest className="h-5 w-5 text-amber-200" />}
            title="PR Automation"
            value={hasReviews ? "Comment posted" : "Waiting"}
            detail="Review output is formatted and sent back to the pull request."
          />
        </section>

        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.5)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Risk Timeline</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Latest review trend based on RiskAgent classification.
                </p>
              </div>
              <span className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-100">
                {riskReview.level}
              </span>
            </div>
            <RiskTrendChart points={riskTrend} level={riskReview.level} />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.5)]">
            <div>
              <h2 className="text-xl font-semibold">Severity Mix</h2>
              <p className="mt-1 text-sm text-slate-400">
                Security and performance findings by level.
              </p>
            </div>
            <SeverityBars counts={severityCounts} max={maxSeverityCount} />
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.5)]">
            <div className="text-sm text-slate-400">LangGraph Nodes</div>
            <div className="mt-3 text-4xl font-semibold text-white">
              {completeAgents}/{pipelineStages.length}
            </div>
            <LangGraphFlow stages={pipelineStages} />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.5)]">
            <div className="text-sm text-slate-400">Finding Volume</div>
            <div className="mt-3 text-4xl font-semibold text-white">
              {allFindings.length}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <GraphMetric label="Security" value={securityFindings.length} />
              <GraphMetric label="Performance" value={performanceFindings.length} />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.5)]">
            <div className="text-sm text-slate-400">System Impact</div>
            <div className="mt-3 text-4xl font-semibold text-white">
              {riskReview.affected.length || "--"}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {(riskReview.affected.length
                ? riskReview.affected
                : ["Waiting for affected systems"]
              ).map((system) => (
                <span
                  key={system}
                  className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100"
                >
                  {system}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.5)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Review Pipeline</h2>
              <p className="mt-2 text-sm text-slate-400">
                Semgrep feeds Security and Performance, then Risk, Impact, Fix.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-xs text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              pipeline active
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {pipelineStages.map((stage, index) => (
              <StageCard
                key={`${stage.name}-${index}`}
                name={stage.name}
                detail={stage.detail}
                status={stage.status}
              />
            ))}
          </div>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.5)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <Bug className="h-5 w-5 text-rose-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Security Findings</h2>
                <p className="text-sm text-slate-400">Semgrep + SecurityAgent output.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {securityFindings.map((finding) => (
                <FindingCard key={finding.title} finding={finding} />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.5)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <Activity className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Performance Findings</h2>
                <p className="text-sm text-slate-400">PerformanceAgent output.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {performanceFindings.map((finding) => (
                <FindingCard key={finding.title} finding={finding} />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.5)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <ShieldAlert className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Risk Review</h2>
                <p className="text-sm text-slate-400">RiskAgent aggregation.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                <span>Classification</span>
                <span className="text-sm font-semibold text-rose-200">{riskReview.level}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                <span>Affected systems</span>
                <span className="text-sm font-semibold text-white">
                  {riskReview.affected.length || "Pending"}
                </span>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Affected systems</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {riskReview.affected.map((system) => (
                    <span
                      key={system}
                      className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200"
                    >
                      {system}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Summary</div>
                <p className="mt-2 text-sm text-slate-200">{riskReview.summary}</p>
              </div>
              <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">
                Recommendation: {riskReview.recommendation}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.5)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <Activity className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Impact Review</h2>
                <p className="text-sm text-slate-400">ImpactAgent summary.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Criticality</div>
                <div className="mt-2 text-lg font-semibold text-white">{impactReview.criticality}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Architectural impact</div>
                <p className="mt-2 text-sm text-slate-200">{impactReview.impact}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Production risk</div>
                <p className="mt-2 text-sm text-slate-200">{impactReview.productionRisk}</p>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-cyan-100">
                Recommendation: {impactReview.recommendation}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.5)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10">
              <Terminal className="h-5 w-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Fix Review</h2>
              <p className="text-sm text-slate-400">FixAgent patch synthesis.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Patch summary</div>
              <p className="mt-2">{patchReview.summary}</p>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-emerald-400/20 bg-black/60 p-5">
              <pre className="text-sm text-emerald-200">{patchReview.code}</pre>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">
              Explanation
            </div>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-cyan-50">
              {patchReview.explanation || "FixAgent explanation pending."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

const severityStyles = {
  CRITICAL: "border-rose-400/40 bg-rose-500/10 text-rose-200",
  HIGH: "border-orange-400/40 bg-orange-500/10 text-orange-200",
  MEDIUM: "border-amber-400/40 bg-amber-500/10 text-amber-200",
  LOW: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
  UNKNOWN: "border-slate-400/30 bg-white/5 text-slate-200",
};

const severityBarColors = {
  CRITICAL: "#FB7185",
  HIGH: "#FB923C",
  MEDIUM: "#FACC15",
  LOW: "#34D399",
  UNKNOWN: "#94A3B8",
};

function RiskTrendChart({ points, level }) {
  const width = 520;
  const height = 220;
  const padding = {
    top: 18,
    right: 28,
    bottom: 38,
    left: 46,
  };
  const max = 100;
  const min = 0;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const yFor = (value) =>
    padding.top + ((max - value) / (max - min)) * plotHeight;

  const coordinates = points.map((point, index) => {
    const x =
      padding.left + (index * plotWidth) / Math.max(points.length - 1, 1);
    const y = yFor(point.value);

    return {
      ...point,
      x,
      y,
    };
  });

  const linePath = coordinates.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = coordinates[index - 1];
    const controlX = (previous.x + point.x) / 2;

    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
  const areaPath = `${linePath} L ${coordinates.at(-1).x} ${height - padding.bottom} L ${coordinates[0].x} ${height - padding.bottom} Z`;
  const bands = [
    { label: "Critical", from: 75, to: 100, fill: "rgba(244,63,94,0.12)" },
    { label: "High", from: 50, to: 75, fill: "rgba(251,146,60,0.08)" },
    { label: "Medium", from: 25, to: 50, fill: "rgba(250,204,21,0.06)" },
    { label: "Low", from: 0, to: 25, fill: "rgba(52,211,153,0.05)" },
  ];
  const currentPoint = coordinates.at(-1);

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <svg
        className="h-72 w-full"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Risk trend ending at ${level}`}
      >
        <defs>
          <linearGradient id="riskAreaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FB7185" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#FB7185" stopOpacity="0.03" />
          </linearGradient>
          <filter id="riskLineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {bands.map((band) => (
          <g key={band.label}>
            <rect
              x={padding.left}
              y={yFor(band.to)}
              width={plotWidth}
              height={yFor(band.from) - yFor(band.to)}
              fill={band.fill}
            />
            <text
              x={width - padding.right + 4}
              y={yFor((band.from + band.to) / 2) + 3}
              fill="#64748B"
              fontSize="9"
            >
              {band.label}
            </text>
          </g>
        ))}
        {[25, 50, 75, 100].map((tick) => {
          const y = yFor(tick);

          return (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="rgba(148,163,184,0.14)"
              />
              <text x="12" y={y + 4} fill="#94A3B8" fontSize="10">
                {tick}
              </text>
            </g>
          );
        })}
        <line
          x1={padding.left}
          x2={padding.left}
          y1={padding.top}
          y2={height - padding.bottom}
          stroke="rgba(148,163,184,0.18)"
        />
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={height - padding.bottom}
          y2={height - padding.bottom}
          stroke="rgba(148,163,184,0.18)"
        />
        <path d={areaPath} fill="url(#riskAreaGradient)" />
        <path
          d={linePath}
          fill="none"
          stroke="rgba(251,113,133,0.24)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="8"
          filter="url(#riskLineGlow)"
        />
        <path
          d={linePath}
          fill="none"
          stroke="#FB7185"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        {coordinates.map((point) => (
          <g key={point.label}>
            <circle
              cx={point.x}
              cy={point.y}
              r={point.label === "Now" ? "6" : "4"}
              fill="#FDE68A"
              stroke="#0F172A"
              strokeWidth="2"
            />
            <text
              x={point.x}
              y={height - 12}
              fill="#CBD5E1"
              fontSize="10"
              textAnchor="middle"
            >
              {point.label}
            </text>
          </g>
        ))}
        <g>
          <rect
            x={currentPoint.x - 40}
            y={currentPoint.y - 34}
            width="80"
            height="22"
            rx="11"
            fill="rgba(15,23,42,0.92)"
            stroke="rgba(251,113,133,0.55)"
          />
          <text
            x={currentPoint.x}
            y={currentPoint.y - 19}
            fill="#FFE4E6"
            fontSize="10"
            textAnchor="middle"
            fontWeight="700"
          >
            {level}
          </text>
        </g>
      </svg>
    </div>
  );
}

function SeverityBars({ counts, max }) {
  return (
    <div className="mt-6 space-y-4">
      {counts.map((item) => {
        const width = Math.max((item.count / max) * 100, item.count ? 12 : 4);

        return (
          <div key={item.level}>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">{item.level}</span>
              <span className="text-slate-400">{item.count}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-950/80">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${width}%`,
                  background: severityBarColors[item.level],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LangGraphFlow({ stages }) {
  const statusByKey = stages.reduce((acc, stage) => {
    acc[stage.key] = stage.status;
    return acc;
  }, {});
  const analysisComplete =
    statusByKey.semgrep === "complete" &&
    statusByKey.security === "complete" &&
    statusByKey.performance === "complete";
  const riskComplete = statusByKey.risk === "complete";
  const nodes = [
    { key: "semgrep", label: "Semgrep", x: 50, y: 12, tone: "source" },
    { key: "security", label: "Security", x: 28, y: 35 },
    { key: "performance", label: "Performance", x: 72, y: 35 },
    { key: "risk", label: "Risk", x: 50, y: 58, tone: "risk" },
    { key: "impact", label: "Impact", x: 28, y: 82 },
    { key: "fix", label: "Fix", x: 72, y: 82, tone: "fix" },
  ];

  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="relative mx-auto h-80 max-w-lg overflow-hidden">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
          <GraphPath
            active={statusByKey.semgrep === "complete"}
            d="M50 19 V26 H28 V28"
          />
          <GraphPath
            active={statusByKey.semgrep === "complete"}
            d="M50 26 H72 V28"
          />
          <GraphPath
            active={analysisComplete}
            d="M28 42 V48 H50 V51"
          />
          <GraphPath
            active={analysisComplete}
            d="M72 42 V48 H50"
          />
          <GraphPath
            active={riskComplete}
            d="M50 65 V72 H28 V75"
          />
          <GraphPath
            active={riskComplete}
            d="M50 72 H72 V75"
          />
        </svg>

        {nodes.map((node) => (
          <GraphNode
            key={node.key}
            label={node.label}
            status={statusByKey[node.key]}
            tone={node.tone}
            x={node.x}
            y={node.y}
          />
        ))}
      </div>
    </div>
  );
}

function GraphPath({ active, d }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={active ? "#22D3EE" : "rgba(71,85,105,0.75)"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.3"
    />
  );
}

function GraphNode({ label, status, tone = "default", x, y }) {
  const complete = status === "complete";
  const toneStyles = {
    default: complete
      ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-50"
      : "border-white/10 bg-white/5 text-slate-300",
    source: complete
      ? "border-sky-300/50 bg-sky-400/15 text-sky-50"
      : "border-white/10 bg-white/5 text-slate-300",
    risk: complete
      ? "border-rose-300/50 bg-rose-400/15 text-rose-50"
      : "border-white/10 bg-white/5 text-slate-300",
    fix: complete
      ? "border-emerald-300/50 bg-emerald-400/15 text-emerald-50"
      : "border-white/10 bg-white/5 text-slate-300",
  };

  return (
    <div
      className={`absolute flex h-12 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border px-3 text-center text-xs font-semibold shadow-[0_10px_30px_rgba(2,6,23,0.35)] ${toneStyles[tone]}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span className="truncate">{label}</span>
      {complete && (
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-300 ring-4 ring-slate-950" />
      )}
    </div>
  );
}

function GraphMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function CapabilityCard({ icon, title, value, detail }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.4)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
          {icon}
        </div>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs text-cyan-100">
          live
        </span>
      </div>
      <div className="mt-5 text-sm text-slate-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
        {detail}
      </p>
    </div>
  );
}

function MetricChip({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        {icon}
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
          {label}
        </div>
        <div className="text-sm font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}

function StageCard({ name, detail, status }) {
  const statusStyles = {
    complete: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
    running: "border-cyan-400/30 bg-cyan-400/10 text-cyan-100",
    queued: "border-white/10 bg-white/5 text-slate-200",
  };

  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div>
        <div className="text-sm font-semibold text-white">{name}</div>
        <div className="mt-1 text-xs text-slate-400">{detail}</div>
      </div>
      <span className={`rounded-full border px-2.5 py-1 text-xs ${statusStyles[status]}`}>
        {status}
      </span>
    </div>
  );
}

function FindingCard({ finding }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{finding.title}</h3>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs ${
            severityStyles[finding.severity]
          }`}
        >
          {finding.severity}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-300">{finding.impact}</p>
      <div className="mt-3 text-xs text-slate-400">Fix: {finding.fix}</div>
      {finding.source && (
        <div className="mt-2 text-xs text-cyan-300">Source: {finding.source}</div>
      )}
    </div>
  );
}

function StatCard({ title, value, note, icon, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.5)]">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-2xl"
        style={{ background: accent }}
      />
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>{title}</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white">
          {icon}
        </span>
      </div>
      <div className="mt-5 text-3xl font-semibold tracking-tight text-white">
        {value}
      </div>
      <div className="mt-2 text-xs text-slate-400">{note}</div>
    </div>
  );
}
