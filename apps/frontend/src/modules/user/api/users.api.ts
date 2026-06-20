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
