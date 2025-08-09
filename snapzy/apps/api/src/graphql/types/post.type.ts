import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { GqlUser } from './user.type';

@ObjectType()
export class GqlPost {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  caption?: string;

  @Field(() => GraphQLJSON)
  media!: any;

  @Field(() => GqlUser)
  author!: GqlUser;

  @Field()
  createdAt!: Date;
}