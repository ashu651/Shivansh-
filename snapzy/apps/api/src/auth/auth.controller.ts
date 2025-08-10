import { Body, Controller, Get, HttpCode, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import Redis from 'ioredis';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { AuthGuard } from '@nestjs/passport';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

@ApiTags('auth')
@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Throttle(5, 60)
  @ApiOperation({ summary: 'Create a new user and send verification email token' })
  @ApiBody({ schema: { example: { username: 'alice', email: 'alice@example.com', password: 'Password123!' } } })
  async register(@Body() dto: RegisterDto) {
    const user = await this.auth.register(dto.username, dto.email, dto.password);
    return { user };
  }

  @Post('login')
  @HttpCode(200)
  @Throttle(10, 60)
  @ApiOperation({ summary: 'Login and receive access token + refresh cookie' })
  @ApiBody({ schema: { example: { email: 'alice@example.com', password: 'Password123!' } } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, sessionId } = await this.auth.login(dto.email, dto.password);
    const cookieDomain = process.env.COOKIE_DOMAIN || 'localhost';
    res.cookie('rt', `${sessionId}.${refreshToken}`, { httpOnly: true, sameSite: 'lax', secure: false, domain: cookieDomain, path: '/' });
    return { accessToken };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookie = req.cookies['rt'] as string | undefined;
    if (!cookie) return { ok: false } as any;
    const [sessionId, token] = cookie.split('.', 2);
    const { accessToken, refreshToken, sessionId: newSessionId } = await this.auth.rotateRefresh(sessionId, token);
    const cookieDomain = process.env.COOKIE_DOMAIN || 'localhost';
    res.cookie('rt', `${newSessionId}.${refreshToken}`, { httpOnly: true, sameSite: 'lax', secure: false, domain: cookieDomain, path: '/' });
    return { accessToken };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookie = req.cookies['rt'] as string | undefined;
    if (cookie) {
      const [sessionId] = cookie.split('.', 2);
      await this.auth.revoke(sessionId);
    }
    res.clearCookie('rt');
    return { ok: true };
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    const user = await this.auth.me(req.user.userId);
    return { user };
  }

  @Get('verify/:token')
  async verify(@Param('token') token: string) {
    return { verified: true, token };
  }

  @Post('password-reset')
  async passwordReset() {
    return { ok: true };
  }

  @Post('password-reset/confirm')
  async passwordResetConfirm() {
    return { ok: true };
  }

  // Magic link login
  @Post('magic/request')
  @Throttle(5, 60)
  async magicRequest(@Body() body: any) {
    const token = crypto.randomBytes(16).toString('hex');
    await redis.set(`magic:${token}`, body.email, 'EX', 10 * 60);
    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
      const link = `${process.env.WEB_URL || 'http://localhost:3000'}/login?token=${token}`;
      await transporter.sendMail({ from: process.env.SMTP_FROM || 'no-reply@snapzy.local', to: body.email, subject: 'Your Snapzy login link', text: `Login link: ${link}` });
    }
    return { ok: true };
  }

  @Get('magic/consume')
  async magicConsume(@Query('token') token: string, @Res({ passthrough: true }) res: Response) {
    const email = await redis.get(`magic:${token}`);
    if (!email) return { ok: false } as any;
    const { accessToken, refreshToken, sessionId } = await this.auth.login(email, '');
    const cookieDomain = process.env.COOKIE_DOMAIN || 'localhost';
    res.cookie('rt', `${sessionId}.${refreshToken}`, { httpOnly: true, sameSite: 'lax', secure: false, domain: cookieDomain, path: '/' });
    return { accessToken };
  }

  // Phone OTP
  @Post('otp/request')
  @Throttle(5, 60)
  async otpRequest(@Body() body: any) {
    const code = (Math.floor(Math.random() * 900000) + 100000).toString();
    await redis.set(`otp:${body.phone}`, code, 'EX', 5 * 60);
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({ from: process.env.TWILIO_FROM_NUMBER, to: body.phone, body: `Your Snapzy code: ${code}` });
    }
    return { ok: true };
  }

  @Post('otp/verify')
  async otpVerify(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const stored = await redis.get(`otp:${body.phone}`);
    if (!stored || stored !== body.code) return { ok: false } as any;
    const { accessToken, refreshToken, sessionId } = await this.auth.login(body.email, '');
    const cookieDomain = process.env.COOKIE_DOMAIN || 'localhost';
    res.cookie('rt', `${sessionId}.${refreshToken}`, { httpOnly: true, sameSite: 'lax', secure: false, domain: cookieDomain, path: '/' });
    return { accessToken };
  }

  // Google OAuth placeholders (real flow handled via passport or frontend)
  @Get('oauth/google')
  @UseGuards(AuthGuard('google'))
  async googleStart() { return { ok: true }; }

  @Get('oauth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback() { return { ok: true }; }

  @Get('oauth/apple')
  @UseGuards(AuthGuard('apple'))
  async appleStart() { return { ok: true }; }

  @Get('oauth/apple/callback')
  @UseGuards(AuthGuard('apple'))
  async appleCallback() { return { ok: true }; }
}