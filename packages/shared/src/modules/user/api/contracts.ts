import { CurrentUser, UserSearchResult } from "../model/types";

export interface UserApi {
  getMe(): Promise<CurrentUser>;
  searchUsers(login: string): Promise<UserSearchResult[]>;
  updateProfile(data: {
    login?: string;
    email?: string;
    notificationsEnabled?: boolean;
  }): Promise<CurrentUser>;
}
