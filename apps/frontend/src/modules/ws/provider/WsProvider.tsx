"use client";

import type { PropsWithChildren } from "react";
import { useWsConnection } from "@/modules/ws/hooks/useWsConnection";
import { useChatSocket } from "@/modules/ws/hooks/useChatSocket";

export function WsProvider({ children }: PropsWithChildren) {
  const socket = useWsConnection();
  useChatSocket(socket);
  return children;
}
