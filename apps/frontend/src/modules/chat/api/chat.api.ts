import { apiClient } from "@/shared/api/apiClient";
import { ChatItem, MessageDto } from "@shared/modules/chat/model/types";

export const getChats = () => {
  return apiClient<ChatItem[]>("/chats");
};

export const getChatMessages = (chatId: string) => {
  return apiClient<MessageDto[]>(`/chats/${chatId}/messages`);
};
