import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { api } from "../api/client";

export const SettingsPage = () => {
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState("medium");

  useEffect(() => {
    api.get("/settings/me").then((response) => {
      const settings = response.data.settings;
      setTheme(settings?.theme?.mode ?? "dark");
      setFontSize(settings?.chatAppearance?.fontSize ?? "medium");
    });
  }, []);

  const save = async () => {
    await api.patch("/settings/me", {
      theme: { mode: theme },
      chatAppearance: { fontSize }
    });
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Appearance, privacy, notifications, and relationship preferences." />
      <div className="grid gap-4 p-6 md:grid-cols-2">
        <label className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-slate-400">Theme</div>
          <select value={theme} onChange={(event) => setTheme(event.target.value)} className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>
        <label className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-slate-400">Font size</div>
          <select value={fontSize} onChange={(event) => setFontSize(event.target.value)} className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
      </div>
      <div className="px-6 pb-6">
        <button onClick={save} className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950">Save settings</button>
      </div>
    </div>
  );
};
