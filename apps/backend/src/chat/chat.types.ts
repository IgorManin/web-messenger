export type ChatWithRelations = {
  id: string
  title: string
  type: string
  updatedAt: Date
  messages: {
    text: string
    createdAt: Date
  }[]
  participants: {
    userId: number
    user: {
      id: number
      login: string
      avatarUrl: string | null
    }
  }[]
}

export type CreateDirectChatData = {
  title: string
  directChatKey: string
  participantIds: [number, number]
}

export type CreateMessageData = {
  chatId: string
  authorId: number
  text: string
  clientMessageId: string | null
}
