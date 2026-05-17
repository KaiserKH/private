export const PageHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  return (
    <div className="border-b border-white/10 px-5 py-5 sm:px-8">
      <div className="font-display text-2xl font-bold text-white">{title}</div>
      {subtitle ? <div className="mt-1 text-sm text-slate-400">{subtitle}</div> : null}
    </div>
  );
};
