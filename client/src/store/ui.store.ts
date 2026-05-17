import { create } from "zustand";

type UIState = {
  theme: "dark" | "light";
  sidebarCollapsed: boolean;
  activeConversationId: string | null;
  toggleTheme: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  setActiveConversationId: (id: string | null) => void;
};

export const useUIStore = create<UIState>((set) => ({
  theme: "dark",
  sidebarCollapsed: false,
  activeConversationId: null,
  toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
  setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
  setActiveConversationId: (id) => set({ activeConversationId: id })
}));
