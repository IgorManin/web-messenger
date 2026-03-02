export type ChatJoinDto = {
    chatId: string
}

export type SendMessageDto = {
    chatId: string
    text: string
    clientMessageId?: string
}

export type MessageDto = {
    id: string
    chatId: string
    text: string
    authorId: string
    createdAt: string
    clientMessageId: string | null
}

export type ServerToClientEvents = {
    'message:new': (message: MessageDto) => void
}

export type ClientToServerEvents = {
    'chat:join': (dto: ChatJoinDto, ack?: (res: { ok: boolean }) => void) => void
    'message:new': (dto: SendMessageDto, ack?: (message: MessageDto) => void) => void
}