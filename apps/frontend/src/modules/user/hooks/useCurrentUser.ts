"use client";

import { useEffect } from "react";
import { useUserStore } from "../store/user.store";
import { loadMyUserAction } from "../actions/loadMyUser.action";

export function useCurrentUser() {
  const user = useUserStore((state) => state.user);
  const isMeLoading = useUserStore((state) => state.isMeLoading);
  const meError = useUserStore((state) => state.meError);

  useEffect(() => {
    if (!user) {
      void loadMyUserAction();
    }
  }, [user]);

  return {
    user,
    isMeLoading,
    meError,
  };
}
