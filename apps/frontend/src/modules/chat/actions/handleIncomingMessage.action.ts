import { useChatStore } from "../store/chat.store";
import { useUserStore } from "@/modules/user/store/user.store";
import { MessageDto } from "@shared/modules/chat/model/types";

export function handleIncomingMessageAction(message: MessageDto) {
  const { activeChatId, appendMessage, incrementUnread, incrementIncomingCount } =
    useChatStore.getState();
  const myUserId = useUserStore.getState().user?.id;

  appendMessage(message.chatId, message);

  const isIncoming = String(myUserId) !== message.authorId;
  const isInactiveChat = message.chatId !== activeChatId;

  if (isIncoming && isInactiveChat) {
    incrementUnread(message.chatId);
    incrementIncomingCount();
  }
}
