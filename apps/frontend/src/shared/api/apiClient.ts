import { useAuthStore } from "@/modules/auth/store/auth.store";
import { refreshTokenAction } from "@/modules/auth/actions/refreshToken.action";

type HttpOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function toMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") return fallback;
  const anyData = data as any;
  const msg = anyData?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string") return msg;
  return fallback;
}

function buildHeaders(
  token: string | null,
  isFormData: boolean,
  extra?: Record<string, string>,
) {
  return {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra ?? {}),
  };
}

export async function apiClient<T>(
  path: string,
  options: HttpOptions = {},
): Promise<T> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");

  const token = useAuthStore.getState().accessToken;
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: buildHeaders(token, isFormData, options.headers),
  });

  if (res.status === 401) {
    const refreshed = await refreshTokenAction();

    if (!refreshed) {
      useAuthStore.getState().clear();
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }

    const newToken = useAuthStore.getState().accessToken;
    const retryRes = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: buildHeaders(newToken, isFormData, options.headers),
    });

    const retryText = await retryRes.text();
    const retryData = retryText ? (JSON.parse(retryText) as unknown) : null;

    if (!retryRes.ok) {
      throw new Error(toMessage(retryData, `HTTP error ${retryRes.status}`));
    }

    return retryData as T;
  }

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    throw new Error(toMessage(data, `HTTP error ${res.status}`));
  }

  return data as T;
}
