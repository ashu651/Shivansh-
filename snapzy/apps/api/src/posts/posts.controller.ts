import { Body, Controller, Get, Param, Post as HttpPost, Query, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('posts')
@ApiBearerAuth()
@Controller('/api/v1/posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @HttpPost()
  @UseGuards(JwtAuthGuard)
  @Throttle(20, 60)
  @ApiOperation({ summary: 'Create a post with caption and media' })
  @ApiBody({ schema: { example: { caption: 'Hello', media: [{ public_id: 'abc', url: 'https://...' }] } } })
  async create(@Body() dto: CreatePostDto, @Req() req: any) {
    const post = await this.posts.createPost(req.user.userId, { caption: dto.caption, media: dto.media });
    return { post };
    }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @Throttle(60, 60)
  @ApiOperation({ summary: 'Get user feed with cursor pagination' })
  async feed(@Req() req: any, @Query('limit') limit = '20', @Query('cursor') cursor?: string) {
    const { posts, nextCursor } = await this.posts.getFeed(req.user.userId, parseInt(limit), cursor);
    return { posts, nextCursor };
  }

  @HttpPost(':id/like')
  @UseGuards(JwtAuthGuard)
  @Throttle(60, 60)
  async like(@Param('id') id: string, @Req() req: any) {
    return this.posts.toggleLike(req.user.userId, id);
  }

  @HttpPost(':id/comment')
  @UseGuards(JwtAuthGuard)
  @Throttle(60, 60)
  async comment(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const comment = await this.posts.addComment(req.user.userId, id, body.text, body.parentId);
    return { comment };
  }
}