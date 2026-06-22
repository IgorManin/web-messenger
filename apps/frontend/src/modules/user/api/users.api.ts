import { apiClient } from "@/shared/api/apiClient";
import {
  CurrentUser,
  UploadAvatarResponse,
  UserSearchResult,
} from "@shared/modules/user/model/types";

export const getMe = () => {
  return apiClient<CurrentUser>("/users/me");
};

export const searchUsers = (login: string) => {
  const params = new URLSearchParams({ login });
  return apiClient<UserSearchResult[]>(`/users/search?${params}`);
};

export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient<UploadAvatarResponse>("/users/avatar", {
    method: "POST",
    body: formData,
  });
};

export const updateProfile = (data: {
  login?: string;
  email?: string;
  notificationsEnabled?: boolean;
}) => {
  return apiClient<CurrentUser>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};
