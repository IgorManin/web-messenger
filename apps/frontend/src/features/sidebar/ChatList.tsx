import {
  Avatar,
  Badge,
  Box,
  CircularProgress,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { ChatItem } from "@shared/modules/chat/model/types";
import { useChatStore } from "@/modules/chat/store/chat.store";

interface ChatListProps {
  chats: ChatItem[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const ChatList = ({
  chats,
  activeChatId,
  onSelectChat,
  isLoading,
  error,
}: ChatListProps) => {
  const unreadByChat = useChatStore((state) => state.unreadByChat);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (chats.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Чатов пока нет
        </Typography>
      </Box>
    );
  }

  return (
    <List disablePadding>
      {chats.map((chat) => {
        const unread = unreadByChat[chat.id] ?? 0;

        return (
          <ListItemButton
            key={chat.id}
            selected={chat.id === activeChatId}
            onClick={() => onSelectChat(chat.id)}
            sx={{
              borderBottom: "1px solid",
              borderColor: "divider",
              py: 1.5,
            }}
          >
            <ListItemAvatar>
              <Avatar
                src={chat.companion?.avatarUrl ?? undefined}
                sx={{ width: 40, height: 40 }}
              >
                {chat.title.slice(0, 2).toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography fontWeight={600} noWrap>
                    {chat.title}
                  </Typography>
                  {unread > 0 && (
                    <Badge
                      badgeContent={unread}
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              }
              secondary={
                <Typography variant="body2" color="text.secondary" noWrap>
                  {chat.lastMessage || "Нет сообщений"}
                </Typography>
              }
            />
          </ListItemButton>
        );
      })}
    </List>
  );
};
