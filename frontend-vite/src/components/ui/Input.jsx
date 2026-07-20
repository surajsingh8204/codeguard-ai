import { forwardRef } from "react";

export const Input = forwardRef(function Input(
  { label, error, hint, className = "", id, ...props },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-xl border bg-slate-950/50 px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 ${
          error
            ? "border-rose-400/40 focus:border-rose-400/60 focus:ring-rose-400/20"
            : "border-white/10"
        }`}
        {...props}
      />
      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
      {hint && !error && (
        <p className="mt-2 text-xs text-[var(--text-muted)]">{hint}</p>
      )}
    </div>
  );
});

export function Select({ label, error, className = "", children, id, ...props }) {
  const selectId = id || props.name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-xl border bg-slate-950/50 px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 ${
          error ? "border-rose-400/40" : "border-white/10"
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
    </div>
  );
}
