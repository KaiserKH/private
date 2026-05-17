import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Bell, Hash, LayoutDashboard, LogOut, Search, Settings, Shield, UserCircle2 } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { getSocket } from "../socket";

const navItems = [
  { to: "/home", label: "Inbox", icon: Hash },
  { to: "/search", label: "Search", icon: Search },
  { to: "/notifications", label: "Alerts", icon: Bell },
  { to: "/relationships", label: "Relationships", icon: Shield },
  { to: "/profile", label: "Profile", icon: UserCircle2 },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/admin", label: "Admin", icon: LayoutDashboard }
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    getSocket().disconnect();
  };

  return (
    <div className="min-h-screen bg-mesh text-white">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-4 p-4 lg:grid-cols-[280px_1fr] lg:p-6">
        <aside className="glass-strong flex flex-col rounded-[1.75rem] p-4">
          <div>
            <div className="font-display text-xl font-bold tracking-wide">Kaizu</div>
            <div className="mt-1 text-sm text-slate-400">Realtime private messaging</div>
          </div>

          <nav className="mt-8 flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${isActive ? "bg-cyan-400/15 text-cyan-200" : "text-slate-300 hover:bg-white/5 hover:text-white"}`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Active user</div>
            <div className="mt-2 font-semibold text-white">{user?.displayName ?? user?.username ?? "Guest"}</div>
            <div className="mt-1 text-sm text-slate-400">{user?.roles?.join(", ") || "Normal user"}</div>
            <button onClick={handleLogout} className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-2 text-sm text-white transition hover:border-cyan-400/40 hover:text-cyan-100">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <main className="glass-strong overflow-hidden rounded-[1.75rem]">{children}</main>
      </div>
    </div>
  );
};
