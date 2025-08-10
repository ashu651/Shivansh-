import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function CspNonceMiddleware(req: Request, res: Response, next: NextFunction) {
  // Generate per-request nonce for inline scripts when needed
  (res.locals as any).cspNonce = crypto.randomBytes(16).toString('base64');
  next();
}