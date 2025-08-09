/**
 * Cloudinary utilities. To swap to S3:
 * - Replace sign implementation with STS credential issuance
 * - Use S3 pre-signed POST or PUT URLs
 */
export function getCloudinaryUploadSignature(apiSecret: string, timestamp: number): string {
  const crypto = require('crypto');
  const stringToSign = `timestamp=${timestamp}${apiSecret}`;
  return crypto.createHash('sha1').update(stringToSign).digest('hex');
}