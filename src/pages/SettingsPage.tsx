import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, LogOut, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useStaffPreferences,
  useUpdateStaffPreferences,
} from "@/hooks/useStaffPreferences";
import type { StaffTheme } from "@/services/staff-preferences";
import { workstationAuth } from "@/services/api";
import ToastNotification from "@/components/ToastNotification";

const SettingsPage = () => {
  const navigate = useNavigate();
  const prefsQuery = useStaffPreferences();
  const updatePrefs = useUpdateStaffPreferences();
  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error" | "info";
    title: string;
    message?: string;
  }>({ open: false, type: "success", title: "" });

  const prefs = prefsQuery.data;
  const [theme, setTheme] = useState<StaffTheme>("system");

  // Apply the loaded theme to the local <select> state so it doesn't flicker.
  useEffect(() => {
    if (prefs?.theme) setTheme(prefs.theme);
  }, [prefs?.theme]);

  // Apply theme to the document root whenever it changes (light/dark/system).
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const effective = theme === "system" ? (mq.matches ? "dark" : "light") : theme;
      root.classList.toggle("dark", effective === "dark");
    };
    apply();
    if (theme === "system") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  const togglePref = (
    key: "beepEnabled" | "notificationsEnabled",
    value: boolean,
  ) => {
    updatePrefs.mutate(
      { [key]: value },
      {
        onError: (e: Error) =>
          setToast({
            open: true,
            type: "error",
            title: "Couldn't save",
            message: e.message,
          }),
      },
    );
  };

  const changeTheme = (next: StaffTheme) => {
    setTheme(next);
    updatePrefs.mutate(
      { theme: next },
      {
        onError: (e: Error) =>
          setToast({
            open: true,
            type: "error",
            title: "Couldn't save",
            message: e.message,
          }),
      },
    );
  };

  const handleSignOut = () => {
    workstationAuth.clear();
    navigate("/", { replace: true });
  };

  const staff = workstationAuth.getStaff();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Settings</h1>
              <p className="text-xs text-muted-foreground">
                Personal preferences for this account
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {prefsQuery.isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading preferences…
          </div>
        )}

        {staff && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="font-medium text-foreground">
              {staff.firstName} {staff.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {staff.staffCode} · {staff.roleName}
            </p>
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl divide-y divide-border">
          <div className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-foreground">Beep sound</p>
              <p className="text-sm text-muted-foreground">
                Play a beep when items are added to the cart or an order is created.
              </p>
            </div>
            <Switch
              checked={prefs?.beepEnabled ?? true}
              disabled={updatePrefs.isPending || prefsQuery.isLoading}
              onCheckedChange={(v) => togglePref("beepEnabled", v)}
            />
          </div>

          <div className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-foreground">Order notifications</p>
              <p className="text-sm text-muted-foreground">
                Show push notifications for new orders and status changes.
              </p>
            </div>
            <Switch
              checked={prefs?.notificationsEnabled ?? true}
              disabled={updatePrefs.isPending || prefsQuery.isLoading}
              onCheckedChange={(v) => togglePref("notificationsEnabled", v)}
            />
          </div>

          <div className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-foreground">Theme</p>
              <p className="text-sm text-muted-foreground">
                Choose light, dark, or follow your device.
              </p>
            </div>
            <Select value={theme} onValueChange={(v) => changeTheme(v as StaffTheme)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="outline"
            className="w-full justify-center text-status-error hover:bg-status-error/10 border-status-error/30"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>

      <ToastNotification
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
    </div>
  );
};

export default SettingsPage;
