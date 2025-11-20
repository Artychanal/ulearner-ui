import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const started = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - started;
      this.logger.log(`${method} ${originalUrl} -> ${statusCode} (${duration}ms)`);
    });

    next();
  }
}
