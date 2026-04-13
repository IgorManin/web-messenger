import { useChatStore } from "../store/chat.store";
import { webChatApi } from "../api/chat.api-adapter";
import { CreateDirectFirstMessagePayload } from "@shared/modules/chat/model/types";
import { getSocket } from "@/modules/ws/api/ws.client";

export async function sendFirstMessageAction(
  payload: CreateDirectFirstMessagePayload,
) {
  const { setDraftChat, setChats, chats, setActiveChatId, setMessages } =
    useChatStore.getState();

  const response = await webChatApi.createDirectFirstMessage(payload);
  setDraftChat(null);

  const exists = chats.some((c) => c.id === response.chat.id);
  if (!exists) {
    setChats([response.chat, ...chats]);
  }

  setMessages(response.chat.id, [response.message]);

  setActiveChatId(response.chat.id);

  const socket = getSocket();
  if (socket) {
    socket.emit("chat:join", { chatId: response.chat.id }, () => {});
  }
}
