"use client";

import { useAuthStore } from "@/modules/auth/store/auth.store";
import { refreshTokenAction } from "@/modules/auth/actions/refreshToken.action";
import { useEffect } from "react";

export const useAuthInit = () => {
  const setInitialized = useAuthStore((s) => s.setInitialized);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await refreshTokenAction();
      if (!cancelled) setInitialized(true);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [setInitialized]);
};
