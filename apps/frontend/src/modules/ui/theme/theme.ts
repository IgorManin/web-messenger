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
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: "transparent",
            backgroundImage: "none",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: mode === "dark" ? "#1e6fa8" : undefined,
            },
            "&.Mui-focused": {
              backgroundColor: mode === "dark" ? "#1e3a5f" : "transparent",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#016db5",
              boxShadow:
                mode === "dark" ? "0 0 0 3px rgba(33, 150, 243, 0.15)" : "none",
            },
          },
        },
      },
    },
  });
}