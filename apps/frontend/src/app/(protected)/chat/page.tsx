"use client";

import { useCallback, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { ChatSidebar } from "@/modules/chat/ui/ChatSidebar";
import { ChatWindow } from "@/modules/chat/ui/ChatWindow";
import { mockChats, mockMessagesByChat } from "@/modules/chat/model/mock";
import { ChatItem, MessagesByChat } from "@/modules/chat/model/types";
import { MessageDto } from "@/modules/ws";
import { useAuthStore } from "@/modules/auth/store/auth.store";

const sortChatsByUpdatedAt = (chats: ChatItem[]) => {
  return [...chats].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
};

const initialChats = sortChatsByUpdatedAt(mockChats);

export default function ChatPage() {
  const myUserId = useAuthStore((state) => {
    return state.accessToken ? "me" : null;
  });

  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<ChatItem[]>(initialChats);
  const [messagesByChat, setMessagesByChat] =
    useState<MessagesByChat>(mockMessagesByChat);
  const [unreadByChat, setUnreadByChat] = useState<Record<string, number>>({});
  const [typingByChat, setTypingByChat] = useState<
    Record<string, string | null>
  >({});
  const [activeChatId, setActiveChatId] = useState<string>(
    initialChats[0]?.id ?? "",
  );

  const activeChat = useMemo(() => {
    return chats.find((chat) => chat.id === activeChatId) ?? null;
  }, [chats, activeChatId]);

  const activeMessages = useMemo(() => {
    return messagesByChat[activeChatId] ?? [];
  }, [messagesByChat, activeChatId]);

  const activeTypingText = useMemo(() => {
    return typingByChat[activeChatId] ?? null;
  }, [typingByChat, activeChatId]);

  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);

    setUnreadByChat((prev) => {
      if (!prev[chatId]) return prev;

      return {
        ...prev,
        [chatId]: 0,
      };
    });
  }, []);

  const onTypingChange = useCallback(
    (chatId: string, payload: { userId: string; isTyping: boolean }) => {
      setTypingByChat((prev) => ({
        ...prev,
        [chatId]: payload.isTyping ? "печатает..." : null,
      }));
    },
    [],
  );

  const onAppendMessage = useCallback(
    (chatId: string, message: MessageDto) => {
      let shouldAppend = false;

      setMessagesByChat((prev) => {
        const currentMessages = prev[chatId] ?? [];

        const alreadyExists = currentMessages.some((item) => {
          return (
            item.id === message.id ||
            item.clientMessageId === message.clientMessageId
          );
        });

        if (alreadyExists) {
          return prev;
        }

        shouldAppend = true;

        return {
          ...prev,
          [chatId]: [...currentMessages, message],
        };
      });

      if (!shouldAppend) return;

      setTypingByChat((prev) => ({
        ...prev,
        [chatId]: null,
      }));

      setChats((prev) => {
        const nextChats = prev.map((chat) => {
          if (chat.id !== chatId) return chat;

          return {
            ...chat,
            lastMessage: message.text,
            updatedAt: message.createdAt,
          };
        });

        return sortChatsByUpdatedAt(nextChats);
      });

      const isIncomingForInactiveChat =
        chatId !== activeChatId && message.authorId !== myUserId;

      if (isIncomingForInactiveChat) {
        setUnreadByChat((prev) => ({
          ...prev,
          [chatId]: (prev[chatId] ?? 0) + 1,
        }));
      }
    },
    [activeChatId, myUserId],
  );

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
        chats={chats}
        unreadByChat={unreadByChat}
        activeChatId={activeChatId}
        search={search}
        onSearchChange={setSearch}
        onSelectChat={handleSelectChat}
      />

      <ChatWindow
        chat={activeChat}
        myUserId={myUserId}
        messages={activeMessages}
        typingText={activeTypingText}
        onAppendMessage={onAppendMessage}
        onTypingChange={onTypingChange}
      />
    </Box>
  );
}
