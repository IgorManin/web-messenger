import { ThemeOptions } from "@mui/material/styles";
import { colors } from "./colors";
import "./theme.augmentation";

export const darkPalette: ThemeOptions["palette"] = {
  mode: "dark",
  primary: {
    main: colors.primaryMain,
  },
  background: {
    default: colors.deepNavy,
  },
  text: {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
  },
  divider: "transparent",
  interactive: {
    selected: colors.interactiveSelected,
    hover: colors.interactiveHover,
    focused: colors.interactiveFocused,
    border: colors.interactiveBorder,
    shadow: `0 0 0 2px ${colors.interactiveShadowColor}`,
    shadowFocused: `0 0 0 2px ${colors.interactiveShadowFocusedColor}`,
  },
  message: {
    mine: colors.messageMine,
    other: colors.messageOther,
  },
  avatar: {
    background: colors.avatarBackground,
    color: colors.avatarColor,
  },
};

export const lightPalette: ThemeOptions["palette"] = {
  mode: "light",
};
