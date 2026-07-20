export const fallbackSecurityFindings = [
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

export const fallbackPerformanceFindings = [
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

export const pipelineStageDefinitions = [
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

export const fallbackRiskReview = {
  level: "CRITICAL",
  summary: "Active exploit path and cross-service impact detected.",
  recommendation: "Hold release, rotate secrets, and re-run security scan.",
  affected: ["Auth Service", "API Gateway", "Database Layer"],
};

export const fallbackImpactReview = {
  criticality: "HIGH",
  impact: "Shared auth library updated with unsafe subprocess call.",
  productionRisk: "High blast radius across all gateway deployments.",
  recommendation: "Isolate deploy to staging and gate on Semgrep pass.",
};

export const fallbackPatchReview = {
  summary: "Replace unsafe subprocess call and validate argv inputs.",
  code: `- subprocess.run(user_input, shell=True)

+ subprocess.run(
+     ["python", "safe_script.py"],
+     shell=False
+ )`,
  explanation: "Removes shell execution and enforces explicit command list.",
};

export const riskLevelWeights = {
  CRITICAL: 100,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25,
  UNKNOWN: 12,
};

export const severityLevels = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"];

export const severityStyles = {
  CRITICAL: "border-rose-400/40 bg-rose-500/10 text-rose-200",
  HIGH: "border-orange-400/40 bg-orange-500/10 text-orange-200",
  MEDIUM: "border-amber-400/40 bg-amber-500/10 text-amber-200",
  LOW: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
  UNKNOWN: "border-slate-400/30 bg-white/5 text-slate-200",
};

export const severityBarColors = {
  CRITICAL: "#FB7185",
  HIGH: "#FB923C",
  MEDIUM: "#FACC15",
  LOW: "#34D399",
  UNKNOWN: "#94A3B8",
};

export const normalizeRiskLevel = (value) => {
  const level = String(value || "UNKNOWN").toUpperCase();
  return riskLevelWeights[level] ? level : "UNKNOWN";
};

export const buildRiskTrend = (level) => {
  const current = riskLevelWeights[level] || riskLevelWeights.UNKNOWN;
  const offsets = [-28, -18, -10, -16, -6, 0];

  return ["T-25m", "T-20m", "T-15m", "T-10m", "T-5m", "Now"].map(
    (label, index) => ({
      label,
      value: Math.min(Math.max(current + offsets[index], 8), 100),
    })
  );
};

export const hasData = (obj) => obj && Object.keys(obj).length > 0;

/**
 * Derive all normalized view-model fields from raw reviewData.
 * Preserves the original Dashboard transformation logic.
 */
export function deriveReviewViewModel(reviewData) {
  const reviews = reviewData?.reviews || [];
  const primaryReview = reviews[0] || {};
  const hasReviews = reviews.length > 0;

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
      file: review.file,
    }))
  );

  const performanceFindingsRaw = reviews.flatMap((review) =>
    (review.performance_review?.findings || []).map((finding) => ({
      severity: finding.severity || "UNKNOWN",
      title: finding.issue || "Performance issue",
      impact: finding.impact || "",
      fix: finding.fix || "",
      file: review.file,
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

  const riskLevelPercent =
    riskLevelWeights[riskReview.level] || riskLevelWeights.UNKNOWN;

  const pipelineStages = pipelineStageDefinitions.map((stage) => {
    if (!hasReviews) {
      return { ...stage, status: "queued" };
    }

    const statusMap = {
      semgrep: hasData(primaryReview.security_review) ? "complete" : "queued",
      security: hasData(primaryReview.security_review) ? "complete" : "queued",
      performance: hasData(primaryReview.performance_review)
        ? "complete"
        : "queued",
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
  const reviewedFiles = [
    ...new Set(reviews.map((r) => r.file).filter(Boolean)),
  ];

  return {
    reviews,
    primaryReview,
    hasReviews,
    prMeta,
    repoName,
    prNumber,
    prTitle,
    securityFindings,
    performanceFindings,
    allFindings,
    riskReview,
    impactReview,
    patchReview,
    riskLevelPercent,
    pipelineStages,
    severityCounts,
    maxSeverityCount,
    completeAgents,
    riskTrend,
    patchLineCount,
    patchStatus,
    engineeringStatus,
    reviewedFiles,
    hasLiveSecurity: securityFindingsRaw.length > 0,
    hasLivePerformance: performanceFindingsRaw.length > 0,
    hasLiveRisk: hasData(riskData),
    hasLiveImpact: hasData(impactData),
    hasLivePatch: hasData(fixData),
  };
}
