"use client";

import { useEffect } from "react";
import { useChatStore } from "../store/chat.store";

export function useNotificationSound() {
  const incomingMessageCount = useChatStore(
    (state) => state.incomingMessageCount,
  );

  useEffect(() => {
    if (incomingMessageCount > 0) {
      new Audio("/notification.mp3").play().catch(() => {});
    }
  }, [incomingMessageCount]);
}
