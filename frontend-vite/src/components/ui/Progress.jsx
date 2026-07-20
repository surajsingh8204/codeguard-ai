export function Progress({
  value = 0,
  max = 100,
  className = "",
  barClassName = "bg-gradient-to-r from-blue-500 to-cyan-400",
  size = "md",
  label,
}) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" };

  return (
    <div className={className}>
      {label && (
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-[var(--text-secondary)]">{label}</span>
          <span className="font-semibold text-[var(--text-primary)]">
            {Math.round(pct)}%
          </span>
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full bg-slate-950/80 ${heights[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barClassName}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
