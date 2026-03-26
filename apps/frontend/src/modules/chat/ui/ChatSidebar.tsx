"use client";

import { ChangeEvent } from "react";
import {
  Badge,
  Box,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { ChatCompanion, ChatItem } from "@/modules/chat/model/types";

interface ChatSidebarProps {
  chats: ChatItem[];
  foundUsers: ChatCompanion[];
  unreadByChat: Record<string, number>;
  activeChatId: string;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectChat: (chatId: string) => void;
  onSelectUser: (userId: number) => void;
}

const formatChatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (isYesterday) {
    return "Вчера";
  }

  return date.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
};

export function ChatSidebar({
  chats,
  foundUsers,
  unreadByChat,
  activeChatId,
  search,
  onSearchChange,
  onSelectChat,
  onSelectUser,
}: ChatSidebarProps) {
  const trimmedSearch = search.trim();
  const isSearchMode = trimmedSearch.length >= 2;

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Чаты
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Поиск пользователей..."
          value={search}
          onChange={handleSearchChange}
        />
      </Box>

      <Box sx={{ overflow: "auto" }}>
        {isSearchMode ? (
          foundUsers.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Пользователи не найдены
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {foundUsers.map((user) => (
                <ListItemButton
                  key={user.id}
                  onClick={() => onSelectUser(user.id)}
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body1">{user.login}</Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Открыть диалог
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          )
        ) : chats.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Чаты не найдены
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {chats.map((chat) => {
              const isActive = chat.id === activeChatId;
              const unreadCount = unreadByChat[chat.id] ?? 0;

              return (
                <ListItemButton
                  key={chat.id}
                  selected={isActive}
                  onClick={() => onSelectChat(chat.id)}
                  sx={{
                    alignItems: "flex-start",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {chat.title}
                        </Typography>

                        {unreadCount > 0 ? (
                          <Badge color="primary" badgeContent={unreadCount} />
                        ) : null}
                      </Box>
                    }
                    secondary={
                      <Box
                        component="span"
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          gap: 1,
                          mt: 0.5,
                          alignItems: "start",
                        }}
                      >
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 220,
                          }}
                        >
                          {chat.lastMessage}
                        </Typography>

                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {formatChatTime(chat.updatedAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Box>
    </Paper>
  );
}
