'use client'

import {FormEvent, useCallback, useMemo, useState} from 'react'
import { Box, Button, Paper, TextField, Typography } from '@mui/material'
import {useAuthStore} from "../../../modules/auth/store/auth.store";
import {MessageDto, useWsMessages} from "../../../modules/ws";

const CHAT_ID = 'global' // todo MVP: один общий чат. Потом заменим на реальные чаты.

export default function ChatPage() {
    const myUserId = useAuthStore((s) => {
        return (s as unknown as { userId?: string }).userId ?? null
    })

    const [text, setText] = useState('')
    const [messages, setMessages] = useState<MessageDto[]>([])

    const onMessage = useCallback((message: MessageDto) => {
        setMessages((prev) => [...prev, message])
    }, [])

    const { sendMessage } = useWsMessages({ chatId: CHAT_ID, onMessage })

    const canSend = useMemo(() => text.trim().length > 0, [text])

    const handleSend = useCallback(async () => {
        const value = text.trim()
        if (!value) return

        const ack = await sendMessage(value)

        setMessages((prev) => [...prev, ack])

        setText('')
    }, [sendMessage, text])

    const handleSubmit = useCallback(
        async (e: FormEvent) => {
            e.preventDefault()
            await handleSend()
        },
        [handleSend],
    )

    return (
        <Box sx={{ p: 2, display: 'grid', gap: 2, height: 'calc(100vh - 32px)' }}>
            <Typography variant="h5">Чат</Typography>

            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    flex: 1,
                    overflow: 'auto',
                    display: 'grid',
                    gap: 1,
                    alignContent: 'start',
                }}
            >
                {messages.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        Пока сообщений нет
                    </Typography>
                ) : (
                    messages.map((m) => {
                        const isMine = myUserId ? m.authorId === myUserId : false

                        return (
                            <Box
                                key={m.id}
                                sx={{
                                    display: 'grid',
                                    justifyContent: isMine ? 'end' : 'start',
                                }}
                            >
                                <Box
                                    sx={{
                                        px: 1.5,
                                        py: 1,
                                        borderRadius: 2,
                                        maxWidth: 520,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {m.text}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(m.createdAt).toLocaleTimeString()}
                                    </Typography>
                                </Box>
                            </Box>
                        )
                    })
                )}
            </Paper>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 1 }}>
                <TextField
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Напиши сообщение…"
                    size="small"
                    autoComplete="off"
                />
                <Button type="submit" variant="contained" disabled={!canSend}>
                    Отправить
                </Button>
            </Box>

            <Typography variant="caption" color="text.secondary">
                chatId: {CHAT_ID}
            </Typography>
        </Box>
    )
}