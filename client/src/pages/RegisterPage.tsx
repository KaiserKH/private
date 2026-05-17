import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [form, setForm] = useState({ username: "", email: "", phoneNumber: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/onboarding");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-white">
      <div>
        <p className="font-display text-sm uppercase tracking-[0.3em] text-cyan-300">Create account</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Start a private workspace</h2>
      </div>

      {Object.entries(form).map(([key, value]) => (
        <label key={key} className="block space-y-2 text-sm text-slate-300">
          <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
          <input
            value={value}
            type={key === "password" ? "password" : "text"}
            onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
          />
        </label>
      ))}

      {error ? <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

      <button type="submit" className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">Create account</button>

      <div className="text-sm text-slate-400">
        Already registered? <Link to="/login" className="text-cyan-300 hover:text-cyan-200">Log in</Link>
      </div>
    </form>
  );
};
