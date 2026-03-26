import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { UsersService } from "../users/users.service.js";

type ChatWithRelations = {
  id: string;
  title: string;
  type: string;
  updatedAt: Date;
  messages: {
    text: string;
    createdAt: Date;
  }[];
  participants: {
    userId: number;
    user: {
      id: number;
      login: string;
    };
  }[];
};

type ChatListItem = {
  id: string;
  title: string;
  type: string;
  lastMessage: string;
  updatedAt: string;
  companion: {
    id: number;
    login: string;
  } | null;
};

type CreateOrGetDirectChatResult = {
  chat: ChatListItem;
  chatForTargetUser: ChatListItem;
  created: boolean;
  targetUserId: number;
};

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  private buildDirectChatKey(firstUserId: number, secondUserId: number) {
    const [minUserId, maxUserId] = [firstUserId, secondUserId].sort(
      (a, b) => a - b,
    );

    return `${minUserId}:${maxUserId}`;
  }

  private mapChatListItem(chat: ChatWithRelations, currentUserId: number) {
    const lastMessage = chat.messages[0] ?? null;
    const actualUpdatedAt = lastMessage?.createdAt ?? chat.updatedAt;

    const companion =
      chat.type === "direct"
        ? (chat.participants.find(
            (participant) => participant.userId !== currentUserId,
          )?.user ?? null)
        : null;

    return {
      id: chat.id,
      title:
        chat.type === "direct" ? (companion?.login ?? chat.title) : chat.title,
      type: chat.type,
      lastMessage: lastMessage?.text ?? "",
      updatedAt: actualUpdatedAt.toISOString(),
      companion,
    };
  }

  async getChatsForUser(userId: number) {
    const chats = await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
        OR: [
          {
            type: "group",
          },
          {
            type: "direct",
            messages: {
              some: {},
            },
          },
        ],
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                login: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return chats
      .map((chat) => this.mapChatListItem(chat, userId))
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

  async createOrGetDirectChat(
    currentUserId: number,
    targetUserId: number,
  ): Promise<CreateOrGetDirectChatResult> {
    if (currentUserId === targetUserId) {
      throw new BadRequestException("Нельзя создать чат с самим собой");
    }

    const targetUser = await this.usersService.findById(targetUserId);

    if (!targetUser) {
      throw new NotFoundException("Пользователь не найден");
    }

    const directChatKey = this.buildDirectChatKey(currentUserId, targetUserId);

    const existingChat = await this.prisma.chat.findUnique({
      where: {
        directChatKey,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                login: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (existingChat) {
      return {
        chat: this.mapChatListItem(existingChat, currentUserId),
        chatForTargetUser: this.mapChatListItem(existingChat, targetUserId),
        created: false,
        targetUserId,
      };
    }

    const createdChat = await this.prisma.chat.create({
      data: {
        title: targetUser.login,
        type: "direct",
        directChatKey,
        participants: {
          create: [{ userId: currentUserId }, { userId: targetUserId }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                login: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    return {
      chat: this.mapChatListItem(createdChat, currentUserId),
      chatForTargetUser: this.mapChatListItem(createdChat, targetUserId),
      created: true,
      targetUserId,
    };
  }
}
