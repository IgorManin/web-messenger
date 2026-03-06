"use client";

import { connectSocket, disconnectSocket } from "@/modules/ws/api/ws.client";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { useEffect } from "react";

export const useWsConnection = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isInitialized) return;

    if (!accessToken) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(accessToken);

    const handleConnect = () => {
      console.log("[ws] connected", socket.id);
    };

    const handleDisconnect = (reason: string) => {
      console.log("[ws] disconnected", reason);
    };

    const handleConnectError = (error: unknown) => {
      console.log("[ws] connect_error", error);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [accessToken, isInitialized]);
};
