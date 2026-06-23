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
  MessageDeliveredEventDto,
  MessageReadEventDto,
  ServerToClientEvents,
  TypingEventDto,
  UserOfflineEventDto,
  UserOnlineEventDto,
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

    const handleUserOnline = (payload: UserOnlineEventDto) => {
      useUserStore.getState().setUserOnline(payload.userId);
    };

    const handleUserOffline = (payload: UserOfflineEventDto) => {
      useUserStore.getState().setUserOffline(payload.userId, payload.lastSeen);
    };

    const handleMessageDelivered = (payload: MessageDeliveredEventDto) => {
      useChatStore
        .getState()
        .setMessagesStatus(payload.chatId, [payload.messageId], "delivered");
    };

    const handleMessageRead = (payload: MessageReadEventDto) => {
      useChatStore
        .getState()
        .setMessagesStatus(payload.chatId, payload.messageIds, "read");
    };

    socket.on("message:new", handleMessageNew);
    socket.on("chat:new", handleChatNew);
    socket.on("typing:update", handleTypingUpdate);
    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);
    socket.on("message:delivered", handleMessageDelivered);
    socket.on("message:read", handleMessageRead);

    return () => {
      socket.off("message:new", handleMessageNew);
      socket.off("chat:new", handleChatNew);
      socket.off("typing:update", handleTypingUpdate);
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
      socket.off("message:delivered", handleMessageDelivered);
      socket.off("message:read", handleMessageRead);
      Object.values(typingTimers).forEach(clearTimeout);
    };
  }, [socket]);
}
