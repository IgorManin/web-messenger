import {
  createDirectFirstMessage,
  getChatMessages,
  getChats,
} from "./chat.api";
import { ChatApi } from "@shared/modules/chat/api/contracts";

export const webChatApi: ChatApi = {
  getChats,
  getChatMessages,
  createDirectFirstMessage,
};
