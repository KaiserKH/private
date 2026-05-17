import { useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { useChatStore } from "../store/chat.store";

export const NotificationsPage = () => {
  const notifications = useChatStore((state) => state.notifications);
  const loadNotifications = useChatStore((state) => state.loadNotifications);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Messages, requests, and admin transparency alerts." />
      <div className="space-y-3 p-6">
        {notifications.map((notification) => (
          <div key={notification.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <div className="font-medium text-white">{notification.title}</div>
            <div className="mt-1 text-sm text-slate-400">{notification.body}</div>
            {!notification.isRead ? <div className="mt-2 text-xs uppercase tracking-[0.25em] text-cyan-300">Unread</div> : null}
          </div>
        ))}
        {!notifications.length ? <div className="text-sm text-slate-500">No notifications yet.</div> : null}
      </div>
    </div>
  );
};
