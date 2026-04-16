"use client";

import {
  Avatar,
  Box,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { useEffect, useRef } from "react";
import { ChatItem, MessageDto } from "@shared/modules/chat/model/types";
import { CurrentUser } from "@shared/modules/user/model/types";
import { DraftDirectChat } from "@/modules/chat/model/types";

interface ChatMessageListProps {
  messages: MessageDto[];
  isLoading: boolean;
  error: string | null;
  myUser: CurrentUser | null;
  activeChat: ChatItem | DraftDirectChat;
}

export const ChatMessageList = ({
  messages,
  isLoading,
  error,
  myUser,
  activeChat,
}: ChatMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        overflow: "auto",
        display: "grid",
        gap: 1,
        justifyContent: "flex-start",
      }}
    >
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
          <CircularProgress size={24} />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
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
              const isMine = String(myUser?.id) === message.authorId;
              const isFirstInGroup =
                index === 0 ||
                messages[index - 1].authorId !== message.authorId;

              const companion = activeChat.companion;

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
                        backgroundColor: isMine
                          ? "rgba(21,69,189,0.15)"
                          : "#283593",
                        // "rgba(21,68,189,0.34)",
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
        </Box>
      )}
      <Box ref={messagesEndRef} />
    </Paper>
  );
};
