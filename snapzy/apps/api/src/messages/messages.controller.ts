import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { MessagesService } from './messages.service';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

@WebSocketGateway({ namespace: '/ws', cors: { origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'], credentials: true } })
export class MessagesController implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly messages: MessagesService) {}

  async afterInit() {
    const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    const subClient = pubClient.duplicate();
    await pubClient.connect();
    await subClient.connect();
    this.server.adapter(createAdapter(pubClient as any, subClient as any));
  }

  handleConnection(client: Socket) {
    client.data.userId = null;
  }

  @SubscribeMessage('auth')
  handleAuth(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
    try {
      const payload: any = jwt.verify(data?.accessToken, process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me');
      socket.data.userId = payload.sub;
      socket.join(`user:${payload.sub}`);
      socket.emit('auth:ok', { ok: true });
    } catch (e) {
      socket.emit('auth:error', { ok: false });
    }
  }

  @SubscribeMessage('dm:send')
  async send(@MessageBody() data: { conversationId: string; text: string; attachments?: any[] }, @ConnectedSocket() socket: Socket) {
    if (!socket.data.userId) return socket.emit('error', { message: 'unauthorized' });
    const msg = await this.messages.sendMessage(socket.data.userId, data.conversationId, data.text, data.attachments);
    this.server.to(`conversation:${data.conversationId}`).emit('dm:receive', { message: msg });
    return { message: msg };
  }

  @SubscribeMessage('typing')
  typing(@MessageBody() data: { conversationId: string; isTyping: boolean }, @ConnectedSocket() socket: Socket) {
    this.server.to(`conversation:${data.conversationId}`).emit('typing', { userId: socket.data.userId, isTyping: data.isTyping });
  }

  @SubscribeMessage('read')
  read(@MessageBody() data: { conversationId: string; messageId: string }, @ConnectedSocket() socket: Socket) {
    this.server.to(`conversation:${data.conversationId}`).emit('read', { userId: socket.data.userId, messageId: data.messageId });
  }
}