export function Timeline({ items = [], className = "" }) {
  return (
    <ol className={`relative space-y-0 ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const statusColor =
          item.status === "complete"
            ? "bg-emerald-400 ring-emerald-400/30"
            : item.status === "running"
              ? "bg-cyan-400 ring-cyan-400/30 animate-pulse"
              : "bg-slate-500 ring-slate-500/20";

        return (
          <li key={item.id || item.title} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span className="absolute left-[11px] top-6 h-[calc(100%-8px)] w-px bg-white/10" />
            )}
            <span
              className={`relative z-10 mt-1.5 h-[22px] w-[22px] shrink-0 rounded-full ring-4 ${statusColor}`}
            />
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  {item.title}
                </h4>
                {item.meta && (
                  <span className="text-xs text-[var(--text-muted)]">{item.meta}</span>
                )}
              </div>
              {item.description && (
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {item.description}
                </p>
              )}
              {item.children}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
