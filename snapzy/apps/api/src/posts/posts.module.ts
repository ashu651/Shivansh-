import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PostsResolver],
  exports: [PostsService]
})
export class PostsModule {}