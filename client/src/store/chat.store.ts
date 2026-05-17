import { create } from "zustand";
import { api } from "../api/client";

type Conversation = {
  id: string;
  participants: Array<{ user: { id: string; username: string; displayName?: string | null; profilePhotoUrl?: string | null } }>;
  messages: Array<{ id: string; content: string; sender?: { id: string; username: string; displayName?: string | null }; createdAt: string }>;
};

type Message = {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  sender?: { id: string; username: string; displayName?: string | null; profilePhotoUrl?: string | null };
};

type ChatState = {
  conversations: Conversation[];
  messages: Message[];
  notifications: Array<{ id: string; title: string; body: string; isRead: boolean }>;
  adminLogs: Array<{ id: string; action: string; category: string; createdAt: string }>;
  features: Array<{ id: string; featureKey: string; enabled: boolean; scope: string }>;
  loading: boolean;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  loadNotifications: () => Promise<void>;
  loadAdminLogs: () => Promise<void>;
  loadFeatures: () => Promise<void>;
  sendMessage: (payload: { targetUserId: string; content: string; type?: string }) => Promise<void>;
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: [],
  notifications: [],
  adminLogs: [],
  features: [],
  loading: false,
  loadConversations: async () => {
    const response = await api.get("/messages/conversations");
    set({ conversations: response.data.conversations ?? [] });
  },
  loadMessages: async (conversationId) => {
    const response = await api.get(`/messages/conversations/${conversationId}/messages`);
    set({ messages: response.data.messages ?? [] });
  },
  loadNotifications: async () => {
    const response = await api.get("/notifications/me");
    set({ notifications: response.data.notifications ?? [] });
  },
  loadAdminLogs: async () => {
    const response = await api.get("/audit/me");
    set({ adminLogs: response.data.logs ?? [] });
  },
  loadFeatures: async () => {
    const response = await api.get("/permissions/me");
    set({ features: response.data.features ?? [] });
  },
  sendMessage: async (payload) => {
    await api.post("/messages/send", payload);
    const activeConversationId = get().conversations[0]?.id;
    if (activeConversationId) {
      await get().loadMessages(activeConversationId);
    }
  }
}));
