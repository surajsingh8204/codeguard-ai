import { createContext, useContext, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const AccordionContext = createContext(null);

export function Accordion({
  children,
  allowMultiple = false,
  className = "",
  defaultOpen = [],
}) {
  const [open, setOpen] = useState(new Set(defaultOpen));

  const toggle = (id) => {
    setOpen((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <AccordionContext.Provider value={{ open, toggle }}>
      <div className={`space-y-2 ${className}`}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ id, title, badge, children, className = "" }) {
  const { open, toggle } = useContext(AccordionContext);
  const isOpen = open.has(id);

  return (
    <div
      className={`overflow-hidden rounded-xl border border-white/10 bg-slate-950/40 ${className}`}
    >
      <button
        type="button"
        onClick={() => toggle(id)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.03]"
        aria-expanded={isOpen}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
            {title}
          </span>
          {badge}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-white/10 px-4 py-4 text-sm text-[var(--text-secondary)]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
