import { ChatItem, MessageDto } from "@shared/modules/chat/model/types";

export type { MessageDto };

export type ChatJoinDto = {
  chatId: string;
};

export type SendMessageDto = {
  chatId: string;
  text: string;
  clientMessageId?: string;
};

export type TypingUpdateDto = {
  chatId: string;
  isTyping: boolean;
};

export type TypingEventDto = {
  chatId: string;
  userId: string;
  isTyping: boolean;
};

export type ServerToClientEvents = {
  "message:new": (message: MessageDto) => void;
  "typing:update": (payload: TypingEventDto) => void;
  "chat:new": (chat: ChatItem) => void;
};

export interface ClientToServerEvents {
  "chat:join": (
    payload: ChatJoinDto,
    cb: (response: { ok?: boolean }) => void,
  ) => void;

  "message:new": (
    payload: SendMessageDto & { clientMessageId: string },
    cb: (message: MessageDto) => void,
  ) => void;

  "typing:update": (payload: TypingUpdateDto) => void;
}
