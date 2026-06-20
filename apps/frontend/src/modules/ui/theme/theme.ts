import { createTheme, Theme } from "@mui/material/styles";
import { darkPalette, lightPalette } from "./palette.config";

export function createAppTheme(mode: "light" | "dark"): Theme {
  const palette = mode === "dark" ? darkPalette : lightPalette;

  return createTheme({
    palette,
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          "*::-webkit-scrollbar": {
            width: "8px",
          },
          "*::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: theme.palette.interactive?.border,
            borderRadius: "4px",
            border: "2px solid transparent",
            backgroundClip: "padding-box",
          },
          "*::-webkit-scrollbar-thumb:hover": {
            backgroundColor: theme.palette.interactive?.selected,
          },
        }),
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            backgroundImage: "none",
            border: `1px solid ${theme.palette.interactive?.border}`,
          }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.interactive?.border,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.interactive?.border,
              boxShadow: theme.palette.interactive?.shadow,
            },
            "&.Mui-focused": {
              backgroundColor: theme.palette.interactive?.focused,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.interactive?.border,
              boxShadow: theme.palette.interactive?.shadowFocused,
            },
          }),
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            "&.Mui-selected": {
              backgroundColor: theme.palette.interactive?.selected,
              "&:hover": {
                backgroundColor: theme.palette.interactive?.selected,
              },
            },
            "&:hover": {
              backgroundColor: theme.palette.interactive?.hover,
            },
            borderRadius: "10px",
          }),
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.avatar?.background,
            color: theme.palette.avatar?.color,
          }),
        },
      },
    },
  });
}
