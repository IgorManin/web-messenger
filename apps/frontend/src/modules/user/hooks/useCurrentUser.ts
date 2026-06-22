"use client";

import { useEffect } from "react";
import { useUserStore } from "../store/user.store";
import { loadMyUserAction } from "../actions/loadMyUser.action";
import { useAuthStore } from "@/modules/auth/store/auth.store";

export function useCurrentUser() {
  const user = useUserStore((state) => state.user);
  const isMeLoading = useUserStore((state) => state.isMeLoading);
  const meError = useUserStore((state) => state.meError);
  const token = useAuthStore((s) => s.accessToken); // добавить

  useEffect(() => {
    if (!user && token) {
      void loadMyUserAction();
    }
  }, [user, token]);

  return { user, isMeLoading, meError };
}
