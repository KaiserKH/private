import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await login({ identifier, password });
      navigate("/home");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-white">
      <div>
        <p className="font-display text-sm uppercase tracking-[0.3em] text-cyan-300">Welcome back</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Sign in</h2>
      </div>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Username, email, or phone</span>
        <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40" placeholder="jane.doe" />
      </label>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Password</span>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40" placeholder="••••••••" />
      </label>

      {error ? <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

      <button type="submit" className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">Log in</button>

      <div className="text-sm text-slate-400">
        New here? <Link to="/register" className="text-cyan-300 hover:text-cyan-200">Create an account</Link>
      </div>
    </form>
  );
};
