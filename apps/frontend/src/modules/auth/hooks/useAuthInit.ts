"use client";

import { useAuthStore } from "@/modules/auth/store/auth.store";
import { authApi } from "@/modules/auth/api/auth.api";
import { useEffect } from "react";

export const useAuthInit = () => {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setInitialized = useAuthStore((s) => s.setInitialized);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const data = await authApi.refresh();
        if (!cancelled) setAccessToken(data.accessToken);
      } catch {
        // не залогинен — ок
      } finally {
        if (!cancelled) setInitialized(true);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [setAccessToken, setInitialized]);
};
