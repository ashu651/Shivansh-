import { Body, Controller, Get, HttpCode, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';

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
    res.cookie('rt', `${sessionId}.${refreshToken}`, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      domain: cookieDomain,
      path: '/',
    });
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
    res.cookie('rt', `${newSessionId}.${refreshToken}`, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      domain: cookieDomain,
      path: '/',
    });
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
}