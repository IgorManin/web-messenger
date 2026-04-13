"use client";

import { AuthForm } from "@/features/auth/LoginForm";
import { useParams } from "next/navigation";
import IconButton from "@mui/material/IconButton";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeStore } from "@/modules/ui/store/theme.store";

type AuthMode = "login" | "register";

export default function Page() {
  const params = useParams<{ mode: string }>();
  const mode = params?.mode === "register" ? "register" : "login";

  const colorMode = useThemeStore((s) => s.colorMode);
  const toggleColorMode = useThemeStore((s) => s.toggleColorMode);

  return (
    <div style={{ position: "relative" }}>
      <IconButton
        onClick={toggleColorMode}
        sx={{ position: "absolute", top: 16, right: 16 }}
        aria-label="toggle theme"
      >
        {colorMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
      <AuthForm mode={mode as AuthMode} />
    </div>
  );
}
