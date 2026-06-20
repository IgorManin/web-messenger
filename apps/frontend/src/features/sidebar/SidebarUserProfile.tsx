"use client";

import {
  Avatar,
  Box,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useRouter } from "next/navigation";
import { CurrentUser } from "@shared/modules/user/model/types";

interface SidebarUserProfileProps {
  user: CurrentUser | null;
}

export const SidebarUserProfile = ({ user }: SidebarUserProfileProps) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const initials = user?.login?.slice(0, 2).toUpperCase() ?? "";

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        justifyContent: isMobile ? "center" : undefined,
      }}
    >
      <Avatar src={user?.avatarUrl ?? undefined}>{initials}</Avatar>
      <Typography fontWeight={600} noWrap sx={{ flexGrow: isMobile ? 0 : 1 }}>
        {user?.login}
      </Typography>

      <IconButton
        size="small"
        onClick={() => router.push("/profile")}
        sx={{ color: theme.palette.text.secondary }}
      >
        <SettingsIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};
