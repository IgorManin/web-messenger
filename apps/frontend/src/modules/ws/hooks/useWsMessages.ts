"use client";

import { useCallback, useEffect } from "react";
import { getSocket } from "../api/ws.client";
import { MessageDto } from "@/modules/ws";

type UseWsMessagesParams = {
  chatId: string;
  onMessage?: (message: MessageDto) => void;
};

export const useWsMessages = ({ chatId, onMessage }: UseWsMessagesParams) => {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("chat:join", { chatId }, (response) => {
      if (!response?.ok) {
        console.log("[ws] chat:join failed", response);
      }
    });

    const handleIncomingMessage = (message: MessageDto) => {
      if (message.chatId !== chatId) return;
      onMessage?.(message);
    };

    socket.on("message:new", handleIncomingMessage);

    return () => {
      socket.off("message:new", handleIncomingMessage);
    };
  }, [chatId, onMessage]);

  const sendMessage = useCallback(
    async (text: string) => {
      const socket = getSocket();
      if (!socket) {
        throw new Error("WebSocket is not connected");
      }

      const clientMessageId = `${Date.now()}-${Math.random()}`;

      return await new Promise<MessageDto>((resolve) => {
        socket.emit(
          "message:new",
          { chatId, text, clientMessageId },
          (acknowledgedMessage) => {
            resolve(acknowledgedMessage);
          },
        );
      });
    },
    [chatId],
  );

  return { sendMessage };
};
