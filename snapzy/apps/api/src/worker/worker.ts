import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const worker = new Worker('media-processing', async (job) => {
  const { postId } = job.data as { postId: string };
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return;
  const media = Array.isArray(post.media) ? post.media : [];
  const processed = await Promise.all(media.map(async (m: any) => {
    const base = {
      ...m,
      processed: true,
      hls: { playlist: (m.url || '').replace(/\.(mp4|mov|webm)$/i, '.m3u8'), variants: [240, 480, 720] },
    };
    try {
      if (cloudinary.config()?.cloud_name && m.url) {
        // Derive a simple thumbnail via Cloudinary transformation if public_id provided
        const thumbUrl = m.public_id ? cloudinary.url(m.public_id, { width: 480, crop: 'scale', format: 'jpg' }) : m.url;
        return { ...base, thumbnailUrl: thumbUrl };
      }
    } catch {}
    return { ...base, thumbnailUrl: m.url };
  }));
  await prisma.post.update({ where: { id: postId }, data: { media: processed as any } });
  return { updated: true };
}, { connection: connection as any });

worker.on('completed', (job) => console.log('media job done', job.id));
worker.on('failed', (job, err) => console.error('media job failed', job?.id, err));