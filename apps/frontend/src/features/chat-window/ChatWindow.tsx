"use client";

import { Box, Paper, Typography } from "@mui/material";
import { useChatWindow } from "@/modules/chat/hooks/useChatWindow";
import { useUserStore } from "@/modules/user/store/user.store";
import { ChatWindowHeader } from "./ChatWindowHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatMessageInput } from "./ChatMessageInput";

export const ChatWindow = () => {
  const {
    activeChat,
    messages,
    isMessagesLoading,
    messagesError,
    handleSendMessage,
    notifyTyping,
  } = useChatWindow();

  const myUser = useUserStore((state) => state.user);

  if (!activeChat) {
    return (
      <Paper
        variant="outlined"
        sx={{ height: "100%", display: "grid", placeItems: "center", p: 2 }}
      >
        <Typography color="text.secondary">Выбери чат слева</Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        minHeight: 0,
      }}
    >
      <ChatWindowHeader activeChat={activeChat} />

      <ChatMessageList
        messages={messages}
        isLoading={isMessagesLoading}
        error={messagesError}
        myUser={myUser}
        activeChat={activeChat}
      />

      <ChatMessageInput
        onSend={handleSendMessage}
        notifyTyping={notifyTyping}
      />
    </Box>
  );
};
