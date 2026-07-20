export function CodeBlock({ code, className = "" }) {
  const lines = String(code || "").split("\n");

  return (
    <div
      className={`overflow-x-auto rounded-xl border border-emerald-400/20 bg-black/70 ${className}`}
    >
      <pre className="p-4 text-[13px] leading-6">
        {lines.map((line, i) => {
          let tone = "diff-ctx";
          if (line.startsWith("+") && !line.startsWith("+++")) tone = "diff-add";
          if (line.startsWith("-") && !line.startsWith("---")) tone = "diff-del";

          return (
            <div key={`${i}-${line.slice(0, 12)}`} className="flex gap-4">
              <span className="w-8 shrink-0 select-none text-right text-slate-600">
                {i + 1}
              </span>
              <code className={tone}>{line || " "}</code>
            </div>
          );
        })}
      </pre>
    </div>
  );
}

export function PatchPreview({ patchReview }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
          Patch summary
        </div>
        <p className="mt-2 text-sm text-slate-200">{patchReview.summary}</p>
      </div>
      <CodeBlock code={patchReview.code} />
      <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
        <div className="text-xs uppercase tracking-[0.16em] text-cyan-200/70">
          Explanation
        </div>
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-cyan-50/90">
          {patchReview.explanation || "FixAgent explanation pending."}
        </p>
      </div>
    </div>
  );
}
