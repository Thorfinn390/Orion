import { create } from "zustand";

export type NovaReaction = {
  id: number;
  code: string;
  inputName: string;
};

interface NovaAvatarState {
  pendingReaction: NovaReaction | null;
  queueReaction: (code: string, inputName: string) => void;
  clearReaction: (reactionId: number) => void;
}

export const useNovaAvatarStore = create<NovaAvatarState>((set, get) => ({
  pendingReaction: null,

  queueReaction: (code, inputName) => {
    set({
      pendingReaction: {
        id: Date.now(),
        code,
        inputName,
      },
    });
  },

  clearReaction: (reactionId) => {
    if (get().pendingReaction?.id !== reactionId) {
      return;
    }

    set({ pendingReaction: null });
  },
}));
