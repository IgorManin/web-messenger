import { useEffect } from "react";
import { useChatStore } from "../store/chat.store";
import { loadChatsAction } from "../actions/loadChats.action";
import { UserSearchResult } from "@shared/modules/user/model/types";
import { selectUserAction } from "../actions/selectUser.action";

export function useChatSidebar() {
  const chats = useChatStore((state) => state.chats);
  const draftChat = useChatStore((state) => state.draftChat);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const isChatsLoading = useChatStore((state) => state.isChatsLoading);
  const chatsError = useChatStore((state) => state.chatsError);
  const setActiveChatId = useChatStore((state) => state.setActiveChatId);

  useEffect(() => {
    void loadChatsAction();
  }, []);

  const sidebarChats = draftChat ? [draftChat, ...chats] : chats;

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
