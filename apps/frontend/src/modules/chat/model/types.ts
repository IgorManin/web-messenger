import { MessageDto } from "@/modules/ws";

export type ChatType = "direct" | "group";

export type MessagesByChat = Record<string, MessageDto[]>;

export type ChatCompanion = {
  id: number;
  login: string;
};

export interface ChatItem {
  id: string;
  title: string;
  type: ChatType;
  lastMessage: string;
  updatedAt: string;
  companion: ChatCompanion | null;
}

export interface DraftDirectChat {
  id: string;
  title: string;
  type: "direct";
  lastMessage: string;
  updatedAt: string;
  companion: ChatCompanion;
  isDraft: true;
}

export type ActiveChat = ChatItem | DraftDirectChat;

export const isDraftDirectChat = (
  chat: ActiveChat | null | undefined,
): chat is DraftDirectChat => {
  return Boolean(chat && "isDraft" in chat && chat.isDraft);
};
