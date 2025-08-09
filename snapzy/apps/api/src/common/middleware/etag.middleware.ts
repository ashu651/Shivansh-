import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function ETagMiddleware(req: Request, res: Response, next: NextFunction) {
  const json = res.json.bind(res);
  res.json = (body: any) => {
    try {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      const etag = `W/"${crypto.createHash('sha1').update(payload).digest('hex')}"`;
      if (req.headers['if-none-match'] === etag) {
        res.status(304);
        return res.end();
      }
      res.setHeader('ETag', etag);
    } catch {}
    return json(body);
  };
  next();
}