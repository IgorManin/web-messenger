import { createTheme, Theme } from "@mui/material/styles";

export function createAppTheme(mode: "light" | "dark"): Theme {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#2196F3",
      },
      background:
        mode === "dark"
          ? { default: "#0d1b2a", paper: "#16213e" }
          : { default: "#fafafa", paper: "#ffffff" },
      text:
        mode === "dark"
          ? { primary: "#e8eaf6", secondary: "#4a6080" }
          : { primary: "#1a1a1a", secondary: "#757575" },
      divider: mode === "dark" ? "#1e2d4a" : "#e0e0e0",
    },
    shape: {
      borderRadius: 8,
    },
    components: {
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
