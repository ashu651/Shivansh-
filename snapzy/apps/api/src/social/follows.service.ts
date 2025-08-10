import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class FollowsService {
  constructor(private readonly users: UsersService) {}
  toggle(followerId: string, followingId: string) {
    return this.users.toggleFollow(followerId, followingId);
  }
}