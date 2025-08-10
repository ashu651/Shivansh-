import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'stub',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'stub',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/v1/auth/oauth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any, done: VerifyCallback) {
    done(null, { profile });
  }
}