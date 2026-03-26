import { apiClient } from "@/shared/api/apiClient";
import { ChatCompanion, ChatItem } from "@/modules/chat/model/types";
import { MessageDto } from "@/modules/ws";

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

export function createOrGetDirectChat(targetUserId: number) {
  return apiClient<ChatItem>("/chats/direct", {
    method: "POST",
    body: JSON.stringify({ targetUserId }),
  });
}
