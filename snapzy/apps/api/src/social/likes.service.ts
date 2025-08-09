import { Injectable } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class LikesService {
  constructor(private readonly posts: PostsService) {}
  toggle(userId: string, postId: string) {
    return this.posts.toggleLike(userId, postId);
  }
}