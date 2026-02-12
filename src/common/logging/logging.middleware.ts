import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggingService } from './logging.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggingService: LoggingService) {}

  use(req: Request, res: Response, next: Function) {
    const start = Date.now();
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress;

    const userAgent = req.headers['user-agent'] || '';
    const body = req.method === 'GET' ? null : req.body;

    res.on('finish', async () => {
      try {
        const responseTime = Date.now() - start;
        const statusCode = res.statusCode;
        const user = (req as any).user;
        const userId = user ? user.id || user.userId || user._id : null;

        await this.loggingService.logRequest({
          method: req.method,
          url: req.originalUrl,
          statusCode,
          responseTimeMs: responseTime,
          ip: typeof ip === 'string' ? ip : JSON.stringify(ip),
          userAgent: String(userAgent),
          userId: userId ? String(userId) : undefined,
          requestBody: body,
        });
      } catch (err) {
        console.error('Logging middleware error:', err);
      }
    });

    next();
  }
}
