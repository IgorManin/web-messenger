"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { ChatSidebar } from "@/modules/chat/ui/ChatSidebar";
import { ChatWindow } from "@/modules/chat/ui/ChatWindow";
import { ChatItem, MessagesByChat } from "@/modules/chat/model/types";
import { MessageDto } from "@/modules/ws";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { getChatMessages, getChats } from "@/modules/chat/api/chat.api";

const sortChatsByUpdatedAt = (chats: ChatItem[]) => {
  return [...chats].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
};

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

  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [messagesByChat, setMessagesByChat] = useState<MessagesByChat>({});
  const [loadedChats, setLoadedChats] = useState<Record<string, boolean>>({});
  const [unreadByChat, setUnreadByChat] = useState<Record<string, number>>({});
  const [typingByChat, setTypingByChat] = useState<
    Record<string, string | null>
  >({});
  const [activeChatId, setActiveChatId] = useState<string>("");

  useEffect(() => {
    const loadChats = async () => {
      try {
        const data = await getChats();
        const sortedChats = sortChatsByUpdatedAt(data);

        setChats(sortedChats);

        setActiveChatId((prev) => {
          if (prev) return prev;
          return sortedChats[0]?.id ?? "";
        });
      } catch (error) {
        console.error("Ошибка загрузки чатов", error);
      }
    };

    void loadChats();
  }, []);

  useEffect(() => {
    if (!activeChatId) return;
    if (loadedChats[activeChatId]) return;

    const loadMessages = async () => {
      try {
        const messages = await getChatMessages(activeChatId);

        setMessagesByChat((prev) => ({
          ...prev,
          [activeChatId]: messages,
        }));

        setLoadedChats((prev) => ({
          ...prev,
          [activeChatId]: true,
        }));
      } catch (error) {
        console.error("Ошибка загрузки сообщений", error);
      }
    };

    void loadMessages();
  }, [activeChatId, loadedChats]);

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

      setLoadedChats((prev) => ({
        ...prev,
        [chatId]: true,
      }));

      setTypingByChat((prev) => ({
        ...prev,
        [chatId]: null,
      }));

      setChats((prev) => {
        const existingChat = prev.find((chat) => chat.id === chatId);

        if (!existingChat) {
          return prev;
        }

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
