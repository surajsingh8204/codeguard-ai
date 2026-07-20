import { useState } from "react";
import {
  KeyRound,
  SlidersHorizontal,
  RefreshCw,
  PanelLeftClose,
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useReview } from "../context/ReviewContext";
import { useToast } from "../context/ToastContext";
import { getApiBase } from "../api/reviews";
import { Card, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";

export default function Settings() {
  const { settings, updateSettings, resetSettings, toggleSidebar } =
    useSettings();
  const { resumeLivePolling, manualMode } = useReview();
  const toast = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const [apiUrlDraft, setApiUrlDraft] = useState(settings.apiUrl);

  const runtimeApi = getApiBase();

  const saveApiPrefs = () => {
    updateSettings({ apiUrl: apiUrlDraft.trim() || runtimeApi });
    toast.success(
      "Preferences saved. API base URL is applied via VITE_API_URL at build time — restart the app after changing env."
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader
          icon={<KeyRound className="h-5 w-5" />}
          title="API configuration"
          description="Runtime API base used by the frontend client. Existing endpoints are unchanged."
        />
        <div className="mt-5 space-y-4">
          <Input
            label="Preferred API base URL"
            value={apiUrlDraft}
            onChange={(e) => setApiUrlDraft(e.target.value)}
            hint={`Currently active: ${runtimeApi}`}
            placeholder="http://127.0.0.1"
          />
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
            <div className="font-medium text-slate-200">Endpoints in use</div>
            <ul className="mt-2 space-y-1 font-mono text-xs text-cyan-200/80">
              <li>GET {runtimeApi}/api/v1/reviews/latest</li>
              <li>POST {runtimeApi}/api/v1/analyze-repo</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveApiPrefs}>Save preferences</Button>
            <Button
              variant="secondary"
              onClick={() => {
                resumeLivePolling();
                toast.info("Resumed live polling of /reviews/latest");
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Resume live polling
            </Button>
            <Badge tone={manualMode ? "warning" : "success"}>
              {manualMode ? "Manual mode" : "Live polling"}
            </Badge>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          icon={<PanelLeftClose className="h-5 w-5" />}
          title="Sidebar"
          description="Collapse or expand the navigation rail. Also available from the top bar."
        />
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={toggleSidebar}>
            {settings.sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          </Button>
          <Badge tone="neutral">
            {settings.sidebarCollapsed ? "Collapsed" : "Expanded"}
          </Badge>
        </div>
      </Card>

      <Card>
        <CardHeader
          icon={<SlidersHorizontal className="h-5 w-5" />}
          title="User preferences"
          description="Local UI preferences stored in your browser. Dark theme only."
        />
        <div className="mt-5 space-y-4">
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-white">
                Show demo fallbacks
              </div>
              <div className="text-xs text-slate-400">
                Display sample findings when live payload is empty
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.showDemoFallbacks}
              onChange={(e) =>
                updateSettings({ showDemoFallbacks: e.target.checked })
              }
              className="h-4 w-4 accent-cyan-400"
            />
          </label>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-white">Poll interval</div>
              <div className="text-xs text-slate-400">
                Live reviews refresh every {settings.pollInterval}s
              </div>
            </div>
            <Badge tone="neutral">{settings.pollInterval}s</Badge>
          </div>

          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            Reset preferences
          </Button>
        </div>
      </Card>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset preferences?"
      >
        <p className="text-sm text-slate-400">
          This restores local UI preferences to defaults.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmReset(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetSettings();
              setApiUrlDraft(getApiBase());
              setConfirmReset(false);
              toast.success("Preferences reset");
            }}
          >
            Reset
          </Button>
        </div>
      </Modal>
    </div>
  );
}
