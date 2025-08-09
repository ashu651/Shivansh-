import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';

describe('Admin (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('exposes health endpoints', async () => {
    await request(app.getHttpServer()).get('/health/liveness').expect(200);
    await request(app.getHttpServer()).get('/health/readiness').expect(200);
  });

  it('admin endpoints require ADMIN role', async () => {
    const email = `a_${Date.now()}@example.com`;
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({ username: `a_${Date.now()}`, email, password: 'Password123!' });
    const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password: 'Password123!' });
    const token = login.body.accessToken;
    await request(app.getHttpServer()).get('/api/v1/admin/audit-logs').set('Authorization', `Bearer ${token}`).expect(403);
  });
});