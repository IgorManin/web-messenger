import { UserSearchResult } from "../../user/model/types";

export type ChatType = "direct" | "group";

export type ChatItem = {
  id: string;
  title: string;
  type: ChatType;
  lastMessage: string;
  updatedAt: string;
  companion: UserSearchResult | null;
};

export type MessageDto = {
  id: string;
  chatId: string;
  text: string;
  authorId: string;
  createdAt: string;
  clientMessageId: string | null;
};

export type CreateDirectFirstMessageResponse = {
  chat: ChatItem;
  message: MessageDto;
  createdChat: boolean;
};

export type CreateDirectFirstMessagePayload = {
  targetUserId: number;
  text: string;
  clientMessageId?: string;
};
