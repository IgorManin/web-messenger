import { MessageDto } from "@/modules/ws";

export type ChatType = "direct" | "group";

export interface ChatItem {
  id: string;
  title: string;
  type: ChatType;
  lastMessage: string;
  updatedAt: string;
}

export type MessagesByChat = Record<string, MessageDto[]>;
