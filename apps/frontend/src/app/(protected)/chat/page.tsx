"use client";

import { useCallback, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { useAuthStore } from "../../../modules/auth/store/auth.store";
import { MessagesByChat } from "../../../modules/chat/model/types";
import {
  mockChats,
  mockMessagesByChat,
} from "../../../modules/chat/model/mock";
import { MessageDto } from "../../../modules/ws";
import { ChatSidebar } from "../../../modules/chat/ui/ChatSidebar";
import { ChatWindow } from "../../../modules/chat/ui/ChatWindow";

export default function ChatPage() {
  const myUserId = useAuthStore((s) => {
    return (s as unknown as { userId?: string }).userId ?? null;
  });

  const [search, setSearch] = useState("");
  const [activeChatId, setActiveChatId] = useState("global");
  const [messagesByChat, setMessagesByChat] =
    useState<MessagesByChat>(mockMessagesByChat);

  const activeChat = useMemo(() => {
    return mockChats.find((chat) => chat.id === activeChatId) ?? null;
  }, [activeChatId]);

  const activeMessages = useMemo(() => {
    return messagesByChat[activeChatId] ?? [];
  }, [messagesByChat, activeChatId]);

  const handleAppendMessage = useCallback(
    (chatId: string, message: MessageDto) => {
      setMessagesByChat((prev) => {
        const chatMessages = prev[chatId] ?? [];

        return {
          ...prev,
          [chatId]: [...chatMessages, message],
        };
      });
    },
    [],
  );

  return (
    <Box
      sx={{
        p: 2,
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        gap: 2,
      }}
    >
      <ChatSidebar
        chats={mockChats}
        activeChatId={activeChatId}
        search={search}
        onSearchChange={setSearch}
        onSelectChat={setActiveChatId}
      />

      <ChatWindow
        chat={activeChat}
        myUserId={myUserId}
        messages={activeMessages}
        onAppendMessage={handleAppendMessage}
      />
    </Box>
  );
}
