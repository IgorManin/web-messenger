"use client";

import { useCallback, useEffect, useRef } from "react";
import { getSocket } from "../api/ws.client";
import { MessageDto } from "@/modules/ws";

type UseWsMessagesParams = {
  chatId: string;
};

export const useWsMessages = ({ chatId }: UseWsMessagesParams) => {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
