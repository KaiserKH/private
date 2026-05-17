import { useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { useChatStore } from "../store/chat.store";

export const AdminDashboardPage = () => {
  const loadAdminLogs = useChatStore((state) => state.loadAdminLogs);
  const adminLogs = useChatStore((state) => state.adminLogs);

  useEffect(() => {
    loadAdminLogs();
  }, [loadAdminLogs]);

  return (
    <div>
      <PageHeader title="Admin dashboard" subtitle="Moderation, feature management, audits, and account activity monitoring." />
      <div className="grid gap-4 p-6 lg:grid-cols-3">
        {[
          ["User control", "Suspend, ban, reset passwords, and revoke sessions."],
          ["Feature control", "Toggle global, role, and per-user capability flags."],
          ["Transparency", "Audit logs stay visible to account owners."]
        ].map(([title, copy]) => (
          <div key={title} className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
            <div className="font-semibold text-white">{title}</div>
            <div className="mt-2 text-sm text-slate-400">{copy}</div>
          </div>
        ))}
      </div>

      <div className="px-6 pb-6">
        <div className="mb-3 text-sm font-semibold text-slate-200">Your audit trail</div>
        <div className="space-y-3">
          {adminLogs.map((log) => (
            <div key={log.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
              <div className="font-medium text-white">{log.action}</div>
              <div className="mt-1 text-slate-500">{log.category} - {new Date(log.createdAt).toLocaleString()}</div>
            </div>
          ))}
          {!adminLogs.length ? <div className="text-sm text-slate-500">No audit logs loaded yet.</div> : null}
        </div>
      </div>
    </div>
  );
};
