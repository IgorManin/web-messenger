import { useChatStore } from "../store/chat.store";
import { webChatApi } from "../api/chat.api-adapter";
import { loadMessages } from "@shared/modules/chat/services/load-messages";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Не удалось загрузить сообщения";
};

export async function loadMessagesAction(chatId: string) {
  const {
    setIsMessagesLoading,
    setMessagesError,
    setMessages,
    messagesByChat,
  } = useChatStore.getState();

  if (messagesByChat[chatId]) return;

  try {
    setIsMessagesLoading(true);
    setMessagesError(null);

    const messages = await loadMessages(webChatApi, chatId);
    setMessages(chatId, messages);
  } catch (error) {
    setMessagesError(getErrorMessage(error));
  } finally {
    setIsMessagesLoading(false);
  }
}
