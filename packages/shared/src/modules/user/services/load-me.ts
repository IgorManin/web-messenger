import { UserApi } from "../api/contracts";
import { CurrentUser } from "../model/types";

export async function loadMyUser(api: UserApi): Promise<CurrentUser> {
  return api.getMe();
}
