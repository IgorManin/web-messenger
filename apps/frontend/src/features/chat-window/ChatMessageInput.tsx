"use client";

import { Box, Button, TextField } from "@mui/material";
import { FormEvent, useCallback, useState } from "react";

interface ChatMessageInputProps {
  onSend: (text: string) => Promise<void>;
  notifyTyping: () => void;
}

export const ChatMessageInput = ({ onSend, notifyTyping }: ChatMessageInputProps) => {
  const [text, setText] = useState("");

  const canSend = text.trim().length > 0;

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!canSend) return;
      await onSend(text);
      setText("");
    },
    [text, canSend, onSend],
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 1 }}
    >
      <TextField
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          notifyTyping();
        }}
        placeholder="Напиши сообщение..."
        size="small"
        autoComplete="off"
      />
      <Button type="submit" variant="contained" disabled={!canSend}>
        Отправить
      </Button>
    </Box>
  );
};
