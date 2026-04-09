import { useEffect, useState } from "react";
import { webUserApi } from "@/modules/user/api/user.api-adapter";
import { UserSearchResult } from "@shared/modules/user/model/types";

export function useUserSearch() {
  const [search, setSearch] = useState("");
  const [foundUsers, setFoundUsers] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmed = search.trim();

    if (trimmed.length < 2) {
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

  const isSearchMode = search.trim().length >= 2;

  return {
    search,
    setSearch,
    foundUsers,
    isSearching,
    isSearchMode,
  };
}
