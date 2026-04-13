import { create } from "zustand";
import { persist } from "zustand/middleware";

type ColorMode = "light" | "dark";

interface ThemeState {
  colorMode: ColorMode;
  toggleColorMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      colorMode: "dark",
      toggleColorMode: () =>
        set({ colorMode: get().colorMode === "dark" ? "light" : "dark" }),
    }),
    { name: "color-mode" },
  ),
);
