import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getChatsForUser(userId: number) {
    const chats = await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return chats
      .map((chat) => {
        const lastMessage = chat.messages[0] ?? null;
        const actualUpdatedAt = lastMessage?.createdAt ?? chat.updatedAt;

        return {
          id: chat.id,
          title: chat.title,
          type: chat.type,
          lastMessage: lastMessage?.text ?? "",
          updatedAt: actualUpdatedAt.toISOString(),
        };
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }

  async getMessagesByChat(chatId: string, userId: number) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!participant) {
      const chatExists = await this.prisma.chat.findUnique({
        where: { id: chatId },
        select: { id: true },
      });

      if (!chatExists) {
        throw new NotFoundException("Чат не найден");
      }

      throw new ForbiddenException("Нет доступа к этому чату");
    }

    const messages = await this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });

    return messages.map((message) => ({
      id: message.id,
      clientMessageId: message.clientMessageId ?? "",
      chatId: message.chatId,
      authorId: String(message.authorId),
      text: message.text,
      createdAt: message.createdAt.toISOString(),
    }));
  }
}
