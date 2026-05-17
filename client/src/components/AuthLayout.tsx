import type { ReactNode } from "react";
import { motion } from "framer-motion";

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-mesh text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl place-items-center px-4 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-glow backdrop-blur-xl lg:block"
        >
          <p className="font-display text-sm uppercase tracking-[0.35em] text-cyan-300">Kaizu Chats</p>
          <h1 className="mt-5 max-w-lg font-display text-5xl leading-tight text-white">Private messaging with centralized control and realtime trust.</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300">
            Built for relationship-based messaging, admin transparency, feature toggles, and future-scale upgrades.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-sm text-slate-200">
            {[
              ["Realtime", "Socket-driven delivery and presence."],
              ["Secure auth", "JWT, refresh rotation, and CSRF."],
              ["Admin logs", "Visible moderation history per account."],
              ["Feature control", "Global, role, and user-scoped toggles."]
            ].map(([title, copy]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="font-semibold text-white">{title}</div>
                <div className="mt-1 text-slate-300">{copy}</div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-glow backdrop-blur-2xl sm:p-8"
        >
          {children}
        </motion.section>
      </div>
    </div>
  );
};
