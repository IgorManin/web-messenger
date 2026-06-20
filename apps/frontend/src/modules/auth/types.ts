export type LoginDto = { login: string; password: string }

export type RegisterDto = { login: string; password: string; email?: string }

export type AuthTokensResponse = { accessToken: string }
