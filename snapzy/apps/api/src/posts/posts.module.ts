import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { PostFieldsResolver } from '../graphql/resolvers/post.fields';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PostsResolver, PostFieldsResolver],
  exports: [PostsService]
})
export class PostsModule {}