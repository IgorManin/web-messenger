"use client";

import { useEffect } from "react";
import { useChatStore } from "@/modules/chat/store/chat.store";
import { useUserStore } from "@/modules/user/store/user.store";
import { ChatItem, MessageDto } from "@shared/modules/chat/model/types";
import { handleIncomingMessageAction } from "@/modules/chat/actions/handleIncomingMessage.action";
import { handleNewChatAction } from "@/modules/chat/actions/handleNewChat.action";
import type { Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  TypingEventDto,
} from "@/modules/ws/types/ws.types";

export function useChatSocket(
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
) {
  useEffect(() => {
    if (!socket) return;

    const typingTimers: Record<string, ReturnType<typeof setTimeout>> = {};

    const handleMessageNew = (message: MessageDto) => {
      if (!message.chatId) return;
      handleIncomingMessageAction(message);
    };

    const handleChatNew = (chat: ChatItem) => {
      handleNewChatAction(chat);
    };

    const handleTypingUpdate = (payload: TypingEventDto) => {
      const myUserId = useUserStore.getState().user?.id;
      if (String(myUserId) === payload.userId) return;

      const { setTyping } = useChatStore.getState();
      setTyping(payload.chatId, true);

      if (typingTimers[payload.chatId]) {
        clearTimeout(typingTimers[payload.chatId]);
      }
      typingTimers[payload.chatId] = setTimeout(() => {
        useChatStore.getState().setTyping(payload.chatId, false);
        delete typingTimers[payload.chatId];
      }, 1000);
    };

    socket.on("message:new", handleMessageNew);
    socket.on("chat:new", handleChatNew);
    socket.on("typing:update", handleTypingUpdate);

    return () => {
      socket.off("message:new", handleMessageNew);
      socket.off("chat:new", handleChatNew);
      socket.off("typing:update", handleTypingUpdate);
      Object.values(typingTimers).forEach(clearTimeout);
    };
  }, [socket]);
}
