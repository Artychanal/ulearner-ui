import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Response, Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly httpAdapterHost?: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, errors } = this.extractExceptionDetails(exception);

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Unhandled exception: ${message}`,
        (exception as Error)?.stack,
        HttpExceptionFilter.name,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      errors,
    });
  }

  private extractExceptionDetails(exception: unknown) {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const error =
        typeof response === 'string'
          ? { message: response }
          : (response as Record<string, unknown>);

      return {
        status: exception.getStatus(),
        message: (error.message as string) ?? exception.message,
        errors: error['errors'] ?? error['message'],
      };
    }

    const message = exception instanceof Error ? exception.message : 'Internal server error';
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      errors: undefined,
    };
  }
}
