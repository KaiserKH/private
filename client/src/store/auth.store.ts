import { create } from "zustand";
import { api } from "../api/client";

type User = {
  id: string;
  username: string;
  displayName?: string | null;
  bio?: string | null;
  profilePhotoUrl?: string | null;
  phoneNumber?: string | null;
  roles?: string[];
  permissions?: string[];
  isAdmin?: boolean;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  csrfReady: boolean;
  initialize: () => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<void>;
  login: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,
  csrfReady: false,
  initialize: async () => {
    set({ loading: true });
    try {
      await api.get("/auth/csrf");
      const response = await api.get("/auth/me");
      set({ user: response.data.user, csrfReady: true, initialized: true });
    } catch {
      set({ user: null, csrfReady: true, initialized: true });
    } finally {
      set({ loading: false });
    }
  },
  register: async (payload) => {
    const response = await api.post("/auth/register", payload);
    set({ user: response.data.user });
  },
  login: async (payload) => {
    const response = await api.post("/auth/login", payload);
    set({ user: response.data.user });
  },
  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null });
  },
  setUser: (user) => set({ user })
}));
