import { apiClient } from "@/shared/api/apiClient";

type UploadAvatarResponse = {
  message: string;
  avatarUrl: string;
  user: {
    id: number;
    login: string;
    avatarUrl: string | null;
  };
};

export const usersApi = {
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient<UploadAvatarResponse>("/users/avatar", {
      method: "POST",
      body: formData,
    });
  },
};
