import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function IdempotencyMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'POST') return next();
  const key = (req.headers['idempotency-key'] as string) || '';
  if (!key) return next();
  const exists = await redis.get(`idem:${key}`);
  if (exists) {
    res.setHeader('Idempotent-Replay', 'true');
    return res.status(200).json(JSON.parse(exists));
  }
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    redis.setex(`idem:${key}`, 60 * 10, JSON.stringify(body)).catch(() => {});
    return originalJson(body);
  };
  next();
}