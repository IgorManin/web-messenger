import { useChatStore } from "../store/chat.store";
import { webChatApi } from "../api/chat.api-adapter";
import { loadChats } from "@shared/modules/chat/services/load-chats";
import { getSocket } from "@/modules/ws/api/ws.client";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Не удалось загрузить чаты";
};

export async function loadChatsAction() {
  const {
    setIsChatsLoading,
    setChatsError,
    setChats,
    setActiveChatId,
    activeChatId,
  } = useChatStore.getState();

  try {
    setIsChatsLoading(true);
    setChatsError(null);

    const result = await loadChats(webChatApi, activeChatId);

    setChats(result.chats);
    setActiveChatId(result.nextActiveChatId);

    const socket = getSocket();
    if (socket?.connected) {
      result.chats.forEach((chat) => {
        socket.emit("chat:join", { chatId: chat.id }, () => {});
      });
    }
  } catch (error) {
    setChatsError(getErrorMessage(error));
  } finally {
    setIsChatsLoading(false);
  }
}
