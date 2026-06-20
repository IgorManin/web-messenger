"use client";

import {
  Avatar,
  Box,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { ChatItem } from "@shared/modules/chat/model/types";
import { DraftDirectChat } from "@/modules/chat/model/types";
import { useChatStore } from "@/modules/chat/store/chat.store";
import { useUiStore } from "@/modules/ui/store/ui.store";

interface ChatWindowHeaderProps {
  activeChat: ChatItem | DraftDirectChat;
}

export const ChatWindowHeader = ({ activeChat }: ChatWindowHeaderProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const companion = activeChat.companion;
  const avatarUrl = companion?.avatarUrl ?? null;
  const initials = activeChat.title.slice(0, 2).toUpperCase();
  const typingByChat = useChatStore((state) => state.typingByChat);
  const closeMobileChat = useUiStore((state) => state.closeMobileChat);
  const isTyping = typingByChat[activeChat.id] ?? false;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: isMobile ? "center" : "flex-start",
          justifyContent: isMobile ? "center" : "flex-start",
          gap: 1,
          position: "relative",
        }}
      >
        {isMobile && (
          <IconButton
            onClick={() => closeMobileChat()}
            size="small"
            sx={{
              position: "absolute",
              left: 0,
              color: theme.palette.text.secondary,
              "&:hover": {
                backgroundColor: theme.palette.interactive.hover,
              },
            }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar src={avatarUrl ?? undefined} sx={{ width: 36, height: 36 }}>
            {initials}
          </Avatar>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                lineHeight: 1,
              }}
              variant="h6"
            >
              {activeChat.title}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                visibility: isTyping ? "visible" : "hidden",
              }}
            >
              печатает...
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
