import { Controller, Get, Header, HttpCode, NotFoundException, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

@Controller('/api/v1/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  async toggleFollow(@Param('id') id: string, @Req() req: any) {
    return this.users.toggleFollow(req.user.userId, id);
  }

  @Get('me/export')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/json')
  async exportData(@Req() req: any, @Res() res: any) {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { posts: true, sessions: true } });
    if (!user) throw new NotFoundException();
    const payload = JSON.stringify(user);
    const etag = `W/"${crypto.createHash('sha1').update(payload).digest('hex')}"`;
    if (req.headers['if-none-match'] === etag) return res.status(304).end();
    res.setHeader('ETag', etag);
    res.send(payload);
  }

  @Post('me/delete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(202)
  async deleteAccount(@Req() req: any) {
    // Soft delete: mark user as deleted for async purge worker (future)
    await prisma.user.update({ where: { id: req.user.userId }, data: { username: `deleted_${Date.now()}`, email: `deleted_${Date.now()}@local` } });
    return { ok: true };
  }
}