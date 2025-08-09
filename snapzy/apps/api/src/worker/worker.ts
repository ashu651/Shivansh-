import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const worker = new Worker('media-processing', async (job) => {
  const { postId } = job.data as { postId: string };
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return;
  const media = Array.isArray(post.media) ? post.media : [];
  const processed = media.map((m: any) => ({
    ...m,
    processed: true,
    thumbnailUrl: m.url,
    hls: {
      playlist: (m.url || '').replace(/\.(mp4|mov|webm)$/i, '.m3u8'),
      variants: [240, 480, 720],
    },
  }));
  await prisma.post.update({ where: { id: postId }, data: { media: processed as any } });
  return { updated: true };
}, { connection: connection as any });

worker.on('completed', (job) => console.log('media job done', job.id));
worker.on('failed', (job, err) => console.error('media job failed', job?.id, err));