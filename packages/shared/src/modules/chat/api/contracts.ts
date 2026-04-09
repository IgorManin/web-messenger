import { ChatItem, MessageDto } from "../model/types";

export interface ChatApi {
  getChats(): Promise<ChatItem[]>;
  getChatMessages(chatId: string): Promise<MessageDto[]>;
}
