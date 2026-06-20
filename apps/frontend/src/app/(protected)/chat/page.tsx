"use client";

import { Box, useMediaQuery, useTheme } from "@mui/material";
import { ChatSidebar } from "@/features/sidebar/ChatSidebar";
import { ChatWindow } from "@/features/chat-window/ChatWindow";
import { useUiStore } from "@/modules/ui/store/ui.store";

export default function ChatPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobileChatOpen = useUiStore((state) => state.isMobileChatOpen);

  if (isMobile) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "grid",
          p: 2,
        }}
      >
        {isMobileChatOpen ? <ChatWindow /> : <ChatSidebar />}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
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
