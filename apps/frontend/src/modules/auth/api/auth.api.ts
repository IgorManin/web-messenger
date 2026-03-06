import { AuthTokensResponse, LoginDto } from "@/modules/auth/types";
import { apiClient } from "@/shared/api/apiClient";

export const authApi = {
  login: (dto: LoginDto) =>
    apiClient<AuthTokensResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  register: (dto: LoginDto) =>
    apiClient<AuthTokensResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  refresh: () =>
    apiClient<AuthTokensResponse>("/auth/refresh", {
      method: "POST",
    }),

  logout: () =>
    apiClient<void>("/auth/logout", {
      method: "POST",
    }),
};
