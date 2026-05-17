import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../store/auth.store";
import { useChatStore } from "../store/chat.store";
import { useUIStore } from "../store/ui.store";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { motion } from "framer-motion";

export const HomePage = () => {
  const user = useAuthStore((state) => state.user);
  const conversations = useChatStore((state) => state.conversations);
  const messages = useChatStore((state) => state.messages);
  const loadMessages = useChatStore((state) => state.loadMessages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const activeConversationId = useUIStore((state) => state.activeConversationId);
  const setActiveConversationId = useUIStore((state) => state.setActiveConversationId);
  const [draft, setDraft] = useState("");

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0] ?? null,
    [activeConversationId, conversations]
  );

  useEffect(() => {
    if (!activeConversation) return;
    setActiveConversationId(activeConversation.id);
    loadMessages(activeConversation.id);
  }, [activeConversation, loadMessages, setActiveConversationId]);

  const recipient = activeConversation
    ? activeConversation.participants.map((participant) => participant.user).find((participant) => participant.id !== user?.id)
    : null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!recipient || !draft.trim()) return;
    await sendMessage({ targetUserId: recipient.id, content: draft.trim() });
    setDraft("");
    await loadMessages(activeConversation!.id);
  };

  const startDirect = async () => {
    const search = prompt("Enter username or phone to message");
    if (!search) return;
    const result = await api.get("/users/search", { params: { q: search } });
    const target = result.data.results?.[0];
    if (!target) return;
    await api.post("/messages/direct", { targetUserId: target.id });
    await useChatStore.getState().loadConversations();
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Inbox" subtitle="Realtime private conversations with relationship-based access control." />
      <div className="grid flex-1 min-h-0 lg:grid-cols-[320px_1fr]">
        <aside className="border-r border-white/10 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-200">Conversations</div>
            <button onClick={startDirect} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-200 hover:border-cyan-400/40 hover:text-cyan-100">New chat</button>
          </div>
          <div className="scrollbar-thin max-h-[calc(100vh-220px)] space-y-3 overflow-y-auto pr-2">
            {conversations.map((conversation) => {
              const partner = conversation.participants.map((participant) => participant.user).find((participant) => participant.id !== user?.id) ?? conversation.participants[0]?.user;
              return (
                <button
                  key={conversation.id}
                  onClick={() => setActiveConversationId(conversation.id)}
                  className={`w-full rounded-3xl border p-4 text-left transition ${conversation.id === activeConversationId ? "border-cyan-400/40 bg-cyan-400/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                >
                  <div className="font-semibold text-white">{partner?.displayName ?? partner?.username ?? "Conversation"}</div>
                  <div className="mt-1 truncate text-sm text-slate-400">{conversation.messages[0]?.content ?? "No messages yet"}</div>
                </button>
              );
            })}
            {!conversations.length ? <div className="rounded-3xl border border-dashed border-white/10 p-6 text-sm text-slate-400">No conversations yet. Start with a friend or admin-approved contact.</div> : null}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="font-display text-xl font-bold text-white">{recipient?.displayName ?? recipient?.username ?? "Select a conversation"}</div>
            <div className="text-sm text-slate-400">{recipient ? `@${recipient.username}` : "Open or create a conversation to begin."}</div>
          </div>

          <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-5 py-5">
            {messages.map((message, index) => {
              const mine = message.senderId === user?.id;
              return (
                <motion.div key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.2) }} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-[1.5rem] px-4 py-3 ${mine ? "bg-cyan-400 text-slate-950" : "bg-white/6 text-white"}`}>
                    <div className="text-sm leading-6">{message.content}</div>
                    <div className={`mt-2 text-[11px] ${mine ? "text-slate-700" : "text-slate-400"}`}>{new Date(message.createdAt).toLocaleString()}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 p-4">
            <div className="flex gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-3">
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message..." className="min-w-0 flex-1 bg-transparent px-3 py-2 text-white outline-none placeholder:text-slate-500" />
              <button type="submit" className="rounded-2xl bg-cyan-400 px-5 py-2.5 font-semibold text-slate-950">Send</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
