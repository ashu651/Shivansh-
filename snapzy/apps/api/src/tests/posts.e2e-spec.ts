import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';

describe('Posts & Media (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    const email = `p_${Date.now()}@example.com`;
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({ username: `p_${Date.now()}`, email, password: 'Password123!' });
    const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password: 'Password123!' });
    accessToken = login.body.accessToken;
  });

  afterAll(async () => { await app.close(); });

  it('media sign returns 200 or 400 depending on env', async () => {
    await request(app.getHttpServer()).post('/api/v1/media/sign').set('Authorization', `Bearer ${accessToken}`).expect((res) => {
      expect([200, 400]).toContain(res.status);
    });
  });

  it('create post and get feed', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ caption: 'test', media: [{ public_id: 'x', url: 'https://example.com' }] })
      .expect(201);

    await request(app.getHttpServer()).get('/api/v1/posts/feed').set('Authorization', `Bearer ${accessToken}`).expect(200);
  });
});