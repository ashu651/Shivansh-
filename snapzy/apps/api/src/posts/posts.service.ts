import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { mediaQueue } from '../worker/queue';
import { NotificationsGateway } from '../notifications/notifications.gateway';

const prisma = new PrismaClient();

@Injectable()
export class PostsService {
  constructor(private readonly notifications?: NotificationsGateway) {}

  async createPost(authorId: string, data: { caption?: string; media: any[] }) {
    const post = await prisma.post.create({ data: { authorId, caption: data.caption, media: data.media as any } });
    await mediaQueue.add('process', { postId: post.id });
    return post;
  }

  async getFeed(userId: string, limit = 20, cursor?: string) {
    const following = await prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } });
    const ids = [userId, ...following.map((f) => f.followingId)];
    const where: any = { authorId: { in: ids }, hidden: false };
    if (cursor) where.createdAt = { lt: new Date(cursor) };
    const posts = await prisma.post.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit + 1, include: { author: true, likes: true, comments: true } });
    const next = posts.length > limit ? posts[limit - 1]?.createdAt.toISOString() : null;
    return { posts: posts.slice(0, limit), nextCursor: next };
  }

  async toggleLike(userId: string, postId: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    const existing = await prisma.like.findUnique({ where: { userId_postId: { userId, postId } } });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return { liked: false };
    }
    await prisma.like.create({ data: { userId, postId } });
    if (this.notifications && userId !== post.authorId) {
      this.notifications.notifyUser(post.authorId, 'post:liked', { postId, userId });
    }
    return { liked: true };
  }

  async addComment(userId: string, postId: string, text: string, parentId?: string) {
    return prisma.comment.create({ data: { authorId: userId, postId, text, parentId } });
  }
}