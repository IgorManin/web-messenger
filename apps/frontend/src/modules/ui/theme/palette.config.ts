import { ThemeOptions } from "@mui/material/styles";
import { colors } from "./colors";
import "./theme.augmentation";

export const darkPalette: ThemeOptions["palette"] = {
  mode: "dark",
  primary: {
    main: colors.accent,
  },
  background: {
    default: colors.darkBg,
    paper: colors.darkSurface,
  },
  text: {
    primary: colors.darkTextPrimary,
    secondary: colors.darkTextSecondary,
  },
  divider: "transparent",
  interactive: {
    selected: colors.darkMessageMine,
    hover: colors.darkHover,
    focused: "transparent",
    border: colors.darkBorder,
    shadow: `0 0 0 1px ${colors.darkHover}`,
    shadowFocused: `0 0 0 2px ${colors.darkHover}`,
  },
  message: {
    mine: colors.darkMessageMine,
    other: colors.darkMessageOther,
  },
  avatar: {
    background: colors.avatarBackground,
    color: colors.avatarColor,
  },
  status: {
    online: colors.statusOnline,
  },
};

export const lightPalette: ThemeOptions["palette"] = {
  mode: "light",
  primary: {
    main: colors.accent,
  },
  background: {
    default: colors.lightBg,
    paper: colors.lightSurface,
  },
  text: {
    primary: colors.lightTextPrimary,
    secondary: colors.lightTextSecondary,
  },
  divider: "transparent",
  interactive: {
    selected: colors.lightSelected,
    hover: colors.lightHover,
    focused: "transparent",
    border: colors.lightBorder,
    shadow: `0 0 0 2px ${colors.lightShadowColor}`,
    shadowFocused: `0 0 0 2px ${colors.lightShadowColor}`,
  },
  message: {
    mine: colors.lightMessageMine,
    other: colors.lightMessageOther,
  },
  avatar: {
    background: colors.avatarBackground,
    color: colors.avatarColor,
  },
  status: {
    online: colors.statusOnline,
  },
};
