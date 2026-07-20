import { Inbox, AlertTriangle } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description = "Data will appear once a review run completes.",
  action,
  actionLabel,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
        {description}
      </p>
      {action && actionLabel && (
        <Button className="mt-6" onClick={action} variant="secondary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-500/5 px-6 py-12 text-center ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/10 text-rose-300">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-rose-100">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-rose-200/70">{description}</p>
      )}
      {onRetry && (
        <Button className="mt-6" onClick={onRetry} variant="danger">
          Try again
        </Button>
      )}
    </div>
  );
}
