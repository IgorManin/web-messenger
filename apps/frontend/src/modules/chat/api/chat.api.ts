import { apiClient } from "@/shared/api/apiClient";
import type { ChatItem } from "@/modules/chat/model/types";
import { MessageDto } from "@/modules/ws";

export function getChats() {
  return apiClient<ChatItem[]>("/chats");
}

export function getChatMessages(chatId: string) {
  return apiClient<MessageDto[]>(`/chats/${chatId}/messages`);
}
