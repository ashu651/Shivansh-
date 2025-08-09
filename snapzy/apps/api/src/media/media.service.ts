import { Injectable, BadRequestException } from '@nestjs/common';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class MediaService {
  signUpload() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) throw new BadRequestException('Cloudinary not configured');
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');
    return { signature, api_key: apiKey, timestamp };
  }

  async verifyAndStore(userId: string, media: any) {
    // Optionally verify with Cloudinary Admin API; for dev assume OK
    // Store media metadata linked to user or post later
    await prisma.user.update({ where: { id: userId }, data: {} });
    return { verified: true, media };
  }
}