import { UserApi } from "@shared/modules/user/api/contracts";
import {
  getMe,
  searchUsers,
  updateProfile,
} from "@/modules/user/api/users.api";

export const webUserApi: UserApi = {
  getMe,
  searchUsers,
  updateProfile,
};
