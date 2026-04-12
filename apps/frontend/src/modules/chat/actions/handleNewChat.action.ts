"use client";

import { useChatStore } from "../store/chat.store";
import { getSocket } from "@/modules/ws/api/ws.client";
import { ChatItem } from "@shared/modules/chat/model/types";

export function handleNewChatAction(chat: ChatItem) {
  const { chats, setChats, incrementUnread } = useChatStore.getState();
  const exists = chats.some((c) => c.id === chat.id);
  if (exists) return;

  setChats([chat, ...chats]);
  getSocket()?.emit("chat:join", { chatId: chat.id }, () => {});

  if (chat.lastMessage) {
    incrementUnread(chat.id);
  }
}
