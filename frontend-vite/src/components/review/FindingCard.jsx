import { Badge } from "../ui/Badge";
import { Accordion, AccordionItem } from "../ui/Accordion";

export function FindingCard({ finding }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-cyan-400/20">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{finding.title}</h3>
        <Badge tone={finding.severity}>{finding.severity}</Badge>
      </div>
      {finding.impact && (
        <p className="mt-2 text-sm leading-6 text-slate-300">{finding.impact}</p>
      )}
      {finding.fix && (
        <div className="mt-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Fix: </span>
          {finding.fix}
        </div>
      )}
      {finding.source && (
        <div className="mt-2 text-xs text-cyan-300/80">{finding.source}</div>
      )}
    </div>
  );
}

export function FindingsList({ findings, emptyTitle = "No findings" }) {
  if (!findings?.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">
        {emptyTitle}
      </div>
    );
  }

  return (
    <Accordion allowMultiple defaultOpen={[findings[0]?.title]}>
      {findings.map((finding, index) => (
        <AccordionItem
          key={`${finding.title}-${index}`}
          id={`${finding.title}-${index}`}
          title={finding.title}
          badge={<Badge tone={finding.severity}>{finding.severity}</Badge>}
        >
          {finding.impact && (
            <p className="leading-6 text-slate-300">{finding.impact}</p>
          )}
          {finding.fix && (
            <div className="mt-3 rounded-lg border border-emerald-400/15 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-100/90">
              <span className="font-semibold">Recommended fix: </span>
              {finding.fix}
            </div>
          )}
          {(finding.source || finding.file) && (
            <div className="mt-2 text-xs text-cyan-300/80">
              {finding.source || `File: ${finding.file}`}
            </div>
          )}
        </AccordionItem>
      ))}
    </Accordion>
  );
}
