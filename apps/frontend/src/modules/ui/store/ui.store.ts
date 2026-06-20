import { create } from "zustand";

interface UiState {
  isMobileChatOpen: boolean;
  openMobileChat: () => void;
  closeMobileChat: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isMobileChatOpen: false,
  openMobileChat: () => set({ isMobileChatOpen: true }),
  closeMobileChat: () => set({ isMobileChatOpen: false }),
}));
