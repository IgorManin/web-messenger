import { ChatApi } from "../api/contracts";
import { ChatItem } from "../model/types";

type LoadChatsResult = {
  chats: ChatItem[];
  nextActiveChatId: string | null;
};

export async function loadChats(
  api: ChatApi,
  activeChatId: string | null,
): Promise<LoadChatsResult> {
  const chats = await api.getChats();

  return {
    chats,
    nextActiveChatId: activeChatId ?? chats[0]?.id ?? null,
  };
}
