"use client";

import { ChangeEvent, useMemo } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { ChatItem } from "@/modules/chat/model/types";

interface ChatSidebarProps {
  chats: ChatItem[];
  activeChatId: string;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectChat: (chatId: string) => void;
}

export function ChatSidebar({
  chats,
  activeChatId,
  search,
  onSearchChange,
  onSelectChat,
}: ChatSidebarProps) {
  const filteredChats = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return chats;

    return chats.filter((chat) => {
      return chat.title.toLowerCase().includes(value);
    });
  }, [chats, search]);

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
          placeholder="Поиск чатов..."
          value={search}
          onChange={handleSearchChange}
        />
      </Box>

      <Box sx={{ overflow: "auto" }}>
        {filteredChats.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Чаты не найдены
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filteredChats.map((chat) => {
              const isActive = chat.id === activeChatId;

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
                    primary={chat.title}
                    secondary={
                      <Box
                        component="span"
                        sx={{ display: "inline-block", mt: 0.5 }}
                      >
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 240,
                          }}
                        >
                          {chat.lastMessage}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {new Date(chat.updatedAt).toLocaleTimeString()}
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
