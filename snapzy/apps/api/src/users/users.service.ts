import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class UsersService {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async toggleFollow(followerId: string, followingId: string) {
    const existing = await prisma.follow.findUnique({ where: { followerId_followingId: { followerId, followingId } } });
    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return { following: false };
    }
    await prisma.follow.create({ data: { followerId, followingId } });
    return { following: true };
  }
}