import { useEffect } from "react";
import { useChatStore } from "../store/chat.store";
import { loadMessagesAction } from "../actions/loadMessages.action";
import { sendFirstMessageAction } from "../actions/sendFirstMessage.action";
import { useWsMessages } from "@/modules/ws";
import { isDraftDirectChat } from "@/modules/chat/model/types";

export function useChatWindow() {
  const chats = useChatStore((state) => state.chats);
  const draftChat = useChatStore((state) => state.draftChat);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const messagesByChat = useChatStore((state) => state.messagesByChat);
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);
  const messagesError = useChatStore((state) => state.messagesError);

  const activeChat =
    draftChat?.id === activeChatId
      ? draftChat
      : (chats.find((c) => c.id === activeChatId) ?? null);

  const isDraft = isDraftDirectChat(activeChat);
  const messages =
    activeChatId && !isDraft ? (messagesByChat[activeChatId] ?? []) : [];

  const { sendMessage, notifyTyping } = useWsMessages({
    chatId: isDraft ? "" : (activeChatId ?? ""),
  });

  useEffect(() => {
    if (!activeChatId) return;
    if (isDraft) return;
    void loadMessagesAction(activeChatId);
  }, [activeChatId, isDraft]);

  const handleSendMessage = async (text: string) => {
    const value = text.trim();
    if (!value || !activeChat) return;

    if (isDraft && isDraftDirectChat(activeChat)) {
      await sendFirstMessageAction({
        targetUserId: activeChat.companion.id,
        text: value,
        clientMessageId: crypto.randomUUID(),
      });
      return;
    }

    if (!activeChatId) return;
    const ack = await sendMessage(value);
    useChatStore.getState().appendMessage(ack.chatId, ack);
  };

  return {
    activeChat,
    messages,
    isMessagesLoading,
    messagesError,
    handleSendMessage,
    notifyTyping,
    isDraft,
  };
}
