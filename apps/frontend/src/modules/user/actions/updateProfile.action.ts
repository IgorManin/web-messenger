import { webUserApi } from "../api/user.api-adapter";
import { useUserStore } from "../store/user.store";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    // apiClient прокидывает только текст сообщения, не статус-код.
    // GlobalExceptionFilter на бэке мапит Prisma P2002 (unique constraint) в это сообщение.
    if (error.message.includes("уже существует")) {
      return "Этот логин или email уже занят";
    }
    return error.message;
  }

  return "Не удалось обновить профиль";
};

export async function updateProfileAction(data: {
  login?: string;
  email?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const updatedUser = await webUserApi.updateProfile(data);
    useUserStore.getState().setUser(updatedUser);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
