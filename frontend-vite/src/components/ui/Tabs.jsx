import { createContext, useContext, useState } from "react";

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value, onChange, children, className = "" }) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;
  const setActive = onChange ?? setInternal;

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className = "" }) {
  return (
    <div
      role="tablist"
      className={`inline-flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/5 p-1 ${className}`}
    >
      {children}
    </div>
  );
}

export function Tab({ value, children, className = "" }) {
  const { active, setActive } = useContext(TabsContext);
  const selected = active === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={() => setActive(value)}
      className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
        selected
          ? "bg-gradient-to-r from-blue-600/80 to-cyan-500/80 text-white shadow"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabPanel({ value, children, className = "" }) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return (
    <div role="tabpanel" className={`mt-5 ${className}`}>
      {children}
    </div>
  );
}
