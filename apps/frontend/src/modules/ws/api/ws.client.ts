'use client'

import { io, type Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '../types/ws.types'

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
let currentToken: string | null = null

const getWsBaseUrl = () => {
    const url = process.env.NEXT_PUBLIC_WS_URL
    if (!url) throw new Error('NEXT_PUBLIC_WS_URL is not set')
    return url
}

export const getSocket = () => socket

export const connectSocket = (token: string) => {
    const baseUrl = getWsBaseUrl()

    if (socket && currentToken === token && socket.connected) return socket

    if (socket) {
        try {
            socket.disconnect()
        } catch {
            /* ignore disconnect errors */
        }
        socket = null
    }

    currentToken = token

    socket = io(`${baseUrl}/ws`, {
        transports: ['websocket'],
        auth: { token },
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 300,
        reconnectionDelayMax: 2000,
    })

    return socket
}

export const disconnectSocket = () => {
    if (!socket) return
    try {
        socket.disconnect()
    } catch {
        /* ignore disconnect errors */
    }
    socket = null
    currentToken = null
}

/**
 * Обновить токен на сокете.
 * В Socket.IO auth применяется на реконнекте → форсим reconnect.
 */
export const updateSocketToken = (token: string) => {
    currentToken = token
    if (!socket) return

    socket.auth = { token }

    if (socket.connected) {
        socket.disconnect()
    }
    socket.connect()
}