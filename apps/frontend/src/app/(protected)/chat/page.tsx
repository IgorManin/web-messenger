"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { ChatSidebar } from "@/modules/chat/ui/ChatSidebar";
import { ChatWindow } from "@/modules/chat/ui/ChatWindow";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { useChatController } from "@/modules/chat/hooks/useChatController";

const getMyUserIdFromToken = (token: string | null): string | null => {
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;

    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const payloadJson = atob(normalized);
    const payload = JSON.parse(payloadJson) as { sub?: number | string };

    if (payload.sub === undefined || payload.sub === null) return null;

    return String(payload.sub);
  } catch {
    return null;
  }
};

export default function ChatPage() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const myUserId = useMemo(() => {
    return getMyUserIdFromToken(accessToken);
  }, [accessToken]);


  const {
    search,
    setSearch,
    foundUsers,
    unreadByChat,
    activeChatId,
    sidebarChats,
    activeChat,
    activeMessages,
    activeTypingText,
    onAppendMessage,
    onTypingChange,
    handleSelectChat,
    handleSelectUser,
    handleDraftChatCreated,
  } = useChatController({ myUserId });

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
      <ChatSidebar
        chats={sidebarChats}
        foundUsers={foundUsers}
        unreadByChat={unreadByChat}
        activeChatId={activeChatId}
        search={search}
        onSearchChange={setSearch}
        onSelectChat={handleSelectChat}
        onSelectUser={handleSelectUser}
      />

      <ChatWindow
        chat={activeChat}
        myUserId={myUserId}
        messages={activeMessages}
        typingText={activeTypingText}
        onAppendMessage={onAppendMessage}
        onTypingChange={onTypingChange}
        onDraftChatCreated={handleDraftChatCreated}
      />
    </Box>
  );
}
