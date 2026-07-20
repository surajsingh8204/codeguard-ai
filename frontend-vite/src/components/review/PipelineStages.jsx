import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Progress } from "../ui/Progress";

const statusMeta = {
  complete: {
    label: "Done",
    icon: CheckCircle2,
    tone: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
    iconClass: "text-emerald-400",
  },
  running: {
    label: "Running",
    icon: Loader2,
    tone: "border-cyan-400/30 bg-cyan-500/10 text-cyan-300",
    iconClass: "text-cyan-400 animate-spin",
  },
  queued: {
    label: "Queued",
    icon: Circle,
    tone: "border-white/10 bg-white/5 text-slate-400",
    iconClass: "text-slate-500",
  },
};

export function PipelineStages({ stages }) {
  const complete = stages.filter((s) => s.status === "complete").length;
  const pct = stages.length ? (complete / stages.length) * 100 : 0;

  return (
    <div className="min-w-0">
      <Progress
        value={pct}
        label={`Pipeline progress · ${complete}/${stages.length} complete`}
        className="mb-5"
      />

      <div className="space-y-2">
        {stages.map((stage, index) => {
          const meta = statusMeta[stage.status] || statusMeta.queued;
          const Icon = meta.icon;
          return (
            <div key={stage.key} className="flex items-stretch gap-3">
              <div className="flex w-6 shrink-0 flex-col items-center">
                <div
                  className={`mt-3 flex h-6 w-6 items-center justify-center rounded-full border ${
                    stage.status === "complete"
                      ? "border-emerald-400/40 bg-emerald-500/15"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${meta.iconClass}`} />
                </div>
                {index < stages.length - 1 && (
                  <div className="mt-1 w-px flex-1 bg-white/10" />
                )}
              </div>

              <div className="mb-1 min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">
                      {stage.name}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-slate-400">
                      {stage.detail}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${meta.tone}`}
                  >
                    {meta.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
