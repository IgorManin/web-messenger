"use client";

import { useAuthActions } from "@/modules/auth/hooks/useAuthActions";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AvatarPicker } from "@/features/auth/AvatarPicker";
import { uploadAvatar } from "@/modules/user/api/users.api";
import Image from "next/image";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const next = useMemo(() => sp.get("next") || "/chat", [sp]);

  const { login, register } = useAuthActions();
  const mutation = mode === "login" ? login : register;

  const [currentLogin, setCurrentLogin] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState("");

  const submitText = mode === "login" ? "Войти" : "Создать аккаунт";

  console.log("email", email);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAvatarError("");

    await mutation.mutateAsync({
      login: currentLogin,
      password,
      email: email || undefined,
    });

    if (mode === "register" && avatarFile) {
      try {
        await uploadAvatar(avatarFile);
      } catch (error) {
        setAvatarError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить аватар",
        );
      }
    }

    router.push(next);
  };

  const switchHref = mode === "login" ? "/register" : "/login";
  const switchText =
    mode === "login" ? "Нет аккаунта? Регистрация" : "Уже есть аккаунт? Войти";

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        maxWidth: 380,
        mx: "auto",
        mt: 8,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {mode === "login" && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Image
            src="/favicon.png"
            alt="Logo"
            width={130}
            height={130}
            priority
          />
        </Box>
      )}

      {mode === "register" && (
        <AvatarPicker file={avatarFile} onChange={setAvatarFile} />
      )}

      <TextField
        label="Логин"
        value={currentLogin}
        onChange={(e) => setCurrentLogin(e.target.value)}
        autoComplete="off"
        required
      />

      <TextField
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="off"
        required
      />

      {mode === "register" && (
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          helperText="Рекомендуем указать — понадобится для сброса пароля"
        />
      )}

      {mutation.isError && (
        <Typography variant="body2" color="error">
          {(mutation.error as Error).message}
        </Typography>
      )}

      {!mutation.isError && avatarError && (
        <Typography variant="body2" color="error">
          {avatarError}
        </Typography>
      )}

      <Button type="submit" variant="contained" disabled={mutation.isPending}>
        {mutation.isPending ? "Подождите…" : submitText}
      </Button>

      <Button
        type="button"
        variant="text"
        onClick={() => router.push(switchHref)}
        sx={{ justifySelf: "start", px: 0 }}
      >
        {switchText}
      </Button>
    </Box>
  );
}
