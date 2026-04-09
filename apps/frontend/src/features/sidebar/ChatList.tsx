import {
  Box,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { ChatItem } from "@shared/modules/chat/model/types";

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
      {chats.map((chat) => (
        <ListItemButton
          key={chat.id}
          selected={chat.id === activeChatId}
          onClick={() => onSelectChat(chat.id)}
          sx={{
            alignItems: "flex-start",
            borderBottom: "1px solid",
            borderColor: "divider",
            py: 1.5,
          }}
        >
          <ListItemText
            primary={
              <Typography fontWeight={600} noWrap>
                {chat.title}
              </Typography>
            }
            secondary={
              <Typography variant="body2" color="text.secondary" noWrap>
                {chat.lastMessage || "Нет сообщений"}
              </Typography>
            }
          />
        </ListItemButton>
      ))}
    </List>
  );
};
