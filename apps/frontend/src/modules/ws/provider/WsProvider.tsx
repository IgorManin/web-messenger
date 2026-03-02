'use client'

import type { PropsWithChildren } from 'react'
import { useWsConnection } from '../hooks/useWsConnection'

export function WsProvider({ children }: PropsWithChildren) {
    useWsConnection()
    return children
}