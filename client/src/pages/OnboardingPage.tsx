import { useNavigate } from "react-router-dom";

export const OnboardingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-mesh px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur-2xl">
        <div className="font-display text-3xl font-bold">Finish setup</div>
        <p className="mt-2 max-w-2xl text-slate-400">Add a profile image, tune privacy, and choose your visual style. The full settings system is available in the app shell.</p>
        <button onClick={() => navigate("/home")} className="mt-8 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950">Enter chat</button>
      </div>
    </div>
  );
};
