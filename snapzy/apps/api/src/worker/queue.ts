import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
export const mediaQueue = new Queue('media-processing', { connection: connection as any });

export type MediaJobData = { postId: string };