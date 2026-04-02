"use client";

import { useEffect } from "react";
import { getSocket } from "@/modules/ws/api/ws.client";
import { ChatItem } from "@/modules/chat/model/types";
import { MessageDto } from "@/modules/ws";

type UseChatSocketParams = {
  myUserId: string | null;
  onChatNew: (chat: ChatItem) => void;
  onMessageNew: (message: MessageDto) => void;
  onTypingUpdate: (payload: {
    chatId: string;
    userId: string;
    isTyping: boolean;
  }) => void;
};

export function useChatSocket({
  myUserId,
  onChatNew,
  onMessageNew,
  onTypingUpdate,
}: UseChatSocketParams) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleChatNew = (chat: ChatItem) => {
      onChatNew(chat);
    };

    const handleMessageNew = (message: MessageDto) => {
      if (!message.chatId) return;
      onMessageNew(message);
    };

    const handleTyping = (payload: {
      chatId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (!payload.chatId) return;
      if (payload.userId === myUserId) return;

      onTypingUpdate(payload);
    };

    socket.on("chat:new", handleChatNew);
    socket.on("message:new", handleMessageNew);
    socket.on("typing:update", handleTyping);

    return () => {
      socket.off("chat:new", handleChatNew);
      socket.off("message:new", handleMessageNew);
      socket.off("typing:update", handleTyping);
    };
  }, [myUserId, onChatNew, onMessageNew, onTypingUpdate]);
}
