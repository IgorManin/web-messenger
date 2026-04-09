import {
  Avatar,
  Box,
  CircularProgress,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { UserSearchResult } from "@shared/modules/user/model/types";

interface UserSearchListProps {
  users: UserSearchResult[];
  onSelectUser: (userId: number) => void;
  isLoading?: boolean;
}

export const UserSearchList = ({
  users,
  onSelectUser,
  isLoading,
}: UserSearchListProps) => {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Пользователи не найдены
        </Typography>
      </Box>
    );
  }

  return (
    <List disablePadding>
      {users.map((user) => (
        <ListItemButton
          key={user.id}
          onClick={() => onSelectUser(user.id)}
          sx={{ borderBottom: "1px solid", borderColor: "divider" }}
        >
          <ListItemAvatar>
            <Avatar src={user.avatarUrl ?? undefined}>
              {user.login.slice(0, 2).toUpperCase()}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={<Typography fontWeight={500}>{user.login}</Typography>}
            secondary={
              <Typography variant="body2" color="text.secondary">
                Открыть диалог
              </Typography>
            }
          />
        </ListItemButton>
      ))}
    </List>
  );
};
