import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

async function main() {
  const prisma = new PrismaClient();
  try {
    const passwordHash = await argon2.hash('Password123!', { type: argon2.argon2id });

    const alice = await prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
        username: 'alice',
        email: 'alice@example.com',
        password: passwordHash,
        bio: 'Photographer & traveler',
        isEmailVerified: true,
      },
    });

    const bob = await prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: {
        username: 'bob',
        email: 'bob@example.com',
        password: passwordHash,
        bio: 'Coffee lover',
        isEmailVerified: true,
      },
    });

    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: alice.id, followingId: bob.id } },
      update: {},
      create: { followerId: alice.id, followingId: bob.id },
    });

    await prisma.post.create({
      data: {
        authorId: alice.id,
        caption: 'Sunset at the beach',
        media: [{
          public_id: 'sample',
          url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          width: 864,
          height: 576,
          format: 'jpg',
        }],
      } as any,
    });

    await prisma.post.create({
      data: {
        authorId: bob.id,
        caption: 'Morning espresso',
        media: [{
          public_id: 'coffee',
          url: 'https://res.cloudinary.com/demo/image/upload/coffee.jpg',
          width: 1200,
          height: 800,
          format: 'jpg',
        }],
      } as any,
    });

    console.log('Seed complete');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});