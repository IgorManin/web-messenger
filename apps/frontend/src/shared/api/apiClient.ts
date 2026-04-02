import { useAuthStore } from "@/modules/auth/store/auth.store";

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
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    throw new Error(toMessage(data, `HTTP error ${res.status}`));
  }

  return data as T;
}
