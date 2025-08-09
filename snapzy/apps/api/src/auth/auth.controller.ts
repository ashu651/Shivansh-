import { Body, Controller, Get, HttpCode, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Request, Response } from 'express';

@ApiTags('auth')
@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.auth.register(dto.username, dto.email, dto.password);
    return { user };
  }

  @Post('login')
  @HttpCode(200)
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
    // TODO verify token and set isEmailVerified
    return { verified: true, token };
  }

  @Post('password-reset')
  async passwordReset() {
    // TODO send reset token email
    return { ok: true };
  }

  @Post('password-reset/confirm')
  async passwordResetConfirm() {
    // TODO verify token and set new password
    return { ok: true };
  }
}