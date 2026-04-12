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
import { useChatStore } from "@/modules/chat/store/chat.store";

export const ChatWindow = () => {
  const {
    activeChat,
    messages,
    isMessagesLoading,
    messagesError,
    handleSendMessage,
    notifyTyping,
  } = useChatWindow();

  const myUserId = useUserStore((state) => state.user?.id);
  const typingByChat = useChatStore((state) => state.typingByChat);
  const isTyping = activeChat ? (typingByChat[activeChat.id] ?? false) : false;

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
        {isTyping && (
          <Box sx={{ display: "grid", justifyContent: "start" }}>
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                "@keyframes typingDot": {
                  "0%, 60%, 100%": { opacity: 0.2, transform: "translateY(0)" },
                  "30%": { opacity: 1, transform: "translateY(-3px)" },
                },
              }}
            >
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "text.secondary",
                    animation: "typingDot 1.2s infinite ease-in-out",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
        <Box ref={messagesEndRef} />
      </Paper>

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
    </Box>
  );
};
