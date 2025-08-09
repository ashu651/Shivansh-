import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('/api/v1/media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post('sign')
  @UseGuards(JwtAuthGuard)
  sign() {
    return this.media.signUpload();
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verify(@Body() body: any, @Req() req: any) {
    return this.media.verifyAndStore(req.user.userId, body);
  }
}