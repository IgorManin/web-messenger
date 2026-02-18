
import {apiClient} from "../../../shared/api/apiClient";
import {AuthTokensResponse, LoginDto} from "../types";

export const authApi = {
    login: (dto: LoginDto) =>
        apiClient<AuthTokensResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    register: (dto: LoginDto) =>
        apiClient<AuthTokensResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    refresh: () =>
        apiClient<AuthTokensResponse>('/auth/refresh', {
            method: 'POST',
        }),

    logout: () =>
        apiClient<void>('/auth/logout', {
            method: 'POST',
        }),
}
