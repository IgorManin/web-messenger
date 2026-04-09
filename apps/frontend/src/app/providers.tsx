"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { WsProvider } from "@/modules/ws";
import { useAuthInit } from "@/modules/auth/hooks/useAuthInit";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  useAuthInit();

  return (
    <QueryClientProvider client={client}>
      <WsProvider>{children}</WsProvider>
    </QueryClientProvider>
  );
}
