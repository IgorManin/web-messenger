"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useMemo, useState } from "react";
import { WsProvider } from "@/modules/ws";
import { useAuthInit } from "@/modules/auth/hooks/useAuthInit";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useThemeStore } from "@/modules/ui/store/theme.store";
import { createAppTheme } from "@/modules/ui/theme/theme";

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

  const colorMode = useThemeStore((s) => s.colorMode);
  const theme = useMemo(() => createAppTheme(colorMode), [colorMode]);

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <WsProvider>{children}</WsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
