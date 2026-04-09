import { create } from "zustand";
import { ChatItem } from "@shared/modules/chat/model/types";
import { MessageDto } from "@/modules/ws";

type ChatStoreState = {
  chats: ChatItem[];
  activeChatId: string | null;
  isChatsLoading: boolean;
  chatsError: string | null;
  messagesByChat: Record<string, MessageDto[]>;
  isMessagesLoading: boolean;
  messagesError: string | null;
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
};

export const useChatStore = create<ChatStore>((set) => ({
  ...initialState,

  setChats: (chats) => set({ chats }),
  setActiveChatId: (chatId) => set({ activeChatId: chatId }),
  setIsChatsLoading: (value) => set({ isChatsLoading: value }),
  setChatsError: (error) => set({ chatsError: error }),
  resetChatsState: () => set(initialState),

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

      return {
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: [...current, message],
        },
      };
    }),

  setIsMessagesLoading: (value) => set({ isMessagesLoading: value }),
  setMessagesError: (error) => set({ messagesError: error }),
}));
