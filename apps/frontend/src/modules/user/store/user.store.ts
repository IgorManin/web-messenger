import { create } from "zustand";
import { CurrentUser } from "@shared/modules/user/model/types";

type UserStoreState = {
  user: CurrentUser | null;
  isMeLoading: boolean;
  meError: string | null;
};

type UserStoreActions = {
  setUser: (user: CurrentUser | null) => void;
  setIsMeLoading: (value: boolean) => void;
  setMeError: (error: string | null) => void;
  resetUserState: () => void;
};

type UserStore = UserStoreState & UserStoreActions;

const initialState: UserStoreState = {
  user: null,
  isMeLoading: false,
  meError: null,
};

export const useUserStore = create<UserStore>((set) => ({
  ...initialState,

  setUser: (user) => set({ user }),
  setIsMeLoading: (value) => set({ isMeLoading: value }),
  setMeError: (error) => set({ meError: error }),
  resetUserState: () => set(initialState),
}));
