import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';

describe('Auth & Posts (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('register -> login -> refresh -> me -> create post -> feed', async () => {
    const email = `test_${Date.now()}@example.com`;
    // register
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({ username: `user_${Date.now()}`, email, password: 'Password123!' }).expect(201);
    // login
    const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password: 'Password123!' }).expect(200);
    const accessToken = login.body.accessToken;
    const cookies = login.headers['set-cookie'];

    // me
    await request(app.getHttpServer()).get('/api/v1/auth/me').set('Authorization', `Bearer ${accessToken}`).expect(200);

    // refresh
    const refresh = await request(app.getHttpServer()).post('/api/v1/auth/refresh').set('Cookie', cookies).expect(200);
    const accessToken2 = refresh.body.accessToken;

    // media sign (will fail if cloudinary not configured) but should return 400 or 201 with signature
    await request(app.getHttpServer()).post('/api/v1/media/sign').set('Authorization', `Bearer ${accessToken2}`).expect((res) => {
      expect([200, 400]).toContain(res.status);
    });

    // create post
    const post = await request(app.getHttpServer())
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${accessToken2}`)
      .send({ caption: 'Hello', media: [{ public_id: 'demo', url: 'https://example.com/img.jpg' }] })
      .expect(201);

    // feed
    await request(app.getHttpServer()).get('/api/v1/posts/feed').set('Authorization', `Bearer ${accessToken2}`).expect(200);

    // like
    await request(app.getHttpServer()).post(`/api/v1/posts/${post.body.post.id}/like`).set('Authorization', `Bearer ${accessToken2}`).expect(201);
  });
});