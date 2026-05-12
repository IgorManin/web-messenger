"use client";

import { Avatar, Box, Paper, Typography } from "@mui/material";
import { ChatItem } from "@shared/modules/chat/model/types";
import { DraftDirectChat } from "@/modules/chat/model/types";
import { useChatStore } from "@/modules/chat/store/chat.store";

interface ChatWindowHeaderProps {
  activeChat: ChatItem | DraftDirectChat;
}

export const ChatWindowHeader = ({ activeChat }: ChatWindowHeaderProps) => {
  const companion = activeChat.companion;
  const avatarUrl = companion?.avatarUrl ?? null;
  const initials = activeChat.title.slice(0, 2).toUpperCase();
  const typingByChat = useChatStore((state) => state.typingByChat);
  const isTyping = typingByChat[activeChat.id] ?? false;

  console.log("isTyping", isTyping);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          border: "1px solid red",
        }}
      >
        {/*<Avatar src={avatarUrl ?? undefined} sx={{ width: 36, height: 36 }}>*/}
        {/*  {initials}*/}
        {/*</Avatar>*/}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/*<Typography*/}
          {/*  sx={{*/}
          {/*    lineHeight: 1,*/}
          {/*  }}*/}
          {/*  variant="h6"*/}
          {/*>*/}
          {/*  {activeChat.title}*/}
          {/*</Typography>*/}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              visibility: isTyping ? "visible" : "hidden",
              border: "1px solid red",
              color: "red",
            }}
          >
            печатает...
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
