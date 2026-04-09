import { useEffect } from "react";
import { useChatStore } from "../store/chat.store";
import { loadMessagesAction } from "../actions/loadMessages.action";
import { useWsMessages } from "@/modules/ws";

export function useChatWindow() {
  const chats = useChatStore((state) => state.chats);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const messagesByChat = useChatStore((state) => state.messagesByChat);
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);
  const messagesError = useChatStore((state) => state.messagesError);

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;
  const messages = activeChatId ? (messagesByChat[activeChatId] ?? []) : [];

  const { sendMessage } = useWsMessages({ chatId: activeChatId ?? "" });

  useEffect(() => {
    if (!activeChatId) return;
    void loadMessagesAction(activeChatId);
  }, [activeChatId]);

  const handleSendMessage = async (text: string) => {
    const value = text.trim();
    if (!value || !activeChatId) return;

    const ack = await sendMessage(value);
    useChatStore.getState().appendMessage(ack.chatId, ack);
  };

  return {
    activeChat,
    messages,
    isMessagesLoading,
    messagesError,
    handleSendMessage,
  };
}
