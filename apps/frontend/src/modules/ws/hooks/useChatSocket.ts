"use client";

import { useEffect } from "react";
import { getSocket } from "@/modules/ws/api/ws.client";
import { useChatStore } from "@/modules/chat/store/chat.store";
import { MessageDto, ChatItem } from "@shared/modules/chat/model/types";
import { handleIncomingMessageAction } from "@/modules/chat/actions/handleIncomingMessage.action";

export function useChatSocket() {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleMessageNew = (message: MessageDto) => {
      if (!message.chatId) return;
      handleIncomingMessageAction(message);
    };

    const handleChatNew = (chat: ChatItem) => {
      const { chats, setChats } = useChatStore.getState();
      const exists = chats.some((c) => c.id === chat.id);
      if (!exists) {
        setChats([chat, ...chats]);
      }
    };

    socket.on("message:new", handleMessageNew);
    socket.on("chat:new", handleChatNew);

    return () => {
      socket.off("message:new", handleMessageNew);
      socket.off("chat:new", handleChatNew);
    };
  }, []);
}
