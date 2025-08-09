import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ValidationPipe } from '@nestjs/common';
import * as promClient from 'prom-client';
import { CsrfDoubleSubmit, CsrfTokenIssue } from './common/middleware/csrf.middleware';
import { IdempotencyMiddleware } from './common/middleware/idempotency.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'idempotency-key'],
    exposedHeaders: ['x-request-id'],
  });

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true }));
  app.use(cookieParser());

  const limiter = rateLimit({ windowMs: 60_000, max: 300 });
  app.use(limiter);

  app.use(CorrelationIdMiddleware);
  app.use(CsrfTokenIssue);
  app.use(CsrfDoubleSubmit);
  app.use(IdempotencyMiddleware);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Snapzy API')
    .setDescription('REST API for Snapzy')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  // Prometheus metrics
  const register = new promClient.Registry();
  promClient.collectDefaultMetrics({ register });
  app.getHttpAdapter().getInstance().get('/metrics', async (_req: any, res: any) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  app.getHttpAdapter().getInstance().get('/health/liveness', (_req: any, res: any) => {
    res.json({ ok: true, status: 'live' });
  });
  app.getHttpAdapter().getInstance().get('/health/readiness', (_req: any, res: any) => {
    res.json({ ok: true, status: 'ready' });
  });

  await app.listen(4000);
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:4000`);
}

bootstrap();