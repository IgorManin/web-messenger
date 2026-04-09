"use client";

import { Box } from "@mui/material";
import { ChatSidebar } from "@/features/sidebar/ChatSidebar";
import { ChatWindow } from "@/features/chat-window/ChatWindow";

export default function ChatPage() {
  return (
    <Box
      sx={{
        height: "calc(100vh - 64px)",
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        gap: 2,
        p: 2,
      }}
    >
      <ChatSidebar />
      <ChatWindow />
    </Box>
  );
}
