"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { ChatItem } from "../model/types";
import { MessageDto, useWsMessages } from "../../ws";

interface ChatWindowProps {
  chat: ChatItem | null;
  myUserId: string | null;
  messages: MessageDto[];
  onAppendMessage: (chatId: string, message: MessageDto) => void;
}

export function ChatWindow({
  chat,
  myUserId,
  messages,
  onAppendMessage,
}: ChatWindowProps) {
  const [text, setText] = useState("");

  const currentChatId = chat?.id ?? "";

  const onMessage = useCallback(
    (message: MessageDto) => {
      if (!message.chatId) return;
      onAppendMessage(message.chatId, message);
    },
    [onAppendMessage],
  );

  const { sendMessage } = useWsMessages({
    chatId: currentChatId,
    onMessage,
  });

  const canSend = useMemo(() => {
    return text.trim().length > 0 && Boolean(chat);
  }, [text, chat]);

  const handleSend = useCallback(async () => {
    const value = text.trim();
    if (!value || !chat) return;

    const ack = await sendMessage(value);

    onAppendMessage(chat.id, ack);
    setText("");
  }, [text, chat, sendMessage, onAppendMessage]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      await handleSend();
    },
    [handleSend],
  );

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
          <Typography variant="caption" color="text.secondary">
            chatId: {chat.id}
          </Typography>
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
      </Paper>

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
}
