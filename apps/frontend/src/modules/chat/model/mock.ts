import { ChatItem, MessagesByChat } from "./types";

export const mockChats: ChatItem[] = [
  {
    id: "global",
    title: "Общий чат",
    type: "group",
    lastMessage: "Последнее сообщение в общем чате",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ivan",
    title: "Иван Петров",
    type: "direct",
    lastMessage: "Привет, как дела?",
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "anna",
    title: "Анна",
    type: "direct",
    lastMessage: "Посмотри, пожалуйста, макеты",
    updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "design-team",
    title: "Design Team",
    type: "group",
    lastMessage: "Обновили UI-kit",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
];

export const mockMessagesByChat: MessagesByChat = {
  global: [
    {
      id: "g-1",
      clientMessageId: "g-1",
      chatId: "global",
      text: "Добро пожаловать в общий чат",
      authorId: "system",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ],
  ivan: [
    {
      id: "i-1",
      clientMessageId: "i-1",
      chatId: "ivan",
      text: "Привет, как дела?",
      authorId: "ivan",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
  ],
  anna: [
    {
      id: "a-1",
      clientMessageId: "a-1",
      chatId: "anna",
      text: "Посмотри, пожалуйста, макеты",
      authorId: "anna",
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
  ],
  "design-team": [
    {
      id: "d-1",
      clientMessageId: "d-1",
      chatId: "design-team",
      text: "Обновили UI-kit",
      authorId: "designer",
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
  ],
};
