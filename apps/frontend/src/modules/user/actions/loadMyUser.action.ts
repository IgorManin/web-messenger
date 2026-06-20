import { loadMyUser } from "@shared/modules/user/services/load-me";
import { webUserApi } from "../api/user.api-adapter";
import { useUserStore } from "../store/user.store";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Не удалось загрузить пользователя";
};

export async function loadMyUserAction() {
  const { setIsMeLoading, setMeError, setUser } = useUserStore.getState();

  try {
    setIsMeLoading(true);
    setMeError(null);

    const me = await loadMyUser(webUserApi);

    setUser(me);
  } catch (error) {
    setMeError(getErrorMessage(error));
  } finally {
    setIsMeLoading(false);
  }
}
