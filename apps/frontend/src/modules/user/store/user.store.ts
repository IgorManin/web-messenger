import { create } from "zustand";
import { CurrentUser } from "@shared/modules/user/model/types";

type UserStoreState = {
  user: CurrentUser | null;
  isMeLoading: boolean;
  meError: string | null;
  onlineUserIds: Set<number>;
  lastSeenByUser: Record<number, string>;
};

type UserStoreActions = {
  setUser: (user: CurrentUser | null) => void;
  setIsMeLoading: (value: boolean) => void;
  setMeError: (error: string | null) => void;
  resetUserState: () => void;
  setUserOnline: (userId: number) => void;
  setUserOffline: (userId: number, lastSeen?: string) => void;
};

type UserStore = UserStoreState & UserStoreActions;

const initialState: UserStoreState = {
  user: null,
  isMeLoading: false,
  meError: null,
  onlineUserIds: new Set<number>(),
  lastSeenByUser: {},
};

export const useUserStore = create<UserStore>((set) => ({
  ...initialState,

  setUser: (user) => set({ user }),
  setIsMeLoading: (value) => set({ isMeLoading: value }),
  setMeError: (error) => set({ meError: error }),
  resetUserState: () => set(initialState),

  setUserOnline: (userId) =>
    set((state) => ({
      onlineUserIds: new Set([...state.onlineUserIds, userId]),
    })),

  setUserOffline: (userId, lastSeen) =>
    set((state) => {
      const onlineUserIds = new Set(state.onlineUserIds);
      onlineUserIds.delete(userId);

      return {
        onlineUserIds,
        lastSeenByUser: lastSeen
          ? { ...state.lastSeenByUser, [userId]: lastSeen }
          : state.lastSeenByUser,
      };
    }),
}));
