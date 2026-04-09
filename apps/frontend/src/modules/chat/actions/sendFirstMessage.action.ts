import { useChatStore } from "../store/chat.store";
import { webChatApi } from "../api/chat.api-adapter";
import { CreateDirectFirstMessagePayload } from "@shared/modules/chat/model/types";

export async function sendFirstMessageAction(
  payload: CreateDirectFirstMessagePayload,
) {
  const { setDraftChat, setChats, chats, setActiveChatId, setMessages } =
    useChatStore.getState();

  const response = await webChatApi.createDirectFirstMessage(payload);
  console.log("console.log(response.chat)", response.chat);
  // Убираем draft
  setDraftChat(null);

  // Добавляем реальный чат в список
  const exists = chats.some((c) => c.id === response.chat.id);
  if (!exists) {
    setChats([response.chat, ...chats]);
  }

  // Сохраняем первое сообщение
  setMessages(response.chat.id, [response.message]);

  // Переключаемся на реальный чат
  setActiveChatId(response.chat.id);
}
