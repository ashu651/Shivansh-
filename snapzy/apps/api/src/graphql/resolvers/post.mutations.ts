import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PostsService } from '../../posts/posts.service';
import { GqlPost } from '../types/post.type';

@Resolver()
export class PostMutationsResolver {
  constructor(private readonly posts: PostsService) {}

  @Mutation(() => GqlPost)
  async createPostGql(
    @Args('authorId') authorId: string,
    @Args('caption', { nullable: true }) caption?: string,
    @Args('media') media?: any[],
  ) {
    return this.posts.createPost(authorId, { caption, media: media || [] }) as any;
  }

  @Mutation(() => Boolean)
  async likePostGql(@Args('userId') userId: string, @Args('postId') postId: string) {
    const res = await this.posts.toggleLike(userId, postId);
    return res.liked;
  }
}