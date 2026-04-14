import { ThemeOptions } from "@mui/material/styles";
import { colors } from "./colors";

export const darkPalette: ThemeOptions["palette"] = {
  mode: "dark",
  primary: {
    main: colors.indigo800,
  },
  background: {
    default: colors.deepNavy,
  },
  text: {
    primary: "rgba(255,255,255,0.9)",
    secondary: "rgba(255,255,255,0.6)",
  },
  divider: "transparent",
};

export const lightPalette: ThemeOptions["palette"] = {
  mode: "light",
};