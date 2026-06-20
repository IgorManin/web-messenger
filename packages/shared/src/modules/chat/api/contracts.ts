import {
  ChatItem,
  CreateDirectFirstMessagePayload,
  CreateDirectFirstMessageResponse,
  MessageDto,
} from "../model/types";

export interface ChatApi {
  getChats(): Promise<ChatItem[]>;
  getChatMessages(chatId: string): Promise<MessageDto[]>;
  createDirectFirstMessage(
    payload: CreateDirectFirstMessagePayload,
  ): Promise<CreateDirectFirstMessageResponse>;
}
