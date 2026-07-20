import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SettingsContext = createContext(null);
const STORAGE_KEY = "codeguard-settings";

const defaults = {
  apiUrl: import.meta.env.VITE_API_URL || "http://127.0.0.1",
  pollInterval: 15,
  showDemoFallbacks: true,
  sidebarCollapsed: false,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      ...defaults,
      ...parsed,
      // migrate old compactSidebar key
      sidebarCollapsed:
        parsed.sidebarCollapsed ?? parsed.compactSidebar ?? false,
    };
  } catch {
    return defaults;
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Force dark theme — remove any leftover light class
  useEffect(() => {
    document.documentElement.classList.remove("light");
    localStorage.removeItem("codeguard-theme");
  }, []);

  const updateSettings = (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const toggleSidebar = () => {
    setSettings((prev) => ({
      ...prev,
      sidebarCollapsed: !prev.sidebarCollapsed,
    }));
  };

  const resetSettings = () => setSettings(defaults);

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings, toggleSidebar }),
    [settings]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
