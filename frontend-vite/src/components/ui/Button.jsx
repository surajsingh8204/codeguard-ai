import { forwardRef } from "react";

const variants = {
  primary:
    "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:from-blue-500 hover:to-cyan-400 disabled:from-blue-600/40 disabled:to-cyan-500/40",
  secondary:
    "border border-white/10 bg-white/5 text-slate-100 hover:border-cyan-400/30 hover:bg-white/10",
  ghost: "text-slate-300 hover:bg-white/5 hover:text-white",
  danger:
    "border border-rose-400/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20",
  success:
    "border border-emerald-400/30 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20",
};

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-sm gap-2.5",
};

export const Button = forwardRef(function Button(
  {
    children,
    className = "",
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    type = "button",
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      )}
      {children}
    </button>
  );
});
