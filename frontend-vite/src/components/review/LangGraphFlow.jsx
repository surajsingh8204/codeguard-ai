import { CheckCircle2, Circle } from "lucide-react";

/**
 * Non-overlapping agent graph — vertical flow with clear connectors.
 * Replaces absolute-positioned nodes that collided on narrow cards.
 */
export function LangGraphFlow({ stages }) {
  const statusByKey = stages.reduce((acc, stage) => {
    acc[stage.key] = stage.status;
    return acc;
  }, {});

  const rows = [
    [{ key: "semgrep", label: "Semgrep", tone: "source" }],
    [
      { key: "security", label: "Security" },
      { key: "performance", label: "Performance" },
    ],
    [{ key: "risk", label: "Risk", tone: "risk" }],
    [
      { key: "impact", label: "Impact" },
      { key: "fix", label: "Fix", tone: "fix" },
    ],
  ];

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/50 p-4">
      <div className="mx-auto flex max-w-md flex-col items-center gap-0">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex w-full flex-col items-center">
            {rowIndex > 0 && (
              <div className="my-1 h-5 w-px bg-gradient-to-b from-cyan-400/40 to-white/10" />
            )}
            <div
              className={`grid w-full gap-2 ${
                row.length === 2 ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              {row.map((node) => (
                <GraphNode
                  key={node.key}
                  label={node.label}
                  status={statusByKey[node.key]}
                  tone={node.tone}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GraphNode({ label, status, tone = "default" }) {
  const complete = status === "complete";
  const toneStyles = {
    default: complete
      ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-50"
      : "border-white/10 bg-white/5 text-slate-300",
    source: complete
      ? "border-sky-300/40 bg-sky-400/10 text-sky-50"
      : "border-white/10 bg-white/5 text-slate-300",
    risk: complete
      ? "border-rose-300/40 bg-rose-400/10 text-rose-50"
      : "border-white/10 bg-white/5 text-slate-300",
    fix: complete
      ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-50"
      : "border-white/10 bg-white/5 text-slate-300",
  };

  return (
    <div
      className={`flex min-w-0 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-center text-xs font-semibold ${toneStyles[tone] || toneStyles.default}`}
    >
      {complete ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
      ) : (
        <Circle className="h-3.5 w-3.5 shrink-0 text-slate-500" />
      )}
      <span className="truncate">{label}</span>
    </div>
  );
}
