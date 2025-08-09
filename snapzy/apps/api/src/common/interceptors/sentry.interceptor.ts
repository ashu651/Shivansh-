import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const transaction = Sentry.startTransaction({ name: `${req.method} ${req.path}` });
    const start = Date.now();
    return next.handle().pipe(
      tap({
        next: () => {
          transaction.setData('durationMs', Date.now() - start);
          transaction.finish();
        },
        error: (err) => {
          Sentry.captureException(err);
          transaction.setStatus('internal_error');
          transaction.finish();
        },
      })
    );
  }
}