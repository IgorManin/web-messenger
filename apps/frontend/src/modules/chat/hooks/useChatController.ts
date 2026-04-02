"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActiveChat,
  ChatCompanion,
  ChatItem,
  DraftDirectChat,
  MessagesByChat,
  isDraftDirectChat,
} from "@/modules/chat/model/types";
import {
  getChatMessages,
  getChats,
  searchUsersByLogin,
} from "@/modules/chat/api/chat.api";
import { getSocket } from "@/modules/ws/api/ws.client";
import { MessageDto } from "@/modules/ws";
import { useChatSocket } from "@/modules/ws/hooks/useChatSocket";

const sortChatsByUpdatedAt = (chats: ChatItem[]) => {
  return [...chats].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
};

type UseChatControllerParams = {
  myUserId: string | null;
};

export function useChatController({ myUserId }: UseChatControllerParams) {
  const [search, setSearch] = useState("");
  const [foundUsers, setFoundUsers] = useState<ChatCompanion[]>([]);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [temporaryChat, setTemporaryChat] = useState<DraftDirectChat | null>(
    null,
  );
  const [messagesByChat, setMessagesByChat] = useState<MessagesByChat>({});
  const [loadedChats, setLoadedChats] = useState<Record<string, boolean>>({});
  const [unreadByChat, setUnreadByChat] = useState<Record<string, number>>({});
  const [typingByChat, setTypingByChat] = useState<
    Record<string, string | null>
  >({});
  const [activeChatId, setActiveChatId] = useState("");

  const joinChatRoom = useCallback((chatId: string) => {
    const socket = getSocket();
    if (!socket || !chatId || chatId.startsWith("draft:")) return;

    socket.emit("chat:join", { chatId }, (response: { ok?: boolean }) => {
      if (!response?.ok) {
        console.error("Не удалось войти в комнату чата", chatId);
      }
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
          const hasSameId = item.id === message.id;

          const hasSameClientMessageId =
            !!item.clientMessageId &&
            !!message.clientMessageId &&
            item.clientMessageId === message.clientMessageId;

          return hasSameId || hasSameClientMessageId;
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
        if (!existingChat) return prev;

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

  const handleChatNew = useCallback((chat: ChatItem) => {
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
      if (
        prev &&
        prev.type === "direct" &&
        prev.companion.id === chat.companion?.id
      ) {
        return null;
      }

      return prev;
    });
  }, []);

  const handleMessageNew = useCallback(
    (message: MessageDto) => {
      onAppendMessage(message.chatId, message);
    },
    [onAppendMessage],
  );

  const handleTypingUpdate = useCallback(
    (payload: { chatId: string; userId: string; isTyping: boolean }) => {
      onTypingChange(payload.chatId, {
        userId: payload.userId,
        isTyping: payload.isTyping,
      });
    },
    [onTypingChange],
  );

  useChatSocket({
    myUserId,
    onChatNew: handleChatNew,
    onMessageNew: handleMessageNew,
    onTypingUpdate: handleTypingUpdate,
  });

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
    chats.forEach((chat) => {
      joinChatRoom(chat.id);
    });
  }, [chats, joinChatRoom]);

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
    if (activeChatId.startsWith("draft:")) return;
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

    const exists = chats.some((chat) => {
      return (
        chat.type === "direct" &&
        chat.companion?.id === temporaryChat.companion.id
      );
    });

    if (exists) {
      return chats;
    }

    return [temporaryChat, ...chats];
  }, [chats, temporaryChat]);

  const activeChat = useMemo<ActiveChat | null>(() => {
    if (temporaryChat && temporaryChat.id === activeChatId) {
      return temporaryChat;
    }

    return chats.find((chat) => chat.id === activeChatId) ?? null;
  }, [temporaryChat, chats, activeChatId]);

  const activeMessages = useMemo(() => {
    if (!activeChat || isDraftDirectChat(activeChat)) {
      return [];
    }

    return messagesByChat[activeChat.id] ?? [];
  }, [activeChat, messagesByChat]);

  const activeTypingText = useMemo(() => {
    if (!activeChat || isDraftDirectChat(activeChat)) {
      return null;
    }

    return typingByChat[activeChat.id] ?? null;
  }, [activeChat, typingByChat]);

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

  const handleSelectUser = useCallback(
    (userId: number) => {
      const existingChat = chats.find((chat) => {
        return chat.type === "direct" && chat.companion?.id === userId;
      });

      if (existingChat) {
        setActiveChatId(existingChat.id);
        setTemporaryChat(null);
        setSearch("");
        setFoundUsers([]);
        return;
      }

      const selectedUser = foundUsers.find((user) => user.id === userId);

      if (!selectedUser) {
        return;
      }

      const draftChatId = `draft:${userId}`;

      setTemporaryChat({
        id: draftChatId,
        type: "direct",
        title: selectedUser.login,
        lastMessage: "",
        updatedAt: new Date().toISOString(),
        companion: selectedUser,
        isDraft: true,
      });

      setActiveChatId(draftChatId);
      setSearch("");
      setFoundUsers([]);
    },
    [chats, foundUsers],
  );

  const handleDraftChatCreated = useCallback(
    ({
      draftChatId,
      realChat,
      firstMessage,
    }: {
      draftChatId: string;
      realChat: ChatItem;
      firstMessage: MessageDto;
    }) => {
      setTemporaryChat((prev) => {
        if (prev?.id !== draftChatId) return prev;
        return null;
      });

      setChats((prev) => {
        const exists = prev.some((chat) => chat.id === realChat.id);

        if (exists) {
          const updated = prev.map((chat) =>
            chat.id === realChat.id ? realChat : chat,
          );

          return sortChatsByUpdatedAt(updated);
        }

        return sortChatsByUpdatedAt([realChat, ...prev]);
      });

      setMessagesByChat((prev) => ({
        ...prev,
        [realChat.id]: [firstMessage],
      }));

      setLoadedChats((prev) => ({
        ...prev,
        [realChat.id]: true,
      }));

      setActiveChatId(realChat.id);
      joinChatRoom(realChat.id);
    },
    [joinChatRoom],
  );

  return {
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
  };
}
