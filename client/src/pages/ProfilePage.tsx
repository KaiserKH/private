import { useAuthStore } from "../store/auth.store";
import { PageHeader } from "../components/PageHeader";

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <PageHeader title="Profile" subtitle="Identity, privacy, and personalization controls." />
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <div className="aspect-square rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-400/20 to-sky-500/10 p-4">
            <div className="grid h-full place-items-center rounded-[1.5rem] border border-white/10 bg-slate-950/50 text-4xl font-bold">{user?.username?.slice(0, 1).toUpperCase()}</div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="font-display text-2xl font-bold">{user?.displayName ?? user?.username}</div>
            <div className="mt-2 text-slate-400">{user?.bio ?? "No bio configured yet."}</div>
            <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">Username: {user?.username}</div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">Phone: {user?.phoneNumber ?? "Not linked"}</div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">Roles: {user?.roles?.join(", ") ?? "User"}</div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">Permissions: {user?.permissions?.length ?? 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
