'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import {useAuthInit} from "../modules/auth/hooks/useAuthInit";

export function Providers({ children }: { children: React.ReactNode }) {
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
    )
    useAuthInit()

    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
