import { useChatStore } from "../store/chat.store";
import { UserSearchResult } from "@shared/modules/user/model/types";

export function selectUserAction(user: UserSearchResult) {
  const { chats, setActiveChatId, setDraftChat, draftChat } =
    useChatStore.getState();

  const existingChat = chats.find((chat) => chat.companion?.id === user.id);

  if (existingChat) {
    setDraftChat(null);
    setActiveChatId(existingChat.id);
    return;
  }

  if (draftChat?.companion.id === user.id) {
    setActiveChatId(draftChat.id);
    return;
  }

  // Создаём новый draft
  const draftId = `draft:${user.id}`;

  setDraftChat({
    id: draftId,
    type: "direct",
    title: user.login,
    lastMessage: "",
    updatedAt: new Date().toISOString(),
    companion: user,
    isDraft: true,
  });

  setActiveChatId(draftId);
}
