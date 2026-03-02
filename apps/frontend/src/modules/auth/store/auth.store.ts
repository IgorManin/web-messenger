import { create } from 'zustand'

type AuthState = {
    accessToken: string | null
    isInitialized: boolean

    setAccessToken: (token: string | null) => void
    setInitialized: (v: boolean) => void
    clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    isInitialized: false,

    setAccessToken: (token) => set({ accessToken: token }),
    setInitialized: (v) => set({ isInitialized: v }),

    clear: () => set({ accessToken: null, isInitialized: true }),
}))
