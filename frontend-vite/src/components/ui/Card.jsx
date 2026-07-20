export function Card({
  children,
  className = "",
  accent = false,
  hover = false,
  padding = true,
  ...props
}) {
  return (
    <div
      className={`rounded-2xl ${accent ? "glass-card-accent" : "glass-card"} ${
        hover
          ? "transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_0_40px_rgba(34,211,238,0.1)]"
          : ""
      } ${padding ? "p-5 sm:p-6" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, icon, className = "" }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-300">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
