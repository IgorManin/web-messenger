import { Avatar, Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { CurrentUser } from "@shared/modules/user/model/types";

interface SidebarUserProfileProps {
  user: CurrentUser | null;
}

export const SidebarUserProfile = ({ user }: SidebarUserProfileProps) => {
  const theme = useTheme();
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
      <Typography fontWeight={600} noWrap>
        {user?.login}
      </Typography>
    </Box>
  );
};
