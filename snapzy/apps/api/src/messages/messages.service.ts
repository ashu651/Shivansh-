import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class MessagesService {
  async sendMessage(authorId: string, conversationId: string, text: string, attachments?: any[]) {
    return prisma.message.create({ data: { authorId, conversationId, text, attachments: attachments as any } });
  }
}