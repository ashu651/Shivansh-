import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('/api/v1/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  async toggleFollow(@Param('id') id: string, @Req() req: any) {
    return this.users.toggleFollow(req.user.userId, id);
  }
}