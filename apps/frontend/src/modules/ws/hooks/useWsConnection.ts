"use client";

import { connectSocket, disconnectSocket } from "@/modules/ws/api/ws.client";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { useChatStore } from "@/modules/chat/store/chat.store";
import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/modules/ws/types/ws.types";

export const useWsConnection = (): Socket<
  ServerToClientEvents,
  ClientToServerEvents
> | null => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  useEffect(() => {
    if (!isInitialized) return;

    if (!accessToken) {
      disconnectSocket();
      setSocket(null);
      return;
    }

    const s = connectSocket(accessToken);
    setSocket(s);

    const handleConnect = () => {
      console.log("[ws] connected", s.id);
      const chats = useChatStore.getState().chats;
      chats.forEach((chat) => {
        s.emit("chat:join", { chatId: chat.id }, () => {});
      });
    };

    const handleDisconnect = (reason: string) => {
      console.log("[ws] disconnected", reason);
    };

    const handleConnectError = (error: unknown) => {
      console.log("[ws] connect_error", error);
    };

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);
    s.on("connect_error", handleConnectError);

    return () => {
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      s.off("connect_error", handleConnectError);
    };
  }, [accessToken, isInitialized]);

  return socket;
};
