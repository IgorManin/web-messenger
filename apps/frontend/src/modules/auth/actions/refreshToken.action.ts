import { useAuthStore } from "@/modules/auth/store/auth.store";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function refreshTokenAction(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return false;

    const data = await res.json();
    useAuthStore.getState().setAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}
