import { ChatApi } from "../api/contracts";
import { MessageDto } from "../model/types";

export async function loadMessages(
  api: ChatApi,
  chatId: string,
): Promise<MessageDto[]> {
  return api.getChatMessages(chatId);
}
