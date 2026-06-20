import { ChatItem } from "@shared/modules/chat/model/types";
import { UserSearchResult } from "@shared/modules/user/model/types";

export interface DraftDirectChat {
  id: string;
  title: string;
  type: "direct";
  lastMessage: string;
  updatedAt: string;
  companion: UserSearchResult;
  isDraft: true;
}

export type ActiveChat = ChatItem | DraftDirectChat;

export const isDraftDirectChat = (
  chat: ActiveChat | null | undefined,
): chat is DraftDirectChat => {
  return Boolean(chat && "isDraft" in chat && chat.isDraft);
};
