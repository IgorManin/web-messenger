"use client";

import { useWsConnection } from "@/modules/ws/hooks/useWsConnection";
import type { PropsWithChildren } from "react";

export function WsProvider({ children }: PropsWithChildren) {
  useWsConnection();
  return children;
}
