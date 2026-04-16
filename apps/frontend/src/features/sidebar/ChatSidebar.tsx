"use client";

import { Box, InputAdornment, Paper, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useChatSidebar } from "@/modules/chat/hooks/useChatSidebar";
import { useCurrentUser } from "@/modules/user/hooks/useCurrentUser";
import { useUserSearch } from "@/modules/user/hooks/useUserSearch";
import { SidebarUserProfile } from "@/features/sidebar/SidebarUserProfile";
import { ChatList } from "@/features/sidebar/ChatList";
import { UserSearchList } from "@/features/sidebar/UserSearchList";

export const ChatSidebar = () => {
  const {
    chats,
    activeChatId,
    isChatsLoading,
    chatsError,
    setActiveChatId,
    handleSelectUser,
  } = useChatSidebar();

  const { user } = useCurrentUser();

  const {
    search,
    setSearch,
    foundUsers,
    isSearching,
    isSearchMode,
    clearSearch,
  } = useUserSearch();

  const onSelectUser = (userId: number) => {
    const user = foundUsers.find((u) => u.id === userId);
    if (!user) return;

    handleSelectUser(user);
    clearSearch();
  };

  return (
    <Paper
      sx={{
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto auto auto 1fr",
        overflow: "hidden",
        padding: "0 10px 0 10px",
        background: "rgba(9,30,50,0.66)",
      }}
    >
      <SidebarUserProfile user={user} />

      <Box sx={{ px: 2, py: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Поиск"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ overflow: "auto" }}>
        {isSearchMode ? (
          <UserSearchList
            users={foundUsers}
            onSelectUser={onSelectUser}
            isLoading={isSearching}
          />
        ) : (
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={setActiveChatId}
            isLoading={isChatsLoading}
            error={chatsError}
          />
        )}
      </Box>
    </Paper>
  );
};
