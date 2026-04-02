import { apiClient } from "@/shared/api/apiClient";
import { ChatCompanion, ChatItem } from "@/modules/chat/model/types";
import { MessageDto } from "@/modules/ws";

type CreateDirectFirstMessageResponse = {
  chat: ChatItem;
  message: MessageDto;
  createdChat: boolean;
};

export function getChats() {
  return apiClient<ChatItem[]>("/chats");
}

export function getChatMessages(chatId: string) {
  return apiClient<MessageDto[]>(`/chats/${chatId}/messages`);
}

export function searchUsersByLogin(login: string) {
  const searchParams = new URLSearchParams({ login });

  return apiClient<ChatCompanion[]>(`/users/search?${searchParams.toString()}`);
}

export function createDirectFirstMessage(payload: {
  targetUserId: number;
  text: string;
  clientMessageId?: string;
}) {
  return apiClient<CreateDirectFirstMessageResponse>(
    "/chats/direct/first-message",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
