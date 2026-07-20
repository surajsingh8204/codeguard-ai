export function StatCard({ title, value, note, icon, accent = "cyan" }) {
  const accents = {
    cyan: "from-cyan-500/20 to-transparent text-cyan-300",
    blue: "from-blue-500/20 to-transparent text-blue-300",
    rose: "from-rose-500/20 to-transparent text-rose-300",
    amber: "from-amber-500/20 to-transparent text-amber-300",
    emerald: "from-emerald-500/20 to-transparent text-emerald-300",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-cyan-400/25 hover:bg-white/[0.05]">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-60 blur-2xl ${accents[accent]}`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
          {title}
        </div>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${accents[accent].split(" ").pop()}`}
        >
          {icon}
        </div>
      </div>
      <div className="relative mt-4 truncate text-2xl font-semibold tracking-tight text-white">
        {value}
      </div>
      {note && (
        <div className="relative mt-2 text-xs text-slate-400">{note}</div>
      )}
    </div>
  );
}
