import { useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { useChatStore } from "../store/chat.store";

const tags = ["Friend", "Close Friend", "Best Friend", "BF", "GF", "Partner", "Family"];

export const RelationshipPage = () => {
  const loadFeatures = useChatStore((state) => state.loadFeatures);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const features = useChatStore((state) => state.features);

  return (
    <div>
      <PageHeader title="Relationships" subtitle="Scalable tags, custom themes, and permission rules for each connection." />
      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
        {tags.map((tag) => (
          <div key={tag} className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
            <div className="font-semibold text-white">{tag}</div>
            <div className="mt-2 text-sm text-slate-400">Configure label-specific permissions, wallpapers, and styling.</div>
          </div>
        ))}
      </div>
      <div className="px-6 pb-6">
        <div className="mb-3 text-sm font-semibold text-slate-200">Feature toggles</div>
        <div className="space-y-3">
          {features.map((feature) => (
            <div key={feature.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
              <div className="font-medium text-white">{feature.featureKey}</div>
              <div className="mt-1">Scope: {feature.scope} - {feature.enabled ? "enabled" : "disabled"}</div>
            </div>
          ))}
          {!features.length ? <div className="text-sm text-slate-500">No toggles loaded yet.</div> : null}
        </div>
      </div>
    </div>
  );
};
