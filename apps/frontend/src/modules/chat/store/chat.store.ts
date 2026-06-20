import { create } from "zustand";
import { ChatItem, MessageDto } from "@shared/modules/chat/model/types";
import { DraftDirectChat } from "@/modules/chat/model/types";

type ChatStoreState = {
  chats: ChatItem[];
  activeChatId: string | null;
  isChatsLoading: boolean;
  chatsError: string | null;
  messagesByChat: Record<string, MessageDto[]>;
  isMessagesLoading: boolean;
  messagesError: string | null;
  draftChat: DraftDirectChat | null;
  unreadByChat: Record<string, number>;
  typingByChat: Record<string, boolean>;
  loadedChats: Set<string>;
};

type ChatStoreActions = {
  setChats: (chats: ChatItem[]) => void;
  setActiveChatId: (chatId: string | null) => void;
  setIsChatsLoading: (value: boolean) => void;
  setChatsError: (error: string | null) => void;
  resetChatsState: () => void;
  setMessages: (chatId: string, messages: MessageDto[]) => void;
  appendMessage: (chatId: string, message: MessageDto) => void;
  setIsMessagesLoading: (value: boolean) => void;
  setMessagesError: (error: string | null) => void;
  setDraftChat: (chat: DraftDirectChat | null) => void;
  incrementUnread: (chatId: string) => void;
  resetUnread: (chatId: string) => void;
  setTyping: (chatId: string, isTyping: boolean) => void;
  markChatLoaded: (chatId: string) => void;
};

type ChatStore = ChatStoreState & ChatStoreActions;

const initialState: ChatStoreState = {
  chats: [],
  activeChatId: null,
  isChatsLoading: false,
  chatsError: null,
  messagesByChat: {},
  isMessagesLoading: false,
  messagesError: null,
  draftChat: null,
  unreadByChat: {},
  typingByChat: {},
  loadedChats: new Set<string>(),
};

export const useChatStore = create<ChatStore>((set) => ({
  ...initialState,

  setChats: (chats) => set({ chats }),
  setIsChatsLoading: (value) => set({ isChatsLoading: value }),
  setChatsError: (error) => set({ chatsError: error }),
  resetChatsState: () => set(initialState),
  setActiveChatId: (chatId) =>
    set((state) => ({
      activeChatId: chatId,
      unreadByChat: {
        ...state.unreadByChat,
        ...(chatId ? { [chatId]: 0 } : {}),
      },
    })),

  setMessages: (chatId, messages) =>
    set((state) => ({
      messagesByChat: { ...state.messagesByChat, [chatId]: messages },
    })),

  appendMessage: (chatId, message) =>
    set((state) => {
      const current = state.messagesByChat[chatId] ?? [];
      const alreadyExists = current.some(
        (m) =>
          m.id === message.id ||
          (m.clientMessageId && m.clientMessageId === message.clientMessageId),
      );

      if (alreadyExists) return state;

      const updatedMessagesByChat = {
        ...state.messagesByChat,
        [chatId]: [...current, message],
      };

      const updatedChats = state.chats
        .map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                lastMessage: message.text,
                updatedAt: message.createdAt,
              }
            : chat,
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );

      return {
        messagesByChat: updatedMessagesByChat,
        chats: updatedChats,
      };
    }),

  incrementUnread: (chatId) =>
    set((state) => ({
      unreadByChat: {
        ...state.unreadByChat,
        [chatId]: (state.unreadByChat[chatId] ?? 0) + 1,
      },
    })),

  resetUnread: (chatId) =>
    set((state) => ({
      unreadByChat: {
        ...state.unreadByChat,
        [chatId]: 0,
      },
    })),

  setIsMessagesLoading: (value) => set({ isMessagesLoading: value }),
  setMessagesError: (error) => set({ messagesError: error }),
  setDraftChat: (chat) => set({ draftChat: chat }),

  setTyping: (chatId, isTyping) =>
    set((state) => ({
      typingByChat: { ...state.typingByChat, [chatId]: isTyping },
    })),

  markChatLoaded: (chatId) =>
    set((state) => ({
      loadedChats: new Set([...state.loadedChats, chatId]),
    })),
}));
