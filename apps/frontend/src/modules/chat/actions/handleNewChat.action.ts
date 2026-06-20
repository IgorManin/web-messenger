import { useChatStore } from "../store/chat.store";
import { getSocket } from "@/modules/ws/api/ws.client";
import { ChatItem } from "@shared/modules/chat/model/types";

export function handleNewChatAction(chat: ChatItem) {
  const {
    chats,
    setChats,
    incrementUnread,
    draftChat,
    setDraftChat,
    activeChatId,
    setActiveChatId,
    resetUnread,
  } = useChatStore.getState();

  const exists = chats.some((c) => c.id === chat.id);
  if (exists) return;

  setChats([chat, ...chats]);

  const socket = getSocket();
  if (socket) {
    socket.emit("chat:join", { chatId: chat.id }, () => {});
  }

  const isDraftMaterialized = draftChat?.companion.id === chat.companion?.id;

  if (isDraftMaterialized) {
    setDraftChat(null);
    if (activeChatId === draftChat!.id) {
      setActiveChatId(chat.id);
    }
    resetUnread(chat.id);
  } else if (chat.lastMessage) {
    incrementUnread(chat.id);
  }
}
