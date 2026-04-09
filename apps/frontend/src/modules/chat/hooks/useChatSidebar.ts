"use client";

import { useEffect } from "react";
import { useChatStore } from "../store/chat.store";
import { loadChatsAction } from "../actions/loadChats.action";

export function useChatSidebar() {
  const chats = useChatStore((state) => state.chats);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const isChatsLoading = useChatStore((state) => state.isChatsLoading);
  const chatsError = useChatStore((state) => state.chatsError);
  const setActiveChatId = useChatStore((state) => state.setActiveChatId);

  useEffect(() => {
    void loadChatsAction();
  }, []);

  return {
    chats,
    activeChatId,
    isChatsLoading,
    chatsError,
    setActiveChatId,
  };
}
