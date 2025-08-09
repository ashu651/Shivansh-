import { Resolver, Query, Args } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { GqlPost } from '../graphql/types/post.type';

@Resolver(() => GqlPost)
export class PostsResolver {
  constructor(private readonly posts: PostsService) {}

  @Query(() => [GqlPost])
  async postsFeed(
    @Args('userId', { type: () => String }) userId: string,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
    @Args('cursor', { type: () => String, nullable: true }) cursor?: string,
  ) {
    const { posts } = await this.posts.getFeed(userId, limit ?? 20, cursor);
    return posts as any;
  }
}