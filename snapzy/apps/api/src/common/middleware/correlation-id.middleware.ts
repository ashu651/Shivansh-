import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

export function CorrelationIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const id = (req.headers['x-request-id'] as string) || randomUUID();
  req.headers['x-request-id'] = id;
  res.setHeader('x-request-id', id);
  next();
}