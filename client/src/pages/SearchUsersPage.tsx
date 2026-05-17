import { FormEvent, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { api } from "../api/client";

export const SearchUsersPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: string; username: string; displayName?: string | null; phoneNumber?: string | null }>>([]);
  const [mode, setMode] = useState("fuzzy");

  const search = async (event: FormEvent) => {
    event.preventDefault();
    const response = await api.get("/users/search", { params: { q: query } });
    setMode(response.data.mode ?? "fuzzy");
    setResults(response.data.results ?? []);
  };

  const sendFriendRequest = async (userId: string) => {
    await api.post("/friends/requests", { receiverId: userId });
  };

  return (
    <div>
      <PageHeader title="Search users" subtitle="Username matches open the exact account. Phone matches reveal all linked accounts." />
      <form onSubmit={search} className="flex gap-3 border-b border-white/10 p-6">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by username or phone" className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
        <button type="submit" className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950">Search</button>
      </form>
      <div className="p-6">
        <div className="mb-4 text-sm text-slate-400">Search mode: {mode}</div>
        <div className="grid gap-4 lg:grid-cols-2">
          {results.map((result) => (
            <div key={result.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
              <div className="font-semibold text-white">{result.displayName ?? result.username}</div>
              <div className="text-sm text-slate-400">@{result.username}</div>
              <div className="mt-3 text-sm text-slate-500">{result.phoneNumber ?? "No phone linked"}</div>
              <button onClick={() => sendFriendRequest(result.id)} className="mt-4 rounded-2xl border border-white/10 px-4 py-2 text-sm text-cyan-100 hover:border-cyan-400/40">Send friend request</button>
            </div>
          ))}
          {!results.length ? <div className="text-sm text-slate-500">No results yet.</div> : null}
        </div>
      </div>
    </div>
  );
};
