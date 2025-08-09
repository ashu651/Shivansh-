import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

function parseExpiryToSeconds(exp: string): number {
  if (exp.endsWith('s')) return parseInt(exp);
  if (exp.endsWith('m')) return parseInt(exp) * 60;
  if (exp.endsWith('h')) return parseInt(exp) * 3600;
  if (exp.endsWith('d')) return parseInt(exp) * 86400;
  return Number(exp) || 900;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async register(username: string, email: string, password: string) {
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) throw new BadRequestException('User exists');
    const hash = await argon2.hash(password, { type: argon2.argon2id });
    const user = await prisma.user.create({ data: { username, email, password: hash } });
    // TODO: send verification email with token
    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await argon2.verify(user.password, password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  private signAccess(user: any) {
    const payload = { sub: user.id, email: user.email, username: user.username };
    return this.jwt.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me',
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '900s',
    });
  }

  private async issueRefresh(userId: string) {
    const token = this.jwt.sign({ sub: userId, type: 'refresh' }, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me',
      expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    });
    const ttl = parseExpiryToSeconds(process.env.JWT_REFRESH_EXPIRES || '7d');
    const session = await prisma.session.create({ data: { userId, refreshToken: token, expiresAt: new Date(Date.now() + ttl * 1000) } });
    await redis.set(`refresh:${session.id}`, token, 'EX', ttl);
    return { token, sessionId: session.id };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const accessToken = this.signAccess(user);
    const { token: refreshToken, sessionId } = await this.issueRefresh(user.id);
    return { accessToken, refreshToken, sessionId, user };
  }

  async rotateRefresh(sessionId: string, token: string) {
    const stored = await redis.get(`refresh:${sessionId}`);
    if (!stored || stored !== token) throw new UnauthorizedException('Invalid session');
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.refreshToken !== token) throw new UnauthorizedException('Invalid session');
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) throw new UnauthorizedException('Invalid user');

    // Invalidate old
    await redis.del(`refresh:${sessionId}`);
    await prisma.session.delete({ where: { id: sessionId } });

    // Issue new
    const accessToken = this.signAccess(user);
    const { token: newRefresh, sessionId: newSessionId } = await this.issueRefresh(user.id);
    return { accessToken, refreshToken: newRefresh, sessionId: newSessionId };
  }

  async revoke(sessionId: string) {
    await redis.del(`refresh:${sessionId}`);
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }

  async me(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  }
}