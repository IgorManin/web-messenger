import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { MessagesService } from './messages.service.js';

@Controller('messages')
export class MessagesController {
    constructor(private readonly messages: MessagesService) {}

    @Get()
    list() {
        return { items: this.messages.all() };
    }

    @Post()
    @HttpCode(201)
    create(@Body() body: { text: string; author?: string }) {
        const msg = this.messages.create({
            text: body.text,
            author: body.author ?? 'anon'
        });
        return msg;
    }
}
