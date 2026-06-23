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
  useTheme,
} from "@mui/material";
import { ChatItem } from "@shared/modules/chat/model/types";
import { useChatStore } from "@/modules/chat/store/chat.store";
import { useUserStore } from "@/modules/user/store/user.store";
import { formatMessageTime } from "@/shared/utils/formatMessageTime";

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
  const theme = useTheme();
  const unreadByChat = useChatStore((state) => state.unreadByChat);
  const typingByChat = useChatStore((state) => state.typingByChat);
  const onlineUserIds = useUserStore((state) => state.onlineUserIds);

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
        const isTyping = typingByChat[chat.id] ?? false;
        const isCompanionOnline = chat.companion
          ? onlineUserIds.has(chat.companion.id)
          : false;

        return (
          <ListItemButton
            key={chat.id}
            selected={chat.id === activeChatId}
            onClick={() => onSelectChat(chat.id)}
            sx={{
              borderBottom: "1px solid",
              borderColor: "divider",
              py: 1.5,
              mb: 0.5,
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, overflow: "hidden" }}>
                    <Typography fontWeight={600} noWrap>
                      {chat.title}
                    </Typography>
                    {isCompanionOnline && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: theme.palette.status.online,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Box>
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
                <Box
                  component="span"
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={isTyping ? { fontStyle: "italic" } : undefined}
                  >
                    {isTyping
                      ? "печатает..."
                      : chat.lastMessage || "Нет сообщений"}
                  </Typography>
                  {chat.updatedAt && (
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {formatMessageTime(chat.updatedAt)}
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItemButton>
        );
      })}
    </List>
  );
};
