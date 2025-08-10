import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import Redis from 'ioredis';
import webpush from 'web-push';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:ops@snapzy.local', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
}

@Controller('/api/v1/push')
@UseGuards(JwtAuthGuard)
export class PushController {
  @Post('subscribe')
  async subscribe(@Req() req: any, @Body() body: any) {
    await redis.set(`push:${req.user.userId}`, JSON.stringify(body));
    return { ok: true };
  }

  @Post('test')
  async test(@Req() req: any) {
    const raw = await redis.get(`push:${req.user.userId}`);
    if (!raw) return { ok: false } as any;
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return { ok: false } as any;
    const sub = JSON.parse(raw);
    await webpush.sendNotification(sub, JSON.stringify({ title: 'Snapzy', body: 'Test notification' }));
    return { ok: true };
  }
}