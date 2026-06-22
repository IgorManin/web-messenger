export type CurrentUser = {
  id: number;
  login: string;
  email?: string;
  avatarUrl: string | null;
  notificationsEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UserSearchResult = {
  id: number;
  login: string;
  avatarUrl: string | null;
};

export type UploadAvatarResponse = {
  message: string;
  avatarUrl: string;
  user: {
    id: number;
    login: string;
    avatarUrl: string | null;
  };
};
