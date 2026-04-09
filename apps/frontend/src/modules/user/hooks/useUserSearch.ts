import { useEffect, useState } from "react";
import { webUserApi } from "@/modules/user/api/user.api-adapter";
import { UserSearchResult } from "@shared/modules/user/model/types";

export function useUserSearch() {
  const [search, setSearch] = useState("");
  const [foundUsers, setFoundUsers] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmed = search.trim();
    //todo потом зменить на < 2
    if (trimmed.length < 1) {
      setFoundUsers([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        const users = await webUserApi.searchUsers(trimmed);
        setFoundUsers(users);
      } catch {
        setFoundUsers([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const clearSearch = () => {
    setSearch("");
    setFoundUsers([]);
  };
  // todo потом сделать >=2
  const isSearchMode = search.trim().length >= 1;

  return {
    search,
    setSearch,
    foundUsers,
    isSearching,
    isSearchMode,
    clearSearch,
  };
}
