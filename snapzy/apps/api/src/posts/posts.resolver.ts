import { Resolver, Query, Args } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { GraphQLJSON } from 'graphql-type-json';

@Resolver()
export class PostsResolver {
  constructor(private readonly posts: PostsService) {}

  @Query(() => GraphQLJSON)
  async feedGql(
    @Args('userId', { type: () => String }) userId: string,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
    @Args('cursor', { type: () => String, nullable: true }) cursor?: string,
  ) {
    return this.posts.getFeed(userId, limit ?? 20, cursor);
  }
}