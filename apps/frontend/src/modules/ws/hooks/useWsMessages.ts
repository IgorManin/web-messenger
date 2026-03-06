"use client";

import { useCallback, useEffect, useRef } from "react";
import { getSocket } from "../api/ws.client";
import { MessageDto } from "@/modules/ws";

type TypingDto = {
  chatId: string;
  userId: string;
  isTyping: boolean;
};

type UseWsMessagesParams = {
  chatId: string;
  onMessage?: (message: MessageDto) => void;
  onTyping?: (payload: TypingDto) => void;
};

export const useWsMessages = ({
  chatId,
  onMessage,
  onTyping,
}: UseWsMessagesParams) => {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !chatId) return;

    socket.emit("chat:join", { chatId }, (response: { ok?: boolean }) => {
      if (!response?.ok) {
        console.log("[ws] chat:join failed", response);
      }
    });

    const handleIncomingMessage = (message: MessageDto) => {
      if (message.chatId !== chatId) return;
      onMessage?.(message);
    };

    const handleTyping = (payload: TypingDto) => {
      if (payload.chatId !== chatId) return;
      onTyping?.(payload);
    };

    socket.on("message:new", handleIncomingMessage);
    socket.on("typing:update", handleTyping);

    return () => {
      socket.off("message:new", handleIncomingMessage);
      socket.off("typing:update", handleTyping);
    };
  }, [chatId, onMessage, onTyping]);

  const sendMessage = useCallback(
    async (text: string) => {
      const socket = getSocket();

      if (!socket) {
        throw new Error("WebSocket is not connected");
      }

      if (!chatId) {
        throw new Error("Chat is not selected");
      }

      const clientMessageId = `${Date.now()}-${Math.random()}`;

      return await new Promise<MessageDto>((resolve) => {
        socket.emit(
          "message:new",
          { chatId, text, clientMessageId },
          (acknowledgedMessage: MessageDto) => {
            resolve(acknowledgedMessage);
          },
        );
      });
    },
    [chatId],
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      const socket = getSocket();

      if (!socket || !chatId) return;

      socket.emit("typing:update", { chatId, isTyping });
    },
    [chatId],
  );

  const notifyTyping = useCallback(() => {
    if (!chatId) return;

    sendTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 1200);
  }, [chatId, sendTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return { sendMessage, notifyTyping, sendTyping };
};
