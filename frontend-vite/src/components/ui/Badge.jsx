import { severityStyles } from "../../lib/reviewHelpers";

const toneMap = {
  critical: severityStyles.CRITICAL,
  high: severityStyles.HIGH,
  medium: severityStyles.MEDIUM,
  low: severityStyles.LOW,
  unknown: severityStyles.UNKNOWN,
  success: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
  info: "border-cyan-400/40 bg-cyan-500/10 text-cyan-200",
  warning: "border-amber-400/40 bg-amber-500/10 text-amber-200",
  neutral: "border-white/10 bg-white/5 text-slate-300",
  live: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
};

export function Badge({ children, tone = "neutral", className = "", pulse = false }) {
  const key = String(tone).toLowerCase();
  const resolved =
    toneMap[key] ||
    severityStyles[String(tone).toUpperCase()] ||
    toneMap.neutral;

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 truncate rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${resolved} ${className}`}
    >
      {pulse && (
        <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-current" />
      )}
      <span className="truncate">{children}</span>
    </span>
  );
}
