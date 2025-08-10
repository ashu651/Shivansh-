import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function CsrfTokenIssue(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies['csrf'] || crypto.randomBytes(16).toString('hex');
  if (!req.cookies['csrf']) res.cookie('csrf', token, { httpOnly: false, sameSite: 'lax', secure: false });
  res.setHeader('x-csrf-token', token);
  next();
}

export function CsrfDoubleSubmit(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
  const cookie = req.cookies['csrf'];
  const header = req.headers['x-csrf-token'];
  if (cookie && header && cookie === header) return next();
  return res.status(403).json({ ok: false, error: { message: 'CSRF' } });
}