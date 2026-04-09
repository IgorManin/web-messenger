export type ChatItem = {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
};

export type MessageDto = {
  id: string;
  chatId: string;
  text: string;
  authorId: string;
  createdAt: string;
  clientMessageId: string | null;
};
