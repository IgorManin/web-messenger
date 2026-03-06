import { useAuthStore } from "@/modules/auth/store/auth.store";
import { authApi } from "@/modules/auth/api/auth.api";
import { useMutation } from "@tanstack/react-query";
import { LoginDto } from "@/modules/auth/types";
import { useRouter } from "next/navigation";

export const useAuthActions = () => {
  const router = useRouter();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const clear = useAuthStore((s) => s.clear);

  const login = useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),
    onSuccess: (data) => setAccessToken(data.accessToken),
  });

  const register = useMutation({
    mutationFn: (dto: LoginDto) => authApi.register(dto),
    onSuccess: (data) => setAccessToken(data.accessToken),
  });

  const logout = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clear();
      router.replace("/login");
    },
    onError: () => {
      clear();
      router.replace("/login");
    },
  });

  return { login, register, logout };
};
