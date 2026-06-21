"use client";

import type { PropsWithChildren } from "react";
import { useWsConnection } from "@/modules/ws/hooks/useWsConnection";
import { useChatSocket } from "@/modules/ws/hooks/useChatSocket";
import { useNotificationSound } from "@/modules/chat/hooks/useNotificationSound";

export function WsProvider({ children }: PropsWithChildren) {
  const socket = useWsConnection();
  useChatSocket(socket);
  useNotificationSound();
  return children;
}
