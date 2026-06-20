import { useEffect } from "react";
import { useChatStore } from "../store/chat.store";
import { loadChatsAction } from "../actions/loadChats.action";
import { UserSearchResult } from "@shared/modules/user/model/types";
import { selectUserAction } from "../actions/selectUser.action";
import { useUiStore } from "@/modules/ui/store/ui.store";

export function useChatSidebar() {
  const chats = useChatStore((state) => state.chats);
  const draftChat = useChatStore((state) => state.draftChat);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const isChatsLoading = useChatStore((state) => state.isChatsLoading);
  const chatsError = useChatStore((state) => state.chatsError);
  const setActiveChatIdInStore = useChatStore((state) => state.setActiveChatId);
  const openMobileChat = useUiStore((state) => state.openMobileChat);

  useEffect(() => {
    void loadChatsAction();
  }, []);

  const sidebarChats = draftChat ? [draftChat, ...chats] : chats;

  const setActiveChatId = (chatId: string | null) => {
    setActiveChatIdInStore(chatId);
    openMobileChat();
  };

  const handleSelectUser = (user: UserSearchResult) => {
    selectUserAction(user);
  };

  return {
    chats: sidebarChats,
    activeChatId,
    isChatsLoading,
    chatsError,
    setActiveChatId,
    handleSelectUser,
  };
}
