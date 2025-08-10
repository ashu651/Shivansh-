import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

@Controller('/api/v1/consent')
@UseGuards(JwtAuthGuard)
export class ConsentController {
  @Get()
  async get(@Req() req: any) {
    const key = `consent:${req.user.userId}`;
    const raw = (await redis.get(key)) || '{}';
    return JSON.parse(raw);
  }

  @Post()
  async set(@Req() req: any, @Body() body: any) {
    const key = `consent:${req.user.userId}`;
    await redis.set(key, JSON.stringify(body), 'EX', 60 * 60 * 24 * 365);
    return { ok: true };
  }
}