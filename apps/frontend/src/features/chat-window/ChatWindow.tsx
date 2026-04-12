"use client";

import {
  Avatar,
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
import { isDraftDirectChat } from "@/modules/chat/model/types";

export const ChatWindow = () => {
  const {
    activeChat,
    messages,
    isMessagesLoading,
    messagesError,
    handleSendMessage,
    notifyTyping,
  } = useChatWindow();

  const myUser = useUserStore((state) => state.user);
  const myUserId = myUser?.id;
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

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          overflow: "auto",
          display: "grid",
          gap: 1,
          alignContent: "start",
          justifyContent: "flex-start",
        }}
      >
        {isMessagesLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : messagesError ? (
          <Typography color="error">{messagesError}</Typography>
        ) : (
          <Box
            sx={{
              maxWidth: 720,
              mx: "auto",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
            }}
          >
            {messages.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Пока сообщений нет
              </Typography>
            ) : (
              messages.map((message, index) => {
                const isMine = String(myUserId) === message.authorId;
                const isFirstInGroup =
                  index === 0 ||
                  messages[index - 1].authorId !== message.authorId;

                const companion =
                  activeChat && !isDraftDirectChat(activeChat)
                    ? activeChat.companion
                    : null;

                const authorLogin = isMine
                  ? (myUser?.login ?? "Я")
                  : (companion?.login ?? "Собеседник");
                const authorAvatarUrl = isMine
                  ? (myUser?.avatarUrl ?? null)
                  : (companion?.avatarUrl ?? null);
                const initials = authorLogin.slice(0, 2).toUpperCase();

                return (
                  <Box
                    key={message.id}
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "flex-start",
                      mt: isFirstInGroup && index > 0 ? 1 : 0,
                    }}
                  >
                    {isFirstInGroup ? (
                      <Avatar
                        src={authorAvatarUrl ?? undefined}
                        sx={{ width: 36, height: 36, flexShrink: 0, mt: 0.25 }}
                      >
                        {initials}
                      </Avatar>
                    ) : (
                      <Box sx={{ width: 36, flexShrink: 0 }} />
                    )}

                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      {isFirstInGroup && (
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: isMine ? "secondary.main" : "primary.main",
                            mb: 0.25,
                          }}
                        >
                          {authorLogin}
                        </Typography>
                      )}
                      <Box
                        sx={{
                          px: 1.5,
                          py: 1,
                          borderRadius: 2,
                          maxWidth: 480,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "pre-wrap" }}
                        >
                          {message.text}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 0.25 }}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })
            )}

            {isTyping && (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "flex-start",
                  mt: 1,
                }}
              >
                <Box sx={{ width: 36, flexShrink: 0 }} />
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
                      "0%, 60%, 100%": {
                        opacity: 0.2,
                        transform: "translateY(0)",
                      },
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
