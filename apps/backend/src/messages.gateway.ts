import { OnModuleInit } from '@nestjs/common';
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MessagesService } from './messages.service.js';

@WebSocketGateway({
    cors: {
        origin: (process.env.ALLOWED_ORIGINS || '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
        credentials: true
    },
    path: process.env.WS_PATH || '/ws'
})
export class MessagesGateway implements OnModuleInit {
    @WebSocketServer() server!: Server;

    constructor(private readonly messages: MessagesService) {}

    onModuleInit() {
        // eslint-disable-next-line no-console
        console.log('[WS] ready at', process.env.WS_PATH || '/ws');
    }

    @SubscribeMessage('message:new')
    handleNew(@MessageBody() payload: { text: string; author?: string }) {
        const msg = this.messages.create({
            text: payload.text,
            author: payload.author ?? 'anon'
        });
        this.server.emit('message:new', msg);
        return msg;
    }

    @SubscribeMessage('typing')
    handleTyping(@MessageBody() payload: { author: string; isTyping: boolean }) {
        this.server.emit('typing', payload);
    }

    @SubscribeMessage('read')
    handleRead(@MessageBody() payload: { messageId: string; reader: string }) {
        this.server.emit('read', payload);
    }
}
