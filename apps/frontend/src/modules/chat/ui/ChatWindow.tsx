"use client";

import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MessageDto, useWsMessages } from "@/modules/ws";
import { ChatItem } from "@/modules/chat/model/types";

interface ChatWindowProps {
  chat: ChatItem | null;
  myUserId: string | null;
  messages: MessageDto[];
  typingText?: string | null;
  onAppendMessage: (chatId: string, message: MessageDto) => void;
  onTypingChange: (
    chatId: string,
    payload: { userId: string; isTyping: boolean },
  ) => void;
}

export function ChatWindow({
  chat,
  myUserId,
  messages,
  typingText,
  onAppendMessage,
  onTypingChange,
}: ChatWindowProps) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentChatId = chat?.id ?? "";

  const onMessage = useCallback(
    (message: MessageDto) => {
      if (!message.chatId) return;
      onAppendMessage(message.chatId, message);
    },
    [onAppendMessage],
  );

  const onTyping = useCallback(
    (payload: { chatId: string; userId: string; isTyping: boolean }) => {
      if (!payload.chatId) return;
      if (payload.userId === myUserId) return;

      onTypingChange(payload.chatId, {
        userId: payload.userId,
        isTyping: payload.isTyping,
      });
    },
    [myUserId, onTypingChange],
  );

  const { sendMessage, notifyTyping, sendTyping } = useWsMessages({
    chatId: currentChatId,
    onMessage,
    onTyping,
  });

  const canSend = useMemo(() => {
    return text.trim().length > 0 && Boolean(chat);
  }, [text, chat]);

  const handleSend = useCallback(async () => {
    const value = text.trim();

    if (!value || !chat) return;

    const ack = await sendMessage(value);

    onAppendMessage(chat.id, ack);
    sendTyping(false);
    setText("");
  }, [text, chat, sendMessage, onAppendMessage, sendTyping]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      await handleSend();
    },
    [handleSend],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, currentChatId]);

  if (!chat) {
    return (
      <Paper
        variant="outlined"
        sx={{
          height: "100%",
          display: "grid",
          placeItems: "center",
          p: 2,
        }}
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
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6">{chat.title}</Typography>

          {typingText ? (
            <Typography variant="caption" color="primary">
              {typingText}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary">
              chatId: {chat.id}
            </Typography>
          )}
        </Box>
      </Paper>

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
        {messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Пока сообщений нет
          </Typography>
        ) : (
          messages.map((message) => {
            const isMine = myUserId ? message.authorId === myUserId : false;

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

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 1 }}
      >
        <TextField
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (e.target.value.trim()) {
              notifyTyping();
            } else {
              sendTyping(false);
            }
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
}
