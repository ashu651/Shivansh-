import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.getResponse() : exception?.message || 'Internal error';

    response.status(status).json({
      ok: false,
      error: {
        status,
        message,
      },
      path: request.url,
      requestId: request.headers['x-request-id'],
      timestamp: new Date().toISOString(),
    });
  }
}