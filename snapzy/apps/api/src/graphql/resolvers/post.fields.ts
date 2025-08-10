import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { GqlPost } from '../types/post.type';

@Resolver(() => GqlPost)
export class PostFieldsResolver {
  @ResolveField('author')
  async author(@Parent() post: any, _: any, ctx: any) {
    return ctx.loaders.userLoader.load(post.authorId);
  }
}