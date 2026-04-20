import { create } from "zustand";

export const useChatStore = create((set) => ({
  currentChatId: null,
  setCurrentChatId: (chatId: number) => {
    set({ currentChatId: chatId });
  },
}));
