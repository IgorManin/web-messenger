"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { ChatSidebar } from "@/modules/chat/ui/ChatSidebar";
import { ChatWindow } from "@/modules/chat/ui/ChatWindow";
import {
  ChatCompanion,
  ChatItem,
  MessagesByChat,
} from "@/modules/chat/model/types";
import { MessageDto } from "@/modules/ws";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import {
  createOrGetDirectChat,
  getChatMessages,
  getChats,
  searchUsersByLogin,
} from "@/modules/chat/api/chat.api";
import { getSocket } from "@/modules/ws/api/ws.client";

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
  const [foundUsers, setFoundUsers] = useState<ChatCompanion[]>([]);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [temporaryChat, setTemporaryChat] = useState<ChatItem | null>(null);
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
    const socket = getSocket();
    if (!socket) return;

    const handleChatNew = (chat: ChatItem) => {
      setChats((prev) => {
        const exists = prev.some((item) => item.id === chat.id);

        if (exists) {
          const updatedChats = prev.map((item) => {
            if (item.id !== chat.id) return item;
            return chat;
          });

          return sortChatsByUpdatedAt(updatedChats);
        }

        return sortChatsByUpdatedAt([chat, ...prev]);
      });

      setTemporaryChat((prev) => {
        if (prev?.id === chat.id) {
          return null;
        }

        return prev;
      });
    };

    socket.on("chat:new", handleChatNew);

    return () => {
      socket.off("chat:new", handleChatNew);
    };
  }, []);

  useEffect(() => {
    const trimmedSearch = search.trim();

    if (trimmedSearch.length < 2) {
      setFoundUsers([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const users = await searchUsersByLogin(trimmedSearch);
        setFoundUsers(users);
      } catch (error) {
        console.error("Ошибка поиска пользователей", error);
        setFoundUsers([]);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search]);

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

  const sidebarChats = useMemo(() => {
    if (!temporaryChat) {
      return chats;
    }

    const exists = chats.some((chat) => chat.id === temporaryChat.id);

    if (exists) {
      return chats;
    }

    return sortChatsByUpdatedAt([temporaryChat, ...chats]);
  }, [chats, temporaryChat]);

  const activeChat = useMemo(() => {
    if (temporaryChat && temporaryChat.id === activeChatId) {
      return temporaryChat;
    }

    return chats.find((chat) => chat.id === activeChatId) ?? null;
  }, [chats, activeChatId, temporaryChat]);

  const activeMessages = useMemo(() => {
    return messagesByChat[activeChatId] ?? [];
  }, [messagesByChat, activeChatId]);

  const activeTypingText = useMemo(() => {
    return typingByChat[activeChatId] ?? null;
  }, [typingByChat, activeChatId]);

  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);

    setTemporaryChat((prev) => {
      if (prev?.id === chatId) {
        return prev;
      }

      return null;
    });

    setUnreadByChat((prev) => {
      if (!prev[chatId]) return prev;

      return {
        ...prev,
        [chatId]: 0,
      };
    });
  }, []);

  const handleSelectUser = useCallback(
    async (userId: number) => {
      try {
        const directChat = await createOrGetDirectChat(userId);
        const existingChat = chats.find((chat) => chat.id === directChat.id);

        if (existingChat) {
          setActiveChatId(existingChat.id);
          setTemporaryChat(null);
        } else {
          setTemporaryChat(directChat);
          setActiveChatId(directChat.id);
        }

        setSearch("");
        setFoundUsers([]);
      } catch (error) {
        console.error("Ошибка открытия direct-чата", error);
      }
    },
    [chats],
  );

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

        const updatedChats = prev.map((chat) => {
          if (chat.id !== chatId) return chat;

          return {
            ...chat,
            lastMessage: message.text,
            updatedAt: message.createdAt,
          };
        });

        return sortChatsByUpdatedAt(updatedChats);
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
      />
    </Box>
  );
}
