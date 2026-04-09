import { apiClient } from "@/shared/api/apiClient";
import {
  ChatItem,
  CreateDirectFirstMessagePayload,
  CreateDirectFirstMessageResponse,
  MessageDto,
} from "@shared/modules/chat/model/types";

export const getChats = () => {
  return apiClient<ChatItem[]>("/chats");
};

export const getChatMessages = (chatId: string) => {
  return apiClient<MessageDto[]>(`/chats/${chatId}/messages`);
};

export const createDirectFirstMessage = (
  payload: CreateDirectFirstMessagePayload,
) => {
  return apiClient<CreateDirectFirstMessageResponse>(
    "/chats/direct/first-message",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
};
