"use client";

import {
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useChatWindow } from "@/modules/chat/hooks/useChatWindow";
import { useUserStore } from "@/modules/user/store/user.store";

export const ChatWindow = () => {
  const {
    activeChat,
    messages,
    isMessagesLoading,
    messagesError,
    handleSendMessage,
  } = useChatWindow();

  const myUserId = useUserStore((state) => state.user?.id);

  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const canSend = text.trim().length > 0 && Boolean(activeChat);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!canSend) return;
      await handleSendMessage(text);
      setText("");
    },
    [text, canSend, handleSendMessage],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  if (!activeChat) {
    return (
      <Paper
        variant="outlined"
        sx={{ height: "100%", display: "grid", placeItems: "center", p: 2 }}
      >
        <Typography color="text.secondary">Выбери чат слева</Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        gap: 2,
      }}
    >
      {/* Заголовок */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6">{activeChat.title}</Typography>
      </Paper>

      {/* Сообщения */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          overflow: "auto",
          display: "grid",
          gap: 1,
          alignContent: "start",
        }}
      >
        {isMessagesLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : messagesError ? (
          <Typography color="error">{messagesError}</Typography>
        ) : messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Пока сообщений нет
          </Typography>
        ) : (
          messages.map((message) => {
            const isMine = String(myUserId) === message.authorId;

            return (
              <Box
                key={message.id}
                sx={{
                  display: "grid",
                  justifyContent: isMine ? "end" : "start",
                }}
              >
                <Box
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: 520,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {message.text}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        <Box ref={messagesEndRef} />
      </Paper>

      {/* Инпут */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 1 }}
      >
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напиши сообщение..."
          size="small"
          autoComplete="off"
        />
        <Button type="submit" variant="contained" disabled={!canSend}>
          Отправить
        </Button>
      </Box>
    </Box>
  );
};
