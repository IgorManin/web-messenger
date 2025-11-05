import { Injectable } from '@nestjs/common';

export interface Message {
    id: string;
    text: string;
    author: string;
    createdAt: string;
}

@Injectable()
export class MessagesService {
    private data: Message[] = [];

    create(input: Pick<Message, 'text' | 'author'>): Message {
        const msg: Message = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            text: input.text,
            author: input.author,
            createdAt: new Date().toISOString()
        };
        this.data.unshift(msg);
        return msg;
    }

    all(): Message[] {
        return this.data;
    }
}
