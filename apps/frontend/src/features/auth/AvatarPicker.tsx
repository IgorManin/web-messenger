"use client";

import { Avatar, Box, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type AvatarPickerProps = {
  file: File | null;
  onChange: (file: File | null) => void;
};

export function AvatarPicker({ file, onChange }: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleChangeFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    if (!selectedFile) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Допустимы только JPG, PNG и WEBP");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("Файл должен быть меньше 5 МБ");
      return;
    }

    onChange(selectedFile);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
      <Avatar
        src={previewUrl || undefined}
        sx={{
          width: 140,
          height: 140,
          cursor: "pointer",
          background: "transparent",
        }}
        onClick={openFileDialog}
      >
        <img
          src="/avatar.png"
          width={120}
          height={120}
          style={{ cursor: "pointer" }}
          alt="Avatar"
        />
      </Avatar>

      <input
        ref={inputRef}
        type="file"
        hidden
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChangeFile}
      />
    </Box>
  );
}
