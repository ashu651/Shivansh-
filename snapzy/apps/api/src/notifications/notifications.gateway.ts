import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/ws', cors: { origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'], credentials: true } })
export class NotificationsGateway {
  @WebSocketServer()
  server!: Server;

  notifyUser(userId: string, event: string, payload: any) {
    if (!this.server) return;
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}