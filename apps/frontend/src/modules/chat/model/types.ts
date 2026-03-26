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
