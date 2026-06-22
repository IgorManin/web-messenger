"use client";

import { useEffect } from "react";
import { useChatStore } from "../store/chat.store";
import { useUserStore } from "@/modules/user/store/user.store";

export function useNotificationSound() {
  const incomingMessageCount = useChatStore(
    (state) => state.incomingMessageCount,
  );

  useEffect(() => {
    if (incomingMessageCount > 0) {
      const notificationsEnabled =
        useUserStore.getState().user?.notificationsEnabled;

      if (notificationsEnabled === false) return;

      new Audio("/notification.mp3").play().catch(() => {});
    }
  }, [incomingMessageCount]);
}
