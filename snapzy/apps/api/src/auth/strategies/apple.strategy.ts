import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import AppleStrategyBase, { Profile } from 'passport-apple';

@Injectable()
export class AppleStrategy extends PassportStrategy(AppleStrategyBase, 'apple') {
  constructor() {
    super({
      clientID: process.env.APPLE_CLIENT_ID || 'com.snapzy.app',
      teamID: process.env.APPLE_TEAM_ID || 'TEAMID',
      keyID: process.env.APPLE_KEY_ID || 'KEYID',
      privateKeyString: process.env.APPLE_PRIVATE_KEY_BASE64 ? Buffer.from(process.env.APPLE_PRIVATE_KEY_BASE64, 'base64').toString('utf8') : '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----',
      callbackURL: process.env.APPLE_CALLBACK_URL || 'http://localhost:4000/api/v1/auth/oauth/apple/callback',
      scope: ['name', 'email'],
    } as any);
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile, done: Function) {
    done(null, { profile });
  }
}