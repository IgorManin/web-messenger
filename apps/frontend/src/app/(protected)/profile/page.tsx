"use client";

import {
  Avatar,
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useUserStore } from "@/modules/user/store/user.store";
import { uploadAvatar } from "@/modules/user/api/users.api";
import { updateProfileAction } from "@/modules/user/actions/updateProfile.action";

export default function ProfilePage() {
  const theme = useTheme();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [login, setLogin] = useState(user?.login ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    if (user) {
      setLogin(user.login);
      setEmail(user.email ?? "");
    }
  }, [user]);

  const hasChanges =
    login.trim() !== (user?.login ?? "") ||
    email.trim() !== (user?.email ?? "");

  const initials = (user?.login ?? "").slice(0, 2).toUpperCase();

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Допустимы только JPG, PNG и WEBP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Файл должен быть меньше 5 МБ");
      return;
    }

    setAvatarError("");

    try {
      const response = await uploadAvatar(file);
      if (user) {
        setUser({ ...user, avatarUrl: response.avatarUrl });
      }
    } catch (err) {
      setAvatarError(
        err instanceof Error ? err.message : "Не удалось загрузить аватар",
      );
    }
  };

  const handleSave = async () => {
    setError("");
    setIsSaving(true);

    const result = await updateProfileAction({
      login: login.trim() !== user?.login ? login.trim() : undefined,
      email: email.trim() !== (user?.email ?? "") ? email.trim() : undefined,
    });

    setIsSaving(false);

    if (!result.success) {
      setError(result.error ?? "Не удалось обновить профиль");
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 420,
        mx: "auto",
        mt: 4,
        px: 2,
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton
          onClick={() => router.back()}
          sx={{ color: theme.palette.text.secondary }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1 }}>
          Профиль
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Avatar
          src={user?.avatarUrl ?? undefined}
          onClick={openFileDialog}
          sx={{
            width: 120,
            height: 120,
            cursor: "pointer",
            fontSize: 36,
            backgroundColor: theme.palette.avatar.background,
            color: theme.palette.avatar.color,
          }}
        >
          {initials}
        </Avatar>
        <input
          ref={inputRef}
          type="file"
          hidden
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarChange}
        />
        {avatarError && (
          <Typography variant="body2" sx={{ color: theme.palette.error.main }}>
            {avatarError}
          </Typography>
        )}
      </Box>

      <TextField
        value={login}
        onChange={(e) => {
          setLogin(e.target.value);
          setError("");
        }}
        autoComplete="off"
      />

      <TextField
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError("");
        }}
        autoComplete="off"
      />

      {error && (
        <Typography variant="body2" sx={{ color: theme.palette.error.main }}>
          {error}
        </Typography>
      )}

      <Button
        variant="contained"
        disabled={!hasChanges || isSaving}
        onClick={handleSave}
      >
        {isSaving ? "Сохранение…" : "Сохранить"}
      </Button>
    </Box>
  );
}
